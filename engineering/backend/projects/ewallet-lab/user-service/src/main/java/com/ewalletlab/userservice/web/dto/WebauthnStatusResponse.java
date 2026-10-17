package com.ewalletlab.userservice.web.dto;

/**
 * Issue #41 — response for {@code GET /users/{id}/webauthn/credentials}. {@code registered}
 * tells the caller whether this user has registered a platform authenticator on ANY device
 * (not necessarily the one asking) — the frontend's own per-device decision additionally checks
 * a local flag written at registration time on that specific device (see
 * {@code packages/ui/src/webauthn.ts}'s DESIGN.md note for why both checks exist).
 */
public record WebauthnStatusResponse(boolean registered, int deviceCount) {
}
