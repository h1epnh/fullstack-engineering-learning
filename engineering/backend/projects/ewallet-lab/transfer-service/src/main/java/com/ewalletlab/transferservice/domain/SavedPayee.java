package com.ewalletlab.transferservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "saved_payees", uniqueConstraints = {
    @UniqueConstraint(name = "uk_saved_payees_user_phone", columnNames = {"user_id", "payee_phone"})
})
public class SavedPayee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "payee_phone", nullable = false, length = 20)
    private String payeePhone;

    @Column(name = "payee_name", nullable = false, length = 120)
    private String payeeName;

    @Column(name = "nickname", length = 100)
    private String nickname;

    @Column(name = "is_favorite", nullable = false)
    private boolean isFavorite = false;

    @Column(name = "last_transferred_at")
    private Instant lastTransferredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    public SavedPayee() {
    }

    public SavedPayee(UUID userId, String payeePhone, String payeeName, String nickname, boolean isFavorite) {
        this.userId = userId;
        this.payeePhone = payeePhone;
        this.payeeName = payeeName;
        this.nickname = nickname;
        this.isFavorite = isFavorite;
    }

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getPayeePhone() {
        return payeePhone;
    }

    public String getPayeeName() {
        return payeeName;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public Instant getLastTransferredAt() {
        return lastTransferredAt;
    }

    public void setLastTransferredAt(Instant lastTransferredAt) {
        this.lastTransferredAt = lastTransferredAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}
