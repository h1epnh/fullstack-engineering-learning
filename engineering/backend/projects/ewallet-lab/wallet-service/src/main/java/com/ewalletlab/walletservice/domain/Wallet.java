package com.ewalletlab.walletservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * One wallet per user, VND only. wallet-service is the ONLY place balance is mutated — every other
 * service (topup-service, transfer-service, bill-payment-service) calls this service's API rather
 * than touching a wallet row directly, even though nothing at the database level would stop them.
 * That's a discipline problem, not a technical one — see WalletController.
 */
@Entity
@Table(name = "wallets")
public class Wallet {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private BigDecimal balance;

    @Version
    private Long version; // optimistic locking — concurrent topup/transfer/withdraw must not race

    protected Wallet() {
        // JPA
    }

    public Wallet(UUID userId) {
        this.userId = userId;
        this.balance = BigDecimal.ZERO;
    }

    public void credit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
