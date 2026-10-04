package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Issue #14 — Task step 3's "lịch sử đóng góp minh bạch theo từng người" (who contributed how much
 * and when), extended to also log withdrawals/dissolve so the fund has one complete audit trail,
 * same spirit as wallet-service's own {@code Transaction} table. */
@Entity
@Table(name = "fund_transactions")
public class FundTransaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    /** The member who contributed, or the creator who withdrew/dissolved. */
    @Column(name = "actor_user_id", nullable = false)
    private UUID actorUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundTransactionType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected FundTransaction() {
        // JPA
    }

    public FundTransaction(UUID fundId, UUID actorUserId, FundTransactionType type, BigDecimal amount) {
        this.fundId = fundId;
        this.actorUserId = actorUserId;
        this.type = type;
        this.amount = amount;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFundId() {
        return fundId;
    }

    public UUID getActorUserId() {
        return actorUserId;
    }

    public FundTransactionType getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
