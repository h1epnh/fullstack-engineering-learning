package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.SavingsPocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.function.Supplier;

/** Issue #13 — public API for "Túi Thần Tài", with the same optimistic-lock retry pattern
 * {@code WalletService} uses (issue #5) since both the {@code Wallet} and {@code SavingsPocket}
 * rows touched by a mutation carry {@code @Version}. */
@Service
public class SavingsPocketService {

    private static final Logger log = LoggerFactory.getLogger(SavingsPocketService.class);
    private static final int MAX_ATTEMPTS = 4;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    private final SavingsPocketMutationExecutor mutationExecutor;

    public SavingsPocketService(SavingsPocketMutationExecutor mutationExecutor) {
        this.mutationExecutor = mutationExecutor;
    }

    public SavingsPocket open(UUID userId, BigDecimal initialAmount) {
        return withRetry("open", userId, () -> mutationExecutor.openOnce(userId, initialAmount));
    }

    public SavingsPocket deposit(UUID userId, BigDecimal amount) {
        return withRetry("deposit", userId, () -> mutationExecutor.depositOnce(userId, amount));
    }

    public SavingsPocket withdraw(UUID userId, BigDecimal amount) {
        return withRetry("withdraw", userId, () -> mutationExecutor.withdrawOnce(userId, amount));
    }

    public SavingsPocket view(UUID userId) {
        return withRetry("view", userId, () -> mutationExecutor.viewOnce(userId));
    }

    private SavingsPocket withRetry(String op, UUID userId, Supplier<SavingsPocket> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("savings-pocket {} for user={} lost optimistic-lock race {} times, giving up — 409",
                        op, userId, MAX_ATTEMPTS);
                    throw e;
                }
                log.debug("savings-pocket {} for user={} lost optimistic-lock race, retrying ({}/{})",
                    op, userId, i, MAX_ATTEMPTS);
                sleep(RETRY_BACKOFF_MILLIS * i);
            } catch (DataIntegrityViolationException e) {
                // Concurrent "open" for the same user: two requests both pass the check-then-act
                // findByWalletId(...).isEmpty() read before either insert commits, so only the DB's
                // UNIQUE constraint on savings_pockets.wallet_id catches the second one — as a flush
                // failure at commit time, not something the retry loop's optimistic-lock catch above
                // sees. Money is never double-moved (the wallet debit and pocket insert are in the
                // same transaction that rolls back), but without this catch the exception surfaced as
                // a raw 500 instead of the clean 409 every other "already exists" conflict gets
                // (agent-tester found this at 20 concurrent opens — see issue #13).
                log.info("savings-pocket {} for user={} hit a unique-constraint conflict (likely concurrent open) — 409",
                    op, userId);
                throw new IllegalStateException("Túi Thần Tài đã được mở trước đó", e);
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
