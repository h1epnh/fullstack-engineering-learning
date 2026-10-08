package com.ewalletlab.investmentfundservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "investment_orders")
public class InvestmentOrder {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private InvestmentOrderType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal units;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal nav;

    @Column(nullable = false)
    private Instant createdAt;

    protected InvestmentOrder() {
    }

    public InvestmentOrder(UUID userId, UUID fundId, InvestmentOrderType type, BigDecimal amount, BigDecimal units, BigDecimal nav) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.fundId = fundId;
        this.type = type;
        this.amount = amount;
        this.units = units;
        this.nav = nav;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getFundId() {
        return fundId;
    }

    public InvestmentOrderType getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getUnits() {
        return units;
    }

    public BigDecimal getNav() {
        return nav;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}

