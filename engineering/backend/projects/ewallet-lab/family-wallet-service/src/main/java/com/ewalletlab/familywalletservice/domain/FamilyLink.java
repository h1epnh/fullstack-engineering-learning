package com.ewalletlab.familywalletservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #12 — "Ví Gia Đình". Deliberately the ONLY thing this service persists (operator's
 * architecture decision, option (a) on issue #12): an overlay of parent-set spending permission on
 * top of the existing 1-wallet-per-user model, never a second wallet. {@code memberUserId} is
 * {@code unique} — a member belongs to at most 1 family at a time (MVP simplification, not in the
 * issue's explicit scope but needed to make "which limit applies" unambiguous; see backend
 * DESIGN.md). This service never calls wallet-service's /credit or /debit itself — it has no code
 * path that moves money. The actual enforcement (blocking a member's outbound transaction that
 * would exceed {@link #monthlyLimit}) lives entirely in wallet-service's debit path (operator's
 * decision (ii) on issue #12), which calls this service's read-only
 * GET /family-wallets/members/{memberUserId}/limit.
 */
@Entity
@Table(name = "family_links")
public class FamilyLink {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "parent_user_id", nullable = false)
    private UUID parentUserId;

    @Column(name = "member_user_id", nullable = false, unique = true)
    private UUID memberUserId;

    /** Denormalized from user-service at link time (same trust model as
     * payment-request-service's creatorPhone/creatorName — avoids a lookup round trip to render
     * the member's phone/name in the parent's member list). */
    @Column(name = "member_phone", nullable = false)
    private String memberPhone;

    @Column(name = "member_name")
    private String memberName;

    @Column(name = "monthly_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal monthlyLimit;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected FamilyLink() {
        // JPA
    }

    public FamilyLink(UUID parentUserId, UUID memberUserId, String memberPhone, String memberName,
                       BigDecimal monthlyLimit) {
        this.parentUserId = parentUserId;
        this.memberUserId = memberUserId;
        this.memberPhone = memberPhone;
        this.memberName = memberName;
        this.monthlyLimit = monthlyLimit;
    }

    public void updateLimit(BigDecimal newLimit) {
        this.monthlyLimit = newLimit;
    }

    public UUID getId() {
        return id;
    }

    public UUID getParentUserId() {
        return parentUserId;
    }

    public UUID getMemberUserId() {
        return memberUserId;
    }

    public String getMemberPhone() {
        return memberPhone;
    }

    public String getMemberName() {
        return memberName;
    }

    public BigDecimal getMonthlyLimit() {
        return monthlyLimit;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
