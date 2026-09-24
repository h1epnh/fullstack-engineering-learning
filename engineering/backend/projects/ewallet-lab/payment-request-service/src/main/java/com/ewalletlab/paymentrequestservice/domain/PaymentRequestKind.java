package com.ewalletlab.paymentrequestservice.domain;

/**
 * Distinguishes the two "chờ giữa 2 user" flows this service was created to own (see issue #3 +
 * #8's shared architecture decision comment) — same table/entity, different field on purpose so
 * we don't duplicate a domain model for one underlying concept ("someone will pay someone else
 * later").
 */
public enum PaymentRequestKind {
    /** Issue #3 — opaque-token public link, created by the requester, payable by anyone with a
     * valid Ewallet Lab account who opens the URL (no target user known ahead of time). */
    LINK,
    /** Issue #8 — 1-1 nội bộ, target user resolved by phone at creation time (like transfer-service),
     * only that target user can pay it. */
    REMINDER
}
