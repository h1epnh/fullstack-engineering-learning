package com.paymenthub.ledger.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * One leg of a double-entry posting. A single transaction produces exactly two rows sharing the
 * same transactionId: one DEBIT (source account) and one CREDIT (destination account).
 * PROVISIONAL -> FINAL is a plain status update on those same two rows (nothing about the
 * financial fact changed, just its confirmation state). A failed settlement does NOT delete or
 * silently rewrite the provisional rows — see {@code LedgerRecordingService.reverse} — it flips
 * their status to REVERSED and inserts new compensating rows, so the audit trail always shows
 * what was provisionally posted and what undid it.
 */
@Entity
@Table(name = "ledger_entries")
public class LedgerEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private EntryType entryType;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntryStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected LedgerEntry() {
        // JPA
    }

    public LedgerEntry(UUID transactionId, String accountId, EntryType entryType,
                        BigDecimal amount, String currency, EntryStatus status) {
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.entryType = entryType;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public String getAccountId() {
        return accountId;
    }

    public EntryType getEntryType() {
        return entryType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public EntryStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * The only mutation this entity allows — everything else about a posted entry is fixed at
     * creation. Named to make clear this isn't a generic property setter: it exists solely for the
     * PROVISIONAL -> FINAL/REVERSED transition in {@code LedgerRecordingService}.
     */
    public void applyStatus(EntryStatus status) {
        this.status = status;
    }
}
