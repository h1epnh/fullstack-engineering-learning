package com.ewalletlab.paymentrequestservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Shared domain record for issue #3 (payment-link) and issue #8 (payment-reminder) — both are
 * "a pending claim between 2 users, resolved by a real transfer-service /transfers call later",
 * differing only in how the payer is identified ({@link PaymentRequestKind#LINK}: opaque token,
 * anyone who opens the URL; {@link PaymentRequestKind#REMINDER}: a specific {@code targetUserId}
 * resolved by phone at creation time, only that user may pay).
 *
 * <p>{@code creatorPhone} is denormalized (copied from the client-supplied session at creation
 * time, same trust model the rest of this lab already uses — e.g. mfe-transfer passes
 * {@code session.id}/{@code session.phone} straight through with no server-side auth check) so
 * paying can call transfer-service's real {@code POST /transfers} (which takes a phone, not a
 * user id) without this service needing to look the creator up again.
 *
 * <p>This service intentionally owns its own DB (see backend DESIGN.md's "Điểm rẽ kiến trúc —
 * PaymentRequest" section) — chosen over a new table in wallet-service or a DB added to
 * transfer-service, per the human operator's decision comment on issue #3.
 */
@Entity
@Table(name = "payment_requests")
public class PaymentRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentRequestKind kind;

    @Column(name = "creator_user_id", nullable = false)
    private UUID creatorUserId;

    @Column(name = "creator_phone", nullable = false)
    private String creatorPhone;

    @Column(name = "creator_name", nullable = false)
    private String creatorName;

    /** REMINDER only — the specific person expected to pay, resolved by phone at creation time.
     * Null for LINK (anyone with a valid account who opens the URL may pay). */
    @Column(name = "target_user_id")
    private UUID targetUserId;

    @Column(name = "target_phone")
    private String targetPhone;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentRequestStatus status = PaymentRequestStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    /** LINK only — see PaymentRequestKind javadoc. Null for REMINDER (no TTL in issue #8). */
    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "paid_by_user_id")
    private UUID paidByUserId;

    /** New wallet balance of the payer right after transfer-service confirmed the pay — kept as a
     * simple receipt reference, not a foreign key into any other service's data. */
    @Column(name = "transfer_reference")
    private String transferReference;

    /**
     * Optimistic locking — see issue #3/#8's race-condition fix. Without this, concurrent
     * {@code pay()} calls on the same request could all read {@code PENDING}, all call
     * transfer-service's real {@code /transfers} (moving real money each time), and only collide on
     * the final {@code save()} — by then the damage (multiple real transfers) is already done. The
     * fix (see {@link PaymentRequestMutationExecutor}) uses this version to atomically claim the
     * PENDING -> PAID transition BEFORE calling transfer-service at all, so only one concurrent
     * caller ever gets to move money.
     */
    @Version
    private Long version;

    protected PaymentRequest() {
        // JPA
    }

    public static PaymentRequest newLink(UUID creatorUserId, String creatorPhone, String creatorName,
                                          BigDecimal amount, String message, Instant expiresAt) {
        PaymentRequest r = new PaymentRequest();
        r.kind = PaymentRequestKind.LINK;
        r.creatorUserId = creatorUserId;
        r.creatorPhone = creatorPhone;
        r.creatorName = creatorName;
        r.amount = amount;
        r.message = message;
        r.expiresAt = expiresAt;
        return r;
    }

    public static PaymentRequest newReminder(UUID creatorUserId, String creatorPhone, String creatorName,
                                              UUID targetUserId, String targetPhone,
                                              BigDecimal amount, String message) {
        PaymentRequest r = new PaymentRequest();
        r.kind = PaymentRequestKind.REMINDER;
        r.creatorUserId = creatorUserId;
        r.creatorPhone = creatorPhone;
        r.creatorName = creatorName;
        r.targetUserId = targetUserId;
        r.targetPhone = targetPhone;
        r.amount = amount;
        r.message = message;
        return r;
    }

    public void markExpired() {
        this.status = PaymentRequestStatus.EXPIRED;
    }

    public void markCancelled() {
        this.status = PaymentRequestStatus.CANCELLED;
    }

    /**
     * Claims the PENDING -> PAID transition WITHOUT a transfer-service reference yet — this is
     * deliberately split from the old single-step {@code markPaid(payerUserId, transferReference)}
     * so {@link PaymentRequestMutationExecutor#claimPendingOnce} can commit this status flip (and
     * thus win/lose the optimistic-lock race) strictly BEFORE the real transfer-service call
     * happens. Call {@link #attachTransferReference} once that call succeeds.
     */
    public void markPaidPending(UUID payerUserId) {
        this.status = PaymentRequestStatus.PAID;
        this.paidByUserId = payerUserId;
        this.paidAt = Instant.now();
    }

    public void attachTransferReference(String transferReference) {
        this.transferReference = transferReference;
    }

    /** Compensates a claimed-but-never-settled request (the transfer-service call after the claim
     * failed) — reverts back to PENDING so it can be retried, instead of getting stuck "PAID" with
     * no money having actually moved. */
    public void revertToPending() {
        this.status = PaymentRequestStatus.PENDING;
        this.paidByUserId = null;
        this.paidAt = null;
        this.transferReference = null;
    }

    public UUID getId() {
        return id;
    }

    public PaymentRequestKind getKind() {
        return kind;
    }

    public UUID getCreatorUserId() {
        return creatorUserId;
    }

    public String getCreatorPhone() {
        return creatorPhone;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public UUID getTargetUserId() {
        return targetUserId;
    }

    public String getTargetPhone() {
        return targetPhone;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getMessage() {
        return message;
    }

    public PaymentRequestStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getPaidAt() {
        return paidAt;
    }

    public UUID getPaidByUserId() {
        return paidByUserId;
    }

    public String getTransferReference() {
        return transferReference;
    }
}
