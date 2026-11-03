package com.ewalletlab.topupservice.web.dto;

/**
 * Field names match MoMo's real IPN payload (see topup-service/README.md "Nguồn spec"). All 13
 * fields of MoMo's documented IPN signature (minus accessKey, which is server-side config) are
 * carried here because the signature is recomputed from them — see IpnSignatureVerifier.
 * {@code partnerUserId} is in MoMo's field list but is not part of the signed string, so it is
 * not modelled.
 */
public record IpnRequest(
    String partnerCode,
    String orderId,
    String requestId,
    long amount,
    String orderInfo,
    String orderType,
    long transId,
    int resultCode,
    String message,
    String payType,
    long responseTime,
    String extraData,
    String signature
) {
}
