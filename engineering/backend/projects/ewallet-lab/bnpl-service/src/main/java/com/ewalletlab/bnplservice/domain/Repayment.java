package com.ewalletlab.bnplservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "repayments")
public class Repayment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "credit_line_id", nullable = false)
    private UUID creditLineId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RepaymentStatus status = RepaymentStatus.PENDING;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "repayment_allocations", joinColumns = @JoinColumn(name = "repayment_id"))
    private List<RepaymentAllocation> allocations = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Repayment() {
        // JPA
    }

    public Repayment(UUID creditLineId, BigDecimal amount, List<RepaymentAllocation> allocations, Instant createdAt) {
        this.creditLineId = creditLineId;
        this.amount = amount;
        this.allocations = new ArrayList<>(allocations);
        this.createdAt = createdAt;
    }

    public void markCompleted() {
        status = RepaymentStatus.COMPLETED;
    }

    public void markFailed() {
        status = RepaymentStatus.FAILED;
    }

    public UUID getId() { return id; }
    public UUID getCreditLineId() { return creditLineId; }
    public BigDecimal getAmount() { return amount; }
    public RepaymentStatus getStatus() { return status; }
    public List<RepaymentAllocation> getAllocations() { return allocations; }
    public Instant getCreatedAt() { return createdAt; }
}
