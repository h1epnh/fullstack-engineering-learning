package com.ewalletlab.luckymoneyservice.service;

import java.math.BigDecimal;
import java.util.UUID;

/** Issue #56 — everything the relay needs for the wallet-service credit and for compensation.
 * {@code subjectId} = lucky money id or gift card id; {@code userId} = wallet to credit;
 * {@code senderId} = who to refund if a gift card recipient credit permanently fails. */
record OutboxPayload(UUID subjectId, UUID userId, BigDecimal amount, String walletType, String reference,
                      String note, UUID senderId) {
}
