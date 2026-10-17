import { API_BASE, http } from './http';

export type WebauthnStatusResponse = {
  registered: boolean;
  deviceCount: number;
};

/**
 * Issue #41 — calls user-service's `/users/{id}/webauthn/credentials`. Used by shell's
 * `Account.tsx` (registration screen) only — NOT by `StepUpModal` (packages/ui), which
 * deliberately uses a local-only flag for its UI decision (see `packages/ui/src/webauthn.ts`'s
 * `markPlatformCredentialRegistered` comment for why a per-device check beats a network round
 * trip for that specific decision).
 */
export const webauthnService = {
  status: (userId: string) =>
    http.get<WebauthnStatusResponse>(`${API_BASE.user}/users/${userId}/webauthn/credentials`),

  register: (userId: string, credentialId: string, publicKey: string | null, deviceLabel?: string) =>
    http.post<void>(`${API_BASE.user}/users/${userId}/webauthn/credentials`, {
      credentialId,
      publicKey,
      deviceLabel,
    }),
};
