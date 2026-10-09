package com.ewalletlab.fundservice.service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Issue #22 — the JSON shape stored in {@code OutboxEvent.payload}, shared by all 3 {@code
 * OutboxEventType}s (see its javadoc). Jackson (de)serializes this directly — no custom
 * converter needed, it's a flat record of primitives/UUID/BigDecimal, all of which Jackson handles
 * natively.
 */
record OutboxPayload(UUID fundId, UUID userId, BigDecimal amount, UUID fundTransactionId,
                      boolean stepUpConfirmed) {
}
