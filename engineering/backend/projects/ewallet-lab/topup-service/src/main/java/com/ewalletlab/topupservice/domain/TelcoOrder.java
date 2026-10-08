package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "telco_orders")
public class TelcoOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TelcoProvider telcoProvider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TelcoOrderType orderType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal denomination;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal discountRate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal finalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TelcoOrderStatus status;

    private String pinCode;

    private String serialNumber;

    @Column(length = 500)
    private String failureReason;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    public TelcoOrder() {
    }

    public TelcoOrder(UUID userId, String phoneNumber, TelcoProvider telcoProvider,
                      TelcoOrderType orderType, BigDecimal denomination,
                      BigDecimal discountRate, BigDecimal finalPrice,
                      TelcoOrderStatus status) {
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.telcoProvider = telcoProvider;
        this.orderType = orderType;
        this.denomination = denomination;
        this.discountRate = discountRate;
        this.finalPrice = finalPrice;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void markCompleted(String pinCode, String serialNumber) {
        this.status = TelcoOrderStatus.COMPLETED;
        this.pinCode = pinCode;
        this.serialNumber = serialNumber;
        this.updatedAt = Instant.now();
    }

    public void markFailedRefunded(String failureReason) {
        this.status = TelcoOrderStatus.FAILED_REFUNDED;
        this.failureReason = failureReason;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public TelcoProvider getTelcoProvider() {
        return telcoProvider;
    }

    public TelcoOrderType getOrderType() {
        return orderType;
    }

    public BigDecimal getDenomination() {
        return denomination;
    }

    public BigDecimal getDiscountRate() {
        return discountRate;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }

    public TelcoOrderStatus getStatus() {
        return status;
    }

    public String getPinCode() {
        return pinCode;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}
