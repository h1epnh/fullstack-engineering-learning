package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

/**
 * Holds the actual, single-attempt, {@code @Transactional} credit/debit logic in a bean separate
 * from {@link WalletService} on purpose: retrying an optimistic-lock failure (see issue #5) needs
 * each attempt to run in a brand-new transaction that re-reads the wallet row (and its {@code
 * @Version}) from scratch. Spring's {@code @Transactional} is only honored through a proxy, so a
 * method can't retry itself transactionally by calling itself — the retry loop has to live in a
 * different bean ({@link WalletService}) calling into this one.
 */
@Component
class WalletMutationExecutor {

    /**
     * Transaction types that count towards the monthly outbound limit (issue #7, Điều 26 Thông tư
     * 40/2024/TT-NHNN, sửa bởi Thông tư 41/2025/TT-NHNN): transfer/thanh toán ra khỏi ví. Deliberately
     * excludes {@code TOPUP}/{@code TRANSFER_IN}/{@code REFUND} — the law caps outbound
     * transfer/payment volume, not money coming into the wallet. See backend DESIGN.md's "Hạn mức
     * giao dịch/tháng" section for the full source + scope reasoning (including why this is a flat
     * 100tr for every type here rather than the 300tr essential-services carve-out from Thông tư
     * 41/2025 — bill-payment-service has no real domain mapping to essential-service categories to
     * apply that carve-out safely). {@code BNPL_REPAYMENT} (issue #18) is excluded on purpose: the
     * same Điều 26 lists "trả nợ vay đến hạn/quá hạn tại TCTD" as not counting towards the cap.
     */
    private static final Set<TransactionType> MONTHLY_LIMIT_TYPES =
        EnumSet.of(TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT, TransactionType.WITHDRAW,
            TransactionType.INVESTMENT_BUY, TransactionType.SAVINGS_GOAL_DEPOSIT, TransactionType.VOUCHER_PASS_PURCHASE);

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final BigDecimal monthlyOutboundLimit;
    private final StepUpPolicy stepUpPolicy;
    private final FamilyWalletServiceClient familyWalletServiceClient;

    WalletMutationExecutor(WalletRepository walletRepository, TransactionRepository transactionRepository,
                            @Value("${ewallet-lab.monthly-outbound-limit:100000000}") BigDecimal monthlyOutboundLimit,
                            StepUpPolicy stepUpPolicy, FamilyWalletServiceClient familyWalletServiceClient) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.monthlyOutboundLimit = monthlyOutboundLimit;
        this.stepUpPolicy = stepUpPolicy;
        this.familyWalletServiceClient = familyWalletServiceClient;
    }

    /**
     * Issue #22 — {@code idempotencyKey} pre-check: if a {@code Transaction} with this exact key
     * already exists, this call has already been fully applied (either by an earlier attempt that
     * committed before a caller's own crash, or by a concurrent duplicate that just won the race) —
     * short-circuit to the wallet's CURRENT state without crediting again. This is the fast path;
     * {@link WalletService#credit} also catches the DB-level UNIQUE-constraint violation as a
     * fallback for the rare case 2 calls race past this check at the same instant (see
     * {@code Transaction.idempotencyKey}'s javadoc for why a separate column, not {@code
     * reference}).
     */
    @Transactional
    Wallet creditOnce(UUID userId, BigDecimal amount, TransactionType type, String reference, String note,
                       String idempotencyKey) {
        Wallet wallet = getOrCreateWalletInternal(userId);
        if (idempotencyKey != null && transactionRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
            return wallet;
        }
        wallet.credit(amount);
        walletRepository.save(wallet);
        transactionRepository.save(new Transaction(wallet.getId(), type, amount, reference, note, idempotencyKey));
        return wallet;
    }

    /**
     * Throws IllegalStateException (mapped to 409 by the controller) if balance is insufficient OR
     * if this debit would push the wallet's cumulative outbound total for the current calendar
     * month over {@link #monthlyOutboundLimit} (issue #7). The monthly check runs BEFORE
     * {@code wallet.debit(amount)}, inside this same {@code @Transactional} method — not as a
     * separate pre-check — so it shares the same optimistic-lock-driven serialization as the
     * balance check: if two concurrent debits race, the loser's {@code walletRepository.save}
     * throws {@code ObjectOptimisticLockingFailureException}, {@link WalletService}'s retry re-runs
     * this whole method from scratch, and the retry's fresh sum query sees the winner's now-committed
     * transaction row. Computing the sum outside this transaction (e.g. in {@link WalletService}
     * before calling this method) would reopen exactly that race.
     */
    @Transactional
    Wallet debitOnce(UUID userId, BigDecimal amount, TransactionType type, String reference, String note,
                      boolean stepUpConfirmed, String idempotencyKey) {
        Wallet wallet = getOrCreateWalletInternal(userId);
        if (idempotencyKey != null && transactionRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
            return wallet;
        }
        if (MONTHLY_LIMIT_TYPES.contains(type)) {
            BigDecimal spentThisMonth = transactionRepository.sumAmountByWalletIdAndTypeInSince(
                wallet.getId(), MONTHLY_LIMIT_TYPES, currentMonthStart());
            BigDecimal projectedSpend = spentThisMonth.add(amount);
            if (projectedSpend.compareTo(monthlyOutboundLimit) > 0) {
                throw new IllegalStateException(
                    "Đã vượt hạn mức giao dịch chuyển tiền/thanh toán %s/tháng theo Điều 26 Thông tư 40/2024/TT-NHNN (sửa bởi Thông tư 41/2025/TT-NHNN)"
                        .formatted(formatVnd(monthlyOutboundLimit)));
            }
            // Issue #12 — "Ví Gia Đình" (VNPay-inspired, NOT MoMo). Reuses the exact same
            // spentThisMonth/projectedSpend already computed above for the legal limit — a
            // parent-set limit is the identical measurement (outbound spend this calendar month),
            // just a second, independently-configured ceiling. Computed inside this same
            // @Transactional method for the same race-safety reason as the legal-limit block: a
            // losing optimistic-lock retry re-runs this whole method (including this sum) against
            // the winner's now-committed transaction row. See FamilyWalletServiceClient's javadoc
            // for why an unreachable family-wallet-service fails OPEN here (empty Optional) rather
            // than blocking every debit in the system.
            familyWalletServiceClient.findLimit(userId).ifPresent(familyLimit -> {
                if (projectedSpend.compareTo(familyLimit.monthlyLimit()) > 0) {
                    throw new IllegalStateException(
                        "Đã vượt hạn mức chi tiêu/tháng do quản trị viên Ví Gia Đình đặt (%s), dù số dư ví vẫn đủ"
                            .formatted(formatVnd(familyLimit.monthlyLimit())));
                }
            });
        }
        // Issue #15 — same "compute inside this same @Transactional method, not a separate
        // pre-check" reasoning as the monthly-limit block above: if this weren't in here, 2
        // concurrent debits both near the daily step-up threshold could both read the same
        // "not required yet" total and both slip through unconfirmed. Computing it here means a
        // losing optimistic-lock retry re-runs this whole method (including this sum) against the
        // winner's now-committed transaction row.
        if (StepUpPolicy.STEP_UP_DEBIT_TYPES.contains(type)) {
            BigDecimal spentToday = transactionRepository.sumAmountByWalletIdAndTypeInSince(
                wallet.getId(), StepUpPolicy.STEP_UP_TYPES, StepUpPolicy.currentDayStart());
            if (stepUpPolicy.requiresStepUp(spentToday, amount) && !stepUpConfirmed) {
                throw new StepUpRequiredException(stepUpPolicy.describeRequirement());
            }
        }
        wallet.debit(amount);
        walletRepository.save(wallet);
        transactionRepository.save(new Transaction(wallet.getId(), type, amount, reference, note, idempotencyKey));
        return wallet;
    }

    private Wallet getOrCreateWalletInternal(UUID userId) {
        return walletRepository.findByUserId(userId)
            .orElseGet(() -> walletRepository.save(new Wallet(userId)));
    }

    /**
     * Start of the current calendar month in the server's local timezone — issue #7 deliberately
     * interprets "trong một tháng" as calendar-month reset (1st of the month), not a rolling 30-day
     * window. See backend DESIGN.md for why.
     */
    private static Instant currentMonthStart() {
        return LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    private static String formatVnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }
}
