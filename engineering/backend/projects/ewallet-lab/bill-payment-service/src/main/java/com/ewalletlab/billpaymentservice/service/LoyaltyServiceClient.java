package com.ewalletlab.billpaymentservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class LoyaltyServiceClient {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyServiceClient.class);
    private final RestClient restClient;

    public LoyaltyServiceClient(@Value("${ewallet-lab.loyalty-service.base-url:http://localhost:8099}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    public record ClaimRequest(UUID userId, String billCategory, BigDecimal billAmount, UUID billId) {}
    public record ClaimResult(UUID voucherId, String code, String title, BigDecimal discountAmount) {}
    public record RevertRequest(UUID userId) {}

    public ClaimResult claimVoucher(UUID voucherId, UUID userId, String billCategory, BigDecimal billAmount, UUID billId) {
        return restClient.post()
            .uri("/loyalty/vouchers/{id}/claim", voucherId)
            .body(new ClaimRequest(userId, billCategory, billAmount, billId))
            .retrieve()
            .body(ClaimResult.class);
    }

    public void revertVoucher(UUID voucherId, UUID userId) {
        try {
            restClient.post()
                .uri("/loyalty/vouchers/{id}/revert", voucherId)
                .body(new RevertRequest(userId))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Không thể hoàn voucher {} cho user {}: {}", voucherId, userId, e.getMessage());
        }
    }
}

