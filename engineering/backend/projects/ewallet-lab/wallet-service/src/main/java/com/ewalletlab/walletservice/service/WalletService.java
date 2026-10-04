package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import com.ewalletlab.walletservice.web.dto.SpendingReportResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.http.HttpStatus;

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
    private final StepUpPolicy stepUpPolicy;

    public WalletService(WalletRepository walletRepository, TransactionRepository transactionRepository,
                          WalletMutationExecutor mutationExecutor, StepUpPolicy stepUpPolicy) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.mutationExecutor = mutationExecutor;
        this.stepUpPolicy = stepUpPolicy;
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

    /** Throws IllegalStateException (mapped to 409 by the controller) if balance is insufficient,
     * or StepUpRequiredException (mapped to 428) if the amount/daily total requires step-up
     * confirmation (issue #15) that {@code stepUpConfirmed} doesn't yet satisfy. */
    public Wallet debit(UUID userId, BigDecimal amount, TransactionType type, String reference, String note,
                         boolean stepUpConfirmed) {
        return withOptimisticLockRetry("debit", userId,
            () -> mutationExecutor.debitOnce(userId, amount, type, reference, note, stepUpConfirmed));
    }

    public List<Transaction> history(UUID userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    /**
     * Issue #16 — "Quản lý chi tiêu" MVP, "Báo cáo tự động". Same definition of "chi tiêu" as
     * {@code mfe-wallet/Home.tsx}'s client-side {@code SPEND_TYPES}: WITHDRAW + TRANSFER_OUT +
     * BILL_PAYMENT — deliberately NOT the broader {@code StepUpPolicy.STEP_UP_TYPES} (which also
     * includes TOPUP, a credit) and NOT the issue #7 monthly-limit set (same 3 types, coincidentally
     * identical today, but kept as its own constant here rather than reused — issue #7's set is
     * about outbound-transaction legal limits, this one is about user-facing spend reporting; they
     * happen to match today but have no reason to be forced to always match if either changes).
     *
     * <p>"week"/"month" both follow the same "calendar reset, not rolling window" interpretation
     * already used for issue #7 (calendar month) and issue #15 (calendar day) — week resets at the
     * most recent Monday 00:00 in the server's local timezone, per ISO-8601 (Vietnam's own
     * convention, unlike the US week-starts-Sunday convention).
     */
    public SpendingReportResponse spendingReport(UUID userId, String period) {
        Instant periodStart = switch (period) {
            case "week" -> currentWeekStart();
            case "month" -> currentMonthStart();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "period phải là 'week' hoặc 'month'");
        };
        Wallet wallet = getOrCreateWallet(userId);
        List<TransactionRepository.SpendingBreakdownRow> rows = transactionRepository
            .sumAmountGroupedByTypeSince(wallet.getId(), SPEND_TYPES, periodStart);

        Map<TransactionType, BigDecimal> breakdown = new EnumMap<>(TransactionType.class);
        for (TransactionType type : SPEND_TYPES) {
            breakdown.put(type, BigDecimal.ZERO);
        }
        BigDecimal total = BigDecimal.ZERO;
        for (TransactionRepository.SpendingBreakdownRow row : rows) {
            breakdown.put(row.getType(), row.getTotal());
            total = total.add(row.getTotal());
        }
        return new SpendingReportResponse(period, periodStart, total, breakdown);
    }

    /** Same 3 types as {@code mfe-wallet/Home.tsx}'s {@code SPEND_TYPES} — see {@link #spendingReport}. */
    private static final Set<TransactionType> SPEND_TYPES =
        EnumSet.of(TransactionType.WITHDRAW, TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT);

    private static Instant currentMonthStart() {
        return LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    private static Instant currentWeekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
            .atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    /**
     * Read-only pre-flight for issue #15's step-up rule — used by topup-service before initiating
     * a TOPUP (whose actual credit happens asynchronously via Kafka, with no HTTP caller present at
     * that point to carry a {@code stepUpConfirmed} flag the way debit's synchronous callers can).
     * Not wrapped in the same retry/optimistic-lock machinery as credit/debit since it doesn't
     * write anything — a plain read of the current daily total. This does mean there's a race
     * window specific to TOPUP that the embedded debitOnce check doesn't have: two concurrent topup
     * requests from the same user, each individually under threshold, could both read the same
     * "not required yet" total before either's async IPN confirms and lands in the ledger. Documented
     * as an accepted lab-scale limitation of topup's async architecture (see backend DESIGN.md) —
     * closing it would require topup-service to hold a pending-total lock across the IPN round-trip,
     * out of scope for this issue.
     */
    public StepUpCheckResult stepUpCheck(UUID userId, BigDecimal amount) {
        Wallet wallet = getOrCreateWallet(userId);
        BigDecimal spentToday = transactionRepository.sumAmountByWalletIdAndTypeInSince(
            wallet.getId(), StepUpPolicy.STEP_UP_TYPES, StepUpPolicy.currentDayStart());
        boolean required = stepUpPolicy.requiresStepUp(spentToday, amount);
        return new StepUpCheckResult(required, spentToday, stepUpPolicy.singleTransactionThreshold(),
            stepUpPolicy.dailyCumulativeThreshold());
    }

    public record StepUpCheckResult(boolean required, BigDecimal dailyTotalSoFar,
                                     BigDecimal singleThreshold, BigDecimal dailyThreshold) {
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
