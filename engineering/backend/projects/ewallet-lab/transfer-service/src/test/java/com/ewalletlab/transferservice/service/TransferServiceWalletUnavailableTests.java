package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
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

/** Issue #85 — wallet-service 503 (debit rejected BEFORE execution, ADR-02) must surface as a retryable 503 with no credit/refund. */
class TransferServiceWalletUnavailableTests {

    @Test
    void walletServiceUnavailable_returns503_andNeverCreditsAnyone() {
        UUID sender = UUID.randomUUID();
        UUID recipient = UUID.randomUUID();
        UserServiceClient users = mock(UserServiceClient.class);
        WalletServiceClient wallet = mock(WalletServiceClient.class);
        SavedPayeeService payees = mock(SavedPayeeService.class);
        when(users.findByPhone("0987654321")).thenReturn(new UserServiceClient.UserResponse(recipient, "0987654321", "B"));
        when(wallet.debit(any(), any(), anyString(), anyString(), anyBoolean())).thenThrow(
            HttpServerErrorException.create(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable", new HttpHeaders(),
                "Không thể xác minh định danh lúc này, vui lòng thử lại sau".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));
        TransferService service = new TransferService(users, wallet, payees);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            service.transfer(new TransferRequestDto(sender, "0987654321", new BigDecimal("10000"), false)));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        assertTrue(ex.getReason().contains("thử lại sau"));
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString()); // no credit, no refund
        verifyNoInteractions(payees);
    }

    @Test
    void ambiguousServerError_isNotMappedTo503() {
        UserServiceClient users = mock(UserServiceClient.class);
        WalletServiceClient wallet = mock(WalletServiceClient.class);
        when(users.findByPhone("0987654321")).thenReturn(new UserServiceClient.UserResponse(UUID.randomUUID(), "0987654321", "B"));
        when(wallet.debit(any(), any(), anyString(), anyString(), anyBoolean())).thenThrow(
            HttpServerErrorException.create(HttpStatus.INTERNAL_SERVER_ERROR, "x", new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));
        TransferService service = new TransferService(users, wallet, mock(SavedPayeeService.class));

        assertThrows(HttpServerErrorException.class, () ->
            service.transfer(new TransferRequestDto(UUID.randomUUID(), "0987654321", new BigDecimal("10000"), false)));
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString());
    }
}
