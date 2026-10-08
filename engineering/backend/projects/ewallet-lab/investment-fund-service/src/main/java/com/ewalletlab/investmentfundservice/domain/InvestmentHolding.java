package com.ewalletlab.investmentfundservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "investment_holdings",
    uniqueConstraints = @UniqueConstraint(name = "uk_investment_holding_user_fund", columnNames = {"user_id", "fund_id"})
)
public class InvestmentHolding {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal units;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalInvested;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    protected InvestmentHolding() {
    }

    public InvestmentHolding(UUID userId, UUID fundId) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.fundId = fundId;
        this.units = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
        this.totalInvested = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        this.updatedAt = Instant.now();
    }

    public void addUnits(BigDecimal additionalUnits, BigDecimal additionalAmount) {
        this.units = this.units.add(additionalUnits).setScale(4, RoundingMode.HALF_UP);
        this.totalInvested = this.totalInvested.add(additionalAmount).setScale(2, RoundingMode.HALF_UP);
        this.updatedAt = Instant.now();
    }

    /**
     * Deducts units and proportionally reduces totalInvested.
     * @return the amount of totalInvested that was reduced.
     */
    public BigDecimal deductUnits(BigDecimal unitsToDeduct) {
        if (unitsToDeduct.compareTo(this.units) > 0) {
            throw new IllegalStateException("Số lượng chứng chỉ quỹ nắm giữ không đủ để bán");
        }
        BigDecimal ratio = this.units.compareTo(BigDecimal.ZERO) == 0 
            ? BigDecimal.ONE 
            : unitsToDeduct.divide(this.units, 6, RoundingMode.HALF_UP);
        
        BigDecimal investedReduction = this.totalInvested.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
        if (investedReduction.compareTo(this.totalInvested) > 0 || unitsToDeduct.compareTo(this.units) == 0) {
            investedReduction = this.totalInvested;
        }

        this.units = this.units.subtract(unitsToDeduct).setScale(4, RoundingMode.HALF_UP);
        this.totalInvested = this.totalInvested.subtract(investedReduction).setScale(2, RoundingMode.HALF_UP);
        this.updatedAt = Instant.now();
        return investedReduction;
    }

    /** Reverts deduction in case external credit fails (compensation). */
    public void restoreDeduction(BigDecimal restoredUnits, BigDecimal restoredInvested) {
        this.units = this.units.add(restoredUnits).setScale(4, RoundingMode.HALF_UP);
        this.totalInvested = this.totalInvested.add(restoredInvested).setScale(2, RoundingMode.HALF_UP);
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getFundId() {
        return fundId;
    }

    public BigDecimal getUnits() {
        return units;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}

