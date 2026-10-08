package com.ewalletlab.loyaltyservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vouchers", indexes = {
    @Index(name = "idx_vouchers_user_status", columnList = "user_id, status"),
    @Index(name = "idx_vouchers_pass_purchase", columnList = "pass_purchase_id")
})
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "pass_purchase_id", nullable = false)
    private UUID passPurchaseId;

    @Column(nullable = false, length = 64)
    private String code;

    @Column(nullable = false, length = 128)
    private String title;

    @Column(length = 255)
    private String description;

    @Column(name = "discount_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "min_order_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(name = "applicable_category", length = 64)
    private String applicableCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private VoucherStatus status;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "used_bill_id")
    private UUID usedBillId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Version
    private Long version;

    protected Voucher() {}

    public Voucher(UUID userId, UUID passPurchaseId, String code, String title, String description,
                   BigDecimal discountAmount, BigDecimal minOrderAmount, String applicableCategory, Instant expiresAt) {
        this.userId = userId;
        this.passPurchaseId = passPurchaseId;
        this.code = code;
        this.title = title;
        this.description = description;
        this.discountAmount = discountAmount;
        this.minOrderAmount = minOrderAmount;
        this.applicableCategory = applicableCategory;
        this.status = VoucherStatus.AVAILABLE;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getPassPurchaseId() {
        return passPurchaseId;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public String getApplicableCategory() {
        return applicableCategory;
    }

    public VoucherStatus getStatus() {
        return status;
    }

    public void setStatus(VoucherStatus status) {
        this.status = status;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }

    public UUID getUsedBillId() {
        return usedBillId;
    }

    public void setUsedBillId(UUID usedBillId) {
        this.usedBillId = usedBillId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Long getVersion() {
        return version;
    }
}

