package com.ewalletlab.billpaymentservice.domain;

/**
 * Issue #37: Payment Source Priority & BNPL.
 * MAIN_WALLET = Ví chính (default)
 * BNPL_WALLET = Ví Trả Sau
 */
public enum PaymentSource {
    MAIN_WALLET,
    BNPL_WALLET
}
