package com.ewalletlab.fundservice.domain;

/** Issue #22 — Outbox pattern pilot. See {@link OutboxEvent}'s javadoc. */
public enum OutboxEventStatus {
    /** Written in the SAME local transaction as the business state it follows up on, not yet
     * relayed to wallet-service (or relayed but not yet confirmed delivered). The relay job polls
     * exactly this status. */
    PENDING,
    /** wallet-service confirmed the credit/debit succeeded (HTTP 2xx, possibly via its own
     * idempotent-replay short-circuit on a retried call) — terminal, never revisited. */
    DELIVERED,
    /** wallet-service rejected the call with a client error (4xx) a fixed number of times in a row
     * (see {@code FundOutboxRelay#PERMANENT_FAILURE_ATTEMPTS}) — treated as a permanent business
     * failure (e.g. insufficient balance), NOT a transient one. Terminal: the relay has already run
     * the matching compensation (revert the local optimistic claim) before flipping to this status
     * — see {@code FundOutboxRelay#compensate}. */
    FAILED
}
