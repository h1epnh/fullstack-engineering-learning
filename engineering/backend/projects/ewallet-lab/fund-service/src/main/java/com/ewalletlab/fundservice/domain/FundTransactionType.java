package com.ewalletlab.fundservice.domain;

/** Issue #14 — a flat audit ledger for every balance movement a {@code Fund} goes through, same
 * spirit as wallet-service's own {@code Transaction} but scoped to this one fund's internal
 * balance (not a user's wallet). */
public enum FundTransactionType {
    /** A member moved money from their own wallet into the fund. */
    CONTRIBUTION,
    /** The creator moved money from the fund back to their own wallet, fund stays ACTIVE. */
    WITHDRAWAL,
    /** The creator closed the fund for good, withdrawing whatever remained in one shot. */
    DISSOLVE
}
