package com.ewalletlab.topupservice.service;

/** Mirrors MoMo's real Collection Link response fields. */
record CollectionResponse(
    String partnerCode,
    String requestId,
    String orderId,
    long amount,
    long responseTime,
    String message,
    int resultCode,
    String payUrl,
    String shortLink
) {
}
