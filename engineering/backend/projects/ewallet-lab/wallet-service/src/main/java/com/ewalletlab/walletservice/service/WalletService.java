package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * See issue #5: two concurrent credit/debit calls on the same wallet can both read the same
 * {@code @Version}, and the loser's commit throws {@link ObjectOptimisticLockingFailureException}
 * instead of double-spending — that's optimistic locking working as intended, not a bug. The bug
 * was that the loser used to see that surface as a raw 500. This class retries the loser's write a
 * few times against a freshly-read wallet row (each attempt is a brand-new transaction, run via
 * {@link WalletMutationExecutor} so the retry actually gets a new {@code @Version} to race against)
 * before giving up and letting a genuine, sustained conflict surface as 409 (see
 * {@code WalletController}'s handler for the same exception).
 */
@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);
    private static final int MAX_ATTEMPTS = 4;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletMutationExecutor mutationExecutor;

    public WalletService(WalletRepository walletRepository, TransactionRepository transactionRepository,
                          WalletMutationExecutor mutationExecutor) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.mutationExecutor = mutationExecutor;
    }

    /** Lazily creates a wallet on first use — user-service doesn't need to know wallet-service exists. */
    @Transactional
    public Wallet getOrCreateWallet(UUID userId) {
        return walletRepository.findByUserId(userId)
            .orElseGet(() -> walletRepository.save(new Wallet(userId)));
    }

    public Wallet credit(UUID userId, BigDecimal amount, TransactionType type, String reference, String note) {
        return withOptimisticLockRetry("credit", userId,
            () -> mutationExecutor.creditOnce(userId, amount, type, reference, note));
    }

    /** Throws IllegalStateException (mapped to 409 by the controller) if balance is insufficient. */
    public Wallet debit(UUID userId, BigDecimal amount, TransactionType type, String reference, String note) {
        return withOptimisticLockRetry("debit", userId,
            () -> mutationExecutor.debitOnce(userId, amount, type, reference, note));
    }

    public List<Transaction> history(UUID userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    private Wallet withOptimisticLockRetry(String op, UUID userId, Supplier<Wallet> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} on wallet for user={} lost the optimistic-lock race {} times in a row, " +
                        "giving up — surfacing as 409", op, userId, MAX_ATTEMPTS);
                    throw e;
                }
                log.debug("{} on wallet for user={} lost optimistic-lock race, retrying (attempt {}/{})",
                    op, userId, i, MAX_ATTEMPTS);
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
