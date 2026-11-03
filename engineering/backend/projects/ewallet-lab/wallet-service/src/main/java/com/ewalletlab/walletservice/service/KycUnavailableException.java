package com.ewalletlab.walletservice.service;

/**
 * Issue #55 (TD-08, ADR-02) — wallet-service could not determine the user's eKYC tier (user-service
 * timeout / 5xx / connection error) while a money-OUT debit needed it. Fail-CLOSED: the debit is
 * rejected BEFORE any state is changed, so callers may safely retry later. Mapped to HTTP 503 by
 * {@code WalletController}. Not used for credits (direction IN never calls user-service).
 */
public class KycUnavailableException extends RuntimeException {

    public KycUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
