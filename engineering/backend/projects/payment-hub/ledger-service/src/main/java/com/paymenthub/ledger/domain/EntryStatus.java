package com.paymenthub.ledger.domain;

/**
 * PROVISIONAL entries are recorded as soon as the orchestrator routes a transaction — before the
 * rail has actually confirmed settlement. FINAL means a settlement-confirmed event marked it
 * settled. REVERSED means the rail reported failure and a compensating entry was needed (see
 * DESIGN.md section 3, step 8 — "if screening fails after a provisional debit, compensate, don't
 * delete").
 */
public enum EntryStatus {
    PROVISIONAL,
    FINAL,
    REVERSED
}
