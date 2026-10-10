package com.ewalletlab.luckymoneyservice;

import com.ewalletlab.luckymoneyservice.domain.GiftCardStatus;
import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;
import com.ewalletlab.luckymoneyservice.repository.GiftCardTransferRepository;
import com.ewalletlab.luckymoneyservice.service.GiftCardService;
import com.ewalletlab.luckymoneyservice.service.UserServiceClient;
import com.ewalletlab.luckymoneyservice.service.WalletServiceClient;
import com.ewalletlab.luckymoneyservice.web.dto.SendGiftCardRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class GiftCardServiceTests {

    private GiftCardTransferRepository repository;
    private UserServiceClient userServiceClient;
    private WalletServiceClient walletServiceClient;
    private GiftCardService giftCardService;

    @BeforeEach
    void setup() {
        repository = mock(GiftCardTransferRepository.class);
        userServiceClient = mock(UserServiceClient.class);
        walletServiceClient = mock(WalletServiceClient.class);
        giftCardService = new GiftCardService(repository, userServiceClient, walletServiceClient);
    }

    @Test
    void testGetTemplates() {
        var templates = giftCardService.getTemplates();
        assertEquals(4, templates.size());
        assertTrue(templates.stream().anyMatch(t -> t.templateCode().equals("BIRTHDAY_CHEER")));
        assertTrue(templates.stream().anyMatch(t -> t.templateCode().equals("WEDDING_LOVE")));
        assertTrue(templates.stream().anyMatch(t -> t.templateCode().equals("THANK_YOU_WARM")));
        assertTrue(templates.stream().anyMatch(t -> t.templateCode().equals("CONGRATS_SUCCESS")));
    }

    @Test
    void testSend_Success() {
        UUID senderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        String recipientPhone = "0987654321";

        when(userServiceClient.findByPhone(recipientPhone))
            .thenReturn(new UserServiceClient.UserResponse(recipientId, recipientPhone, "Tran Thi B"));
        when(repository.save(any(GiftCardTransfer.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        var req = new SendGiftCardRequestDto(
            senderId,
            "Nguyen Van A",
            recipientPhone,
            new BigDecimal("50000"),
            "BIRTHDAY_CHEER",
            "Sinh nhat vui ve!",
            false
        );

        GiftCardTransfer card = giftCardService.send(req);
        assertNotNull(card);
        assertEquals(senderId, card.getSenderId());
        assertEquals(recipientId, card.getRecipientUserId());
        assertEquals(GiftCardStatus.SENT, card.getStatus());
        assertEquals(new BigDecimal("50000"), card.getAmount());

        verify(walletServiceClient, times(1)).debit(eq(senderId), eq(new BigDecimal("50000")), eq("TRANSFER_OUT"), anyString(), anyString());
        verify(walletServiceClient, times(1)).credit(eq(recipientId), eq(new BigDecimal("50000")), eq("TRANSFER_IN"), anyString(), anyString());
    }

    @Test
    void testSend_StepUpRequiredAbove10M() {
        UUID senderId = UUID.randomUUID();
        var req = new SendGiftCardRequestDto(
            senderId,
            "Nguyen Van A",
            "0987654321",
            new BigDecimal("12000000"),
            "BIRTHDAY_CHEER",
            "Chuc mung!",
            false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> giftCardService.send(req));
        assertEquals(HttpStatus.PRECONDITION_REQUIRED, ex.getStatusCode());
    }

    @Test
    void testSend_SelfTransferRejected() {
        UUID senderId = UUID.randomUUID();
        String phone = "0987654321";
        when(userServiceClient.findByPhone(phone))
            .thenReturn(new UserServiceClient.UserResponse(senderId, phone, "Nguyen Van A"));

        var req = new SendGiftCardRequestDto(
            senderId,
            "Nguyen Van A",
            phone,
            new BigDecimal("10000"),
            "BIRTHDAY_CHEER",
            "Hello",
            false
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> giftCardService.send(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void testOpen_Success() {
        UUID cardId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        GiftCardTransfer card = new GiftCardTransfer(
            UUID.randomUUID(), "Sender", recipientId, "0987654321", "Recipient",
            new BigDecimal("50000"), "BIRTHDAY_CHEER", "Wish"
        );

        when(repository.findById(cardId)).thenReturn(Optional.of(card));
        when(repository.save(any(GiftCardTransfer.class))).thenAnswer(inv -> inv.getArgument(0));

        GiftCardTransfer opened = giftCardService.open(cardId, recipientId);
        assertEquals(GiftCardStatus.OPENED, opened.getStatus());
        assertNotNull(opened.getOpenedAt());
    }

    @Test
    void testReply_Success() {
        UUID cardId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        GiftCardTransfer card = new GiftCardTransfer(
            UUID.randomUUID(), "Sender", recipientId, "0987654321", "Recipient",
            new BigDecimal("50000"), "BIRTHDAY_CHEER", "Wish"
        );

        when(repository.findById(cardId)).thenReturn(Optional.of(card));
        when(repository.save(any(GiftCardTransfer.class))).thenAnswer(inv -> inv.getArgument(0));

        GiftCardTransfer replied = giftCardService.reply(cardId, recipientId, "Cam on ban rat nhieu!");
        assertEquals("Cam on ban rat nhieu!", replied.getReplyMessage());
    }

    @Test
    void testReply_ForbiddenForNonRecipient() {
        UUID cardId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        UUID intruderId = UUID.randomUUID();
        GiftCardTransfer card = new GiftCardTransfer(
            UUID.randomUUID(), "Sender", recipientId, "0987654321", "Recipient",
            new BigDecimal("50000"), "BIRTHDAY_CHEER", "Wish"
        );

        when(repository.findById(cardId)).thenReturn(Optional.of(card));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            giftCardService.reply(cardId, intruderId, "Thank you!")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }
}
