package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.TransactionType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopupConfirmedListenerTests {

    @Mock
    private WalletService walletService;

    private TopupConfirmedListener listener;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        listener = new TopupConfirmedListener(walletService, objectMapper);
    }

    @Test
    void onTopupConfirmed_usesExplicitIdempotencyKeyWhenPresent() {
        UUID userId = UUID.randomUUID();
        String payload = """
            {
                "userId": "%s",
                "amount": "100000",
                "bankTransactionId": "bank-123",
                "idempotencyKey": "topup:custom-key"
            }
            """.formatted(userId);

        listener.onTopupConfirmed(payload);

        verify(walletService).credit(
            eq(userId),
            eq(new BigDecimal("100000")),
            eq(TransactionType.TOPUP),
            eq("bank-123"),
            eq("Top-up from linked bank"),
            eq("topup:custom-key")
        );
    }

    @Test
    void onTopupConfirmed_fallsBackToTopupBankTransactionId() {
        UUID userId = UUID.randomUUID();
        String payload = """
            {
                "userId": "%s",
                "amount": "50000",
                "bankTransactionId": "bank-456"
            }
            """.formatted(userId);

        listener.onTopupConfirmed(payload);

        verify(walletService).credit(
            eq(userId),
            eq(new BigDecimal("50000")),
            eq(TransactionType.TOPUP),
            eq("bank-456"),
            eq("Top-up from linked bank"),
            eq("topup:bank-456")
        );
    }

    @Test
    void onTopupConfirmed_handlesMalformedJsonGracefully() {
        listener.onTopupConfirmed("invalid-json");
        verifyNoInteractions(walletService);
    }
}
