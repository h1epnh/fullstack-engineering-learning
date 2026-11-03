package com.ewalletlab.walletservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "monthly_budgets",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "month", "category_code"})
)
public class MonthlyBudget {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 16)
    private String month; // e.g. "10/2026" or "2026-10"

    @Column(name = "category_code", nullable = false, length = 64)
    private String categoryCode; // "ALL" or specific category

    @Column(name = "budget_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal budgetLimit;

    @Column(name = "alert_triggered_80", nullable = false)
    private boolean alertTriggered80 = false;

    @Column(name = "alert_triggered_100", nullable = false)
    private boolean alertTriggered100 = false;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MonthlyBudget() {
    }

    public MonthlyBudget(UUID userId, String month, String categoryCode, BigDecimal budgetLimit) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.month = month.trim();
        this.categoryCode = categoryCode != null ? categoryCode.trim().toUpperCase() : "ALL";
        this.budgetLimit = budgetLimit;
        this.alertTriggered80 = false;
        this.alertTriggered100 = false;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getMonth() {
        return month;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public BigDecimal getBudgetLimit() {
        return budgetLimit;
    }

    public void setBudgetLimit(BigDecimal budgetLimit) {
        this.budgetLimit = budgetLimit;
        this.updatedAt = Instant.now();
    }

    public boolean isAlertTriggered80() {
        return alertTriggered80;
    }

    public void setAlertTriggered80(boolean alertTriggered80) {
        this.alertTriggered80 = alertTriggered80;
        this.updatedAt = Instant.now();
    }

    public boolean isAlertTriggered100() {
        return alertTriggered100;
    }

    public void setAlertTriggered100(boolean alertTriggered100) {
        this.alertTriggered100 = alertTriggered100;
        this.updatedAt = Instant.now();
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
