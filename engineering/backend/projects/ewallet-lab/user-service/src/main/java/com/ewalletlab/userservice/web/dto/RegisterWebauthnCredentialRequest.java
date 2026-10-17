package com.ewalletlab.userservice.web.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Issue #41 — body for {@code POST /users/{id}/webauthn/credentials}. {@code publicKey} is
 * optional (stored opaque, not verified — see {@code WebauthnCredential}'s class comment).
 */
public record RegisterWebauthnCredentialRequest(
    @NotBlank(message = "credentialId không được để trống") String credentialId,
    String publicKey,
    String deviceLabel
) {
}
