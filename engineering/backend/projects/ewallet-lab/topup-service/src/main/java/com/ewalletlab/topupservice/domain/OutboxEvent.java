package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Issue #66 (TD-04b) — Outbox pattern for topup-service.
 * Written in the exact same local transaction as TopupRequest status transition PENDING -> CONFIRMED.
 * TopupOutboxRelay asynchronously relays events to Kafka (wallet.topup.confirmed) with retry and
 * at-least-once delivery guarantee, while wallet-service deduplicates by idempotency key.
 */
@Entity
@Table(name = "outbox_event")
public class OutboxEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private OutboxEventType eventType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutboxEventStatus status = OutboxEventStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "last_error", length = 2000)
    private String lastError;

    protected OutboxEvent() {
        // JPA
    }

    public static OutboxEvent pending(OutboxEventType eventType, String payload) {
        OutboxEvent event = new OutboxEvent();
        event.eventType = eventType;
        event.payload = payload;
        return event;
    }

    public void markDelivered(Instant deliveredAt) {
        this.status = OutboxEventStatus.DELIVERED;
        this.deliveredAt = deliveredAt;
    }

    public void markFailed(String lastError) {
        this.status = OutboxEventStatus.FAILED;
        this.lastError = lastError;
    }

    public void recordAttemptFailure(String lastError) {
        this.attemptCount++;
        this.lastError = lastError;
    }

    public UUID getId() {
        return id;
    }

    public OutboxEventType getEventType() {
        return eventType;
    }

    public String getPayload() {
        return payload;
    }

    public OutboxEventStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public String getLastError() {
        return lastError;
    }
}
