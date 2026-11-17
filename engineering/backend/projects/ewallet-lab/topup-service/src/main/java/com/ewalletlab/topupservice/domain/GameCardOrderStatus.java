package com.ewalletlab.topupservice.domain;

public enum GameCardOrderStatus {
    /** A fulfiller holds the claim (see GameCardOrder.fulfillToken): debit/issue in progress. */
    PENDING,
    COMPLETED,
    /** Atomically decided "no card will ever be issued"; wallet refund is (being) applied by key. */
    FAILED_REFUNDED
}
