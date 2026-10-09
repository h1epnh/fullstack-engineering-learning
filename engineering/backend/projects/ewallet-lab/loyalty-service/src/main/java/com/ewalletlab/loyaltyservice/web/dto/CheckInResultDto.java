package com.ewalletlab.loyaltyservice.web.dto;

/** Issue #38 — {@code POST /loyalty/check-in}'s response. */
public record CheckInResultDto(int pointsAwarded, int streakDay, long pointsBalance) {
}
