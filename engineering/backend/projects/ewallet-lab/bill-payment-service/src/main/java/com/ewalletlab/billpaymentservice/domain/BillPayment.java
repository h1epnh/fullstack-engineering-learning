package com.ewalletlab.billpaymentservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** One paid mock bill — persisted here, not in wallet-service, because this is
 * bill-payment-service's own domain record (biller/customer code/category); the wallet-service
 * Transaction row (type=BILL_PAYMENT) remains the single source of truth for the balance effect. */
@Entity
@Table(
    name = "bill_payments",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_bill_payments_category_customer_period",
        columnNames = {"category", "customer_code", "period"}
    )
)
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

    @Column(name = "period")
    private String period;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "voucher_id")
    private UUID voucherId;

    @Column(name = "final_amount", precision = 19, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_source", nullable = false)
    private PaymentSource paymentSource = PaymentSource.MAIN_WALLET;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected BillPayment() {
        // JPA
    }

    public BillPayment(UUID userId, BillCategory category, String customerCode, BigDecimal amount) {
        this(userId, category, customerCode, amount, null, BigDecimal.ZERO, null, amount, PaymentSource.MAIN_WALLET);
    }

    public BillPayment(UUID userId, BillCategory category, String customerCode, BigDecimal amount, String period) {
        this(userId, category, customerCode, amount, period, BigDecimal.ZERO, null, amount, PaymentSource.MAIN_WALLET);
    }

    public BillPayment(UUID userId, BillCategory category, String customerCode, BigDecimal amount, String period,
                       BigDecimal discountAmount, UUID voucherId, BigDecimal finalAmount) {
        this(userId, category, customerCode, amount, period, discountAmount, voucherId, finalAmount, PaymentSource.MAIN_WALLET);
    }

    public BillPayment(UUID userId, BillCategory category, String customerCode, BigDecimal amount, String period,
                       BigDecimal discountAmount, UUID voucherId, BigDecimal finalAmount, PaymentSource paymentSource) {
        this.userId = userId;
        this.category = category;
        this.customerCode = customerCode;
        this.amount = amount;
        this.period = period;
        this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.voucherId = voucherId;
        this.finalAmount = finalAmount != null ? finalAmount : amount;
        this.paymentSource = paymentSource != null ? paymentSource : PaymentSource.MAIN_WALLET;
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

    public String getPeriod() {
        return period;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public UUID getVoucherId() {
        return voucherId;
    }

    public BigDecimal getFinalAmount() {
        return finalAmount;
    }

    public PaymentSource getPaymentSource() {
        return paymentSource;
    }
}
