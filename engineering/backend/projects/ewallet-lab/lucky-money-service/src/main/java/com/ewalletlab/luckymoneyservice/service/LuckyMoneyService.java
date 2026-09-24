package com.ewalletlab.luckymoneyservice.service;

import com.ewalletlab.luckymoneyservice.domain.LuckyMoney;
import com.ewalletlab.luckymoneyservice.domain.LuckyMoneyStatus;
import com.ewalletlab.luckymoneyservice.repository.LuckyMoneyRepository;
import com.ewalletlab.luckymoneyservice.web.dto.SendLuckyMoneyRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Issue #10 — 1-1 lucky money (MVP scope only: no group lucky money, no random-amount mode, no SMS
 * invite for phone numbers without an account — see class-level Constraints in the issue). Escrows
 * real money at send time (debit now, credit-or-refund later), unlike payment-request-service's
 * LINK/REMINDER which never touch a wallet until the payer actively confirms.
 */
@Service
public class LuckyMoneyService {

    private static final Logger log = LoggerFactory.getLogger(LuckyMoneyService.class);
    private static final int MAX_ATTEMPTS = 4;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    private final LuckyMoneyRepository repository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final LuckyMoneyMutationExecutor mutationExecutor;
    private final long ttlHours;

    public LuckyMoneyService(
            LuckyMoneyRepository repository,
            UserServiceClient userServiceClient,
            WalletServiceClient walletServiceClient,
            LuckyMoneyMutationExecutor mutationExecutor,
            @Value("${ewallet-lab.lucky-money.ttl-hours}") long ttlHours) {
        this.repository = repository;
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
        this.mutationExecutor = mutationExecutor;
        this.ttlHours = ttlHours;
    }

    /** Debit(sender) happens synchronously here, before the row is even saved — see LuckyMoney's
     * class javadoc for why escrow-at-creation isn't optional. */
    public LuckyMoney send(SendLuckyMoneyRequestDto request) {
        UserServiceClient.UserResponse recipient = lookupRecipient(request.toPhone());
        if (recipient.id().equals(request.fromUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự gửi lì xì cho chính mình");
        }

        try {
            walletServiceClient.debit(
                request.fromUserId(), request.amount(), "TRANSFER_OUT",
                recipient.id().toString(), "Lì xì cho " + recipient.name());
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để gửi lì xì");
        }

        Instant expiresAt = Instant.now().plus(Duration.ofHours(ttlHours));
        LuckyMoney lm = new LuckyMoney(
            request.fromUserId(), request.fromName(), recipient.id(), recipient.phone(),
            request.amount(), request.message(), expiresAt);
        return repository.save(lm);
    }

    public LuckyMoney get(UUID id) {
        LuckyMoney lm = findOrThrow(id);
        return checkExpiry(lm);
    }

    public List<LuckyMoney> listSent(UUID fromUserId) {
        return repository.findByFromUserIdOrderByCreatedAtDesc(fromUserId).stream().map(this::checkExpiry).toList();
    }

    public List<LuckyMoney> listReceived(UUID toUserId) {
        return repository.findByToUserIdOrderByCreatedAtDesc(toUserId).stream().map(this::checkExpiry).toList();
    }

    /**
     * Only the intended recipient may claim — resolved by phone at send time, same as
     * payment-request-service's REMINDER kind.
     *
     * <p>Fixes the critical race condition found by agent-tester on issue #10 (8/8 concurrent
     * {@code claim()} calls all succeeding, crediting the recipient 8x while the sender was only
     * ever debited once — money created from nothing). The PENDING -> CLAIMED transition (and the
     * recipient-check that gates it) is now claimed FIRST, atomically (optimistic-lock protected via
     * {@link LuckyMoneyMutationExecutor#claimPendingOnce}), and only the single winner of that claim
     * is allowed to call wallet-service's real {@code /credit} at all. If that call then fails, the
     * claim is released back to PENDING.
     */
    public LuckyMoney claim(UUID id, UUID toUserId) {
        LuckyMoney lm = findOrThrow(id);
        checkExpiry(lm);

        LuckyMoney claimed = withOptimisticLockRetry("claim", id,
            () -> mutationExecutor.claimPendingOnce(id, toUserId));

        try {
            walletServiceClient.credit(
                toUserId, claimed.getAmount(), "TRANSFER_IN", claimed.getFromUserId().toString(),
                "Nhận lì xì từ " + claimed.getFromName());
        } catch (RuntimeException e) {
            mutationExecutor.revertToPending(id);
            throw e;
        }
        return claimed;
    }

    private UserServiceClient.UserResponse lookupRecipient(String phone) {
        try {
            return userServiceClient.findByPhone(phone);
        } catch (HttpClientErrorException.NotFound e) {
            // Issue #10 Constraints: no SMS/invite infra in this lab — a phone with no account is a
            // plain error, not a "chưa có tài khoản, mời tải app" flow like real MoMo.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy người dùng Ewallet Lab với số điện thoại này (lab không hỗ trợ mời SMS cho SĐT chưa có tài khoản)");
        }
    }

    private LuckyMoney findOrThrow(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lì xì này"));
    }

    /**
     * Lazy-expiry check (issue #10's "Điểm rẽ #2" decision — no @Scheduled job): a PENDING lucky
     * money past its expiresAt is auto-refunded to the sender the next time it's read.
     *
     * <p>Same race-condition shape as {@link #claim} (and same fix): the PENDING -> EXPIRED_REFUNDED
     * transition is claimed FIRST, atomically, and only the winner is allowed to call
     * wallet-service's real refund {@code /credit} — otherwise two concurrent reads racing past the
     * expiry moment could both see PENDING+expired and both refund, creating money from nothing
     * exactly like the {@code claim()} bug did.
     */
    private LuckyMoney checkExpiry(LuckyMoney lm) {
        if (lm.getStatus() != LuckyMoneyStatus.PENDING || !Instant.now().isAfter(lm.getExpiresAt())) {
            return lm;
        }

        LuckyMoney claimed;
        try {
            claimed = withOptimisticLockRetry("expire", lm.getId(),
                () -> mutationExecutor.claimExpiryOnce(lm.getId()));
        } catch (ObjectOptimisticLockingFailureException e) {
            // No money moved on our side — a concurrent caller already resolved this row. Just
            // return whatever the winner committed instead of surfacing a lock error on a read.
            return repository.findById(lm.getId()).orElse(lm);
        }
        if (claimed == null) {
            // Lost the logical race already (a concurrent claim()/expiry-check resolved this row
            // before we got here) — re-read the fresh, already-settled state.
            return repository.findById(lm.getId()).orElse(lm);
        }

        try {
            walletServiceClient.credit(
                claimed.getFromUserId(), claimed.getAmount(), "REFUND", claimed.getToUserId().toString(),
                "Hoàn tiền lì xì hết hạn (48h) chưa được nhận");
        } catch (RuntimeException e) {
            mutationExecutor.revertToPending(claimed.getId());
            throw e;
        }
        return claimed;
    }

    /** See issue #5's {@code WalletService.withOptimisticLockRetry} — same pattern: retries the
     * loser of a lost optimistic-lock race a few times against a freshly-read row before giving up
     * and letting a genuine, sustained conflict surface as 409 (mapped in
     * {@code LuckyMoneyController}'s exception handler for the same exception). */
    private <T> T withOptimisticLockRetry(String op, UUID id, Supplier<T> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} on lucky-money={} lost the optimistic-lock race {} times in a row, " +
                        "giving up — surfacing as 409", op, id, MAX_ATTEMPTS);
                    throw e;
                }
                log.debug("{} on lucky-money={} lost optimistic-lock race, retrying (attempt {}/{})",
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
