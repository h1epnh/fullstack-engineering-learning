package com.ewalletlab.loyaltyservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Point history ("lịch sử điểm"). EARN rows are keyed by the wallet-service transaction they came
 * from ({@code source_transaction_id} unique), which makes syncing idempotent: re-reading the same
 * wallet history can never award the same transaction twice.
 */
@Entity
@Table(name = "point_entries")
public class PointEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointEntryKind kind;

    /** Always positive; {@link #kind} gives the direction. */
    @Column(nullable = false)
    private long points;

    /** EARN: the eligible spend amount. REDEEM: the cashback amount credited. */
    @Column(name = "amount_vnd", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountVnd;

    @Column(name = "source_transaction_id", unique = true)
    private UUID sourceTransactionId;

    /** EARN: tier name used for the multiplier. */
    private String tier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointEntryStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected PointEntry() {
        // JPA
    }

    public static PointEntry earn(UUID accountId, long points, BigDecimal spend, UUID sourceTransactionId, String tier, Instant createdAt) {
        PointEntry e = new PointEntry();
        e.accountId = accountId;
        e.kind = PointEntryKind.EARN;
        e.points = points;
        e.amountVnd = spend;
        e.sourceTransactionId = sourceTransactionId;
        e.tier = tier;
        e.status = PointEntryStatus.COMPLETED;
        e.createdAt = createdAt;
        return e;
    }

    public static PointEntry pendingRedeem(UUID accountId, long points, BigDecimal cashback, Instant createdAt) {
        PointEntry e = new PointEntry();
        e.accountId = accountId;
        e.kind = PointEntryKind.REDEEM;
        e.points = points;
        e.amountVnd = cashback;
        e.status = PointEntryStatus.PENDING;
        e.createdAt = createdAt;
        return e;
    }

    public void markCompleted() {
        status = PointEntryStatus.COMPLETED;
    }

    public void markFailed() {
        status = PointEntryStatus.FAILED;
    }

    public UUID getId() { return id; }
    public UUID getAccountId() { return accountId; }
    public PointEntryKind getKind() { return kind; }
    public long getPoints() { return points; }
    public BigDecimal getAmountVnd() { return amountVnd; }
    public UUID getSourceTransactionId() { return sourceTransactionId; }
    public String getTier() { return tier; }
    public PointEntryStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
