package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.OutboxEvent;
import com.ewalletlab.topupservice.domain.OutboxEventStatus;
import com.ewalletlab.topupservice.domain.OutboxEventType;
import com.ewalletlab.topupservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopupOutboxRelayTests {

    @Mock
    private OutboxEventRepository outboxRepo;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String TOPIC = "wallet.topup.confirmed";

    private TopupOutboxRelay relay;

    @BeforeEach
    void setUp() {
        relay = new TopupOutboxRelay(outboxRepo, kafkaTemplate, objectMapper, TOPIC);
    }

    @Test
    void relayOnce_successfulPublish_marksDelivered() {
        UUID userId = UUID.randomUUID();
        String payload = """
            {"userId":"%s","amount":"50000","bankTransactionId":"bank-1","orderId":"topup-1","idempotencyKey":"topup:bank-1"}
            """.formatted(userId).trim();
        OutboxEvent event = OutboxEvent.pending(OutboxEventType.TOPUP_CONFIRMED, payload);

        CompletableFuture<SendResult<String, String>> future = CompletableFuture.completedFuture(mock(SendResult.class));
        when(kafkaTemplate.send(eq(TOPIC), eq(userId.toString()), eq(payload))).thenReturn(future);

        relay.relayOnce(event);

        assertEquals(OutboxEventStatus.DELIVERED, event.getStatus());
        assertNotNull(event.getDeliveredAt());
        verify(outboxRepo).save(event);
    }

    @Test
    void relayOnce_kafkaFailure_incrementsAttemptAndKeepsPending() {
        UUID userId = UUID.randomUUID();
        String payload = """
            {"userId":"%s","amount":"50000","bankTransactionId":"bank-2","orderId":"topup-2","idempotencyKey":"topup:bank-2"}
            """.formatted(userId).trim();
        OutboxEvent event = OutboxEvent.pending(OutboxEventType.TOPUP_CONFIRMED, payload);

        CompletableFuture<SendResult<String, String>> failedFuture = new CompletableFuture<>();
        failedFuture.completeExceptionally(new RuntimeException("Kafka broker unreachable"));
        when(kafkaTemplate.send(eq(TOPIC), eq(userId.toString()), eq(payload))).thenReturn(failedFuture);

        relay.relayOnce(event);

        assertEquals(OutboxEventStatus.PENDING, event.getStatus());
        assertEquals(1, event.getAttemptCount());
        assertNotNull(event.getLastError());
        assertTrue(event.getLastError().contains("Kafka broker unreachable"));
        verify(outboxRepo).save(event);
    }

    @Test
    void relay_pollsPendingEventsAndProcessesAll() {
        UUID u1 = UUID.randomUUID();
        UUID u2 = UUID.randomUUID();
        String p1 = """
            {"userId":"%s","amount":"50000","bankTransactionId":"b1","orderId":"t1","idempotencyKey":"topup:b1"}
            """.formatted(u1).trim();
        String p2 = """
            {"userId":"%s","amount":"100000","bankTransactionId":"b2","orderId":"t2","idempotencyKey":"topup:b2"}
            """.formatted(u2).trim();

        OutboxEvent e1 = OutboxEvent.pending(OutboxEventType.TOPUP_CONFIRMED, p1);
        OutboxEvent e2 = OutboxEvent.pending(OutboxEventType.TOPUP_CONFIRMED, p2);

        when(outboxRepo.findByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING)).thenReturn(List.of(e1, e2));
        when(kafkaTemplate.send(anyString(), anyString(), anyString()))
            .thenReturn(CompletableFuture.completedFuture(mock(SendResult.class)));

        relay.relay();

        assertEquals(OutboxEventStatus.DELIVERED, e1.getStatus());
        assertEquals(OutboxEventStatus.DELIVERED, e2.getStatus());
        verify(outboxRepo, times(2)).save(any(OutboxEvent.class));
    }
}
