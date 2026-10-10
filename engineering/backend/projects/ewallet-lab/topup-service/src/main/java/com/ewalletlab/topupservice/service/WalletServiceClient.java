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

    /** Issue #15 — GET /wallets/{userId}/step-up-check's response shape (see wallet-service's
     * StepUpCheckResponse). Used as a pre-flight for TOPUP: unlike the debit-path types
     * (TRANSFER_OUT/BILL_PAYMENT/WITHDRAW), TOPUP's actual credit happens asynchronously via Kafka
     * once mock-bank-gateway's IPN lands, with no HTTP caller present at that point to carry a
     * stepUpConfirmed flag — so the gate has to run here, synchronously, before initiating the
     * collection at all. */
    public record StepUpCheckResult(boolean required, BigDecimal dailyTotalSoFar,
                                     BigDecimal singleThreshold, BigDecimal dailyThreshold) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note,
                                         Boolean stepUpConfirmed) {
    }

    public DebitResult debit(UUID userId, BigDecimal amount, String note, boolean stepUpConfirmed) {
        return debit(userId, amount, "WITHDRAW", note, stepUpConfirmed);
    }

    public DebitResult debit(UUID userId, BigDecimal amount, String type, String note, boolean stepUpConfirmed) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, null, note, stepUpConfirmed);
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(request)
            .retrieve()
            .body(DebitResult.class);
    }

    /** Used to refund a sender when an outbound bank transfer's IPN reports failure — the debit
     * already happened synchronously before the bank's async confirmation, so a failure has to be
     * compensated here, not just recorded (see BankTransferOutIpnController). Never needs step-up
     * (it's a compensating refund, not new outbound spend). */
    public DebitResult credit(UUID userId, BigDecimal amount, String type, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, null, note, false);
        return restClient.post()
            .uri("/wallets/{userId}/credit", userId)
            .body(request)
            .retrieve()
            .body(DebitResult.class);
    }

    public StepUpCheckResult stepUpCheck(UUID userId, BigDecimal amount) {
        return restClient.get()
            .uri("/wallets/{userId}/step-up-check?amount={amount}", userId, amount.toPlainString())
            .retrieve()
            .body(StepUpCheckResult.class);
    }

    public BigDecimal getBalance(UUID userId) {
        record BalanceResponse(UUID id, UUID userId, BigDecimal balance) {}
        BalanceResponse res = restClient.get()
            .uri("/wallets/{userId}/balance", userId)
            .retrieve()
            .body(BalanceResponse.class);
        return res != null ? res.balance() : BigDecimal.ZERO;
    }
}
