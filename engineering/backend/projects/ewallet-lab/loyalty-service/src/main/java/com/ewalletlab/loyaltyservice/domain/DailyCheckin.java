package com.ewalletlab.loyaltyservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Issue #38 — "Điểm danh mỗi ngày". One row per user per calendar day (server timezone, {@code
 * Asia/Ho_Chi_Minh} — see {@code LoyaltyProperties.zone()}), enforced by the {@code UNIQUE
 * (user_id, checkin_date)} constraint below — a brand-new table, so {@code ddl-auto: update}
 * creates it (and this constraint) correctly from the start, unlike the "add a constraint to an
 * EXISTING table" trap documented in CLAUDE.md.
 *
 * <p>{@link #streakDay} cycles 1→7 then wraps back to 1 on the NEXT consecutive day (not specified
 * explicitly by the issue beyond "đủ 7 ngày liên tục thưởng 50 điểm" — a weekly cycle restarting is
 * the standard shape every real daily-check-in program in the ticket's own sources uses; documented
 * as this lab's own interpretation in DESIGN.md, not a verified MoMo number). Missing a day resets
 * to 1 — computed by comparing this row's {@code checkinDate} to the previous one, see {@code
 * CheckinCalculator}.
 */
@Entity
@Table(name = "daily_checkins", uniqueConstraints = @UniqueConstraint(name = "uk_daily_checkins_user_date",
    columnNames = {"user_id", "checkin_date"}))
public class DailyCheckin {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "points_awarded", nullable = false)
    private int pointsAwarded;

    @Column(name = "streak_day", nullable = false)
    private int streakDay;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected DailyCheckin() {
        // JPA
    }

    public DailyCheckin(UUID userId, LocalDate checkinDate, int pointsAwarded, int streakDay, Instant createdAt) {
        this.userId = userId;
        this.checkinDate = checkinDate;
        this.pointsAwarded = pointsAwarded;
        this.streakDay = streakDay;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public LocalDate getCheckinDate() {
        return checkinDate;
    }

    public int getPointsAwarded() {
        return pointsAwarded;
    }

    public int getStreakDay() {
        return streakDay;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
