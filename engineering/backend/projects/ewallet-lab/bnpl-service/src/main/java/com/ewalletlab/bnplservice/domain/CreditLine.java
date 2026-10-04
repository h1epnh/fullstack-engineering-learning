package com.ewalletlab.bnplservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #18 — one MOCK "Ví Trả Sau" credit line per user. Approved instantly with a fixed limit:
 * no credit scoring, no real lender behind it (see DESIGN.md's disclaimer).
 *
 * <p>{@link #outstandingPrincipal} is a denormalized sum of every statement's unpaid principal,
 * kept here so the "available limit" check of a draw only needs this one row — which every
 * mutating transaction locks first ({@code CreditLineRepository.lockByUserId}), serializing all
 * draws/repayments of one user.
 */
@Entity
@Table(name = "credit_lines")
public class CreditLine {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "credit_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "outstanding_principal", nullable = false, precision = 19, scale = 2)
    private BigDecimal outstandingPrincipal = BigDecimal.ZERO;

    /** The user explicitly went through the blocking disclaimer before opening (issue #18). */
    @Column(name = "disclaimer_accepted_at", nullable = false)
    private Instant disclaimerAcceptedAt;

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt;

    @Version
    private Long version;

    protected CreditLine() {
        // JPA
    }

    public CreditLine(UUID userId, BigDecimal creditLimit, Instant now) {
        this.userId = userId;
        this.creditLimit = creditLimit;
        this.disclaimerAcceptedAt = now;
        this.openedAt = now;
    }

    public BigDecimal getAvailableLimit() {
        return creditLimit.subtract(outstandingPrincipal);
    }

    public void addPrincipal(BigDecimal amount) {
        outstandingPrincipal = outstandingPrincipal.add(amount);
    }

    public void subtractPrincipal(BigDecimal amount) {
        outstandingPrincipal = outstandingPrincipal.subtract(amount);
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public BigDecimal getCreditLimit() { return creditLimit; }
    public BigDecimal getOutstandingPrincipal() { return outstandingPrincipal; }
    public Instant getDisclaimerAcceptedAt() { return disclaimerAcceptedAt; }
    public Instant getOpenedAt() { return openedAt; }
}
