package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.web.dto.IpnRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Cross-language fixed vector for the IPN signature. The SAME constants are asserted in the Go
 * test mock-bank-gateway/collection_test.go — the signer (Go gateway) and the verifier (Java) live
 * in different languages, so a shared digest is the only thing that actually proves the two sides
 * agree on the canonical string (field set, sort order, separator, empty-value handling). If
 * either side changes it, one of the two tests fails.
 *
 * <p>The expected digest was computed independently with Python's hmac/hashlib over:
 * <pre>
 * accessKey=test-access-key&amp;amount=50000&amp;extraData=&amp;message=msg&amp;orderId=ord-1
 * &amp;orderInfo=info&amp;orderType=lab&amp;partnerCode=P&amp;payType=lab&amp;requestId=req-1
 * &amp;responseTime=1700000000000&amp;resultCode=0&amp;transId=99
 * </pre>
 */
class IpnSignatureVerifierTests {

    private static final String ACCESS_KEY = "test-access-key";
    private static final String SECRET = "test-secret-not-a-real-one";
    private static final String EXPECTED_SIGNATURE =
            "8d7d3c6d4764b21272200f1b6bec99bd2398052e83e0c19502463c0b7232072f";

    private final IpnSignatureVerifier verifier = new IpnSignatureVerifier(ACCESS_KEY, SECRET, 300);

    private static IpnRequest vectorPayload() {
        return new IpnRequest("P", "ord-1", "req-1", 50000L, "info", "lab", 99L, 0,
                "msg", "lab", 1700000000000L, "", EXPECTED_SIGNATURE);
    }

    @Test
    void acceptsTheSharedCrossLanguageVector() {
        assertTrue(verifier.isSignatureValid(vectorPayload()),
                "the Go gateway's IPN signature must verify here");
    }

    @Test
    void rejectsAWrongSecret() {
        IpnSignatureVerifier other = new IpnSignatureVerifier(ACCESS_KEY, "attacker-guess", 300);
        assertFalse(other.isSignatureValid(vectorPayload()));
    }

    @Test
    void rejectsATamperedAmount() {
        IpnRequest good = vectorPayload();
        IpnRequest tampered = new IpnRequest(good.partnerCode(), good.orderId(), good.requestId(),
                50001L, good.orderInfo(), good.orderType(), good.transId(), good.resultCode(),
                good.message(), good.payType(), good.responseTime(), good.extraData(), good.signature());
        assertFalse(verifier.isSignatureValid(tampered));
    }

    @Test
    void rejectsATamperedResultCode() {
        IpnRequest good = vectorPayload();
        IpnRequest tampered = new IpnRequest(good.partnerCode(), good.orderId(), good.requestId(),
                good.amount(), good.orderInfo(), good.orderType(), good.transId(), 1000,
                good.message(), good.payType(), good.responseTime(), good.extraData(), good.signature());
        assertFalse(verifier.isSignatureValid(tampered));
    }

    @Test
    void rejectsAMissingOrBlankSignature() {
        IpnRequest good = vectorPayload();
        assertFalse(verifier.isSignatureValid(new IpnRequest(good.partnerCode(), good.orderId(),
                good.requestId(), good.amount(), good.orderInfo(), good.orderType(), good.transId(),
                good.resultCode(), good.message(), good.payType(), good.responseTime(),
                good.extraData(), null)));
        assertFalse(verifier.isSignatureValid(new IpnRequest(good.partnerCode(), good.orderId(),
                good.requestId(), good.amount(), good.orderInfo(), good.orderType(), good.transId(),
                good.resultCode(), good.message(), good.payType(), good.responseTime(),
                good.extraData(), "  ")));
    }

    /** The signature must cover exactly the 13 documented fields — not fewer (the original bug:
     *  the gateway signed 6, the verifier expected 13, so every IPN was rejected as forged). */
    @Test
    void signedFieldSetIsExactlyThe13DocumentedFields() {
        IpnRequest ipn = vectorPayload();
        // A payload whose orderInfo/orderType/payType/extraData are changed must still fail,
        // because all four are covered by the signature.
        List<IpnRequest> mutations = List.of(
                new IpnRequest(ipn.partnerCode(), ipn.orderId(), ipn.requestId(), ipn.amount(),
                        "changed-info", ipn.orderType(), ipn.transId(), ipn.resultCode(), ipn.message(),
                        ipn.payType(), ipn.responseTime(), ipn.extraData(), ipn.signature()),
                new IpnRequest(ipn.partnerCode(), ipn.orderId(), ipn.requestId(), ipn.amount(),
                        ipn.orderInfo(), "changed-type", ipn.transId(), ipn.resultCode(), ipn.message(),
                        ipn.payType(), ipn.responseTime(), ipn.extraData(), ipn.signature()),
                new IpnRequest(ipn.partnerCode(), ipn.orderId(), ipn.requestId(), ipn.amount(),
                        ipn.orderInfo(), ipn.orderType(), ipn.transId(), ipn.resultCode(), ipn.message(),
                        "changed-paytype", ipn.responseTime(), ipn.extraData(), ipn.signature()),
                new IpnRequest(ipn.partnerCode(), ipn.orderId(), ipn.requestId(), ipn.amount(),
                        ipn.orderInfo(), ipn.orderType(), ipn.transId(), ipn.resultCode(), ipn.message(),
                        ipn.payType(), ipn.responseTime(), "changed-extra", ipn.signature()));
        for (IpnRequest mutated : mutations) {
            assertFalse(verifier.isSignatureValid(mutated),
                    "every documented field must be covered by the signature");
        }
    }

    @Test
    void replayWindowAcceptsFreshAndRejectsStale() {
        long now = 1_700_000_000_000L;
        IpnRequest fresh = vectorPayload();
        assertTrue(verifier.isWithinReplayWindow(fresh, now));

        IpnRequest stale = new IpnRequest(fresh.partnerCode(), fresh.orderId(), fresh.requestId(),
                fresh.amount(), fresh.orderInfo(), fresh.orderType(), fresh.transId(), fresh.resultCode(),
                fresh.message(), fresh.payType(), now - 10 * 60 * 1000L, fresh.extraData(), fresh.signature());
        assertFalse(verifier.isWithinReplayWindow(stale, now));
    }

    @Test
    void emptySecretIsRejectedAtConstruction() {
        IllegalStateException ex = assertThrows(
                IllegalStateException.class, () -> new IpnSignatureVerifier(ACCESS_KEY, "", 300));
        assertTrue(ex.getMessage().contains("BANK_GATEWAY_SECRET_KEY"));
    }

    /** The canonical string must be exactly what the shared vector says — asserted directly so a
     *  failure points at the string, not just at "some signature mismatch". */
    @Test
    void canonicalStringMatchesTheDocumentedLayout() {
        assertEquals("8d7d3c6d4764b21272200f1b6bec99bd2398052e83e0c19502463c0b7232072f",
                MomoStyleSignature.compute(Map.ofEntries(
                        Map.entry("accessKey", ACCESS_KEY),
                        Map.entry("amount", "50000"),
                        Map.entry("extraData", ""),
                        Map.entry("message", "msg"),
                        Map.entry("orderId", "ord-1"),
                        Map.entry("orderInfo", "info"),
                        Map.entry("orderType", "lab"),
                        Map.entry("partnerCode", "P"),
                        Map.entry("payType", "lab"),
                        Map.entry("requestId", "req-1"),
                        Map.entry("responseTime", "1700000000000"),
                        Map.entry("resultCode", "0"),
                        Map.entry("transId", "99")),
                        SECRET));
    }
}
