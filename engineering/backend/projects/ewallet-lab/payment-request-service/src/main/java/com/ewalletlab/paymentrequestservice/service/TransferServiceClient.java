package com.ewalletlab.paymentrequestservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Calls transfer-service's real {@code POST /transfers} — the actual debit(payer)/credit(creator)
 * saga (lookup recipient → debit sender → credit recipient, with compensation on failure) already
 * lives there (see TransferService.java). This service does not re-implement or bypass it: money
 * only ever moves through this one call, same as issue #8's constraint ("Không tạo endpoint nào
 * cho phép 'Trả ngay' bỏ qua transfer-service's /transfers thật").
 *
 * <p>Issue #126: Passes {@code idempotencyKey = "pay-req:" + id} to ensure idempotent debit execution
 * across retries and reconciliations.
 */
@Component
public class TransferServiceClient {

    private final RestClient restClient;

    public TransferServiceClient(@Value("${ewallet-lab.transfer-service.base-url}") String transferServiceBaseUrl) {
        this.restClient = RestClient.create(transferServiceBaseUrl);
    }

    public record TransferResult(UUID fromUserId, UUID toUserId, String toName, BigDecimal newBalance) {
    }

    private record TransferRequest(UUID fromUserId, String toPhone, BigDecimal amount, Boolean stepUpConfirmed, String idempotencyKey) {
    }

    /** {@code stepUpConfirmed} — issue #15 interaction (see PayRequestDto's javadoc). */
    public TransferResult transfer(UUID fromUserId, String toPhone, BigDecimal amount, boolean stepUpConfirmed, String idempotencyKey) {
        return restClient.post()
            .uri("/transfers")
            .body(new TransferRequest(fromUserId, toPhone, amount, stepUpConfirmed, idempotencyKey))
            .retrieve()
            .body(TransferResult.class);
    }

    public TransferResult transfer(UUID fromUserId, String toPhone, BigDecimal amount, boolean stepUpConfirmed) {
        return transfer(fromUserId, toPhone, amount, stepUpConfirmed, null);
    }
}
