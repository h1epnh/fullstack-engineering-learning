package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "game_card_orders")
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

    @Column(nullable = false, length = 32)
    private String pinCode;

    @Column(nullable = false, length = 32)
    private String serialNumber;

    @Column(nullable = false, length = 32)
    private String expiryDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Version
    private Long version;

    public GameCardOrder() {
    }

    public GameCardOrder(UUID userId, GamePublisher publisher, BigDecimal denomination,
                         BigDecimal discountRate, BigDecimal finalPrice,
                         String pinCode, String serialNumber, String expiryDate) {
        this.userId = userId;
        this.publisher = publisher;
        this.denomination = denomination;
        this.discountRate = discountRate;
        this.finalPrice = finalPrice;
        this.pinCode = pinCode;
        this.serialNumber = serialNumber;
        this.expiryDate = expiryDate;
        this.createdAt = Instant.now();
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
