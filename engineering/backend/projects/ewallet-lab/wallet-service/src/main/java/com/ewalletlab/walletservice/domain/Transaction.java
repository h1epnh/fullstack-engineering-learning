package com.ewalletlab.walletservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Append-only ledger row. One row per credit/debit — never mutated after creation.
 *
 * <p>Issue #22 — {@code idempotencyKey} is a dedicated, nullable, UNIQUE column backing dedupe for
 * callers that need it (currently: fund-service's outbox relay, see its {@code FundOutboxRelay}).
 * Deliberately NOT reusing the existing {@code reference} column for this: {@code reference} is
 * already overloaded with non-unique business semantics across many existing callers (e.g. a
 * TRANSFER's {@code reference} is the counterparty's user id, which legitimately repeats across
 * many separate transfers between the same 2 people) — a blanket unique constraint on {@code
 * (type, reference)} would have broken every one of those callers. A separate, purely-additive
 * column that's {@code null} for every caller that doesn't explicitly opt in is a much lower-risk
 * change. See backend DESIGN.md's "Outbox pattern" section for the full idempotency design.
 */
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

    /** Issue #22 — see this class's javadoc. {@code null} for every caller that doesn't pass one
     * (the vast majority, unchanged) — the UNIQUE constraint on this column only ever rejects a
     * second row for the SAME non-null key, never collides with other {@code null} rows (standard
     * SQL NULL-vs-UNIQUE semantics). */
    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Transaction() {
        // JPA
    }

    public Transaction(UUID walletId, TransactionType type, BigDecimal amount, String reference, String note) {
        this(walletId, type, amount, reference, note, null);
    }

    public Transaction(UUID walletId, TransactionType type, BigDecimal amount, String reference, String note,
                        String idempotencyKey) {
        this.walletId = walletId;
        this.type = type;
        this.amount = amount;
        this.reference = reference;
        this.note = note;
        this.idempotencyKey = idempotencyKey;
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

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
