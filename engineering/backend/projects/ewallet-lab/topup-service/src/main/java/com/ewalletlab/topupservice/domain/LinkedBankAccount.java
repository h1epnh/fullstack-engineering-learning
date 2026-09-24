package com.ewalletlab.topupservice.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "linked_bank_accounts")
public class LinkedBankAccount {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "bank_code", nullable = false)
    private String bankCode;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    protected LinkedBankAccount() {
        // JPA
    }

    public LinkedBankAccount(UUID userId, String bankCode, String accountNumber) {
        this.userId = userId;
        this.bankCode = bankCode;
        this.accountNumber = accountNumber;
    }

    public UUID getId() {
        return id;
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
}
