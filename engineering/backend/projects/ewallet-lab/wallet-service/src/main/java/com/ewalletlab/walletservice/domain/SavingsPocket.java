package com.ewalletlab.walletservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #13 — "Túi Thần Tài": a sub-ledger 1-1 with {@link Wallet}, living in the SAME service/DB
 * (architecture decision by the operator on issue #13, option (a) — see backend DESIGN.md's "Túi
 * Thần Tài" section). Money moving between a wallet and its pocket never leaves wallet-service, so
 * it's a single {@code @Transactional} method touching two {@code @Version}-ed rows — no
 * cross-service call, no check-then-act race window of the kind fixed in issues #3/#8/#10.
 *
 * <p>Interest is lazily accrued (see {@code SavingsPocketMutationExecutor#applyAccrual}) rather
 * than via a {@code @Scheduled} job — see DESIGN.md for the reasoning. {@code lastAccrualAt} is the
 * watermark: any read or mutation first "catches up" whole elapsed accrual periods since this
 * timestamp before doing anything else.
 */
@Entity
@Table(name = "savings_pockets")
public class SavingsPocket {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "wallet_id", nullable = false, unique = true)
    private UUID walletId;

    @Column(nullable = false)
    private BigDecimal balance;

    /** Annual rate as a fraction (e.g. 0.04 = 4%/year) — see DESIGN.md for the ZaloPay-sourced default. */
    @Column(name = "annual_rate", nullable = false)
    private BigDecimal annualRate;

    @Column(name = "opened_at", nullable = false, updatable = false)
    private Instant openedAt;

    @Column(name = "last_accrual_at", nullable = false)
    private Instant lastAccrualAt;

    @Version
    private Long version;

    protected SavingsPocket() {
        // JPA
    }

    public SavingsPocket(UUID walletId, BigDecimal initialBalance, BigDecimal annualRate) {
        this.walletId = walletId;
        this.balance = initialBalance;
        this.annualRate = annualRate;
        this.openedAt = Instant.now();
        this.lastAccrualAt = this.openedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getWalletId() {
        return walletId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getAnnualRate() {
        return annualRate;
    }

    public Instant getOpenedAt() {
        return openedAt;
    }

    public Instant getLastAccrualAt() {
        return lastAccrualAt;
    }

    public void setLastAccrualAt(Instant lastAccrualAt) {
        this.lastAccrualAt = lastAccrualAt;
    }

    public void credit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void debit(BigDecimal amount) {
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Số dư Túi Thần Tài không đủ");
        }
        this.balance = this.balance.subtract(amount);
    }
}
