package com.ewalletlab.topupservice.service;

/**
 * Mirrors MoMo's real Collection Link request fields exactly (see MomoStyleSignature javadoc for
 * the source). "Collection" here plays the role of "the bank collecting money from the user's
 * linked account to top up the wallet" — same request shape, different business meaning than
 * MoMo's real merchant-collects-from-customer use case (see ../README.md "Ranh giới spec").
 */
record CollectionRequest(
    String partnerCode,
    String requestId,
    long amount,
    String orderId,
    String orderInfo,
    String redirectUrl,
    String ipnUrl,
    String requestType,
    String extraData,
    String signature
) {
}
