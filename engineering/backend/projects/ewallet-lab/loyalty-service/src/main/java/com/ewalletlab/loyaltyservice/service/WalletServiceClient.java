package com.ewalletlab.loyaltyservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Issue #19 option (b): points are computed from wallet-service's own ledger
 * ({@code GET /wallets/{userId}/transactions}) and cashback is paid through its {@code /credit}
 * — never a private credit path of this service's own.
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    /** Subset of wallet-service's Transaction entity — field names match it exactly. */
    public record WalletTransaction(UUID id, String type, BigDecimal amount, Instant createdAt) {
    }

    public record WalletResult(UUID userId, BigDecimal balance) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note) {
    }

    public List<WalletTransaction> transactions(UUID userId) {
        return restClient.get()
            .uri("/wallets/{userId}/transactions", userId)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {});
    }

    /** {@code LOYALTY_REDEMPTION} is the TransactionType added to wallet-service for this issue. */
    public WalletResult creditRedemption(UUID userId, BigDecimal amount, UUID redemptionId) {
        return restClient.post()
            .uri("/wallets/{userId}/credit", userId)
            .body(new AdjustBalanceRequest(amount, "LOYALTY_REDEMPTION", redemptionId.toString(), "Đổi điểm thưởng lấy hoàn tiền (mô phỏng)"))
            .retrieve()
            .body(WalletResult.class);
    }
}
