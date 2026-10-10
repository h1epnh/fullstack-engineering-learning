package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "merchant_withdrawal_trackers", uniqueConstraints = @UniqueConstraint(name = "uk_merchant_tracker_user_month", columnNames = {"user_id", "year_month"}))
public class MerchantWithdrawalTracker {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "year_month", nullable = false, length = 7)
    private String yearMonth;

    @Column(name = "cumulative_withdrawn", nullable = false)
    private BigDecimal cumulativeWithdrawn;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MerchantWithdrawalTracker() {
        // JPA
    }

    public MerchantWithdrawalTracker(UUID userId, String yearMonth, BigDecimal cumulativeWithdrawn) {
        this.userId = userId;
        this.yearMonth = yearMonth;
        this.cumulativeWithdrawn = cumulativeWithdrawn;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void preSave() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getYearMonth() {
        return yearMonth;
    }

    public BigDecimal getCumulativeWithdrawn() {
        return cumulativeWithdrawn;
    }

    public void setCumulativeWithdrawn(BigDecimal cumulativeWithdrawn) {
        this.cumulativeWithdrawn = cumulativeWithdrawn;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
