package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.TransactionType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Consumes wallet.topup.confirmed, published by topup-service only AFTER mock-bank-gateway's IPN
 * confirms the money actually arrived — see DESIGN.md "Luồng Top-up". wallet-service never talks
 * to mock-bank-gateway directly; it only trusts topup-service's confirmation.
 */
@Component
class TopupConfirmedListener {

    private static final Logger log = LoggerFactory.getLogger(TopupConfirmedListener.class);

    private final WalletService walletService;
    private final ObjectMapper objectMapper;

    TopupConfirmedListener(WalletService walletService, ObjectMapper objectMapper) {
        this.walletService = walletService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${ewallet-lab.topics.topup-confirmed}")
    void onTopupConfirmed(String payload) {
        JsonNode node;
        try {
            node = objectMapper.readTree(payload);
        } catch (Exception e) {
            log.error("failed to parse topup-confirmed payload ({} bytes)", payload.length(), e);
            return;
        }

        UUID userId;
        try {
            userId = UUID.fromString(node.path("userId").asText());
        } catch (IllegalArgumentException e) {
            log.error("topup-confirmed event has invalid userId");
            return;
        }

        BigDecimal amount = new BigDecimal(node.path("amount").asText());
        String bankTransactionId = node.path("bankTransactionId").asText();

        walletService.credit(userId, amount, TransactionType.TOPUP, bankTransactionId, "Top-up from linked bank");
        log.info("credited topup for user={} amount={} bankTxn={}", userId, amount, bankTransactionId);
    }
}
