package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.web.dto.IpnRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/** Independent signer (written from MoMo's documented string, not reusing production code). */
final class IpnTestSupport {
    static final String ACCESS_KEY = "test-access-key";
    static final String SECRET = "test-secret-not-a-real-one";

    private IpnTestSupport() {
    }

    static IpnRequest signed(String orderId, long amount, int resultCode, long responseTime, String secret) {
        String raw = "accessKey=" + ACCESS_KEY + "&amount=" + amount + "&extraData=&message=msg"
            + "&orderId=" + orderId + "&orderInfo=info&orderType=lab&partnerCode=P&payType=lab"
            + "&requestId=req-1&responseTime=" + responseTime + "&resultCode=" + resultCode + "&transId=99";
        return new IpnRequest("P", orderId, "req-1", amount, "info", "lab", 99, resultCode, "msg", "lab",
            responseTime, "", hmac(raw, secret));
    }

    static IpnRequest withSignature(IpnRequest i, String sig) {
        return new IpnRequest(i.partnerCode(), i.orderId(), i.requestId(), i.amount(), i.orderInfo(), i.orderType(),
            i.transId(), i.resultCode(), i.message(), i.payType(), i.responseTime(), i.extraData(), sig);
    }

    static String hmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            StringBuilder sb = new StringBuilder();
            for (byte b : mac.doFinal(data.getBytes(StandardCharsets.UTF_8))) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
