package com.ewalletlab.loyaltyservice.web.dto;

/** Issue #38 — {@code POST /loyalty/missions/{missionCode}/claim}'s response. */
public record ClaimMissionResultDto(String missionCode, int pointsAwarded, long pointsBalance) {
}
