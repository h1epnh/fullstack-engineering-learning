package com.ewalletlab.luckymoneyservice.domain;

public enum LuckyMoneyStatus {
    PENDING,
    CLAIMED,
    /** Reached via lazy-check (see LuckyMoneyService.checkExpiry) — a PENDING lucky money past its
     * expiresAt is auto-refunded to the sender (wallet-service credit, type=REFUND) the next time
     * it's read (GET single/list, or a claim attempt), not by any @Scheduled polling job — see
     * issue #10's "Điểm rẽ #2" architecture decision. */
    EXPIRED_REFUNDED
}
