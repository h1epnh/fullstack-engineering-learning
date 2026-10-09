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
 * {@code TRANSFER_OUT} (member contributing out of their wallet into the fund) and
 * {@code TRANSFER_IN} (creator withdrawing/dissolving back to their own wallet) — same enum values
 * wallet-service already has, per CLAUDE.md's "không tự bịa giá trị enum" rule.
 *
 * <p>Issue #22 — Outbox pattern: {@code credit}/{@code debit} are now called ONLY by {@code
 * FundOutboxRelay}, never directly from {@code FundService} (see backend DESIGN.md). Both always
 * carry an {@code idempotencyKey} (the outbox event's own id) so a relay retry of the same event —
 * including the "called wallet-service successfully, crashed before marking DELIVERED" case the
 * ticket's kill-pod scenario specifically exercises — doesn't double-credit/double-debit; see
 * wallet-service's new {@code Transaction.idempotencyKey} unique column.
 *
 * <p>Contribution debits use {@code TRANSFER_OUT}, which is in issue #15's step-up scope. Unlike
 * before (a single synchronous debit call from the live HTTP request), the actual debit is now
 * relayed asynchronously with no user present to react to a 428 — so {@code FundService#contribute}
 * runs the step-up GATE synchronously up front via {@link #stepUpCheck}, same established pattern
 * as topup-service's pre-check before TOPUP's own async (Kafka-driven) credit, and bakes the
 * resulting {@code stepUpConfirmed} into the outbox payload so the relay's eventual {@code debit}
 * call passes it straight through.
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record WalletResult(UUID userId, BigDecimal balance) {
    }

    /** Same shape as wallet-service's own {@code StepUpCheckResponse} (issue #15). */
    public record StepUpCheckResult(boolean required, BigDecimal dailyTotalSoFar, BigDecimal singleThreshold,
                                     BigDecimal dailyThreshold) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note,
                                         Boolean stepUpConfirmed, String idempotencyKey) {
    }

    public WalletResult debit(UUID userId, BigDecimal amount, String type, String reference, String note,
                               boolean stepUpConfirmed, String idempotencyKey) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, reference, note, stepUpConfirmed,
            idempotencyKey);
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }

    public WalletResult credit(UUID userId, BigDecimal amount, String type, String reference, String note,
                                String idempotencyKey) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, type, reference, note, null, idempotencyKey);
        return restClient.post()
            .uri("/wallets/{userId}/credit", userId)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }

    /** Read-only pre-flight for issue #15's step-up rule — see this class's javadoc for why
     * {@code FundService#contribute} has to call this synchronously now instead of letting
     * wallet-service's own {@code debitOnce} gate run inline with the (now-relayed) debit. */
    public StepUpCheckResult stepUpCheck(UUID userId, BigDecimal amount) {
        return restClient.get()
            .uri("/wallets/{userId}/step-up-check?amount={amount}", userId, amount.toPlainString())
            .retrieve()
            .body(StepUpCheckResult.class);
    }
}
