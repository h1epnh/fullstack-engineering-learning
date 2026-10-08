package com.ewalletlab.investmentfundservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Calls wallet-service's /debit (type INVESTMENT_BUY) and /credit (type INVESTMENT_SELL).
 * INVESTMENT_BUY is subject to monthly legal limit #7 (Thông tư 40/2024/TT-NHNN) and
 * step-up authentication #15 (QĐ 2345/QĐ-NHNN).
 * INVESTMENT_SELL is incoming funds, not subject to monthly limit and no step-up required.
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

    public WalletResult debitBuy(UUID userId, BigDecimal amount, String reference, String note, boolean stepUpConfirmed) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, "INVESTMENT_BUY", reference, note, stepUpConfirmed);
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }

    public WalletResult creditSell(UUID userId, BigDecimal amount, String reference, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, "INVESTMENT_SELL", reference, note, null);
        return restClient.post()
            .uri("/wallets/{userId}/credit", userId)
            .body(request)
            .retrieve()
            .body(WalletResult.class);
    }
}

