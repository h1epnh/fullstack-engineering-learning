package com.ewalletlab.luckymoneyservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Issue #56 (TD-04) — outbox for lucky-money-service, same pattern as fund-service's (#22). A row is
 * written in the SAME local transaction as the business state it follows up on (claim/expiry status
 * change, or the saved GiftCardTransfer); {@code LuckyOutboxRelay} is the only thing that then calls
 * wallet-service /credit, with {@code idempotencyKey = this row's id}. Per CLAUDE.md principle 7 /
 * ADR-05, ONLY credits (recipient credit, refund) go through here — the debit that funds an
 * envelope/gift card stays synchronous and happens first.
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

    /** Plain {@code TEXT} column, deliberately NOT {@code @Lob} — Hibernate maps a {@code @Lob
     * String} on Postgres to the {@code oid} large-object type (a pointer into a separate
     * large-object storage table, needing the Postgres LO API, not a plain string column) rather
     * than a normal {@code text}/{@code varchar} column. The payload here is a few dozen bytes of
     * flat JSON — a plain {@code TEXT} column holding the string directly is simpler and avoids
     * that whole LOB machinery. Caught by actually inspecting the column type after first deploy
     * (\d outbox_event showed {@code oid}, not {@code text}) rather than assuming the annotation
     * did what the name suggests — same "verify the real schema, don't just trust the Java
     * annotation" discipline as CLAUDE.md's CHECK-constraint lesson. */
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

    /** Last error seen (HTTP status + body, or exception message) — purely diagnostic, so a human
     * reading this table directly can tell why a {@code PENDING} row keeps not landing, or why a
     * {@code FAILED} row was compensated, without having to go dig through pod logs. */
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
