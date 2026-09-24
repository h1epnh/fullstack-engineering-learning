package com.paymenthub.orchestrator.service;

import com.paymenthub.orchestrator.domain.RailType;
import com.paymenthub.orchestrator.domain.Transaction;
import com.paymenthub.orchestrator.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Core saga: PENDING (implicit) -> SCREENING -> (REJECTED | ROUTED). SETTLED is set later, out of
 * band, once a rail adapter confirms settlement (see DESIGN.md section 3 — this is deliberately
 * NOT synchronous for SWIFT/cross-border, and shouldn't become synchronous just to simplify a
 * demo).
 */
@Service
public class PaymentOrchestratorService {

    private final TransactionRepository transactionRepository;
    private final RoutingEngine routingEngine;
    private final ComplianceClient complianceClient;
    private final TransactionWriter transactionWriter;

    public PaymentOrchestratorService(TransactionRepository transactionRepository,
                                       RoutingEngine routingEngine,
                                       ComplianceClient complianceClient,
                                       TransactionWriter transactionWriter) {
        this.transactionRepository = transactionRepository;
        this.routingEngine = routingEngine;
        this.complianceClient = complianceClient;
        this.transactionWriter = transactionWriter;
    }

    /**
     * Idempotency check is a plain read outside any write transaction, so a duplicate request is
     * cheap. There's a narrow race between this check and the insert in {@link TransactionWriter}
     * under concurrent duplicate requests; the DB unique constraint on idempotency_key (see
     * {@code Transaction}) is the actual source of truth and will reject the second insert if the
     * race is lost here.
     */
    public Transaction submit(String idempotencyKey, String sourceAccount, String destAccount,
                               String destBic, BigDecimal amount, String currency, String walletProvider) {
        return transactionRepository.findByIdempotencyKey(idempotencyKey)
            .orElseGet(() -> screenAndRoute(idempotencyKey, sourceAccount, destAccount, destBic, amount, currency, walletProvider));
    }

    private Transaction screenAndRoute(String idempotencyKey, String sourceAccount, String destAccount,
                                        String destBic, BigDecimal amount, String currency, String walletProvider) {
        if (!complianceClient.isClear(sourceAccount, destAccount)) {
            return transactionWriter.persistRejected(idempotencyKey, sourceAccount, destAccount, destBic, amount, currency);
        }

        RailType rail = routingEngine.route(destAccount, destBic, currency, amount, walletProvider);
        return transactionWriter.persistRouted(idempotencyKey, sourceAccount, destAccount, destBic, amount, currency, rail);
    }
}
