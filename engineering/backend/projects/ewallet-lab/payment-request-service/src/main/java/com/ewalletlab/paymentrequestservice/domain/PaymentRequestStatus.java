package com.ewalletlab.paymentrequestservice.domain;

public enum PaymentRequestStatus {
    PENDING,
    /**
     * Issue #67 (TD-04c) — Atomic intermediate state when a payer initiates payment.
     * Prevents race conditions and stops "lying state" (marking PAID before transfer-service
     * actually moves the money). If transfer fails with 4xx, reverts to PENDING. If 503/timeout,
     * stays PAYING to prevent duplicate debit.
     */
    PAYING,
    PAID,
    CANCELLED,
    /** LINK only — reached via lazy-check (see PaymentRequestService.checkExpiry) when a PENDING
     * link is read past its TTL. REMINDER has no expiresAt (issue #8's Acceptance criteria has no
     * TTL for reminders), so it never transitions here. */
    EXPIRED
}
