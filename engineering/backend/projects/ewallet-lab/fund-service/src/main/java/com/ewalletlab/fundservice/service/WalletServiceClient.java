package com.ewalletlab.fundservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Calls wallet-service's own /credit and /debit directly — same pattern as lucky-money-service
 * (issue #10), NOT transfer-service's P2P saga, because money here moves between a user's wallet
 * and this service's own locally-held {@code Fund.balance}, which isn't itself a wallet
 * transfer-service's API models. No new {@code TransactionType} value needed: reuses
 * {@code TRANSFER_OUT} (member contributing out of their wallet into the fund),
 * {@code TRANSFER_IN} (creator withdrawing/dissolving back to their own wallet), and
 * {@code REFUND} (compensating credit if a contribution's local step fails after the wallet debit
 * already succeeded) — same enum values wallet-service already has, per CLAUDE.md's "không tự bịa
 * giá trị enum" rule.
 *
 * <p>Contribution debits use {@code TRANSFER_OUT}, which is in issue #15's step-up scope — a large
 * contribution can legitimately come back as HTTP 428 from wallet-service, same as any other
 * TRANSFER_OUT. {@code debit} takes a {@code stepUpConfirmed} flag so the caller can retry after
 * confirmation, the same plumbing payment-request-service's {@code pay()} added for issue #11
 * (lucky-money-service predates issue #15 and was never updated with this — not repeating that gap
 * here, see backend DESIGN.md's "Quỹ nhóm" section).
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record WalletResult(UUID userId, BigDecimal balance) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note,
                                         Boolean stepUpConfirmed) {
    }

    public WalletResult debit(UUID userId, BigDecimal amount, String type, String reference, String note,
                               boolean stepUpConfirmed) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, reference, note, stepUpConfirmed);
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }

    public WalletResult credit(UUID userId, BigDecimal amount, String type, String reference, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, reference, note, null);
        return restClient.post()
            .uri("/wallets/{userId}/credit", userId)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }
}
