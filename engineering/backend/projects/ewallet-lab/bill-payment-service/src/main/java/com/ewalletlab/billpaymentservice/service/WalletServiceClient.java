package com.ewalletlab.billpaymentservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/** Calls wallet-service's own /debit — same "internal, meant for a peer service" endpoint
 * WalletController's javadoc already names bill-payment-service as a caller of. */
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

    public DebitResult debit(UUID userId, BigDecimal amount, String reference, String note) {
        AdjustBalanceRequest request = new AdjustBalanceRequest(amount, "BILL_PAYMENT", reference, note);
        return restClient.post()
            .uri("/wallets/{userId}/debit", userId)
            .body(request)
            .retrieve()
            .body(DebitResult.class);
    }
}
