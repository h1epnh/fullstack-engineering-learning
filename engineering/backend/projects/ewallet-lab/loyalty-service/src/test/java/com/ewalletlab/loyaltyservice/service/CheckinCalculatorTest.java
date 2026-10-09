package com.ewalletlab.loyaltyservice.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

/** Issue #38 — pure streak math, no Spring context needed. */
class CheckinCalculatorTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 9);

    @Test
    void firstEverCheckinIsStreakDayOne() {
        assertThat(CheckinCalculator.nextStreakDay(null, 0, TODAY)).isEqualTo(1);
    }

    @Test
    void consecutiveDayAdvancesTheStreak() {
        assertThat(CheckinCalculator.nextStreakDay(TODAY.minusDays(1), 2, TODAY)).isEqualTo(3);
    }

    @Test
    void missingADayResetsToOne() {
        assertThat(CheckinCalculator.nextStreakDay(TODAY.minusDays(2), 4, TODAY)).isEqualTo(1);
        assertThat(CheckinCalculator.nextStreakDay(TODAY.minusDays(10), 7, TODAY)).isEqualTo(1);
    }

    @Test
    void dayEightWrapsBackToOne() {
        assertThat(CheckinCalculator.nextStreakDay(TODAY.minusDays(1), 7, TODAY)).isEqualTo(1);
    }

    @Test
    void pointsIncludeBonusesOnlyOnMilestoneDays() {
        assertThat(CheckinCalculator.pointsForStreakDay(1)).isEqualTo(5);
        assertThat(CheckinCalculator.pointsForStreakDay(2)).isEqualTo(5);
        assertThat(CheckinCalculator.pointsForStreakDay(3)).isEqualTo(20); // 5 + 15
        assertThat(CheckinCalculator.pointsForStreakDay(4)).isEqualTo(5);
        assertThat(CheckinCalculator.pointsForStreakDay(7)).isEqualTo(55); // 5 + 50
    }
}
