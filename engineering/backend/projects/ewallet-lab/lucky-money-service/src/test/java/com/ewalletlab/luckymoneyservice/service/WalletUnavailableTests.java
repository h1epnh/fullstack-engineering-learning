package com.ewalletlab.luckymoneyservice.service;

import com.ewalletlab.luckymoneyservice.domain.OutboxEvent;
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
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Issue #85 — wallet 503 on the sending debit: retryable 503, NO envelope/card/outbox row, NO credit/refund call. */
class WalletUnavailableTests {

    private final UUID sender = UUID.randomUUID();
    private final UUID recipient = UUID.randomUUID();
    private LuckyMoneyRepository luckyRepo;
    private GiftCardTransferRepository cardRepo;
    private OutboxEventRepository outboxRepo;
    private WalletServiceClient wallet;
    private LuckyMoneyService luckyService;
    private GiftCardService cardService;

    @BeforeEach
    void setUp() {
        luckyRepo = mock(LuckyMoneyRepository.class);
        cardRepo = mock(GiftCardTransferRepository.class);
        outboxRepo = mock(OutboxEventRepository.class);
        wallet = mock(WalletServiceClient.class);
        UserServiceClient users = mock(UserServiceClient.class);
        when(users.findByPhone("0987654321")).thenReturn(new UserServiceClient.UserResponse(recipient, "0987654321", "B"));
        when(wallet.debit(any(), any(), anyString(), anyString(), anyString(), anyString())).thenThrow(
            HttpServerErrorException.create(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable", new HttpHeaders(),
                "Không thể xác minh định danh lúc này, vui lòng thử lại sau".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));
        LuckyMoneyMutationExecutor executor = new LuckyMoneyMutationExecutor(luckyRepo, cardRepo, outboxRepo, new ObjectMapper());
        luckyService = new LuckyMoneyService(luckyRepo, users, wallet, executor, 48);
        cardService = new GiftCardService(cardRepo, users, wallet, executor);
    }

    private void assertNoSideEffects(ResponseStatusException ex) {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        assertTrue(ex.getReason().contains("thử lại sau"));
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString());
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString(), anyString());
        verify(luckyRepo, never()).save(any());
        verify(cardRepo, never()).save(any());
        verify(outboxRepo, never()).save(any(OutboxEvent.class));
    }

    @Test
    void luckyMoneySend503_createsNoEnvelope() {
        assertNoSideEffects(assertThrows(ResponseStatusException.class, () ->
            luckyService.send(new SendLuckyMoneyRequestDto(sender, "A", "0987654321", new BigDecimal("50000"), "hi"))));
    }

    @Test
    void giftCardSend503_createsNoCard() {
        assertNoSideEffects(assertThrows(ResponseStatusException.class, () ->
            cardService.send(new SendGiftCardRequestDto(sender, "A", "0987654321", new BigDecimal("50000"), "BIRTHDAY_CHEER", "x", false))));
    }
}
