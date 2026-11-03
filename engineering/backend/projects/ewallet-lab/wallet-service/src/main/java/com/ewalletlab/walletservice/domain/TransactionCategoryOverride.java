package com.ewalletlab.walletservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "transaction_category_overrides",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "transaction_id"})
)
public class TransactionCategoryOverride {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(name = "category_code", nullable = false, length = 64)
    private String categoryCode;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TransactionCategoryOverride() {
    }

    public TransactionCategoryOverride(UUID userId, UUID transactionId, String categoryCode) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.transactionId = transactionId;
        this.categoryCode = categoryCode.trim().toUpperCase();
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode.trim().toUpperCase();
        this.updatedAt = Instant.now();
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
