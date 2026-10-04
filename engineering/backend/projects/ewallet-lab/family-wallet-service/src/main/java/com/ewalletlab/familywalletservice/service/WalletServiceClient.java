package com.ewalletlab.familywalletservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Read-only caller into wallet-service's existing {@code GET /wallets/{userId}/transactions} —
 * this service never calls wallet-service's /credit or /debit (see FamilyLink's javadoc): it only
 * reads the member's own ledger to compute "spent this month" for display and to serve the
 * parent's "xem lịch sử chi tiêu" view (issue #12's Task). No new wallet-service endpoint was added
 * for this — the existing unauthenticated GET already returns everything needed.
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record TransactionView(UUID id, UUID walletId, String type, BigDecimal amount, String reference,
                                   String note, Instant createdAt) {
    }

    public List<TransactionView> getTransactions(UUID userId) {
        TransactionView[] body = restClient.get()
            .uri("/wallets/{userId}/transactions", userId)
            .retrieve()
            .body(TransactionView[].class);
        return body == null ? List.of() : Arrays.asList(body);
    }
}
