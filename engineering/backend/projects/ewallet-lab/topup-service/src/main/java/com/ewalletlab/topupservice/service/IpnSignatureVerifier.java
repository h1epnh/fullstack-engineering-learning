package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.web.dto.IpnRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Verifies the signature and freshness of an IPN sent by mock-bank-gateway (issue #52, TD-03).
 *
 * <p><b>Field list — verified from MoMo's official docs</b> (https://developers.momo.vn/v3/docs/payment/api/collection-link/,
 * section "Processing payment result", fetched 2026-10-18; that table is introduced as the
 * parameters MoMo sends "in the URL redirectUrl and the body content of ipnUrl"). Keys sorted
 * a-z, HMAC-SHA256:
 * <pre>
 * accessKey, amount, extraData, message, orderId, orderInfo, orderType, partnerCode, payType,
 * requestId, responseTime, resultCode, transId
 * </pre>
 * <b>Lab caveats (not MoMo spec):</b> the secret/accessKey are an internal lab pair shared with
 * mock-bank-gateway; the VALUES mock-bank-gateway puts into {@code orderType}/{@code payType} are
 * lab-defined, not MoMo's enum values. The page does not state the signature's timestamp-window
 * rule, so the replay window below is this lab's own control, not MoMo's.
 *
 * <p>Replay defence is two layers: (1) responseTime — covered by the signature, so it cannot be
 * rewritten — must be within a configurable window of now; (2) the controllers only act on a
 * request still {@code PENDING}, so a valid IPN resent inside the window is a no-op.
 */
@Component
public class IpnSignatureVerifier {

    private final String accessKey;
    private final String secretKey;
    private final long replayWindowMillis;

    public IpnSignatureVerifier(@Value("${ewallet-lab.bank-gateway.access-key}") String accessKey,
                                @Value("${ewallet-lab.bank-gateway.secret-key}") String secretKey,
                                @Value("${ewallet-lab.ipn.replay-window-seconds:300}") long replayWindowSeconds) {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("BANK_GATEWAY_SECRET_KEY must be configured");
        }
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.replayWindowMillis = replayWindowSeconds * 1000L;
    }

    /** Constant-time comparison; a missing signature is always invalid. */
    public boolean isSignatureValid(IpnRequest ipn) {
        if (ipn.signature() == null || ipn.signature().isBlank()) {
            return false;
        }
        String expected = MomoStyleSignature.compute(signedFields(ipn), secretKey);
        return MessageDigest.isEqual(
            expected.getBytes(StandardCharsets.UTF_8),
            ipn.signature().toLowerCase().getBytes(StandardCharsets.UTF_8));
    }

    /** responseTime is epoch millis (same unit as MoMo's responseTime and the gateway). */
    public boolean isWithinReplayWindow(IpnRequest ipn, long nowMillis) {
        return Math.abs(nowMillis - ipn.responseTime()) <= replayWindowMillis;
    }

    private Map<String, String> signedFields(IpnRequest ipn) {
        Map<String, String> f = new LinkedHashMap<>();
        f.put("accessKey", accessKey);
        f.put("amount", String.valueOf(ipn.amount()));
        f.put("extraData", nz(ipn.extraData()));
        f.put("message", nz(ipn.message()));
        f.put("orderId", nz(ipn.orderId()));
        f.put("orderInfo", nz(ipn.orderInfo()));
        f.put("orderType", nz(ipn.orderType()));
        f.put("partnerCode", nz(ipn.partnerCode()));
        f.put("payType", nz(ipn.payType()));
        f.put("requestId", nz(ipn.requestId()));
        f.put("responseTime", String.valueOf(ipn.responseTime()));
        f.put("resultCode", String.valueOf(ipn.resultCode()));
        f.put("transId", String.valueOf(ipn.transId()));
        return f;
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
