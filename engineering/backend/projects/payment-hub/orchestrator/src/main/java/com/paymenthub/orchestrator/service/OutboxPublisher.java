package com.paymenthub.orchestrator.service;

import com.paymenthub.orchestrator.domain.OutboxEvent;
import com.paymenthub.orchestrator.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Polls unpublished outbox rows and pushes them to Kafka. Deliberately simple (a fixed-delay poll,
 * not Debezium/CDC) — good enough for a lab, and the trade-off is worth calling out explicitly:
 * this poller and the writer in {@link TransactionWriter} are not in the same transaction, so
 * there's an at-least-once delivery risk if the process crashes between "sent to Kafka" and
 * "marked published". A consumer of {@code payment-hub.outbox.routing-topic} must be idempotent.
 */
@Component
public class OutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxPublisher.class);

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPublisher(OutboxEventRepository outboxEventRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelayString = "${payment-hub.outbox.poll-interval-ms}")
    @Transactional
    public void publishPending() {
        List<OutboxEvent> pending = outboxEventRepository.findTop50ByPublishedAtIsNullOrderByCreatedAtAsc();
        for (OutboxEvent event : pending) {
            try {
                kafkaTemplate.send(event.getTopic(), event.getAggregateId().toString(), event.getPayload()).get();
                event.markPublished();
            } catch (Exception e) {
                log.warn("Failed to publish outbox event {} to topic {}, will retry next poll",
                    event.getId(), event.getTopic(), e);
            }
        }
    }
}
