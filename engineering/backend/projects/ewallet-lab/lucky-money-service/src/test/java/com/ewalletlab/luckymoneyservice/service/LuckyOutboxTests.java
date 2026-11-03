package com.ewalletlab.luckymoneyservice.service;

import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;
import com.ewalletlab.luckymoneyservice.domain.LuckyMoney;
import com.ewalletlab.luckymoneyservice.domain.LuckyMoneyStatus;
import com.ewalletlab.luckymoneyservice.domain.OutboxEvent;
import com.ewalletlab.luckymoneyservice.domain.OutboxEventStatus;
import com.ewalletlab.luckymoneyservice.domain.OutboxEventType;
import com.ewalletlab.luckymoneyservice.repository.GiftCardTransferRepository;
import com.ewalletlab.luckymoneyservice.repository.LuckyMoneyRepository;
import com.ewalletlab.luckymoneyservice.repository.OutboxEventRepository;
import com.ewalletlab.luckymoneyservice.web.dto.SendGiftCardRequestDto;
import com.ewalletlab.luckymoneyservice.web.dto.SendLuckyMoneyRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Issue #56 — outbox for lucky money / gift cards: same-transaction rows, sync debit first, relay idempotency + compensation. */
class LuckyOutboxTests {

    private final UUID sender = UUID.randomUUID();
    private final UUID recipient = UUID.randomUUID();
    private final BigDecimal amount = new BigDecimal("50000");

    private LuckyMoneyRepository luckyRepo;
    private GiftCardTransferRepository cardRepo;
    private OutboxEventRepository outboxRepo;
    private WalletServiceClient wallet;
    private UserServiceClient users;
    private LuckyMoneyMutationExecutor executor;
    private LuckyMoneyService luckyService;
    private GiftCardService cardService;
    private final List<OutboxEvent> saved = new ArrayList<>();

    @BeforeEach
    void setUp() {
        luckyRepo = mock(LuckyMoneyRepository.class);
        cardRepo = mock(GiftCardTransferRepository.class);
        outboxRepo = mock(OutboxEventRepository.class);
        wallet = mock(WalletServiceClient.class);
        users = mock(UserServiceClient.class);
        when(outboxRepo.save(any(OutboxEvent.class))).thenAnswer(i -> {
            OutboxEvent e = i.getArgument(0);
            if (e.getId() == null) ReflectionTestUtils.setField(e, "id", UUID.randomUUID());
            saved.add(e);
            return e;
        });
        when(luckyRepo.save(any(LuckyMoney.class))).thenAnswer(i -> i.getArgument(0));
        when(cardRepo.save(any(GiftCardTransfer.class))).thenAnswer(i -> {
            GiftCardTransfer c = i.getArgument(0);
            if (c.getId() == null) ReflectionTestUtils.setField(c, "id", UUID.randomUUID());
            return c;
        });
        when(users.findByPhone("0987654321")).thenReturn(new UserServiceClient.UserResponse(recipient, "0987654321", "B"));
        executor = new LuckyMoneyMutationExecutor(luckyRepo, cardRepo, outboxRepo, new ObjectMapper());
        luckyService = new LuckyMoneyService(luckyRepo, users, wallet, executor, 48);
        cardService = new GiftCardService(cardRepo, users, wallet, executor);
    }

    private LuckyMoney envelope(Instant expiresAt) {
        LuckyMoney lm = new LuckyMoney(sender, "A", recipient, "0987654321", amount, "msg", expiresAt);
        ReflectionTestUtils.setField(lm, "id", UUID.randomUUID());
        when(luckyRepo.findById(lm.getId())).thenReturn(Optional.of(lm));
        return lm;
    }

    private static HttpClientErrorException http(HttpStatus s, String body) {
        return HttpClientErrorException.create(s, s.name(), new HttpHeaders(), body.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }

    @Test
    void claimWritesOutboxRowAndDoesNotCallWallet() {
        LuckyMoney lm = envelope(Instant.now().plusSeconds(3600));
        LuckyMoney claimed = luckyService.claim(lm.getId(), recipient);

        assertEquals(LuckyMoneyStatus.CLAIMED, claimed.getStatus());
        assertEquals(1, saved.size());
        assertEquals(OutboxEventType.LUCKY_CLAIM_CREDIT, saved.get(0).getEventType());
        assertEquals(OutboxEventStatus.PENDING, saved.get(0).getStatus());
        verifyNoInteractions(wallet);
    }

    @Test
    void expiryWritesRefundOutboxRowAndDoesNotCallWallet() {
        LuckyMoney lm = envelope(Instant.now().minusSeconds(10));
        LuckyMoney r = luckyService.get(lm.getId());

        assertEquals(LuckyMoneyStatus.EXPIRED_REFUNDED, r.getStatus());
        assertEquals(OutboxEventType.LUCKY_EXPIRE_REFUND, saved.get(0).getEventType());
        verifyNoInteractions(wallet);
    }

    @Test
    void sendDebitInsufficientBalanceCreatesNoEnvelope() {
        when(wallet.debit(any(), any(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(http(HttpStatus.CONFLICT, "Insufficient"));
        var req = new SendLuckyMoneyRequestDto(sender, "A", "0987654321", amount, "hi");

        assertThrows(ResponseStatusException.class, () -> luckyService.send(req));

        verify(luckyRepo, never()).save(any());
        assertTrue(saved.isEmpty());
    }

    @Test
    void sendSaveFailureRefundsSenderWithIdempotentKey() {
        when(luckyRepo.save(any(LuckyMoney.class))).thenThrow(new IllegalStateException("db down"));
        var req = new SendLuckyMoneyRequestDto(sender, "A", "0987654321", amount, "hi");

        assertThrows(IllegalStateException.class, () -> luckyService.send(req));

        verify(wallet).credit(eq(sender), eq(amount), eq("REFUND"), anyString(), anyString(), startsWith("refund:lucky-send:"));
    }

    @Test
    void giftCardDebitFailureCreatesNoCardNorOutbox() {
        when(wallet.debit(any(), any(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(http(HttpStatus.CONFLICT, "Insufficient"));
        var req = new SendGiftCardRequestDto(sender, "A", "0987654321", amount, "BIRTHDAY_CHEER", "x", false);

        assertThrows(ResponseStatusException.class, () -> cardService.send(req));

        verify(cardRepo, never()).save(any());
        assertTrue(saved.isEmpty());
    }

    @Test
    void giftCardOutboxFailureRefundsSender() {
        when(outboxRepo.save(any(OutboxEvent.class))).thenThrow(new IllegalStateException("db down"));
        var req = new SendGiftCardRequestDto(sender, "A", "0987654321", amount, "BIRTHDAY_CHEER", "x", false);

        assertThrows(ResponseStatusException.class, () -> cardService.send(req));

        verify(wallet).credit(eq(sender), eq(amount), eq("REFUND"), anyString(), anyString(), startsWith("refund:giftcard-send:"));
    }

    private OutboxEvent pendingClaimEvent() {
        LuckyMoney lm = envelope(Instant.now().plusSeconds(3600));
        luckyService.claim(lm.getId(), recipient);
        return saved.get(0);
    }

    @Test
    void relayDeliversWithEventIdAsIdempotencyKeyAndRetryReusesIt() {
        OutboxEvent ev = pendingClaimEvent();
        LuckyOutboxRelay relay = new LuckyOutboxRelay(outboxRepo, executor, wallet, new ObjectMapper());
        when(wallet.credit(any(), any(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(new ResourceAccessException("timeout"))
            .thenReturn(new WalletServiceClient.WalletResult(recipient, amount));

        relay.relayOnce(ev); // transient failure: stays PENDING
        assertEquals(OutboxEventStatus.PENDING, ev.getStatus());
        relay.relayOnce(ev); // retry delivers
        assertEquals(OutboxEventStatus.DELIVERED, ev.getStatus());

        org.mockito.ArgumentCaptor<String> key = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(wallet, times(2)).credit(eq(recipient), eq(amount), eq("TRANSFER_IN"), anyString(), anyString(), key.capture());
        assertEquals(ev.getId().toString(), key.getAllValues().get(0));
        assertEquals(key.getAllValues().get(0), key.getAllValues().get(1)); // same key => wallet-service dedupes
    }

    @Test
    void relayRetriesForeverOnServerErrors() {
        OutboxEvent ev = pendingClaimEvent();
        LuckyOutboxRelay relay = new LuckyOutboxRelay(outboxRepo, executor, wallet, new ObjectMapper());
        when(wallet.credit(any(), any(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(new ResourceAccessException("down"));
        for (int i = 0; i < 12; i++) relay.relayOnce(ev);
        assertEquals(OutboxEventStatus.PENDING, ev.getStatus());
        assertEquals(12, ev.getAttemptCount());
    }

    @Test
    void permanentClientErrorRevertsClaimAndMarksFailed() {
        OutboxEvent ev = pendingClaimEvent();
        LuckyMoney lm = luckyRepo.findById(ev.getId() == null ? null : UUID.fromString(readSubject(ev))).orElseThrow();
        LuckyOutboxRelay relay = new LuckyOutboxRelay(outboxRepo, executor, wallet, new ObjectMapper());
        when(wallet.credit(any(), any(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(http(HttpStatus.BAD_REQUEST, "bad"));

        for (int i = 0; i < LuckyOutboxRelay.PERMANENT_FAILURE_ATTEMPTS; i++) relay.relayOnce(ev);

        assertEquals(OutboxEventStatus.FAILED, ev.getStatus());
        assertEquals(LuckyMoneyStatus.PENDING, lm.getStatus());
    }

    @Test
    void giftCardPermanentFailureDeletesCardAndEnqueuesSenderRefund() {
        var req = new SendGiftCardRequestDto(sender, "A", "0987654321", amount, "BIRTHDAY_CHEER", "x", false);
        cardService.send(req);
        OutboxEvent ev = saved.get(0);
        assertEquals(OutboxEventType.GIFT_CARD_CREDIT_RECIPIENT, ev.getEventType());
        when(cardRepo.findById(any())).thenReturn(Optional.of(mock(GiftCardTransfer.class)));
        LuckyOutboxRelay relay = new LuckyOutboxRelay(outboxRepo, executor, wallet, new ObjectMapper());
        when(wallet.credit(eq(recipient), any(), anyString(), anyString(), anyString(), anyString()))
            .thenThrow(http(HttpStatus.BAD_REQUEST, "bad"));

        for (int i = 0; i < LuckyOutboxRelay.PERMANENT_FAILURE_ATTEMPTS; i++) relay.relayOnce(ev);

        assertEquals(OutboxEventStatus.FAILED, ev.getStatus());
        verify(cardRepo).delete(any(GiftCardTransfer.class));
        assertTrue(saved.stream().anyMatch(e -> e.getEventType() == OutboxEventType.GIFT_CARD_REFUND_SENDER));
    }

    private static String readSubject(OutboxEvent ev) {
        try {
            return new ObjectMapper().readTree(ev.getPayload()).get("subjectId").asText();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
