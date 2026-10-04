package com.ewalletlab.bnplservice.domain;

public enum RepaymentStatus {
    /** Debt already reduced (claimed), wallet-service debit not yet confirmed. */
    PENDING,
    COMPLETED,
    /** wallet-service refused/failed the debit — the claimed debt reduction was reverted. */
    FAILED
}
