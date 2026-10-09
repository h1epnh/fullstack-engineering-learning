package com.ewalletlab.loyaltyservice.service;

import java.time.LocalDate;

/**
 * Issue #38 — pure streak/points math for "Điểm danh mỗi ngày", no I/O (same spirit as {@link
 * LoyaltyCalculator}, kept as its own small class rather than folded into it — tier/spend math and
 * check-in streak math are unrelated concepts that happen to live in the same service).
 *
 * <p>Point numbers (5 base, +15 at day 3, +50 at day 7) are exactly the ticket's own numbers —
 * already-sourced by agent-ba/agent-designer (MoMo "Nhiệm vụ & Điểm danh"), not independently
 * re-verified here.
 */
public final class CheckinCalculator {

    public static final int BASE_POINTS = 5;
    public static final int DAY_3_BONUS = 15;
    public static final int DAY_7_BONUS = 50;

    private CheckinCalculator() {
    }

    /**
     * {@code previousCheckinDate == null} (never checked in before) or more than 1 calendar day
     * before {@code today} → streak resets to day 1. Exactly 1 day before (yesterday) → streak
     * continues. {@code previousStreakDay % 7 + 1} means day 7 wraps back to day 1 on the next
     * consecutive day (a new weekly cycle) — the ticket doesn't specify this explicitly beyond "đủ
     * 7 ngày liên tục thưởng 50 điểm"; cycling is this lab's own interpretation (every real
     * check-in program surveyed for this ticket works this way), documented in DESIGN.md as such,
     * not a verified number.
     */
    public static int nextStreakDay(LocalDate previousCheckinDate, int previousStreakDay, LocalDate today) {
        if (previousCheckinDate != null && previousCheckinDate.equals(today.minusDays(1))) {
            return (previousStreakDay % 7) + 1;
        }
        return 1;
    }

    public static int pointsForStreakDay(int streakDay) {
        int points = BASE_POINTS;
        if (streakDay == 3) {
            points += DAY_3_BONUS;
        }
        if (streakDay == 7) {
            points += DAY_7_BONUS;
        }
        return points;
    }
}
