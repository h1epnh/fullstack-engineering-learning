package com.ewalletlab.investmentfundservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "nav_history")
public class NavHistory {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID fundId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal nav;

    @Column(nullable = false)
    private Instant recordedAt;

    protected NavHistory() {
    }

    public NavHistory(UUID fundId, BigDecimal nav) {
        this.id = UUID.randomUUID();
        this.fundId = fundId;
        this.nav = nav;
        this.recordedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getFundId() {
        return fundId;
    }

    public BigDecimal getNav() {
        return nav;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}

