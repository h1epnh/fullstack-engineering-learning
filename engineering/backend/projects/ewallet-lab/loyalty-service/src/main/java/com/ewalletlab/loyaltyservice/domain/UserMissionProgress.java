package com.ewalletlab.loyaltyservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Issue #38 — "Nhiệm vụ hàng ngày". One row per (user, mission, calendar day) — {@code UNIQUE
 * (user_id, mission_code, target_date)} below, brand-new table so this constraint IS correctly
 * applied by {@code ddl-auto: update} on creation (unlike the existing-table trap in CLAUDE.md).
 *
 * <p>{@code @Version} per the ticket's explicit requirement — belt-and-suspenders on top of the
 * {@code LoyaltyAccount} row's own pessimistic lock ({@code LoyaltyAccountRepository.lockByUserId})
 * that {@code LoyaltyMutationExecutor#claimMissionOnce} already acquires before touching this row
 * (every claim for one user is already fully serialized through that lock — see its javadoc for
 * why this service uses pessimistic locking as its concurrency idiom instead of the
 * optimistic-lock-with-retry shape other services in this lab use). The {@code @Version} here
 * would only ever matter if something bypassed that lock in the future.
 */
@Entity
@Table(name = "user_mission_progress", uniqueConstraints = @UniqueConstraint(
    name = "uk_user_mission_progress_user_mission_date", columnNames = {"user_id", "mission_code", "target_date"}))
public class UserMissionProgress {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "mission_code", nullable = false)
    private String missionCode;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionStatus status;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "claimed_at")
    private Instant claimedAt;

    @Version
    private Long version;

    protected UserMissionProgress() {
        // JPA
    }

    public UserMissionProgress(UUID userId, String missionCode, LocalDate targetDate) {
        this.userId = userId;
        this.missionCode = missionCode;
        this.targetDate = targetDate;
        this.status = MissionStatus.IN_PROGRESS;
    }

    public void markCompleted(Instant now) {
        if (status == MissionStatus.IN_PROGRESS) {
            status = MissionStatus.COMPLETED;
            completedAt = now;
        }
    }

    public void markClaimed(Instant now) {
        status = MissionStatus.CLAIMED;
        claimedAt = now;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getMissionCode() {
        return missionCode;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public MissionStatus getStatus() {
        return status;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getClaimedAt() {
        return claimedAt;
    }
}
