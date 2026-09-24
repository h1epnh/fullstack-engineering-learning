package com.paymenthub.orchestrator.web;

import com.paymenthub.orchestrator.domain.Transaction;
import com.paymenthub.orchestrator.repository.TransactionRepository;
import com.paymenthub.orchestrator.service.PaymentOrchestratorService;
import com.paymenthub.orchestrator.web.dto.PaymentRequest;
import com.paymenthub.orchestrator.web.dto.PaymentResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentOrchestratorService orchestratorService;
    private final TransactionRepository transactionRepository;

    public PaymentController(PaymentOrchestratorService orchestratorService,
                              TransactionRepository transactionRepository) {
        this.orchestratorService = orchestratorService;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> submit(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody PaymentRequest request) {
        Transaction transaction = orchestratorService.submit(
            idempotencyKey,
            request.sourceAccount(),
            request.destAccount(),
            request.destBic(),
            request.amount(),
            request.currency(),
            request.walletProvider()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(PaymentResponse.from(transaction));
    }

    @GetMapping("/{id}")
    public PaymentResponse get(@PathVariable UUID id) {
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found: " + id));
        return PaymentResponse.from(transaction);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleUnroutable(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
