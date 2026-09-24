package com.paymenthub.ledger.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymenthub.ledger.util.PiiMasking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Consumes the same payment.routing.requested topic the rail adapters consume — ledger-service is
 * an independent subscriber, not something the orchestrator calls directly. This is exactly the
 * "smart endpoints, dumb pipes" / choreography-for-downstream-consumers pattern: the orchestrator
 * doesn't know or care that ledger-service exists.
 */
@Component
class RoutingEventListener {

    private static final Logger log = LoggerFactory.getLogger(RoutingEventListener.class);

    private final LedgerRecordingService ledgerRecordingService;
    private final ObjectMapper objectMapper;

    RoutingEventListener(LedgerRecordingService ledgerRecordingService, ObjectMapper objectMapper) {
        this.ledgerRecordingService = ledgerRecordingService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${payment-hub.topics.routing}")
    void onRoutingRequested(String payload) {
        // Deliberately never logs `payload` itself on any path below — it carries account numbers
        // ("deposit/account information" under Decree 13/2023/ND-CP), and the raw-payload-on-error
        // habit is exactly how account numbers end up in log aggregators unnoticed. Log length and
        // the exception instead; that's enough to debug a malformed event without also leaking PII.
        JsonNode node;
        try {
            node = objectMapper.readTree(payload);
        } catch (Exception e) {
            log.error("failed to parse routing event payload ({} bytes)", payload.length(), e);
            return;
        }

        UUID transactionId;
        try {
            transactionId = UUID.fromString(node.path("transactionId").asText());
        } catch (IllegalArgumentException e) {
            log.error("routing event has invalid transactionId ({} bytes payload)", payload.length());
            return;
        }

        String sourceAccount = node.path("sourceAccount").asText();
        String destAccount = node.path("destAccount").asText();
        BigDecimal amount = new BigDecimal(node.path("amount").asText());
        String currency = node.path("currency").asText();

        ledgerRecordingService.recordProvisional(transactionId, sourceAccount, destAccount, amount, currency);
        log.info("posted provisional double-entry for tx={} ({} -> {}, {} {})",
            transactionId, PiiMasking.maskAccount(sourceAccount), PiiMasking.maskAccount(destAccount), amount, currency);
    }
}
