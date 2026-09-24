package com.paymenthub.orchestrator.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "transactions",
    uniqueConstraints = @UniqueConstraint(name = "uk_idempotency_key", columnNames = "idempotency_key")
)
public class Transaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "idempotency_key", nullable = false)
    private String idempotencyKey;

    @Column(name = "source_account", nullable = false)
    private String sourceAccount;

    @Column(name = "dest_account", nullable = false)
    private String destAccount;

    /** SWIFT BIC of the beneficiary bank, if known. Null for domestic (NAPAS/INTERNAL) transfers. */
    @Column(name = "dest_bic")
    private String destBic;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "rail_type", nullable = false)
    private RailType railType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Transaction() {
        // JPA
    }

    public Transaction(String idempotencyKey, String sourceAccount, String destAccount,
                        String destBic, BigDecimal amount, String currency) {
        this.idempotencyKey = idempotencyKey;
        this.sourceAccount = sourceAccount;
        this.destAccount = destAccount;
        this.destBic = destBic;
        this.amount = amount;
        this.currency = currency;
        this.status = TransactionStatus.PENDING;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void markStatus(TransactionStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void assignRail(RailType railType) {
        this.railType = railType;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getSourceAccount() {
        return sourceAccount;
    }

    public String getDestAccount() {
        return destAccount;
    }

    public String getDestBic() {
        return destBic;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public RailType getRailType() {
        return railType;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
