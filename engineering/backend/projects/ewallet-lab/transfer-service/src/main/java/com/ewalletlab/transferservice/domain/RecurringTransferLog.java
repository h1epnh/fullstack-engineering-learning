package com.ewalletlab.transferservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recurring_transfer_logs")
public class RecurringTransferLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recurring_transfer_id", nullable = false)
    private UUID recurringTransferId;

    @Column(name = "executed_at", nullable = false)
    private Instant executedAt;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private RecurringExecutionStatus status;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    public RecurringTransferLog() {
    }

    public RecurringTransferLog(UUID recurringTransferId, BigDecimal amount,
                                RecurringExecutionStatus status, String errorMessage) {
        this.recurringTransferId = recurringTransferId;
        this.amount = amount;
        this.status = status;
        this.errorMessage = errorMessage;
    }

    @PrePersist
    public void prePersist() {
        if (this.executedAt == null) {
            this.executedAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getRecurringTransferId() {
        return recurringTransferId;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public RecurringExecutionStatus getStatus() {
        return status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
