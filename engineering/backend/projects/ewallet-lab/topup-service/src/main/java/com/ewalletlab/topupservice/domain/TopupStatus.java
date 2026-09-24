package com.ewalletlab.topupservice.domain;

/**
 * PENDING = create-request accepted by mock-bank-gateway (their immediate ack — see
 * DESIGN.md step 3), NOT proof money moved. CONFIRMED/FAILED are set only by the IPN callback
 * (step 4) — this mirrors the real MoMo distinction between the synchronous create response and
 * the asynchronous IPN.
 */
public enum TopupStatus {
    PENDING,
    CONFIRMED,
    FAILED
}
