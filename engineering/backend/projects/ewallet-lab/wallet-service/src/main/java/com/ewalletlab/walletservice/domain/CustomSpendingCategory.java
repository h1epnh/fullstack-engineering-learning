package com.ewalletlab.walletservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "custom_spending_categories")
public class CustomSpendingCategory {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 64)
    private String code;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 64)
    private String icon;

    @Column(nullable = false, length = 32)
    private String color;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CustomSpendingCategory() {
    }

    public CustomSpendingCategory(UUID userId, String code, String name, String icon, String color) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.code = code.trim().toUpperCase();
        this.name = name.trim();
        this.icon = icon != null && !icon.isBlank() ? icon.trim() : "sell";
        this.color = color != null && !color.isBlank() ? color.trim() : "#64748b";
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getIcon() {
        return icon;
    }

    public String getColor() {
        return color;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
