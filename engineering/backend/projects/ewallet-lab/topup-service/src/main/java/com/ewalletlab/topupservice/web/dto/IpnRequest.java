package com.ewalletlab.topupservice.web.dto;

/**
 * Field names match MoMo's real IPN payload exactly (see topup-service/README.md "Nguồn spec") —
 * transId/resultCode/message/signature/orderId are the fields that mattered for verification here;
 * MoMo's real IPN carries a few more (orderType, payType) that this lab doesn't need to act on.
 */
public record IpnRequest(
    String partnerCode,
    String orderId,
    String requestId,
    long amount,
    long transId,
    int resultCode,
    String message,
    long responseTime,
    String signature
) {
}
