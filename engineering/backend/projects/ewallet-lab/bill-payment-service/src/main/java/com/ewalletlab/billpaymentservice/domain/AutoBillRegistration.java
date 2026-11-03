package com.ewalletlab.billpaymentservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auto_bill_registrations")
public class AutoBillRegistration {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BillCategory category;

    @Column(name = "customer_code", nullable = false, length = 64)
    private String customerCode;

    @Column(name = "max_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "auto_pay_day", nullable = false)
    private Integer autoPayDay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AutoBillStatus status;

    @Column(name = "spike_alert_threshold_percent")
    private Double spikeAlertThresholdPercent = 30.0;

    @Column(name = "held_amount", precision = 19, scale = 2)
    private BigDecimal heldAmount;

    @Column(name = "held_period", length = 32)
    private String heldPeriod;

    @Column(name = "held_reason", length = 500)
    private String heldReason;

    @Column(name = "held_previous_amount", precision = 19, scale = 2)
    private BigDecimal heldPreviousAmount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AutoBillRegistration() {
    }

    public AutoBillRegistration(UUID userId, BillCategory category, String customerCode,
                                BigDecimal maxAmount, Integer autoPayDay) {
        this(userId, category, customerCode, maxAmount, autoPayDay, 30.0);
    }

    public AutoBillRegistration(UUID userId, BillCategory category, String customerCode,
                                BigDecimal maxAmount, Integer autoPayDay, Double spikeAlertThresholdPercent) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.category = category;
        this.customerCode = customerCode;
        this.maxAmount = maxAmount;
        this.autoPayDay = autoPayDay;
        this.status = AutoBillStatus.ACTIVE;
        this.spikeAlertThresholdPercent = spikeAlertThresholdPercent != null ? spikeAlertThresholdPercent : 30.0;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public BillCategory getCategory() {
        return category;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public BigDecimal getMaxAmount() {
        return maxAmount;
    }

    public void setMaxAmount(BigDecimal maxAmount) {
        this.maxAmount = maxAmount;
        this.updatedAt = Instant.now();
    }

    public Integer getAutoPayDay() {
        return autoPayDay;
    }

    public void setAutoPayDay(Integer autoPayDay) {
        this.autoPayDay = autoPayDay;
        this.updatedAt = Instant.now();
    }

    public AutoBillStatus getStatus() {
        return status;
    }

    public void setStatus(AutoBillStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Double getSpikeAlertThresholdPercent() {
        return spikeAlertThresholdPercent != null ? spikeAlertThresholdPercent : 30.0;
    }

    public void setSpikeAlertThresholdPercent(Double spikeAlertThresholdPercent) {
        this.spikeAlertThresholdPercent = spikeAlertThresholdPercent;
        this.updatedAt = Instant.now();
    }

    public BigDecimal getHeldAmount() {
        return heldAmount;
    }

    public void setHeldAmount(BigDecimal heldAmount) {
        this.heldAmount = heldAmount;
        this.updatedAt = Instant.now();
    }

    public String getHeldPeriod() {
        return heldPeriod;
    }

    public void setHeldPeriod(String heldPeriod) {
        this.heldPeriod = heldPeriod;
        this.updatedAt = Instant.now();
    }

    public String getHeldReason() {
        return heldReason;
    }

    public void setHeldReason(String heldReason) {
        this.heldReason = heldReason;
        this.updatedAt = Instant.now();
    }

    public BigDecimal getHeldPreviousAmount() {
        return heldPreviousAmount;
    }

    public void setHeldPreviousAmount(BigDecimal heldPreviousAmount) {
        this.heldPreviousAmount = heldPreviousAmount;
        this.updatedAt = Instant.now();
    }

    public void clearHeld() {
        this.heldAmount = null;
        this.heldPeriod = null;
        this.heldReason = null;
        this.heldPreviousAmount = null;
        this.updatedAt = Instant.now();
    }
}

