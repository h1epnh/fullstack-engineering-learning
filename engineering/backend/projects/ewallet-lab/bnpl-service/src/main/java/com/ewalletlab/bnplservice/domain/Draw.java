package com.ewalletlab.bnplservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * A self-contained MOCK "mua sắm trả sau" draw-down (issue #18 Task step 2): no merchant, no money
 * moves anywhere — it only raises the statement's principal and lowers the available limit.
 * Deliberately NOT wired into bill-payment/transfer/QR (out of scope per the issue).
 */
@Entity
@Table(name = "draws")
public class Draw {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "credit_line_id", nullable = false)
    private UUID creditLineId;

    @Column(name = "statement_id", nullable = false)
    private UUID statementId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String label;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Draw() {
        // JPA
    }

    public Draw(UUID creditLineId, UUID statementId, BigDecimal amount, String label, Instant createdAt) {
        this.creditLineId = creditLineId;
        this.statementId = statementId;
        this.amount = amount;
        this.label = label;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getCreditLineId() { return creditLineId; }
    public UUID getStatementId() { return statementId; }
    public BigDecimal getAmount() { return amount; }
    public String getLabel() { return label; }
    public Instant getCreatedAt() { return createdAt; }
}
