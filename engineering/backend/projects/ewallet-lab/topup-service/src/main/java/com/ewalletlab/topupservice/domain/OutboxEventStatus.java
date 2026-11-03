package com.ewalletlab.topupservice.domain;

/**
 * Issue #66 (TD-04b) — Lifecycle statuses for OutboxEvent.
 */
public enum OutboxEventStatus {
    PENDING,
    DELIVERED,
    FAILED
}
