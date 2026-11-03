package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.time.Instant;

/** Issue #60 (QA round 2) — marker that a contribute attempt's wallet debit was refunded. The wallet
 * ledger treats a replayed debit key as already applied, so replaying a refunded key would credit
 * the fund with no live debit (money creation). {@code FundService.contribute} rejects such keys
 * with 409. Written in its own transaction BEFORE the refund credit is sent. */
@Entity
@Table(name = "refunded_contributions")
public class RefundedContribution {

    @Id
    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected RefundedContribution() {
    }

    public RefundedContribution(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }
}
