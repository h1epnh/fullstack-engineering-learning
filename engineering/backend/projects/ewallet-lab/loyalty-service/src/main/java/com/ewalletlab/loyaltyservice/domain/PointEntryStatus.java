package com.ewalletlab.loyaltyservice.domain;

public enum PointEntryStatus {
    /** REDEEM only: points already deducted (claimed), wallet-service credit not yet confirmed. */
    PENDING,
    COMPLETED,
    /** REDEEM only: wallet-service credit failed — points were given back. */
    FAILED
}
