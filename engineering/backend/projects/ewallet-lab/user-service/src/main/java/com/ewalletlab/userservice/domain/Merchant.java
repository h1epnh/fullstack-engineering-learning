package com.ewalletlab.userservice.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #39: Tài khoản Merchant / Doanh nghiệp liên kết 1-1 với User.
 * Mô phỏng phục vụ học tập, không có thẩm định merchant/KYC doanh nghiệp thật.
 */
@Entity
@Table(name = "merchants", uniqueConstraints = @UniqueConstraint(name = "uk_merchant_user_id", columnNames = "user_id"))
public class Merchant {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "merchant_name", nullable = false)
    private String merchantName;

    @Column(name = "business_category", nullable = false)
    private String businessCategory;

    @Column(name = "merchant_qr_code", nullable = false, length = 1024)
    private String merchantQrCode;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    protected Merchant() {
        // JPA
    }

    public Merchant(UUID userId, String merchantName, String businessCategory, String merchantQrCode) {
        this.userId = userId;
        this.merchantName = merchantName;
        this.businessCategory = businessCategory;
        this.merchantQrCode = merchantQrCode;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public String getMerchantQrCode() {
        return merchantQrCode;
    }

    public void setMerchantQrCode(String merchantQrCode) {
        this.merchantQrCode = merchantQrCode;
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
