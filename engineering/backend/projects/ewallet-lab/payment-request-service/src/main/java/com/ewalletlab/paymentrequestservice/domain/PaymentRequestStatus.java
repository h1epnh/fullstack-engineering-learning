package com.ewalletlab.paymentrequestservice.domain;

public enum PaymentRequestStatus {
    PENDING,
    PAID,
    CANCELLED,
    /** LINK only — reached via lazy-check (see PaymentRequestService.checkExpiry) when a PENDING
     * link is read past its TTL. REMINDER has no expiresAt (issue #8's Acceptance criteria has no
     * TTL for reminders), so it never transitions here. */
    EXPIRED
}
