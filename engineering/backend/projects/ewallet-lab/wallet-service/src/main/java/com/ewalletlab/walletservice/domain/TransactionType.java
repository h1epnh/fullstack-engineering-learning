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
    REFUND
}
