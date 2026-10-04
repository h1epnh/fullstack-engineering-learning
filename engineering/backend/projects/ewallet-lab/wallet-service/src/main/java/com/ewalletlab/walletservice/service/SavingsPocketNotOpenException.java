package com.ewalletlab.walletservice.service;

/** Issue #13 — thrown when a user without an open "Túi Thần Tài" calls deposit/withdraw/view.
 * Mapped by the controller to 404 (distinct from the 409s used for insufficient-balance/already-open). */
public class SavingsPocketNotOpenException extends RuntimeException {
    public SavingsPocketNotOpenException(String message) {
        super(message);
    }
}
