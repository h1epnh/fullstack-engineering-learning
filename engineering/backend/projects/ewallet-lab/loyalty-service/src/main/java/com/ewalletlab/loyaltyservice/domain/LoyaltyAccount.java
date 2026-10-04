package com.ewalletlab.loyaltyservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Issue #19 — one mock "Điểm thưởng" account per user, created lazily on first read.
 *
 * <p>{@link #enrolledAt}: only eligible transactions at or after enrollment earn points — like a
 * real program, joining doesn't retro-credit old history. (Tier qualification still looks at the
 * full rolling 12-month window, enrolled or not — see DESIGN.md.)
 *
 * <p>{@link #pointsBalance} is denormalized from the {@code PointEntry} ledger so a redemption can
 * check-and-decrement it under one row lock ({@code LoyaltyAccountRepository.lockByUserId}).
 */
@Entity
@Table(name = "loyalty_accounts")
public class LoyaltyAccount {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "points_balance", nullable = false)
    private long pointsBalance;

    @Column(name = "lifetime_earned", nullable = false)
    private long lifetimeEarned;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;

    @Version
    private Long version;

    protected LoyaltyAccount() {
        // JPA
    }

    public LoyaltyAccount(UUID userId, Instant enrolledAt) {
        this.userId = userId;
        this.enrolledAt = enrolledAt;
    }

    public void earn(long points) {
        pointsBalance += points;
        lifetimeEarned += points;
    }

    public void spend(long points) {
        pointsBalance -= points;
    }

    public void refund(long points) {
        pointsBalance += points;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public long getPointsBalance() { return pointsBalance; }
    public long getLifetimeEarned() { return lifetimeEarned; }
    public Instant getEnrolledAt() { return enrolledAt; }
}
