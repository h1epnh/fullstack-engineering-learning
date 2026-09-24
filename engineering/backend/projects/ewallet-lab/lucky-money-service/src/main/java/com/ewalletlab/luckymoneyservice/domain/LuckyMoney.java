package com.ewalletlab.luckymoneyservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #10 — 1-1 lucky money ("lì xì") with real escrow: the sender's wallet is debited
 * synchronously at creation time (see LuckyMoneyService.send), before the recipient ever claims
 * it. This is deliberately different from payment-request-service's LINK/REMINDER (issue #3/#8),
 * which never touch a wallet until the payer actively confirms — hence a separate service with its
 * own DB rather than folding into that one (see backend DESIGN.md's architecture decision note).
 *
 * <p>Escrow-at-creation is required, not optional (issue #10's Constraints): if the sender's wallet
 * weren't debited until claim time, the sender could send more lucky money than their real balance
 * allows (each one still shows "not yet debited"), a double-spend risk if they spend that same
 * money elsewhere while a lucky money is pending.
 */
@Entity
@Table(name = "lucky_money")
public class LuckyMoney {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "from_user_id", nullable = false)
    private UUID fromUserId;

    /** Sent by the client at creation time (from the sender's own session), same trust model
     * payment-request-service's creatorName already uses — avoids an extra user-service round trip
     * just to render the sender's name on the recipient's claim screen. */
    @Column(name = "from_name", nullable = false)
    private String fromName;

    @Column(name = "to_user_id", nullable = false)
    private UUID toUserId;

    @Column(name = "to_phone", nullable = false)
    private String toPhone;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    /** "Lời chúc" — the wish message sent along with the lucky money. */
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LuckyMoneyStatus status = LuckyMoneyStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "claimed_at")
    private Instant claimedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    /**
     * Optimistic locking — see issue #10's race-condition fix. Without this, concurrent
     * {@code claim()} calls (or a concurrent lazy-expiry check) on the same lucky money could all
     * read {@code PENDING}, all call wallet-service's real {@code /credit} (crediting real money
     * each time), and only collide on the final {@code save()} — by then money has already been
     * created out of thin air (the sender was only ever debited once, at send time). The fix (see
     * {@code LuckyMoneyMutationExecutor}) uses this version to atomically claim the
     * PENDING -> CLAIMED (or PENDING -> EXPIRED_REFUNDED) transition BEFORE calling wallet-service's
     * {@code /credit} at all, so only one concurrent caller ever gets to move money.
     */
    @Version
    private Long version;

    protected LuckyMoney() {
        // JPA
    }

    public LuckyMoney(UUID fromUserId, String fromName, UUID toUserId, String toPhone, BigDecimal amount, String message, Instant expiresAt) {
        this.fromUserId = fromUserId;
        this.fromName = fromName;
        this.toUserId = toUserId;
        this.toPhone = toPhone;
        this.amount = amount;
        this.message = message;
        this.expiresAt = expiresAt;
    }

    public void markClaimed() {
        this.status = LuckyMoneyStatus.CLAIMED;
        this.claimedAt = Instant.now();
    }

    public void markExpiredRefunded() {
        this.status = LuckyMoneyStatus.EXPIRED_REFUNDED;
        this.refundedAt = Instant.now();
    }

    /** Compensates a claim/expiry-refund transition whose follow-up wallet-service call
     * (credit-recipient or credit-refund) failed afterwards — reverts back to PENDING so the row
     * isn't stuck CLAIMED/EXPIRED_REFUNDED with no money having actually moved, and a later
     * read/claim can retry it. */
    public void revertToPending() {
        this.status = LuckyMoneyStatus.PENDING;
        this.claimedAt = null;
        this.refundedAt = null;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFromUserId() {
        return fromUserId;
    }

    public String getFromName() {
        return fromName;
    }

    public UUID getToUserId() {
        return toUserId;
    }

    public String getToPhone() {
        return toPhone;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getMessage() {
        return message;
    }

    public LuckyMoneyStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getClaimedAt() {
        return claimedAt;
    }

    public Instant getRefundedAt() {
        return refundedAt;
    }
}
