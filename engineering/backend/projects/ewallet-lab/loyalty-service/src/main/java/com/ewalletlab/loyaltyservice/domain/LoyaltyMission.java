package com.ewalletlab.loyaltyservice.domain;

/**
 * Issue #38, #69 — one row of {@code LoyaltyMissionCatalog.MISSIONS}. {@code requiredTransactionType}
 * is the wallet-service {@code TransactionType} name a mission is completed by.
 * {@code minAmountVnd} is the minimum transaction amount required to complete the mission.
 */
public record LoyaltyMission(String code, String title, String description, int rewardPoints,
                              String requiredTransactionType, long minAmountVnd, boolean active) {

    public LoyaltyMission(String code, String title, String description, int rewardPoints,
                          String requiredTransactionType, boolean active) {
        this(code, title, description, rewardPoints, requiredTransactionType, 50_000L, active);
    }

    public long getMinAmountVnd() {
        return minAmountVnd;
    }
}
