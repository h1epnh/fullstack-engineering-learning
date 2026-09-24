package com.paymenthub.orchestrator.domain;

/**
 * Transaction lifecycle. SWIFT/cross-border can sit in ROUTED for a long time before a
 * reconciliation job confirms SETTLED — ROUTED is "accepted by the rail", not "money moved".
 */
public enum TransactionStatus {
    PENDING,
    SCREENING,
    REJECTED,
    ROUTED,
    SETTLED,
    FAILED,
    REVERSED
}
