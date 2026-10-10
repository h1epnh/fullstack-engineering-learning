package com.ewalletlab.billpaymentservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "insurance_policies")
public class InsurancePolicy {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String productCode;

    @Column(nullable = false)
    private String insuredName;

    @Column(nullable = false)
    private String insuredIdCard;

    @Column
    private String vehiclePlate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal premiumAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal coverageAmount;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false, unique = true)
    private String certificateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    public InsurancePolicy() {
    }

    public InsurancePolicy(UUID id, UUID userId, String productCode, String insuredName, String insuredIdCard,
                           String vehiclePlate, BigDecimal premiumAmount, BigDecimal coverageAmount,
                           LocalDate effectiveDate, LocalDate expiryDate, String certificateNumber, PolicyStatus status) {
        this.id = id != null ? id : UUID.randomUUID();
        this.userId = userId;
        this.productCode = productCode;
        this.insuredName = insuredName;
        this.insuredIdCard = insuredIdCard;
        this.vehiclePlate = vehiclePlate;
        this.premiumAmount = premiumAmount;
        this.coverageAmount = coverageAmount;
        this.effectiveDate = effectiveDate;
        this.expiryDate = expiryDate;
        this.certificateNumber = certificateNumber;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getInsuredName() {
        return insuredName;
    }

    public void setInsuredName(String insuredName) {
        this.insuredName = insuredName;
    }

    public String getInsuredIdCard() {
        return insuredIdCard;
    }

    public void setInsuredIdCard(String insuredIdCard) {
        this.insuredIdCard = insuredIdCard;
    }

    public String getVehiclePlate() {
        return vehiclePlate;
    }

    public void setVehiclePlate(String vehiclePlate) {
        this.vehiclePlate = vehiclePlate;
    }

    public BigDecimal getPremiumAmount() {
        return premiumAmount;
    }

    public void setPremiumAmount(BigDecimal premiumAmount) {
        this.premiumAmount = premiumAmount;
    }

    public BigDecimal getCoverageAmount() {
        return coverageAmount;
    }

    public void setCoverageAmount(BigDecimal coverageAmount) {
        this.coverageAmount = coverageAmount;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public PolicyStatus getStatus() {
        return status;
    }

    public void setStatus(PolicyStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
