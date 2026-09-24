package com.paymenthub.orchestrator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymenthub.orchestrator.domain.OutboxEvent;
import com.paymenthub.orchestrator.domain.RailType;
import com.paymenthub.orchestrator.domain.Transaction;
import com.paymenthub.orchestrator.domain.TransactionStatus;
import com.paymenthub.orchestrator.repository.OutboxEventRepository;
import com.paymenthub.orchestrator.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * The actual DB-transactional write. Kept in its own Spring bean (not a private/protected method
 * on {@link PaymentOrchestratorService}) so {@code @Transactional} is applied by Spring's proxy —
 * calling a {@code @Transactional} method on {@code this} from within the same bean silently
 * bypasses the proxy and the annotation does nothing. That's a common, hard-to-notice mistake.
 */
@Component
class TransactionWriter {

    private final TransactionRepository transactionRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    private final String routingTopic;

    TransactionWriter(TransactionRepository transactionRepository,
                       OutboxEventRepository outboxEventRepository,
                       ObjectMapper objectMapper,
                       @Value("${payment-hub.outbox.routing-topic}") String routingTopic) {
        this.transactionRepository = transactionRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
        this.routingTopic = routingTopic;
    }

    /** Persists a REJECTED transaction (screening failed) — no outbox event, nothing to route. */
    @Transactional
    Transaction persistRejected(String idempotencyKey, String sourceAccount, String destAccount,
                                 String destBic, BigDecimal amount, String currency) {
        Transaction transaction = new Transaction(idempotencyKey, sourceAccount, destAccount, destBic, amount, currency);
        transaction.markStatus(TransactionStatus.REJECTED);
        return transactionRepository.save(transaction);
    }

    /**
     * Persists a ROUTED transaction and its outbox event atomically — same DB transaction, so
     * either both are committed or neither is.
     */
    @Transactional
    Transaction persistRouted(String idempotencyKey, String sourceAccount, String destAccount,
                               String destBic, BigDecimal amount, String currency, RailType rail) {
        Transaction transaction = new Transaction(idempotencyKey, sourceAccount, destAccount, destBic, amount, currency);
        transaction.assignRail(rail);
        transaction.markStatus(TransactionStatus.ROUTED);
        transactionRepository.save(transaction);

        String payload = toJson(Map.of(
            "transactionId", transaction.getId().toString(),
            "rail", rail.name(),
            "sourceAccount", sourceAccount,
            "destAccount", destAccount,
            "destBic", destBic == null ? "" : destBic,
            "amount", amount.toPlainString(),
            "currency", currency
        ));
        outboxEventRepository.save(new OutboxEvent(transaction.getId(), routingTopic, payload));

        return transaction;
    }

    /**
     * Applies a settlement confirmation from a rail adapter: ROUTED -> SETTLED or FAILED. Only
     * transitions transactions currently in ROUTED — a duplicate/late settlement event for an
     * already-SETTLED or already-FAILED transaction is a no-op, which is what makes this handler
     * safe to call more than once for the same event (the adapters' Kafka delivery is at-least-once,
     * see OutboxPublisher's javadoc for why).
     */
    @Transactional
    void applySettlement(UUID transactionId, boolean settled) {
        Optional<Transaction> maybeTransaction = transactionRepository.findById(transactionId);
        if (maybeTransaction.isEmpty()) {
            return; // unknown transaction id — log at the caller, nothing to update here
        }
        Transaction transaction = maybeTransaction.get();
        if (transaction.getStatus() != TransactionStatus.ROUTED) {
            return; // already settled/failed/rejected — ignore duplicate or late event
        }
        transaction.markStatus(settled ? TransactionStatus.SETTLED : TransactionStatus.FAILED);
        transactionRepository.save(transaction);
    }

    private String toJson(Map<String, String> value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize outbox payload", e);
        }
    }
}
