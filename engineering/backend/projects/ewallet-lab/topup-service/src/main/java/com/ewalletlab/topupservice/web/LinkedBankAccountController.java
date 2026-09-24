package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.LinkedBankAccount;
import com.ewalletlab.topupservice.repository.LinkedBankAccountRepository;
import com.ewalletlab.topupservice.web.dto.LinkBankAccountRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * No KYC/verification here (lab) — a real e-wallet linking a bank account is a regulated flow
 * (identity verification of account ownership), out of scope, same boundary already documented in
 * payment-hub/BUSINESS.md for Circular 41/45/2025.
 */
@RestController
@RequestMapping("/linked-bank-accounts")
public class LinkedBankAccountController {

    private final LinkedBankAccountRepository repository;

    public LinkedBankAccountController(LinkedBankAccountRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<LinkedBankAccount> link(@Valid @RequestBody LinkBankAccountRequest request) {
        LinkedBankAccount saved = repository.save(
            new LinkedBankAccount(request.userId(), request.bankCode(), request.accountNumber()));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/by-user/{userId}")
    public List<LinkedBankAccount> byUser(@PathVariable UUID userId) {
        return repository.findByUserId(userId);
    }
}
