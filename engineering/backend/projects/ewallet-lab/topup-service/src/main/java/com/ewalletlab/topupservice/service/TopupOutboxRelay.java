package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.OutboxEvent;
import com.ewalletlab.topupservice.domain.OutboxEventStatus;
import com.ewalletlab.topupservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Issue #66 (TD-04b) — Background relay for Topup Outbox events.
 * Scans PENDING outbox events every tick and synchronously verifies Kafka ACK before marking DELIVERED.
 * Single replica assumed (same as fund-service / lucky-money-service).
 */
@Component
public class TopupOutboxRelay {

    private static final Logger log = LoggerFactory.getLogger(TopupOutboxRelay.class);
    private static final long FIXED_DELAY_MILLIS = 3_000;
    static final int ERROR_LOG_ESCALATION_ATTEMPTS = 10;

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String topic;

    public TopupOutboxRelay(OutboxEventRepository outboxEventRepository,
                            KafkaTemplate<String, String> kafkaTemplate,
                            ObjectMapper objectMapper,
                            @Value("${ewallet-lab.topics.topup-confirmed}") String topic) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.topic = topic;
    }

    @Scheduled(fixedDelay = FIXED_DELAY_MILLIS, initialDelay = FIXED_DELAY_MILLIS)
    public void relay() {
        List<OutboxEvent> pending = outboxEventRepository.findByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING);
        for (OutboxEvent event : pending) {
            relayOnce(event);
        }
    }

    public void relayOnce(OutboxEvent event) {
        try {
            Map<?, ?> map = objectMapper.readValue(event.getPayload(), Map.class);
            String userId = String.valueOf(map.get("userId"));
            kafkaTemplate.send(topic, userId, event.getPayload()).get(5, TimeUnit.SECONDS);

            event.markDelivered(Instant.now());
            outboxEventRepository.save(event);
            log.info("outbox event {} ({}) published to kafka topic {} after {} attempt(s)",
                event.getId(), event.getEventType(), topic, event.getAttemptCount() + 1);
        } catch (Exception e) {
            event.recordAttemptFailure(e.getMessage() != null ? e.getMessage() : e.toString());
            outboxEventRepository.save(event);
            if (event.getAttemptCount() >= ERROR_LOG_ESCALATION_ATTEMPTS) {
                log.error("TOPUP_OUTBOX_STUCK — outbox event {} ({}) failed {} times (kafka broker down/timeout?): {}",
                    event.getId(), event.getEventType(), event.getAttemptCount(), e.toString());
            } else {
                log.warn("outbox event {} ({}) attempt {} failed, retrying next tick: {}",
                    event.getId(), event.getEventType(), event.getAttemptCount(), e.toString());
            }
        }
    }
}
