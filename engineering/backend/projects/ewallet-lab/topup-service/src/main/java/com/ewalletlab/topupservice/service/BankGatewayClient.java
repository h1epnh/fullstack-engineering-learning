package com.ewalletlab.topupservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Calls mock-bank-gateway's /v2/gateway/api/create — same path MoMo's real Collection Link API
 * uses (see MomoStyleSignature javadoc). Lab-only fake credentials, same caveat as every other
 * provider adapter in this repo: a real integration gets partnerCode/accessKey/secretKey from a
 * signed contract, never hardcoded.
 */
@Component
public class BankGatewayClient {

    private static final String FAKE_PARTNER_CODE = "EWALLET_LAB_PARTNER";
    private static final String FAKE_ACCESS_KEY = "lab-access-key";
    private static final String FAKE_SECRET_KEY = "lab-secret-key-do-not-use-in-production";

    private final RestClient restClient;
    private final String topupIpnUrl;
    private final String bankTransferOutIpnUrl;

    public BankGatewayClient(@Value("${ewallet-lab.bank-gateway.base-url}") String bankGatewayBaseUrl,
                              @Value("${ewallet-lab.self.base-url}") String selfBaseUrl) {
        this.restClient = RestClient.create(bankGatewayBaseUrl);
        this.topupIpnUrl = selfBaseUrl + "/ipn/topup";
        this.bankTransferOutIpnUrl = selfBaseUrl + "/ipn/bank-transfer-out";
    }

    public CollectionResponse createCollection(String orderId, BigDecimal amount) {
        return call(orderId, amount, "ewallet-lab top-up #" + orderId, topupIpnUrl);
    }

    /**
     * Same gateway/signature mechanics as {@link #createCollection} — mock-bank-gateway has only
     * one endpoint, modeling "a bank accepts a money-movement request and confirms later via IPN"
     * for both directions. Adapted, not separately spec-verified: real MoMo docs fetched for this
     * project cover the Collection Link (money coming in), not an outbound-transfer API — see
     * DESIGN.md.
     */
    public CollectionResponse createOutboundTransfer(String orderId, BigDecimal amount) {
        return call(orderId, amount, "ewallet-lab bank transfer #" + orderId, bankTransferOutIpnUrl);
    }

    private CollectionResponse call(String orderId, BigDecimal amount, String orderInfo, String ipnUrl) {
        String requestId = "req-" + UUID.randomUUID();
        String requestType = "payWithMethod"; // fixed value per MoMo's real Collection Link spec
        String extraData = "";
        long amountLong = amount.longValueExact();

        Map<String, String> signedFields = new LinkedHashMap<>();
        signedFields.put("accessKey", FAKE_ACCESS_KEY);
        signedFields.put("amount", String.valueOf(amountLong));
        signedFields.put("extraData", extraData);
        signedFields.put("ipnUrl", ipnUrl);
        signedFields.put("orderId", orderId);
        signedFields.put("orderInfo", orderInfo);
        signedFields.put("partnerCode", FAKE_PARTNER_CODE);
        signedFields.put("redirectUrl", "");
        signedFields.put("requestId", requestId);
        signedFields.put("requestType", requestType);
        String signature = MomoStyleSignature.compute(signedFields, FAKE_SECRET_KEY);

        CollectionRequest request = new CollectionRequest(
            FAKE_PARTNER_CODE, requestId, amountLong, orderId, orderInfo, "", ipnUrl, requestType, extraData, signature);

        return restClient.post()
            .uri("/v2/gateway/api/create")
            .body(request)
            .retrieve()
            .body(CollectionResponse.class);
    }
}
