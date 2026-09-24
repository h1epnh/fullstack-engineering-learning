package com.ewalletlab.billpaymentservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** One paid mock bill — persisted here, not in wallet-service, because this is
 * bill-payment-service's own domain record (biller/customer code/category); the wallet-service
 * Transaction row (type=BILL_PAYMENT) remains the single source of truth for the balance effect. */
@Entity
@Table(name = "bill_payments")
public class BillPayment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillCategory category;

    @Column(name = "customer_code", nullable = false)
    private String customerCode;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected BillPayment() {
        // JPA
    }

    public BillPayment(UUID userId, BillCategory category, String customerCode, BigDecimal amount) {
        this.userId = userId;
        this.category = category;
        this.customerCode = customerCode;
        this.amount = amount;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
