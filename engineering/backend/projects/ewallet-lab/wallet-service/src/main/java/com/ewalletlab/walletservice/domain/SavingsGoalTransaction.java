package com.ewalletlab.walletservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "savings_goal_transactions")
public class SavingsGoalTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID goalId;

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavingsGoalTransactionType type;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected SavingsGoalTransaction() {}

    public SavingsGoalTransaction(UUID goalId, BigDecimal amount, SavingsGoalTransactionType type) {
        // id để @GeneratedValue tự quản lý — xem SavingsGoal.java's constructor cho lý do tương tự.
        this.goalId = goalId;
        this.amount = amount;
        this.type = type;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getGoalId() {
        return goalId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public SavingsGoalTransactionType getType() {
        return type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
