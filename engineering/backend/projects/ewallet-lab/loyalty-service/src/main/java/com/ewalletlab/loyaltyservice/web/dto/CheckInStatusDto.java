package com.ewalletlab.loyaltyservice.web.dto;

import java.time.LocalDate;

/** Issue #38 — {@code GET /loyalty/check-in/status}. {@code currentStreakDay} is the streak that
 * WOULD apply if the user checks in right now (already-computed via {@code CheckinCalculator}, so
 * the frontend doesn't have to re-implement the streak math just to render "ngày 3/7" before the
 * button is even pressed). */
public record CheckInStatusDto(boolean checkedInToday, int currentStreakDay, LocalDate lastCheckinDate) {
}
