package com.ewalletlab.transferservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

/** Calls wallet-service's own /credit and /debit — same "internal, meant for a peer service"
 * endpoints WalletController's javadoc names transfer-service as a caller of. */
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

    public WalletResult debit(UUID userId, BigDecimal amount, String reference, String note) {
        return adjust(userId, "debit", amount, "TRANSFER_OUT", reference, note);
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
