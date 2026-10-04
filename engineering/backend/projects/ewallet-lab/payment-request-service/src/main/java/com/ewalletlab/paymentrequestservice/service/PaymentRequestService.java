package com.ewalletlab.paymentrequestservice.service;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestKind;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestStatus;
import com.ewalletlab.paymentrequestservice.repository.PaymentRequestRepository;
import com.ewalletlab.paymentrequestservice.web.dto.CreateLinkRequestDto;
import com.ewalletlab.paymentrequestservice.web.dto.CreateReminderRequestDto;
import com.ewalletlab.paymentrequestservice.web.dto.CreateSplitRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Owns both issue #3 (payment-link) and #8 (payment-reminder) — see PaymentRequest's javadoc for
 * why they share one domain model. Neither flow moves money itself: paying always calls
 * transfer-service's real {@code POST /transfers}, so wallet-service stays the single source of
 * truth for balances (this service only tracks "who owes whom, has it been paid yet").
 */
@Service
public class PaymentRequestService {

    private static final Logger log = LoggerFactory.getLogger(PaymentRequestService.class);
    private static final int MAX_ATTEMPTS = 4;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    private final PaymentRequestRepository repository;
    private final UserServiceClient userServiceClient;
    private final TransferServiceClient transferServiceClient;
    private final PaymentRequestMutationExecutor mutationExecutor;
    private final long linkTtlHours;

    public PaymentRequestService(
            PaymentRequestRepository repository,
            UserServiceClient userServiceClient,
            TransferServiceClient transferServiceClient,
            PaymentRequestMutationExecutor mutationExecutor,
            @Value("${ewallet-lab.payment-link.ttl-hours}") long linkTtlHours) {
        this.repository = repository;
        this.userServiceClient = userServiceClient;
        this.transferServiceClient = transferServiceClient;
        this.mutationExecutor = mutationExecutor;
        this.linkTtlHours = linkTtlHours;
    }

    // ---- Issue #3: payment link ----

    public PaymentRequest createLink(CreateLinkRequestDto request) {
        Instant expiresAt = Instant.now().plus(Duration.ofHours(linkTtlHours));
        PaymentRequest r = PaymentRequest.newLink(
            request.creatorUserId(), request.creatorPhone(), request.creatorName(),
            request.amount(), request.message(), expiresAt);
        return repository.save(r);
    }

    public PaymentRequest getLink(UUID token) {
        PaymentRequest r = findLinkOrThrow(token);
        return checkExpiry(r);
    }

    /**
     * Anyone with a valid Ewallet Lab account who has the URL can pay — this is a deliberate lab
     * simplification (issue #3 Constraints: "không phải một tính năng bảo mật cần siết chặt"), not
     * an oversight. The only checks are: request still PENDING (not already paid/cancelled/expired)
     * and payer isn't the creator themselves.
     */
    public PaymentRequest payLink(UUID token, UUID payerUserId, boolean stepUpConfirmed) {
        PaymentRequest r = findLinkOrThrow(token);
        r = checkExpiry(r);
        return pay(r, payerUserId, stepUpConfirmed);
    }

    public PaymentRequest cancelLink(UUID token, UUID creatorUserId) {
        PaymentRequest r = findLinkOrThrow(token);
        r = checkExpiry(r);
        if (!r.getCreatorUserId().equals(creatorUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo link mới được huỷ");
        }
        if (r.getStatus() != PaymentRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Link không còn ở trạng thái chờ thanh toán");
        }
        r.markCancelled();
        return repository.save(r);
    }

    private PaymentRequest findLinkOrThrow(UUID token) {
        PaymentRequest r = repository.findById(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy link nhận tiền này"));
        if (r.getKind() != PaymentRequestKind.LINK) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy link nhận tiền này");
        }
        return r;
    }

    /** Lazy-expiry check: a PENDING link past its TTL is flipped to EXPIRED the next time it's
     * read (GET, pay, or cancel attempt), rather than by any background job — see issue #10's
     * "Điểm rẽ #2" decision, applied here too for consistency even though only #10 mandates it. */
    private PaymentRequest checkExpiry(PaymentRequest r) {
        if (r.getKind() == PaymentRequestKind.LINK
                && r.getStatus() == PaymentRequestStatus.PENDING
                && r.getExpiresAt() != null
                && Instant.now().isAfter(r.getExpiresAt())) {
            try {
                r.markExpired();
                r = repository.save(r);
            } catch (ObjectOptimisticLockingFailureException e) {
                // No money moves here — a concurrent reader already flipped this row (to EXPIRED,
                // or a racing pay() claimed it first). Just return whatever the winner committed
                // instead of surfacing a lock error on what's ultimately a read (GET/pay/cancel).
                r = repository.findById(r.getId()).orElse(r);
            }
        }
        return r;
    }

    // ---- Issue #8: payment reminder ----

    public PaymentRequest createReminder(CreateReminderRequestDto request) {
        UserServiceClient.UserResponse target = lookupTarget(request.targetPhone());
        if (target.id().equals(request.creatorUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự nhắc trả tiền chính mình");
        }
        PaymentRequest r = PaymentRequest.newReminder(
            request.creatorUserId(), request.creatorPhone(), request.creatorName(),
            target.id(), target.phone(), request.amount(), request.message());
        return repository.save(r);
    }

    public List<PaymentRequest> listSentReminders(UUID creatorUserId) {
        return repository.findByCreatorUserIdAndKindOrderByCreatedAtDesc(creatorUserId, PaymentRequestKind.REMINDER);
    }

    public List<PaymentRequest> listReceivedReminders(UUID targetUserId) {
        return repository.findByTargetUserIdAndKindOrderByCreatedAtDesc(targetUserId, PaymentRequestKind.REMINDER);
    }

    /** Only the reminded user ({@code targetUserId}) may pay — unlike a LINK, a REMINDER already
     * names a specific payer at creation time. */
    public PaymentRequest payReminder(UUID id, UUID payerUserId, boolean stepUpConfirmed) {
        PaymentRequest r = repository.findById(id)
            .filter(pr -> pr.getKind() == PaymentRequestKind.REMINDER)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời nhắc trả tiền này"));
        if (!payerUserId.equals(r.getTargetUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người được nhắc mới có thể trả khoản này");
        }
        return pay(r, payerUserId, stepUpConfirmed);
    }

    // ---- Issue #11: split-bill ----

    private static final int SPLIT_MIN_PEOPLE = 2;
    private static final int SPLIT_MAX_PEOPLE = 20;

    public List<PaymentRequest> createSplit(CreateSplitRequestDto request) {
        List<BigDecimal> shareAmounts = resolveShareAmounts(request);
        UUID groupId = UUID.randomUUID();
        BigDecimal groupTotal = shareAmounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        Instant expiresAt = Instant.now().plus(Duration.ofHours(linkTtlHours));
        List<PaymentRequest> shares = shareAmounts.stream()
            .map(amount -> PaymentRequest.newSplitShare(groupId, request.creatorUserId(), request.creatorPhone(),
                request.creatorName(), amount, groupTotal, request.label(), request.message(), expiresAt))
            .toList();
        return repository.saveAll(shares);
    }

    /**
     * Exactly one of "even split" ({@code totalAmount} + {@code peopleCount}) or "custom"
     * ({@code amounts}) must be supplied — see CreateSplitRequestDto's javadoc. Not expressible as
     * bean validation because it's a cross-field rule, same reasoning bill-payment-service uses for
     * validating {@code amount} server-side instead of trusting the client.
     */
    private List<BigDecimal> resolveShareAmounts(CreateSplitRequestDto request) {
        boolean hasCustom = request.amounts() != null && !request.amounts().isEmpty();
        boolean hasEvenSplit = request.totalAmount() != null && request.peopleCount() != null;
        if (hasCustom == hasEvenSplit) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Phải gửi đúng 1 trong 2: (totalAmount + peopleCount) để chia đều, hoặc amounts để chia tuỳ chỉnh");
        }
        if (hasCustom) {
            if (request.amounts().size() < SPLIT_MIN_PEOPLE || request.amounts().size() > SPLIT_MAX_PEOPLE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Số người chia phải từ %d đến %d".formatted(SPLIT_MIN_PEOPLE, SPLIT_MAX_PEOPLE));
            }
            return request.amounts();
        }
        int n = request.peopleCount();
        if (n < SPLIT_MIN_PEOPLE || n > SPLIT_MAX_PEOPLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Số người chia phải từ %d đến %d".formatted(SPLIT_MIN_PEOPLE, SPLIT_MAX_PEOPLE));
        }
        // Round down to the nearest đồng per share, then fold the leftover remainder into the
        // FIRST share so the shares always sum to EXACTLY totalAmount (no rounding drift) —
        // an arbitrary but documented choice, not a bug if the first share looks a few đồng larger.
        BigDecimal per = request.totalAmount().divide(BigDecimal.valueOf(n), 0, RoundingMode.DOWN);
        BigDecimal remainder = request.totalAmount().subtract(per.multiply(BigDecimal.valueOf(n)));
        List<BigDecimal> shares = new ArrayList<>(n);
        for (int i = 0; i < n; i++) {
            shares.add((i == 0 ? per.add(remainder) : per).setScale(2));
        }
        return shares;
    }

    /** "Danh sách đã thu" — every share of a group plus its current status, lazily expiring any
     * share whose TTL has passed (same {@link #checkExpiry} every LINK read already goes through). */
    public List<PaymentRequest> getSplitGroup(UUID groupId) {
        List<PaymentRequest> shares = repository.findByGroupIdOrderByCreatedAtAsc(groupId);
        if (shares.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm chia tiền này");
        }
        return shares.stream().map(this::checkExpiry).toList();
    }

    private UserServiceClient.UserResponse lookupTarget(String phone) {
        try {
            return userServiceClient.findByPhone(phone);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với số điện thoại này");
        }
    }

    // ---- Shared pay path — both LINK and REMINDER settle through this ----

    /**
     * Fixes the critical race condition found by agent-tester on issues #3/#8 (7/8 concurrent
     * {@code pay()} calls all succeeding, multiplying real transfer-service transfers). The status
     * transition PENDING -> PAID is now claimed FIRST, atomically (optimistic-lock protected via
     * {@link PaymentRequestMutationExecutor#claimPendingOnce}), and only the single winner of that
     * claim is allowed to call transfer-service's real {@code /transfers} at all. If that call then
     * fails, the claim is released back to PENDING so the request isn't stuck "PAID" with no money
     * actually moved.
     */
    private PaymentRequest pay(PaymentRequest r, UUID payerUserId, boolean stepUpConfirmed) {
        if (r.getStatus() != PaymentRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                switch (r.getStatus()) {
                    case PAID -> "Yêu cầu này đã được thanh toán rồi";
                    case CANCELLED -> "Yêu cầu này đã bị huỷ";
                    case EXPIRED -> "Yêu cầu này đã hết hạn";
                    case PENDING -> "Không thể thanh toán yêu cầu này";
                });
        }
        if (payerUserId.equals(r.getCreatorUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự thanh toán yêu cầu của chính mình");
        }

        UUID id = r.getId();
        PaymentRequest claimed = withOptimisticLockRetry("pay", id,
            () -> mutationExecutor.claimPendingOnce(id, payerUserId));

        TransferServiceClient.TransferResult result;
        try {
            result = transferServiceClient.transfer(payerUserId, claimed.getCreatorPhone(), claimed.getAmount(), stepUpConfirmed);
        } catch (HttpClientErrorException.Conflict e) {
            mutationExecutor.releaseClaim(id);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để thanh toán");
        } catch (HttpClientErrorException.NotFound e) {
            mutationExecutor.releaseClaim(id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận (creator) của yêu cầu này");
        } catch (HttpClientErrorException e) {
            mutationExecutor.releaseClaim(id);
            // Issue #15 interaction — see PayRequestDto's javadoc. Forward transfer-service's own
            // sourced message instead of re-wording it; 428 (not a named HttpClientErrorException
            // subclass) needs an explicit status check.
            if (e.getStatusCode().value() == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), e.getResponseBodyAsString());
            }
            throw e;
        } catch (RuntimeException e) {
            mutationExecutor.releaseClaim(id);
            throw e;
        }
        return mutationExecutor.attachTransferReference(id, result.newBalance().toString());
    }

    /** See issue #5's {@code WalletService.withOptimisticLockRetry} — same pattern: retries the
     * loser of a lost optimistic-lock race a few times against a freshly-read row before giving up
     * and letting a genuine, sustained conflict surface as 409 (mapped in
     * {@code PaymentRequestController}'s exception handler for the same exception). */
    private <T> T withOptimisticLockRetry(String op, UUID id, Supplier<T> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} on payment-request={} lost the optimistic-lock race {} times in a row, " +
                        "giving up — surfacing as 409", op, id, MAX_ATTEMPTS);
                    throw e;
                }
                log.debug("{} on payment-request={} lost optimistic-lock race, retrying (attempt {}/{})",
                    op, id, i, MAX_ATTEMPTS);
                sleep(RETRY_BACKOFF_MILLIS * i);
            }
        }
        throw new IllegalStateException("unreachable");
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
