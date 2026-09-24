package com.paymenthub.ledger.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
class SettlementEventListener {

    private static final Logger log = LoggerFactory.getLogger(SettlementEventListener.class);

    private final LedgerRecordingService ledgerRecordingService;
    private final ObjectMapper objectMapper;

    SettlementEventListener(LedgerRecordingService ledgerRecordingService, ObjectMapper objectMapper) {
        this.ledgerRecordingService = ledgerRecordingService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${payment-hub.topics.settlement}")
    void onSettlementConfirmed(String payload) {
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
        if (settled) {
            ledgerRecordingService.finalizeEntries(transactionId);
        } else {
            ledgerRecordingService.reverse(transactionId);
        }
    }
}
