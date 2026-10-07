package com.ewalletlab.bnplservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Calls wallet-service's /debit for repayments — never a private debit path of its own (issue #18
 * Constraints, option (b)). Uses the new {@code BNPL_REPAYMENT} TransactionType added to
 * wallet-service for this issue (not WITHDRAW/TRANSFER_OUT, which already mean something else).
 */
@Component
public class WalletServiceClient {

    private final RestClient restClient;

    public WalletServiceClient(@Value("${ewallet-lab.wallet-service.base-url}") String walletServiceBaseUrl) {
        this.restClient = RestClient.create(walletServiceBaseUrl);
    }

    public record WalletResult(UUID userId, BigDecimal balance) {
    }

    private record AdjustBalanceRequest(BigDecimal amount, String type, String reference, String note, Boolean stepUpConfirmed) {
    }

    public WalletResult debitRepayment(UUID userId, BigDecimal amount, UUID repaymentId) {
        return debitRepayment(userId, amount, repaymentId, false);
    }

    public WalletResult debitRepayment(UUID userId, BigDecimal amount, UUID repaymentId, boolean stepUpConfirmed) {
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(new AdjustBalanceRequest(amount, "BNPL_REPAYMENT", repaymentId.toString(), "Trả nợ Ví Trả Sau (mô phỏng)", stepUpConfirmed))
            .retrieve()
            .body(WalletResult.class);
    }
}
