package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.SavingsPocket;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.SavingsPocketRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #13 — "Túi Thần Tài". Single-attempt, {@code @Transactional} logic for opening/depositing
 * into/withdrawing from a savings pocket, kept separate from {@link SavingsPocketService} for the
 * same reason {@code WalletMutationExecutor} is separate from {@code WalletService} (issue #5):
 * an optimistic-lock retry needs each attempt to run in a brand-new transaction that re-reads both
 * the wallet and pocket rows (and their {@code @Version}s) from scratch, and Spring's
 * {@code @Transactional} only self-applies through a proxy.
 *
 * <p>Because the pocket lives in the SAME service/database as {@link Wallet} (operator's decision
 * on issue #13, option (a)), every money movement between "ví chính" and "Túi Thần Tài" is one
 * local transaction touching two {@code @Version}-ed rows — no network call to another service sits
 * between reading and writing, so there's no check-then-act window of the kind fixed in #3/#8/#10.
 * Concurrent operations on either row still safely serialize via optimistic locking exactly like
 * {@code WalletMutationExecutor} already does for the main balance.
 */
@Component
class SavingsPocketMutationExecutor {

    private static final BigDecimal SECONDS_PER_YEAR = BigDecimal.valueOf(365L * 86400L);

    private final WalletRepository walletRepository;
    private final SavingsPocketRepository pocketRepository;
    private final BigDecimal defaultAnnualRate;
    private final BigDecimal minOpenAmount;
    private final long accrualPeriodSeconds;

    SavingsPocketMutationExecutor(
        WalletRepository walletRepository,
        SavingsPocketRepository pocketRepository,
        @Value("${ewallet-lab.savings-pocket.annual-rate:0.04}") BigDecimal defaultAnnualRate,
        @Value("${ewallet-lab.savings-pocket.min-open-amount:10000}") BigDecimal minOpenAmount,
        @Value("${ewallet-lab.savings-pocket.accrual-period-seconds:86400}") long accrualPeriodSeconds) {
        this.walletRepository = walletRepository;
        this.pocketRepository = pocketRepository;
        this.defaultAnnualRate = defaultAnnualRate;
        this.minOpenAmount = minOpenAmount;
        this.accrualPeriodSeconds = accrualPeriodSeconds;
    }

    @Transactional
    SavingsPocket openOnce(UUID userId, BigDecimal initialAmount) {
        if (initialAmount.compareTo(minOpenAmount) < 0) {
            throw new IllegalStateException(
                "Số tiền mở Túi Thần Tài lần đầu tối thiểu %s".formatted(formatVnd(minOpenAmount)));
        }
        Wallet wallet = getOrCreateWalletInternal(userId);
        if (pocketRepository.findByWalletId(wallet.getId()).isPresent()) {
            throw new IllegalStateException("Túi Thần Tài đã được mở trước đó");
        }
        wallet.debit(initialAmount);
        walletRepository.save(wallet);
        SavingsPocket pocket = new SavingsPocket(wallet.getId(), initialAmount, defaultAnnualRate);
        return pocketRepository.save(pocket);
    }

    @Transactional
    SavingsPocket depositOnce(UUID userId, BigDecimal amount) {
        Wallet wallet = getOrCreateWalletInternal(userId);
        SavingsPocket pocket = requirePocket(wallet.getId());
        applyAccrual(pocket);
        wallet.debit(amount);
        walletRepository.save(wallet);
        pocket.credit(amount);
        return pocketRepository.save(pocket);
    }

    @Transactional
    SavingsPocket withdrawOnce(UUID userId, BigDecimal amount) {
        Wallet wallet = getOrCreateWalletInternal(userId);
        SavingsPocket pocket = requirePocket(wallet.getId());
        applyAccrual(pocket);
        pocket.debit(amount);
        pocketRepository.save(pocket);
        wallet.credit(amount);
        walletRepository.save(wallet);
        return pocket;
    }

    /** Read path — still writes the caught-up balance/lastAccrualAt so the accrual watermark
     * actually advances (not just computed transiently for display), same "lazy but persisted"
     * approach a lazy-expiry check (issue #10) used for its own watermark. */
    @Transactional
    SavingsPocket viewOnce(UUID userId) {
        Wallet wallet = getOrCreateWalletInternal(userId);
        SavingsPocket pocket = requirePocket(wallet.getId());
        applyAccrual(pocket);
        return pocketRepository.save(pocket);
    }

    private SavingsPocket requirePocket(UUID walletId) {
        return pocketRepository.findByWalletId(walletId)
            .orElseThrow(() -> new SavingsPocketNotOpenException("Chưa mở Túi Thần Tài"));
    }

    /**
     * Lazy-compute accrual: catches up every WHOLE accrual period elapsed since
     * {@code lastAccrualAt}, compounding daily per {@code interest = balance * annualRate / 365}
     * (see backend DESIGN.md). {@code accrualPeriodSeconds} defaults to a real day (86400) but is
     * overridable so a real accrual cycle can be exercised quickly in verification (same "shrink a
     * real duration, then revert" pattern used for lucky-money's TTL in issue #10) — the per-period
     * interest fraction is scaled by the period length, not hardcoded to "divide by 365", so
     * shrinking the period for a test doesn't change the underlying annual-rate math.
     */
    private void applyAccrual(SavingsPocket pocket) {
        Instant now = Instant.now();
        long elapsedSeconds = now.getEpochSecond() - pocket.getLastAccrualAt().getEpochSecond();
        if (elapsedSeconds < accrualPeriodSeconds) {
            return;
        }
        long periods = Math.min(elapsedSeconds / accrualPeriodSeconds, 3650L);
        BigDecimal periodFraction = BigDecimal.valueOf(accrualPeriodSeconds)
            .divide(SECONDS_PER_YEAR, 12, RoundingMode.HALF_UP);
        BigDecimal balance = pocket.getBalance();
        for (long i = 0; i < periods; i++) {
            BigDecimal interest = balance.multiply(pocket.getAnnualRate()).multiply(periodFraction)
                .setScale(0, RoundingMode.HALF_UP);
            balance = balance.add(interest);
        }
        pocket.setBalance(balance);
        pocket.setLastAccrualAt(pocket.getLastAccrualAt().plusSeconds(periods * accrualPeriodSeconds));
    }

    private Wallet getOrCreateWalletInternal(UUID userId) {
        return walletRepository.findByUserId(userId)
            .orElseGet(() -> walletRepository.save(new Wallet(userId)));
    }

    private static String formatVnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }
}
