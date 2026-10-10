package com.ewalletlab.billpaymentservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Issue #37: Client to interact with bnpl-service (port 8098) for BNPL payment source.
 */
@Component
public class BnplServiceClient {

    private final RestClient restClient;

    public BnplServiceClient(@Value("${ewallet-lab.bnpl-service.base-url:http://localhost:8098}") String bnplServiceBaseUrl) {
        this.restClient = RestClient.create(bnplServiceBaseUrl);
    }

    public record BnplWalletDto(
        boolean opened,
        BigDecimal creditLimit,
        BigDecimal availableLimit,
        BigDecimal outstandingPrincipal,
        BigDecimal totalDue
    ) {}

    private record DrawRequest(BigDecimal amount, String label) {}
    private record RefundRequest(BigDecimal amount, String reason) {}

    public BnplWalletDto getWallet(UUID userId) {
        return restClient.get()
            .uri("/bnpl/wallets/{userId}", userId)
            .retrieve()
            .body(BnplWalletDto.class);
    }

    public BnplWalletDto draw(UUID userId, BigDecimal amount, String label) {
        return restClient.post()
            .uri("/bnpl/wallets/{userId}/draw", userId)
            .body(new DrawRequest(amount, label))
            .retrieve()
            .body(BnplWalletDto.class);
    }

    public BnplWalletDto refund(UUID userId, BigDecimal amount, String reason) {
        return restClient.post()
            .uri("/bnpl/wallets/{userId}/refund", userId)
            .body(new RefundRequest(amount, reason))
            .retrieve()
            .body(BnplWalletDto.class);
    }
}
