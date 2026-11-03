package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundMember;
import com.ewalletlab.fundservice.domain.FundStatus;
import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.repository.RefundedContributionRepository;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import com.ewalletlab.fundservice.repository.FundTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Issue #14 — "Quỹ nhóm" (operator's architecture decision, option (a): a stand-alone
 * {@code fund-service}, see Fund's class javadoc). Unlike {@code payment-request-service}, which
 * always settles through transfer-service's P2P saga, a fund's "other side" of a money movement
 * isn't a wallet at all — it's this service's own {@link Fund#getBalance()} — so this service calls
 * wallet-service's {@code /credit}/{@code /debit} directly, same pattern as lucky-money-service
 * (issue #10).
 *
 * <p><b>Issue #60 supersedes the paragraphs below FOR CONTRIBUTE ONLY.</b> The claim-first outbox
 * shape let {@code Fund.balance} hold money no wallet had been debited for yet, so the creator could
 * withdraw it ("tạo tiền từ hư không"). {@link #contribute} now debits the member's wallet
 * synchronously FIRST and only then credits the fund; it no longer writes an outbox event. Withdraw
 * and dissolve keep the outbox exactly as described next. {@code FUND_CONTRIBUTE_DEBIT} stays in the
 * enum/relay only to drain events written before #60.
 *
 * <p><b>Issue #22 — Outbox pattern.</b> This class no longer calls {@code WalletServiceClient}'s
 * {@code credit}/{@code debit} at all (see backend DESIGN.md's "Outbox pattern" section for the
 * full before/after and why). {@code contribute}/{@code withdraw}/{@code dissolve} now ONLY claim
 * the local state change — {@code FundMutationExecutor.contributeOnce}/{@code withdrawOnce}/{@code
 * dissolveOnce} write the matching {@code OutboxEvent} in the same transaction — and return.
 * {@code FundOutboxRelay}'s background job is the only thing that actually calls wallet-service for
 * these 3 operations now, with its own retry/compensation handling. This removed a large amount of
 * machinery that used to live here: {@code compensateWithRetry}, {@code mapCreditFailure}, the
 * dedicated {@code MAX_COMPENSATION_ATTEMPTS}/jittered-backoff constants, and the {@code
 * FundCompensationFailure}/{@code FundCompensationReconciler} safety net for when compensation
 * itself lost every retry — all 3 of those existed ONLY to paper over gaps in the old
 * "network-call-then-catch-then-compensate" shape that the outbox pattern closes structurally
 * instead (see the next paragraph for the one place that shape is deliberately KEPT).
 *
 * <p>{@link #contribute} still makes ONE synchronous call to wallet-service before touching any
 * local state: a read-only step-up pre-check ({@code WalletServiceClient#stepUpCheck}). This is
 * NOT a regression back to the old dual-write shape — nothing is mutated by it. It exists because
 * moving the actual DEBIT into the outbox-relayed path means there's no live HTTP request anymore
 * at the moment wallet-service would otherwise ask for step-up confirmation (issue #15) — CLAUDE.md's
 * Enterprise Architecture Alignment principle 2 requires regulatory/compliance gates to fail CLOSED,
 * so this has to be checked and enforced before any state is claimed, not discovered later by the
 * relay with no user left to confirm anything. Exactly the same shape topup-service already uses
 * for TOPUP's own async (Kafka-driven) credit — not a new pattern in this codebase.
 */
@Service
public class FundService {

    private static final Logger log = LoggerFactory.getLogger(FundService.class);
    private static final int MAX_ATTEMPTS = 4;
    /** Contribute has already debited the wallet, so ride out optimistic-lock contention longer
     * before falling back to the refund path (issue #60 QA round 2). */
    private static final int CONTRIBUTE_MAX_ATTEMPTS = 12;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    private final FundRepository fundRepository;
    private final FundMemberRepository fundMemberRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final FundMutationExecutor mutationExecutor;
    private final RefundedContributionRepository refundedRepository;

    public FundService(FundRepository fundRepository, FundMemberRepository fundMemberRepository,
                        FundTransactionRepository fundTransactionRepository,
                        UserServiceClient userServiceClient,
                        WalletServiceClient walletServiceClient, FundMutationExecutor mutationExecutor,
                        RefundedContributionRepository refundedRepository) {
        this.refundedRepository = refundedRepository;
        this.fundRepository = fundRepository;
        this.fundMemberRepository = fundMemberRepository;
        this.fundTransactionRepository = fundTransactionRepository;
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
        this.mutationExecutor = mutationExecutor;
    }

    /** Creator is auto-added as a member of their own fund (so they show up in the member list and
     * can contribute like anyone else) — a single INSERT at creation time, no concurrent caller can
     * race it, so no retry/unique-constraint handling needed here (unlike {@link #addMember}).
     * Looks the creator up by id (not phone) via user-service, same reasoning as {@link
     * UserServiceClient#findById} javadoc — trusts user-service's own record, not a client-supplied
     * display name, for the denormalized {@code creatorName}/{@code creatorPhone} on {@link Fund}. */
    public Fund create(UUID creatorUserId, String name, String purpose) {
        UserServiceClient.UserResponse creator;
        try {
            creator = userServiceClient.findById(creatorUserId);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản Ewallet Lab này");
        }
        Fund fund = fundRepository.save(new Fund(creatorUserId, creator.name(), creator.phone(), name, purpose));
        fundMemberRepository.save(new FundMember(fund.getId(), creatorUserId, creator.phone(), creator.name()));
        return fund;
    }

    public Fund get(UUID fundId, UUID requesterUserId) {
        Fund fund = requireFund(fundId);
        requireMember(fundId, requesterUserId);
        return fund;
    }

    public List<Fund> listForMember(UUID memberUserId) {
        return fundMemberRepository.findByMemberUserId(memberUserId).stream()
            .map(FundMember::getFundId)
            .distinct()
            .map(this::requireFund)
            .toList();
    }

    public List<FundMember> listMembers(UUID fundId, UUID requesterUserId) {
        requireFund(fundId);
        requireMember(fundId, requesterUserId);
        return fundMemberRepository.findByFundIdOrderByJoinedAtAsc(fundId);
    }

    public List<FundTransaction> listTransactions(UUID fundId, UUID requesterUserId) {
        requireFund(fundId);
        requireMember(fundId, requesterUserId);
        return fundTransactionRepository.findByFundIdOrderByCreatedAtDesc(fundId);
    }

    public FundMember addMember(UUID fundId, UUID requesterUserId, String memberPhone) {
        UserServiceClient.UserResponse member;
        try {
            member = userServiceClient.findByPhone(memberPhone);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy tài khoản Ewallet Lab với số điện thoại này");
        }
        return withRetry("addMember", fundId,
            () -> mutationExecutor.addMemberOnce(fundId, requesterUserId, member.id(), member.phone(), member.name()));
    }

    /**
     * Issue #60 — "trừ ví trước, đồng bộ". Order of operations:
     * <ol>
     *   <li>read-only checks (fund exists + ACTIVE, caller is a member, step-up gate);</li>
     *   <li>idempotency fast path: a CONTRIBUTION row with this key already exists -> return it, no
     *       second debit;</li>
     *   <li>{@code wallet-service /debit} with the namespaced idempotency key — a 409 (insufficient
     *       balance) / 428 / 4xx aborts here and the fund is untouched;</li>
     *   <li>only then {@code Fund.balance += amount} + CONTRIBUTION row in one transaction;</li>
     *   <li>if step 4 throws a caught exception, refund the wallet ({@code /credit}, key
     *       {@code refund:<debitKey>}). If the process dies between 3 and 4, or the refund itself
     *       fails, money is stuck: logged at ERROR with {@code CONTRIBUTE_MONEY_STUCK} + reference
     *       code (accepted trade-off, operator decision on issue #60).</li>
     * </ol>
     * Retry rule: reuse the same {@code idempotencyKey} only after a 502 (ambiguous outcome); use a
     * new key after any other error (a refunded attempt must not be replayed with the same key).
     */
    public Fund contribute(UUID fundId, UUID memberUserId, BigDecimal amount, boolean stepUpConfirmed,
                            String clientIdempotencyKey) {
        Fund fund = requireFund(fundId);
        if (!fundMemberRepository.existsByFundIdAndMemberUserId(fundId, memberUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ nhóm này");
        }
        String rawKey = (clientIdempotencyKey == null || clientIdempotencyKey.isBlank())
            ? UUID.randomUUID().toString() : clientIdempotencyKey.trim();
        String debitKey = "fund-contribute:" + fundId + ":" + memberUserId + ":" + rawKey;
        String ref = "FC-" + UUID.nameUUIDFromBytes(debitKey.getBytes(StandardCharsets.UTF_8)).toString().substring(0, 8);

        if (fundTransactionRepository.findByIdempotencyKey(debitKey).isPresent()) {
            log.info("contribute ref={} fund={} idempotent replay — already applied, no second debit", ref, fundId);
            return fund;
        }
        if (refundedRepository.existsById(debitKey)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "idempotencyKey này đã được hoàn tiền, dùng key mới (mã " + ref + ")");
        }
        if (fund.getStatus() != FundStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Quỹ nhóm này đã được giải thể");
        }
        WalletServiceClient.StepUpCheckResult check = walletServiceClient.stepUpCheck(memberUserId, amount);
        if (check.required() && !stepUpConfirmed) {
            throw new ResponseStatusException(HttpStatus.valueOf(428), describeStepUpRequirement(check));
        }

        try {
            walletServiceClient.debit(memberUserId, amount, "TRANSFER_OUT", fundId.toString(),
                "Góp vào quỹ nhóm", stepUpConfirmed, debitKey);
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        } catch (RuntimeException e) {
            log.error("CONTRIBUTE_DEBIT_UNKNOWN ref={} fund={} member={} amount={} debitKey={} — wallet-service " +
                "debit outcome unknown ({}); wallet may have been debited. Client may retry with the SAME key.",
                ref, fundId, memberUserId, amount, debitKey, e.toString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Không xác định được kết quả trừ ví, vui lòng thử lại với cùng idempotencyKey (mã " + ref + ")");
        }

        try {
            return withRetry("contribute", fundId, CONTRIBUTE_MAX_ATTEMPTS,
                () -> mutationExecutor.contributeOnce(fundId, memberUserId, amount, debitKey).fund());
        } catch (RuntimeException e) {
            if (refundAfterFailedCredit(ref, fundId, memberUserId, amount, debitKey, e)) {
                // The credit had in fact committed (concurrent same-key request, or lost ack): no refund, success.
                return requireFund(fundId);
            }
            throw e;
        }
    }

    /** @return true if the fund credit turned out to be committed already (nothing refunded). */
    private boolean refundAfterFailedCredit(String ref, UUID fundId, UUID memberUserId, BigDecimal amount,
                                             String debitKey, RuntimeException cause) {
        boolean mayRefund;
        try {
            // Decision + marker in a short transaction under the per-key advisory lock, committed BEFORE
            // the wallet credit below (see FundMutationExecutor#markRefundedUnlessCredited).
            mayRefund = mutationExecutor.markRefundedUnlessCredited(debitKey);
        } catch (RuntimeException decisionEx) {
            log.error("CONTRIBUTE_MONEY_STUCK ref={} fund={} member={} amount={} debitKey={} — wallet DEBITED, " +
                "fund credit failed ({}) and the refund decision itself failed ({}); NOT refunding without a marker. " +
                "Needs manual reconciliation.", ref, fundId, memberUserId, amount, debitKey, cause.toString(),
                decisionEx.toString());
            return false;
        }
        if (!mayRefund) {
            log.warn("contribute ref={} fund={} — exception after the fund credit already committed ({}); " +
                "no refund, treating as success", ref, fundId, cause.toString());
            return true;
        }
        try {
            walletServiceClient.credit(memberUserId, amount, "TRANSFER_IN", fundId.toString(),
                "Hoàn tiền góp quỹ nhóm thất bại (mã " + ref + ")", "refund:" + debitKey);
            log.warn("contribute ref={} fund={} member={} amount={} — wallet debited but fund credit failed ({}); " +
                "wallet refunded", ref, fundId, memberUserId, amount, cause.toString());
        } catch (RuntimeException refundEx) {
            log.error("CONTRIBUTE_MONEY_STUCK ref={} fund={} member={} amount={} debitKey={} — wallet DEBITED, " +
                "fund NOT credited, refund FAILED ({}); original error: {}. Needs manual reconciliation.",
                ref, fundId, memberUserId, amount, debitKey, refundEx.toString(), cause.toString());
        }
        return false;
    }

    /** Issue #22 — claims the withdrawal locally (optimistic lock + balance/status validation,
     * SAME transaction as the matching outbox event) and returns immediately; the actual credit to
     * the creator's wallet is relayed in the background by {@code FundOutboxRelay}. */
    public Fund withdraw(UUID fundId, UUID requesterUserId, BigDecimal amount) {
        Fund fund = requireFund(fundId);
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được rút tiền khỏi quỹ");
        }
        return withRetry("withdraw", fundId, () -> mutationExecutor.withdrawOnce(fundId, requesterUserId, amount).fund());
    }

    public Fund dissolve(UUID fundId, UUID requesterUserId) {
        Fund fund = requireFund(fundId);
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được giải thể quỹ");
        }
        return withRetry("dissolve", fundId, () -> mutationExecutor.dissolveOnce(fundId, requesterUserId).fund());
    }

    /** Same Vietnamese copy as topup-service's {@code TopupService#describeStepUpRequirement} —
     * built from the thresholds the check response actually returned rather than a second
     * hardcoded copy of the numbers, so the services can't drift out of sync. */
    // Issue #41: message giữ trung lập — xem topup-service's TopupService.describeStepUpRequirement
    // / wallet-service's StepUpPolicy class comment cho lý do.
    private static String describeStepUpRequirement(WalletServiceClient.StepUpCheckResult check) {
        return ("Giao dịch trên %s/lần hoặc tổng giao dịch chuyển tiền/thanh toán/nạp ví trong ngày "
            + "đạt %s cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN")
            .formatted(formatVnd(check.singleThreshold()), formatVnd(check.dailyThreshold()));
    }

    private static String formatVnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }

    private Fund requireFund(UUID fundId) {
        return fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
    }

    /** Real MoMo's "Quỹ nhóm" (fetched directly, momo.vn/quy-nhom): "Only approved members can view
     * and access fund operation information" — mirrored here for GET endpoints. */
    private void requireMember(UUID fundId, UUID requesterUserId) {
        if (!fundMemberRepository.existsByFundIdAndMemberUserId(fundId, requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ nhóm này");
        }
    }

    /** Same combined retry shape as wallet-service's {@code SavingsPocketService.withRetry} (issue
     * #13's fix): one loop handles BOTH a lost optimistic-lock race (balance mutations — retried
     * against the freshly-committed row) AND a lost UNIQUE-constraint race on
     * {@code addMemberOnce} (retried so the next attempt observes the winner's now-committed
     * membership row and returns it instead of surfacing a raw 500). */
    private <T> T withRetry(String op, UUID fundId, Supplier<T> attempt) {
        return withRetry(op, fundId, MAX_ATTEMPTS, attempt);
    }

    private <T> T withRetry(String op, UUID fundId, int maxAttempts, Supplier<T> attempt) {
        for (int i = 1; i <= maxAttempts; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == maxAttempts) {
                    log.warn("{} on fund={} lost the optimistic-lock race {} times in a row, giving up — 409",
                        op, fundId, maxAttempts);
                    throw e;
                }
                log.debug("{} on fund={} lost optimistic-lock race, retrying (attempt {}/{})", op, fundId, i, maxAttempts);
                sleep(Math.min(RETRY_BACKOFF_MILLIS * i, 200));
            } catch (DataIntegrityViolationException e) {
                if (i == maxAttempts) {
                    log.warn("{} on fund={} lost a unique-constraint race {} times in a row, giving up — 409",
                        op, fundId, maxAttempts);
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Xung đột khi thao tác trên quỹ nhóm (trùng thời điểm), vui lòng thử lại");
                }
                log.debug("{} on fund={} lost a unique-constraint race (likely concurrent invite), retrying ({}/{})",
                    op, fundId, i, maxAttempts);
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
