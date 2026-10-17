package com.ewalletlab.userservice.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Issue #41 — 1 row per platform authenticator (Touch ID/Face ID) registered for a user, on a
 * given device/browser keychain. A user can have more than 1 row (1 per device they registered
 * on) — there is deliberately no uniqueness constraint on `userId`, only on `credentialId` (the
 * browser/OS never issues the same credential id twice).
 *
 * <p><b>Security scope — explicit, not hidden (see frontend/backend DESIGN.md for the full
 * writeup)</b>: this lab does NOT implement full FIDO2 server-side verification. {@code
 * publicKeyCose} is stored as-received (base64url, opaque to this service) purely for
 * completeness/audit — it is never used to verify a signature against a server-issued challenge,
 * because the registration/step-up ceremonies in this lab generate their challenge client-side
 * (see {@code packages/ui/src/webauthn.ts}) rather than having the server issue and later check
 * one. What this table DOES let the server assert truthfully: "this user has registered at least
 * one platform authenticator credential id" — enough for the lab's step-up UX decision (frontend)
 * and for an audit trail of when/which credential ids were registered, but NOT enough to call
 * this "a verified FIDO2 relying party" in the cryptographic sense.
 */
@Entity
@Table(name = "webauthn_credentials",
    uniqueConstraints = @UniqueConstraint(name = "uk_webauthn_credential_id", columnNames = "credential_id"))
public class WebauthnCredential {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "credential_id", nullable = false)
    private String credentialId;

    @Column(name = "public_key", length = 2048)
    private String publicKey;

    @Column(name = "device_label")
    private String deviceLabel;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected WebauthnCredential() {
        // JPA
    }

    public WebauthnCredential(UUID userId, String credentialId, String publicKey, String deviceLabel) {
        this.userId = userId;
        this.credentialId = credentialId;
        this.publicKey = publicKey;
        this.deviceLabel = deviceLabel;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getCredentialId() {
        return credentialId;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public String getDeviceLabel() {
        return deviceLabel;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
