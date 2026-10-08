package com.ewalletlab.walletservice.domain;

public enum TransactionType {
    TOPUP,
    WITHDRAW,
    TRANSFER_OUT,
    TRANSFER_IN,
    BILL_PAYMENT,
    /** Compensating credit for a debit that turned out not to complete — e.g. an outbound bank
     * transfer whose async IPN reports failure after the wallet was already debited synchronously.
     * See topup-service's BankTransferOutIpnController. */
    REFUND,
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
    BNPL_REPAYMENT,
    /** Issue #19 — cashback credited to the main wallet when "Điểm thưởng" points are redeemed
     * (loyalty-service). Incoming money: not spending, not in MONTHLY_LIMIT_TYPES, and not a type
     * that earns points (only BILL_PAYMENT does), so it can't loop. Needs the same CHECK-constraint
     * ALTER on existing Postgres DBs as BNPL_REPAYMENT — see backend DESIGN.md. */
    LOYALTY_REDEMPTION,
    /**
     * Issue #25 — Sàn Đầu Tư (investment-fund-service).
     * Debit to buy investment fund certificates. Counted in monthly limit #7 (Điều 26 TT 40/2024)
     * and step-up auth #15 (QĐ 2345/QĐ-NHNN).
     */
    INVESTMENT_BUY,
    /**
     * Issue #25 — Sàn Đầu Tư (investment-fund-service).
     * Credit from selling investment fund certificates. Incoming funds: not counted in monthly limit
     * and does not require step-up auth.
     */
    INVESTMENT_SELL,
    /**
     * Issue #27 — Mục tiêu tiết kiệm (Goal-based Savings).
     * Debit to deposit money into a personal savings goal. Counted in monthly limit #7 (Điều 26 TT 40/2024)
     * and step-up auth #15 (QĐ 2345/QĐ-NHNN).
     */
    SAVINGS_GOAL_DEPOSIT,
    /**
     * Issue #27 — Mục tiêu tiết kiệm (Goal-based Savings).
     * Credit to withdraw money from a savings goal back to the main wallet. Incoming funds: not counted
     * in monthly limit and does not require step-up auth.
     */
    SAVINGS_GOAL_WITHDRAW,
    /**
     * Issue #28 — Cơ chế Voucher Pass (Gói Voucher Hội viên tiết kiệm).
     * Debit to purchase a voucher pass package. Counted in monthly limit #7 (Điều 26 TT 40/2024)
     * and step-up auth #15 (QĐ 2345/QĐ-NHNN).
     */
    VOUCHER_PASS_PURCHASE
}
