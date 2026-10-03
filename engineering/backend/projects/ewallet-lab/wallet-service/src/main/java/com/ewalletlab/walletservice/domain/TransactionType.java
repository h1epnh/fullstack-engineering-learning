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
    /** Issue #18 — repaying the MOCK "Ví Trả Sau" credit line (bnpl-service) from the main wallet.
     * Deliberately NOT in WalletMutationExecutor's MONTHLY_LIMIT_TYPES: Điều 26 Thông tư
     * 40/2024/TT-NHNN excludes "trả nợ vay đến hạn/quá hạn tại TCTD" from the 100tr/tháng cap.
     * Existing Postgres DBs need the transactions_type_check constraint widened by hand — see
     * backend DESIGN.md "Ví Trả Sau". */
    BNPL_REPAYMENT
}
