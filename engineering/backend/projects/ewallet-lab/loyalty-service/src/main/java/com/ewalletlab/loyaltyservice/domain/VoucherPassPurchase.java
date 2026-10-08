package com.ewalletlab.loyaltyservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "voucher_pass_purchases", indexes = {
    @Index(name = "idx_vpp_user_id", columnList = "user_id")
})
public class VoucherPassPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "pass_code", nullable = false, length = 64)
    private String passCode;

    @Column(name = "pass_name", nullable = false, length = 128)
    private String passName;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PassPurchaseStatus status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected VoucherPassPurchase() {}

    public VoucherPassPurchase(UUID userId, String passCode, String passName, BigDecimal price, Instant expiresAt) {
        this.userId = userId;
        this.passCode = passCode;
        this.passName = passName;
        this.price = price;
        this.status = PassPurchaseStatus.ACTIVE;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getPassCode() {
        return passCode;
    }

    public String getPassName() {
        return passName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public PassPurchaseStatus getStatus() {
        return status;
    }

    public void setStatus(PassPurchaseStatus status) {
        this.status = status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

