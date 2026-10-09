package com.ewalletlab.walletservice.domain;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * Issue #36 — each constant now carries its {@link TransactionDirection} (IN = money credited to
 * the wallet, OUT = money debited from it) as part of the enum definition itself, verified against
 * each type's own javadoc below (every one already documented whether it's a credit or a debit
 * when it was added) rather than re-deriving/guessing it in a second, separately-maintained
 * {@code Set} elsewhere that could silently drift out of sync the next time a type is added (same
 * failure mode {@code WalletMutationExecutor.MONTHLY_LIMIT_TYPES} already has to be kept in sync by
 * hand today). Single source of truth for "is this type money in or out" — {@link #direction()}.
 */
public enum TransactionType {
    TOPUP(TransactionDirection.IN),
    WITHDRAW(TransactionDirection.OUT),
    TRANSFER_OUT(TransactionDirection.OUT),
    TRANSFER_IN(TransactionDirection.IN),
    BILL_PAYMENT(TransactionDirection.OUT),
    /** Compensating credit for a debit that turned out not to complete — e.g. an outbound bank
     * transfer whose async IPN reports failure after the wallet was already debited synchronously.
     * See topup-service's BankTransferOutIpnController. */
    REFUND(TransactionDirection.IN),
    /**
     * Issue #18 — "Ví Trả Sau" (BNPL) repayment, real money leaving the main wallet to pay down a
     * mock credit-line balance held by {@code bnpl-service}. Deliberately NOT {@code WITHDRAW}
     * (means "cash out to a bank account") or {@code TRANSFER_OUT} (means "P2P to another user") —
     * reusing either would mislabel this in the user-facing ledger. See backend DESIGN.md's "Ví Trả
     * Sau" section: counted in {@link StepUpPolicy}'s scope (issue #15 — no exemption found for QĐ
     * 2345/QĐ-NHNN), but deliberately EXCLUDED from {@code WalletMutationExecutor}'s
     * {@code MONTHLY_LIMIT_TYPES} (issue #7 — Điều 26 Thông tư 40/2024/TT-NHNN's own exception list
     * for "trả nợ vay đến hạn/quá hạn tại TCTD").
     */
    BNPL_REPAYMENT(TransactionDirection.OUT),
    /** Issue #19 — cashback credited to the main wallet when "Điểm thưởng" points are redeemed
     * (loyalty-service). Incoming money: not spending, not in MONTHLY_LIMIT_TYPES, and not a type
     * that earns points (only BILL_PAYMENT does), so it can't loop. Needs the same CHECK-constraint
     * ALTER on existing Postgres DBs as BNPL_REPAYMENT — see backend DESIGN.md. */
    LOYALTY_REDEMPTION(TransactionDirection.IN),
    /**
     * Issue #25 — Sàn Đầu Tư (investment-fund-service).
     * Debit to buy investment fund certificates. Counted in monthly limit #7 (Điều 26 TT 40/2024)
     * and step-up auth #15 (QĐ 2345/QĐ-NHNN).
     */
    INVESTMENT_BUY(TransactionDirection.OUT),
    /**
     * Issue #25 — Sàn Đầu Tư (investment-fund-service).
     * Credit from selling investment fund certificates. Incoming funds: not counted in monthly limit
     * and does not require step-up auth.
     */
    INVESTMENT_SELL(TransactionDirection.IN),
    /**
     * Issue #27 — Mục tiêu tiết kiệm (Goal-based Savings).
     * Debit to deposit money into a personal savings goal. Counted in monthly limit #7 (Điều 26 TT 40/2024)
     * and step-up auth #15 (QĐ 2345/QĐ-NHNN).
     */
    SAVINGS_GOAL_DEPOSIT(TransactionDirection.OUT),
    /**
     * Issue #27 — Mục tiêu tiết kiệm (Goal-based Savings).
     * Credit to withdraw money from a savings goal back to the main wallet. Incoming funds: not counted
     * in monthly limit and does not require step-up auth.
     */
    SAVINGS_GOAL_WITHDRAW(TransactionDirection.IN),
    /**
     * Issue #28 — Cơ chế Voucher Pass (Gói Voucher Hội viên tiết kiệm).
     * Debit to purchase a voucher pass package. Counted in monthly limit #7 (Điều 26 TT 40/2024)
     * and step-up auth #15 (QĐ 2345/QĐ-NHNN).
     */
    VOUCHER_PASS_PURCHASE(TransactionDirection.OUT);

    private final TransactionDirection direction;

    TransactionType(TransactionDirection direction) {
        this.direction = direction;
    }

    public TransactionDirection direction() {
        return direction;
    }

    /** Issue #36 — backs the "Tiền vào (+) / Tiền ra (-)" filter tab on
     * {@code GET /wallets/{userId}/transactions/search} and the opening/closing-balance math on
     * {@code GET /wallets/{userId}/statement}. Computed once, not per-call — this enum never
     * changes at runtime. */
    public static Set<TransactionType> allOfDirection(TransactionDirection direction) {
        EnumSet<TransactionType> result = EnumSet.noneOf(TransactionType.class);
        for (TransactionType type : values()) {
            if (type.direction == direction) {
                result.add(type);
            }
        }
        return Collections.unmodifiableSet(result);
    }
}
