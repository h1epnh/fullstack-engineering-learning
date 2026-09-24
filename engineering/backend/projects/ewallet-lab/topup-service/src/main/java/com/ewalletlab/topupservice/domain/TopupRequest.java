package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * orderId is what correlates this row to mock-bank-gateway's IPN callback later — the IPN payload
 * carries orderId back, not our internal UUID id, so orderId (not id) is what IpnController looks
 * up by. See MockBankGateway's request/response fields in ../README.md.
 */
@Entity
@Table(name = "topup_requests", uniqueConstraints = @UniqueConstraint(name = "uk_order_id", columnNames = "order_id"))
public class TopupRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TopupStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected TopupRequest() {
        // JPA
    }

    public TopupRequest(String orderId, UUID userId, BigDecimal amount) {
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.status = TopupStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public void markStatus(TopupStatus status) {
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public String getOrderId() {
        return orderId;
    }

    public UUID getUserId() {
        return userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TopupStatus getStatus() {
        return status;
    }
}
