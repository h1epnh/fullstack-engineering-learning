package com.ewalletlab.walletservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "external_expense_entries")
public class ExternalExpenseEntry {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "category_code", nullable = false, length = 64)
    private String categoryCode;

    @Column(length = 255)
    private String note;

    @Column(name = "spent_at", nullable = false)
    private Instant spentAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ExternalExpenseEntry() {
    }

    public ExternalExpenseEntry(UUID userId, BigDecimal amount, String categoryCode, String note, Instant spentAt) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.amount = amount;
        this.categoryCode = categoryCode != null ? categoryCode.trim().toUpperCase() : "OTHER";
        this.note = note != null ? note.trim() : "";
        this.spentAt = spentAt != null ? spentAt : Instant.now();
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public String getNote() {
        return note;
    }

    public Instant getSpentAt() {
        return spentAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
