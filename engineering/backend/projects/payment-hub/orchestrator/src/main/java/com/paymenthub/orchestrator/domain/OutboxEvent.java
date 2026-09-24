package com.paymenthub.orchestrator.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Outbox pattern: written in the same DB transaction as the Transaction row, then published to
 * Kafka by a separate poller ({@code OutboxPublisher}). Avoids the "DB commit succeeded but the
 * Kafka publish failed" inconsistency that a naive publish-inside-@Transactional would risk.
 */
@Entity
@Table(name = "outbox_events")
public class OutboxEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "aggregate_id", nullable = false)
    private UUID aggregateId;

    @Column(name = "topic", nullable = false)
    private String topic;

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    protected OutboxEvent() {
        // JPA
    }

    public OutboxEvent(UUID aggregateId, String topic, String payload) {
        this.aggregateId = aggregateId;
        this.topic = topic;
        this.payload = payload;
        this.createdAt = Instant.now();
    }

    public void markPublished() {
        this.publishedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getAggregateId() {
        return aggregateId;
    }

    public String getTopic() {
        return topic;
    }

    public String getPayload() {
        return payload;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
