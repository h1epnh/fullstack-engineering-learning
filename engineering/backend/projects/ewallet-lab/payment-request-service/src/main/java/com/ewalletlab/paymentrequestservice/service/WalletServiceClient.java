package com.ewalletlab.paymentrequestservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Client for wallet-service used by PaymentRequestService reconciler to verify
 * whether an in-flight debit with a specific idempotencyKey actually succeeded.
 */
@Component
public class WalletServiceClient {

    private static final Logger log = LoggerFactory.getLogger(WalletServiceClient.class);
    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url:http://localhost:8091}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record TransactionDto(
        UUID id,
        UUID walletId,
        String type,
        BigDecimal amount,
        String reference,
        String note,
        String idempotencyKey,
        Instant createdAt
    ) {}

    public Optional<TransactionDto> findTransactionByIdempotencyKey(UUID userId, String idempotencyKey) {
        if (userId == null || idempotencyKey == null || idempotencyKey.isBlank()) {
            return Optional.empty();
        }
        try {
            List<TransactionDto> transactions = restClient.get()
                .uri("/wallets/{userId}/transactions", userId)
                .retrieve()
                .body(new ParameterizedTypeReference<List<TransactionDto>>() {});

            if (transactions == null) {
                return Optional.empty();
            }

            return transactions.stream()
                .filter(t -> idempotencyKey.equals(t.idempotencyKey()))
                .findFirst();
        } catch (HttpClientErrorException.NotFound e) {
            log.info("User {} has no wallet or transactions in wallet-service", userId);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Failed to query transactions from wallet-service for user {}: {}", userId, e.getMessage());
            throw e;
        }
    }
}
