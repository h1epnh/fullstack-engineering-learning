package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #14 — persisted record of the "tiền kẹt mid-flight" bug class found by agent-tester at
 * ≥60 concurrent withdraws on one fund: {@code FundService.compensateWithRetry} already retries a
 * lost optimistic-lock race on {@code Fund}'s {@code @Version} far harder than a normal mutation
 * before giving up (see its javadoc for the retry budget), but under truly sustained/extreme
 * contention it CAN still exhaust every attempt. When that happens, the local decrement and the
 * phantom {@code FundTransaction} row {@code withdrawOnce}/{@code dissolveOnce} already committed
 * (before the wallet-service credit call failed) are left exactly as-is — a row here is what makes
 * that state recoverable instead of a silent, permanent loss of real money: {@code
 * FundCompensationReconciler}'s background job keeps retrying exactly this compensation
 * (same {@code compensateWithdraw}/{@code compensateDissolve} call) on a fixed schedule until it
 * succeeds — in practice the contention that caused the original failure is a short-lived burst
 * that has almost always cleared by the very next scheduled run.
 *
 * <p>{@code resolvedAt == null} means the fund's balance/ledger are STILL inconsistent with the
 * real money that moved — this is the table a human would query directly (same spirit as
 * agent-tester's SQL repro on the issue) if the background job itself is somehow not running.
 */
@Entity
@Table(name = "fund_compensation_failures")
public class FundCompensationFailure {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    /** The phantom {@code FundTransaction} row still sitting in the ledger for the withdrawal/
     * dissolve that never actually completed — deleted by the compensation once it finally runs,
     * same as the immediate-path compensation in {@code FundMutationExecutor}. */
    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(name = "requester_user_id", nullable = false)
    private UUID requesterUserId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /** Only ever {@code WITHDRAWAL} or {@code DISSOLVE} — reuses {@link FundTransactionType}
     * rather than inventing a new enum for the exact same two cases (CLAUDE.md: don't invent
     * enum/string values that already exist elsewhere in this codebase). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundTransactionType action;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    protected FundCompensationFailure() {
        // JPA
    }

    public FundCompensationFailure(UUID fundId, UUID transactionId, UUID requesterUserId, BigDecimal amount,
                                    FundTransactionType action) {
        this.fundId = fundId;
        this.transactionId = transactionId;
        this.requesterUserId = requesterUserId;
        this.amount = amount;
        this.action = action;
    }

    public void markResolved(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFundId() {
        return fundId;
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public UUID getRequesterUserId() {
        return requesterUserId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public FundTransactionType getAction() {
        return action;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }
}
