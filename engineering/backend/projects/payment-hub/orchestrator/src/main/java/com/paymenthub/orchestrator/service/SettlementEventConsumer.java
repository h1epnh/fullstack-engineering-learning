package com.paymenthub.orchestrator.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Consumes payment.settlement.confirmed, published by both napas-adapter and swift-adapter after
 * they simulate a rail call. This is what moves a transaction from ROUTED to SETTLED/FAILED — see
 * DESIGN.md section 3: settlement is fundamentally async, especially for SWIFT, so this can fire
 * anywhere from milliseconds to (in a real system) hours after the transaction was routed.
 */
@Component
class SettlementEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SettlementEventConsumer.class);

    private final TransactionWriter transactionWriter;
    private final ObjectMapper objectMapper;

    SettlementEventConsumer(TransactionWriter transactionWriter, ObjectMapper objectMapper) {
        this.transactionWriter = transactionWriter;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${payment-hub.outbox.settlement-topic}")
    void onSettlement(String payload) {
        JsonNode node;
        try {
            node = objectMapper.readTree(payload);
        } catch (Exception e) {
            log.error("failed to parse settlement event payload: {}", payload, e);
            return;
        }

        UUID transactionId;
        try {
            transactionId = UUID.fromString(node.path("transactionId").asText());
        } catch (IllegalArgumentException e) {
            log.error("settlement event has invalid transactionId: {}", payload);
            return;
        }

        boolean settled = node.path("settled").asBoolean(false);
        String reason = node.path("reason").asText("");
        String rail = node.path("rail").asText("");

        transactionWriter.applySettlement(transactionId, settled);

        if (settled) {
            log.info("[{}] tx={} SETTLED", rail, transactionId);
        } else {
            log.warn("[{}] tx={} FAILED reason={}", rail, transactionId, reason);
        }
    }
}
