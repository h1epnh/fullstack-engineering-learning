package com.ewalletlab.walletservice.domain;

/** Issue #36 — "Bộ lọc lịch sử giao dịch thông minh". Every {@link TransactionType} is permanently
 * one or the other (see that enum's own {@code direction()} — single source of truth, not a
 * separately-maintained {@code Set} that could drift out of sync when a new type is added). */
public enum TransactionDirection {
    /** Money moved INTO the wallet. */
    IN,
    /** Money moved OUT of the wallet. */
    OUT
}
