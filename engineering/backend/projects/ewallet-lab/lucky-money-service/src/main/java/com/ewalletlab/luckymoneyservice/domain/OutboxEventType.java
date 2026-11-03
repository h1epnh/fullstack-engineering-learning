package com.ewalletlab.luckymoneyservice.domain;

/** Issue #56 — every type is a wallet-service CREDIT (principle 7: no debit in the outbox). */
public enum OutboxEventType {
    /** Recipient's credit after the PENDING -> CLAIMED transition. Compensation: revert to PENDING. */
    LUCKY_CLAIM_CREDIT,
    /** Sender's REFUND after PENDING -> EXPIRED_REFUNDED. Compensation: revert to PENDING. */
    LUCKY_EXPIRE_REFUND,
    /** Recipient's credit for a gift card (sender already debited synchronously). Compensation:
     * delete the card and enqueue {@link #GIFT_CARD_REFUND_SENDER}. */
    GIFT_CARD_CREDIT_RECIPIENT,
    /** Sender's REFUND after the recipient credit permanently failed. Terminal if it fails too. */
    GIFT_CARD_REFUND_SENDER
}
