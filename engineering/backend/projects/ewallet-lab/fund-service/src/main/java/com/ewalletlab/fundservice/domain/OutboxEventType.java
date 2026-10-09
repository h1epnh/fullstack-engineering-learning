package com.ewalletlab.fundservice.domain;

/**
 * Issue #22 — Outbox pattern pilot. Every type here is the SECOND leg of a two-step "local commit,
 * then move real money" operation that used to call {@code wallet-service} directly from inside
 * {@code FundService} (see backend DESIGN.md's "Outbox pattern" section for the full before/after).
 * All 3 share the same {@code OutboxPayload} shape (fundId/userId/amount/fundTransactionId/
 * stepUpConfirmed) — only this type (which wallet-service endpoint to call, credit vs debit) and
 * the ledger note text differ.
 */
public enum OutboxEventType {
    /** contributeOnce's follow-up — debit the contributing member's wallet. The only DEBIT of the
     * 3, so the only one that carries a meaningful {@code stepUpConfirmed} flag (issue #15). */
    FUND_CONTRIBUTE_DEBIT,
    /** withdrawOnce's follow-up — credit the creator's wallet for a partial withdrawal. */
    FUND_WITHDRAW_CREDIT,
    /** dissolveOnce's follow-up — credit the creator's wallet with whatever remained in the fund. */
    FUND_DISSOLVE_CREDIT
}
