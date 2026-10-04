package com.ewalletlab.fundservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #14 — "Quỹ nhóm" (operator's architecture decision, option (a) on the issue): a
 * stand-alone service/DB owning {@code Fund}/{@link FundMember}/{@code FundTransaction}, which
 * moves real money only by calling wallet-service's existing {@code /credit}/{@code /debit} — it
 * never writes to a {@code Wallet} row itself (same discipline as every other service in this lab,
 * see wallet-service's {@code Wallet} javadoc).
 *
 * <p>Unlike {@code payment-request-service}/{@code lucky-money-service} (1-1, often short-lived),
 * a fund is N members contributing into ONE shared running balance with no expiry — this entity's
 * {@link #balance} is the actual shared pot, mutated by every contribution/withdrawal under
 * optimistic locking (same pattern as wallet-service's own {@code Wallet.credit}/{@code debit} and
 * wallet-service's {@code SavingsPocket}).
 *
 * <p><b>MVP scope, explicitly confirmed by the operator on issue #14</b>: only the creator may
 * withdraw money out of the fund or dissolve it — no voting/multi-signature. Real MoMo's "Quỹ nhóm"
 * (fetched directly, momo.vn/quy-nhom) actually lets members REQUEST a withdrawal subject to the
 * fund owner's approval; this lab simplifies further to "creator-only, no request flow at all" per
 * the operator's sign-off, documented in backend DESIGN.md.
 */
@Entity
@Table(name = "funds")
public class Fund {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "creator_user_id", nullable = false)
    private UUID creatorUserId;

    /** Denormalized from user-service at creation time — same trust model as
     * payment-request-service's creatorName/creatorPhone (avoids a lookup round trip to render the
     * fund's own creator in member/fund list views). */
    @Column(name = "creator_name")
    private String creatorName;

    @Column(name = "creator_phone")
    private String creatorPhone;

    @Column(nullable = false)
    private String name;

    private String purpose;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundStatus status = FundStatus.ACTIVE;

    @Version
    private Long version; // optimistic locking — concurrent contribute/withdraw/dissolve must not race

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected Fund() {
        // JPA
    }

    public Fund(UUID creatorUserId, String creatorName, String creatorPhone, String name, String purpose) {
        this.creatorUserId = creatorUserId;
        this.creatorName = creatorName;
        this.creatorPhone = creatorPhone;
        this.name = name;
        this.purpose = purpose;
    }

    public void contribute(BigDecimal amount) {
        requireActive();
        this.balance = this.balance.add(amount);
    }

    /** Throws if not ACTIVE or if {@code amount} exceeds the current balance — called for both a
     * partial withdrawal (fund stays ACTIVE) and the "withdraw everything" step of {@link
     * #dissolve()} (which calls this with the current balance just before marking DISSOLVED). */
    public void withdraw(BigDecimal amount) {
        requireActive();
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Số dư Quỹ nhóm không đủ");
        }
        this.balance = this.balance.subtract(amount);
    }

    /** Returns whatever was left so the caller can credit it back to the creator's wallet — the
     * fund's own balance always ends at exactly zero after this, regardless of what it was. */
    public BigDecimal dissolve() {
        requireActive();
        BigDecimal remainder = this.balance;
        this.balance = BigDecimal.ZERO;
        this.status = FundStatus.DISSOLVED;
        return remainder;
    }

    /** Compensates a dissolve whose follow-up wallet-service credit call failed — see
     * FundMutationExecutor's javadoc for why this mirrors lucky-money-service's
     * revertToPending/compensation pattern rather than leaving money stranded in limbo. */
    public void revertDissolve(BigDecimal remainder) {
        this.status = FundStatus.ACTIVE;
        this.balance = remainder;
    }

    /** Compensates a withdrawal whose follow-up wallet-service credit call failed. */
    public void revertWithdraw(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    private void requireActive() {
        if (this.status != FundStatus.ACTIVE) {
            throw new IllegalStateException("Quỹ nhóm này đã được giải thể");
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getCreatorUserId() {
        return creatorUserId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public String getCreatorPhone() {
        return creatorPhone;
    }

    public String getName() {
        return name;
    }

    public String getPurpose() {
        return purpose;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public FundStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
