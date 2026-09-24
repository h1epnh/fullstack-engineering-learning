package com.ewalletlab.topupservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Calls wallet-service's own /debit endpoint — same one WalletController's javadoc marks
 * "internal" (meant for a peer service, not a browser). This is exactly that: the withdrawal
 * flow's wallet-side debit is real (balance actually decreases, insufficient-balance is a real
 * 409 from wallet-service, not a client-side guess), but there is no simulated bank payout leg
 * the way top-up has mock-bank-gateway — a real system would still take time to actually move
 * money to the linked bank, this only makes the wallet's own ledger correct.
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record DebitResult(UUID userId, BigDecimal balance) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note) {
    }

    public DebitResult debit(UUID userId, BigDecimal amount, String note) {
        return debit(userId, amount, "WITHDRAW", note);
    }

    public DebitResult debit(UUID userId, BigDecimal amount, String type, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, null, note);
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(request)
            .retrieve()
            .body(DebitResult.class);
    }

    /** Used to refund a sender when an outbound bank transfer's IPN reports failure — the debit
     * already happened synchronously before the bank's async confirmation, so a failure has to be
     * compensated here, not just recorded (see BankTransferOutIpnController). */
    public DebitResult credit(UUID userId, BigDecimal amount, String type, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, null, note);
        return restClient.post()
            .uri("/wallets/{userId}/credit", userId)
            .body(request)
            .retrieve()
            .body(DebitResult.class);
    }
}
