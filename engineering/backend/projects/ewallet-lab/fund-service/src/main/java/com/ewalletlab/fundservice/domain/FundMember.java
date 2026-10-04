package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Issue #14 — one row per (fund, member). Unlike {@code family-wallet-service}'s {@code FamilyLink}
 * (a member belongs to at most 1 family), a user CAN be a member of several different funds at once
 * — real MoMo's "Quỹ nhóm" explicitly allows joining multiple funds (fetched directly,
 * momo.vn/quy-nhom: "mỗi tài khoản có thể tham gia tối đa 20 quỹ khác nhau" — this lab doesn't
 * enforce that exact cap, just the shape: no 1-fund-per-user constraint). The uniqueness that DOES
 * matter here is **1 row per (fund, member)** — see {@code fund_id}/{@code member_user_id}'s
 * composite unique constraint — so the same person can't be invited into the same fund twice.
 */
@Entity
@Table(name = "fund_members", uniqueConstraints = @UniqueConstraint(columnNames = {"fund_id", "member_user_id"}))
public class FundMember {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "fund_id", nullable = false)
    private UUID fundId;

    @Column(name = "member_user_id", nullable = false)
    private UUID memberUserId;

    /** Denormalized from user-service at invite time — same trust model as Fund's
     * creatorName/creatorPhone. */
    @Column(name = "member_phone", nullable = false)
    private String memberPhone;

    @Column(name = "member_name")
    private String memberName;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    protected FundMember() {
        // JPA
    }

    public FundMember(UUID fundId, UUID memberUserId, String memberPhone, String memberName) {
        this.fundId = fundId;
        this.memberUserId = memberUserId;
        this.memberPhone = memberPhone;
        this.memberName = memberName;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFundId() {
        return fundId;
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

    public Instant getJoinedAt() {
        return joinedAt;
    }
}
