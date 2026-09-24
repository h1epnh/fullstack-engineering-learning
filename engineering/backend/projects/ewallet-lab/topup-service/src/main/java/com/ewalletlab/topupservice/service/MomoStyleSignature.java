package com.ewalletlab.topupservice.service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Reproduces MoMo's real Collection Link signature formula exactly (verified from
 * https://developers.momo.vn/v3/docs/payment/api/collection-link/ — see ../README.md "Nguồn spec"):
 *
 * accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId
 * &orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId
 * &requestType=$requestType
 *
 * i.e. sort field names alphabetically, concatenate as key=value pairs joined by "&", HMAC-SHA256
 * with the secret key. mock-bank-gateway (the Go side playing "the bank") verifies with the exact
 * same formula — see mock-bank-gateway/collection.go.
 */
class MomoStyleSignature {

    private MomoStyleSignature() {
    }

    static String compute(Map<String, String> fields, String secretKey) {
        Map<String, String> sorted = new LinkedHashMap<>(fields); // TreeMap would sort, but be explicit below
        String raw = sorted.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> e.getKey() + "=" + e.getValue())
            .collect(Collectors.joining("&"));
        return hmacSha256Hex(raw, secretKey);
    }

    private static String hmacSha256Hex(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Failed to compute HMAC-SHA256 signature", e);
        }
    }
}
