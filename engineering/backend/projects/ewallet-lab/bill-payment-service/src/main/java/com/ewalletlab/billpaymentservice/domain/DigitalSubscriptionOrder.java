package com.ewalletlab.billpaymentservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "digital_subscription_orders")
public class DigitalSubscriptionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 64)
    private String packageCode;

    @Column(nullable = false)
    private String packageName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private BillCategory category;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String accountIdentifier;

    @Column(nullable = false, length = 64)
    private String activationCode;

    @Column(nullable = false, length = 32)
    private String status;

    private UUID billPaymentId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public DigitalSubscriptionOrder() {
    }

    public DigitalSubscriptionOrder(UUID userId, String packageCode, String packageName,
                                    BillCategory category, BigDecimal price,
                                    String accountIdentifier, String activationCode,
                                    UUID billPaymentId) {
        this.userId = userId;
        this.packageCode = packageCode;
        this.packageName = packageName;
        this.category = category;
        this.price = price;
        this.accountIdentifier = accountIdentifier;
        this.activationCode = activationCode;
        this.status = "COMPLETED";
        this.billPaymentId = billPaymentId;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getPackageCode() {
        return packageCode;
    }

    public String getPackageName() {
        return packageName;
    }

    public BillCategory getCategory() {
        return category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getAccountIdentifier() {
        return accountIdentifier;
    }

    public String getActivationCode() {
        return activationCode;
    }

    public String getStatus() {
        return status;
    }

    public UUID getBillPaymentId() {
        return billPaymentId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
