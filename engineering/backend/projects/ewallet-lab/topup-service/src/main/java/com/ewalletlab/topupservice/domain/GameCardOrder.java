package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "game_card_orders", uniqueConstraints = @UniqueConstraint(name = "uk_game_card_orders_idem", columnNames = "idempotencyKey"))
public class GameCardOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private GamePublisher publisher;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal denomination;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal discountRate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal finalPrice;

    @Column(length = 32)
    private String pinCode;

    @Column(length = 32)
    private String serialNumber;

    @Column(length = 32)
    private String expiryDate;

    /** Wallet debit key, scoped per user: "gamecard:<userId>:<clientKey>". UNIQUE = the claim. */
    @Column(length = 200)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private GameCardOrderStatus status;

    @Column(length = 500)
    private String failureReason;

    /** Fulfiller claim token. Every state transition out of PENDING is a conditional UPDATE on
     * (id, status=PENDING, fulfillToken=<mine>), so exactly one fulfiller can ever issue the card
     * or decide to refund. A takeover of a stale claim swaps the token, fencing the old holder out. */
    @Column(length = 36)
    private String fulfillToken;

    private Instant fulfillStartedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Version
    private Long version;

    public GameCardOrder() {
    }

    /** Claim row (PENDING) created BEFORE the wallet debit. */
    public GameCardOrder(UUID userId, GamePublisher publisher, BigDecimal denomination,
                         BigDecimal discountRate, BigDecimal finalPrice, String idempotencyKey) {
        this.userId = userId;
        this.publisher = publisher;
        this.denomination = denomination;
        this.discountRate = discountRate;
        this.finalPrice = finalPrice;
        this.idempotencyKey = idempotencyKey;
        this.status = GameCardOrderStatus.PENDING;
        this.fulfillToken = java.util.UUID.randomUUID().toString();
        this.fulfillStartedAt = Instant.now();
        this.createdAt = this.fulfillStartedAt;
    }

    // Mutators below mirror the conditional UPDATEs in GameCardOrderRepository (used by in-memory fakes).
    public void applyTakeOver(String newToken, Instant at) {
        this.fulfillToken = newToken;
        this.fulfillStartedAt = at;
    }

    public void applyComplete(String pinCode, String serialNumber, String expiryDate) {
        this.pinCode = pinCode;
        this.serialNumber = serialNumber;
        this.expiryDate = expiryDate;
        this.status = GameCardOrderStatus.COMPLETED;
    }

    public void applyFailedRefunded(String reason) {
        this.status = GameCardOrderStatus.FAILED_REFUNDED;
        this.failureReason = reason;
    }

    public String getFulfillToken() {
        return fulfillToken;
    }

    public Instant getFulfillStartedAt() {
        return fulfillStartedAt;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public GameCardOrderStatus getStatus() {
        return status;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public GamePublisher getPublisher() {
        return publisher;
    }

    public BigDecimal getDenomination() {
        return denomination;
    }

    public BigDecimal getDiscountRate() {
        return discountRate;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }

    public String getPinCode() {
        return pinCode;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Long getVersion() {
        return version;
    }
}
