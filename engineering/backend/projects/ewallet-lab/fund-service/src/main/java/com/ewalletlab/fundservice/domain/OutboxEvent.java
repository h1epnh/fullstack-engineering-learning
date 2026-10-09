package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Issue #22 — Outbox pattern pilot (fund-service is the first of 3 services migrated; see backend
 * DESIGN.md's "Outbox pattern" section for the full rationale, including the concrete bug on issue
 * #14 that motivated this and the heavier "process killed mid-flight" risk it closes that no amount
 * of synchronous try/catch compensation ever could).
 *
 * <p>A row here is written in the EXACT SAME {@code @Transactional} method (inside {@code
 * FundMutationExecutor}) as the business state it follows up on — {@code Fund.balance} +
 * {@code FundTransaction} for a contribute/withdraw/dissolve. That's the entire point: by the time
 * either commits, BOTH have committed together or NEITHER has (standard local-DB atomicity, no
 * network call involved) — there is no window where the business state says "done" but nothing
 * durable records that wallet-service still needs to be called. {@code FundOutboxRelay}'s
 * background job is the ONLY thing that ever calls wallet-service for these 3 operations now; a
 * crash at any point before this row commits means the whole local transaction (business state +
 * outbox row) rolled back together — nothing to recover. A crash at any point AFTER it commits
 * (including the dramatic case: killed between this commit and the relay's very next poll) just
 * means the row is still {@code PENDING} once the service is back up — the relay picks it up on its
 * next scheduled run exactly as if nothing happened.
 *
 * <p>{@code payload} is a small JSON blob (not a native {@code jsonb} column — a plain Postgres
 * {@code TEXT} column serialized/deserialized via Jackson is simpler for this lab and avoids a
 * Hibernate user-type dependency for 3 flat fields) carrying everything the relay needs to call
 * wallet-service AND, if the call permanently fails, to compensate the local claim: {@code fundId},
 * {@code userId} (whichever wallet is affected — the contributing member for a debit, the creator
 * for a credit), {@code amount}, {@code fundTransactionId} (the ledger row to delete on
 * compensation — same phantom-row concern issue #14's second bug fix already dealt with), and
 * {@code stepUpConfirmed} (only meaningful for {@code FUND_CONTRIBUTE_DEBIT} — see {@code
 * FundService#contribute}'s javadoc for why the step-up GATE itself still has to run synchronously,
 * before this row is even written, to stay fail-closed per CLAUDE.md's Enterprise Architecture
 * Alignment principle 2).
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
