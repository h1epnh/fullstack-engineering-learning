package com.ewalletlab.billpaymentservice.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Issue #85 — maps wallet-service errors from a debit. HTTP 503 is wallet-service's deliberate
 * "rejected BEFORE execution" signal (ADR-02 / #55: eKYC tier could not be verified), so it is safe to
 * retry and must NOT trigger any credit/refund. Other 5xx and I/O errors (timeout, connection reset) are
 * AMBIGUOUS (the debit may or may not have been applied) and are deliberately NOT mapped here.
 */
public final class WalletErrors {

    static final String UNAVAILABLE_DEFAULT =
        "Hệ thống chưa thể xác minh định danh hoặc xử lý giao dịch lúc này, vui lòng thử lại sau";

    private WalletErrors() {
    }

    /** wallet-service 503 -> our 503 (reusing wallet's Vietnamese message when present). */
    public static ResponseStatusException unavailable(HttpServerErrorException.ServiceUnavailable e) {
        String body = e.getResponseBodyAsString();
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
            body != null && !body.isBlank() ? body : UNAVAILABLE_DEFAULT);
    }

    /** wallet-service 409 covers insufficient balance, monthly limit and eKYC. Only wallet's raw English
     * "Insufficient balance" is replaced by our friendly default; every other 409 message passes through. */
    public static String conflictMessage(HttpClientErrorException e, String insufficientDefault) {
        String body = e.getResponseBodyAsString();
        if (body == null || body.isBlank() || body.trim().equalsIgnoreCase("Insufficient balance")) {
            return insufficientDefault;
        }
        return body;
    }
}
