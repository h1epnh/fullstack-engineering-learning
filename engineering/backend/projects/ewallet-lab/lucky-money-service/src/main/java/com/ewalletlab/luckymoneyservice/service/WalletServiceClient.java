package com.ewalletlab.luckymoneyservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Calls wallet-service's own /credit and /debit directly — unlike payment-request-service (issue
 * #3/#8), which always settles through transfer-service's saga, lucky money debits the sender at
 * creation time (escrow) and only credits the recipient (or refunds the sender) later, which isn't
 * a single "transfer now" call transfer-service's API models. No new {@code TransactionType} value
 * needed: reuses {@code TRANSFER_OUT} (escrow debit), {@code TRANSFER_IN} (claim credit), and
 * {@code REFUND} (already used by topup-service's bank-transfer-out compensating credit) — same
 * enum values wallet-service already has, per CLAUDE.md's "không tự bịa giá trị enum" rule.
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record WalletResult(UUID userId, BigDecimal balance) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note) {
    }

    public WalletResult debit(UUID userId, BigDecimal amount, String type, String reference, String note) {
        return adjust(userId, "debit", amount, type, reference, note);
    }

    public WalletResult credit(UUID userId, BigDecimal amount, String type, String reference, String note) {
        return adjust(userId, "credit", amount, type, reference, note);
    }

    private WalletResult adjust(UUID userId, String action, BigDecimal amount, String type, String reference, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, reference, note);
        return restClient.post()
            .uri("/wallets/{userId}/{action}", userId, action)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }
}
