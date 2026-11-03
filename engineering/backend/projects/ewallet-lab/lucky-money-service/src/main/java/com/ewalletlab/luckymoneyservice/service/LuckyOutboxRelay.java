package com.ewalletlab.luckymoneyservice.service;

import com.ewalletlab.luckymoneyservice.domain.OutboxEvent;
import com.ewalletlab.luckymoneyservice.domain.OutboxEventStatus;
import com.ewalletlab.luckymoneyservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Instant;
import java.util.List;

/**
 * Issue #56 (TD-04) — the ONLY caller of wallet-service /credit for lucky money and gift cards after
 * the claim/expiry/gift-card state change has committed. Same pattern and retry policy as fund-service's
 * {@code FundOutboxRelay} (#22): idempotencyKey = outbox event id; any 4xx counts toward
 * {@link #PERMANENT_FAILURE_ATTEMPTS} then compensates and marks FAILED; anything else (5xx, timeout,
 * network) is retried forever (the call may have been applied; the idempotency key makes a retry safe) and
 * logged at ERROR {@code LUCKY_OUTBOX_STUCK} after {@link #ERROR_LOG_ESCALATION_ATTEMPTS} attempts.
 * Single replica assumed. Only credits live here (principle 7 / ADR-05).
 */
@Component
class LuckyOutboxRelay {

    private static final Logger log = LoggerFactory.getLogger(LuckyOutboxRelay.class);
    private static final long FIXED_DELAY_MILLIS = 10_000;
    static final int PERMANENT_FAILURE_ATTEMPTS = 3;
    private static final int ERROR_LOG_ESCALATION_ATTEMPTS = 10;

    private final OutboxEventRepository outboxRepository;
    private final LuckyMoneyMutationExecutor mutationExecutor;
    private final WalletServiceClient walletServiceClient;
    private final ObjectMapper objectMapper;

    LuckyOutboxRelay(OutboxEventRepository outboxRepository, LuckyMoneyMutationExecutor mutationExecutor,
                      WalletServiceClient walletServiceClient, ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.mutationExecutor = mutationExecutor;
        this.walletServiceClient = walletServiceClient;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = FIXED_DELAY_MILLIS, initialDelay = FIXED_DELAY_MILLIS)
    void relay() {
        for (OutboxEvent event : outboxRepository.findByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING)) {
            relayOnce(event);
        }
    }

    void relayOnce(OutboxEvent event) {
        OutboxPayload p = readPayload(event);
        try {
            walletServiceClient.credit(p.userId(), p.amount(), p.walletType(), p.reference(), p.note(),
                event.getId().toString());
            event.markDelivered(Instant.now());
            outboxRepository.save(event);
            log.info("outbox event {} ({}) delivered to wallet-service after {} attempt(s)",
                event.getId(), event.getEventType(), event.getAttemptCount() + 1);
        } catch (HttpClientErrorException e) {
            handleClientError(event, p, e);
        } catch (RuntimeException e) {
            handleTransientError(event, e);
        }
    }

    private void handleClientError(OutboxEvent event, OutboxPayload p, HttpClientErrorException e) {
        event.recordAttemptFailure(e.getStatusCode().value() + " " + e.getResponseBodyAsString());
        if (event.getAttemptCount() < PERMANENT_FAILURE_ATTEMPTS) {
            outboxRepository.save(event);
            log.warn("outbox event {} ({}) got {} from wallet-service, attempt {}/{}, retrying next tick",
                event.getId(), event.getEventType(), e.getStatusCode(), event.getAttemptCount(), PERMANENT_FAILURE_ATTEMPTS);
            return;
        }
        try {
            compensate(event, p);
            event.markFailed(e.getStatusCode().value() + " " + e.getResponseBodyAsString());
            outboxRepository.save(event);
            log.error("LUCKY_OUTBOX_FAILED event {} ({}) permanently failed after {} attempts ({}) — compensated, marked FAILED",
                event.getId(), event.getEventType(), event.getAttemptCount(), e.getStatusCode());
        } catch (ObjectOptimisticLockingFailureException lockEx) {
            outboxRepository.save(event);
            log.error("outbox event {} ({}) is permanently failing AND its compensation lost an optimistic-lock race — " +
                "staying PENDING, will retry compensating next tick", event.getId(), event.getEventType());
        }
    }

    private void handleTransientError(OutboxEvent event, RuntimeException e) {
        event.recordAttemptFailure(e.toString());
        outboxRepository.save(event);
        if (event.getAttemptCount() >= ERROR_LOG_ESCALATION_ATTEMPTS) {
            log.error("LUCKY_OUTBOX_STUCK — outbox event {} ({}) failed {} times with a non-client error (wallet-service " +
                "down/timeout?) — still retrying every tick, needs attention if this keeps climbing: {}",
                event.getId(), event.getEventType(), event.getAttemptCount(), e.toString());
        } else {
            log.warn("outbox event {} ({}) transient error (attempt {}), retrying next tick: {}",
                event.getId(), event.getEventType(), event.getAttemptCount(), e.toString());
        }
    }

    private void compensate(OutboxEvent event, OutboxPayload p) {
        switch (event.getEventType()) {
            case LUCKY_CLAIM_CREDIT, LUCKY_EXPIRE_REFUND -> mutationExecutor.revertToPending(p.subjectId());
            case GIFT_CARD_CREDIT_RECIPIENT ->
                mutationExecutor.compensateGiftCard(p.subjectId(), p.senderId(), p.userId(), p.amount());
            case GIFT_CARD_REFUND_SENDER -> log.error(
                "LUCKY_OUTBOX_REFUND_FAILED card={} sender={} amount={} — sender refund permanently rejected by " +
                "wallet-service; nothing further can be automated, needs manual reconciliation (row kept as FAILED)",
                p.subjectId(), p.userId(), p.amount());
        }
    }

    private OutboxPayload readPayload(OutboxEvent event) {
        try {
            return objectMapper.readValue(event.getPayload(), OutboxPayload.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Outbox event " + event.getId() + " has an unparseable payload", e);
        }
    }
}
