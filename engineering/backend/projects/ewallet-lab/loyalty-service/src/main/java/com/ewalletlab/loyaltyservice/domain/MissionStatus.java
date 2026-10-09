package com.ewalletlab.loyaltyservice.domain;

/** Issue #38 — lifecycle of a {@link UserMissionProgress} row for one (user, mission, day). */
public enum MissionStatus {
    /** Not yet done today — the default state, including for a day that hasn't been looked at yet
     * (see {@code LoyaltyService#missions}' lazy upsert). */
    IN_PROGRESS,
    /** The qualifying wallet-service transaction was found for today, reward not claimed yet. */
    COMPLETED,
    /** Reward points already credited — terminal for today, re-eligible again next calendar day
     * (a new row, new {@code targetDate}). */
    CLAIMED
}
