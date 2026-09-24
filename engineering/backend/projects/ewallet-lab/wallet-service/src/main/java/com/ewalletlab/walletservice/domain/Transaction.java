package com.ewalletlab.walletservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Append-only ledger row. One row per credit/debit — never mutated after creation. */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "wallet_id", nullable = false)
    private UUID walletId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private BigDecimal amount;

    /** External reference: bank txn id (topup/withdraw), counterparty user id (transfer), biller code (bill). */
    private String reference;

    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Transaction() {
        // JPA
    }

    public Transaction(UUID walletId, TransactionType type, BigDecimal amount, String reference, String note) {
        this.walletId = walletId;
        this.type = type;
        this.amount = amount;
        this.reference = reference;
        this.note = note;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getWalletId() {
        return walletId;
    }

    public TransactionType getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getReference() {
        return reference;
    }

    public String getNote() {
        return note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
