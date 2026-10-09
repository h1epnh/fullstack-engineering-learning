package com.ewalletlab.loyaltyservice.domain;

/**
 * Issue #38 — one row of {@code LoyaltyMissionCatalog.MISSIONS}. {@code requiredTransactionType}
 * is the wallet-service {@code TransactionType} name a mission is completed by (checked against
 * today's ledger — see {@code LoyaltyService#missions}) — data-driven on purpose, so completion
 * detection is 1 generic lookup instead of a hardcoded branch per mission code.
 */
public record LoyaltyMission(String code, String title, String description, int rewardPoints,
                              String requiredTransactionType, boolean active) {
}
