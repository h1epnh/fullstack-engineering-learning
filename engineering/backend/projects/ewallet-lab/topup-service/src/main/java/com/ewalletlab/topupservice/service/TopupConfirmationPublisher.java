package com.ewalletlab.topupservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/** Publishes wallet.topup.confirmed — the ONLY thing that makes wallet-service credit a balance. */
@Component
public class TopupConfirmationPublisher {

    private static final Logger log = LoggerFactory.getLogger(TopupConfirmationPublisher.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topic;

    TopupConfirmationPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper,
                                @Value("${ewallet-lab.topics.topup-confirmed}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.topic = topic;
    }

    public void publish(UUID userId, BigDecimal amount, String bankTransactionId) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                "userId", userId.toString(),
                "amount", amount.toPlainString(),
                "bankTransactionId", bankTransactionId
            ));
            kafkaTemplate.send(topic, userId.toString(), payload);
        } catch (Exception e) {
            log.error("failed to publish topup-confirmed for user={}", userId, e);
        }
    }
}
