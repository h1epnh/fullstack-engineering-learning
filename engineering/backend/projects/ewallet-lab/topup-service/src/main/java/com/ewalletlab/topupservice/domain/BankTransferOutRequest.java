package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Outbound bank transfer — the reverse direction of {@link TopupRequest} (money leaving the
 * wallet to an external bank account, instead of arriving from one). Reuses {@link TopupStatus}
 * since the PENDING/CONFIRMED/FAILED semantics are identical: PENDING means mock-bank-gateway
 * ACKed the create call, not that the bank transfer actually landed — that only happens via the
 * async IPN (see BankTransferOutIpnController), exactly like top-up's own PENDING→CONFIRMED path.
 *
 * <p>Unlike top-up, the wallet debit here happens synchronously up front (see
 * BankTransferOutService) — so a FAILED IPN must refund the sender, not just mark a row failed.
 */
@Entity
@Table(name = "bank_transfer_out_requests", uniqueConstraints = @UniqueConstraint(name = "uk_bto_order_id", columnNames = "order_id"))
public class BankTransferOutRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "bank_code", nullable = false)
    private String bankCode;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TopupStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected BankTransferOutRequest() {
        // JPA
    }

    public BankTransferOutRequest(String orderId, UUID userId, String bankCode, String accountNumber, BigDecimal amount) {
        this.orderId = orderId;
        this.userId = userId;
        this.bankCode = bankCode;
        this.accountNumber = accountNumber;
        this.amount = amount;
        this.status = TopupStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public void markStatus(TopupStatus status) {
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public String getOrderId() {
        return orderId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TopupStatus getStatus() {
        return status;
    }
}
