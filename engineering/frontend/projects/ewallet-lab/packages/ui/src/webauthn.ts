/**
 * Issue #41 — thin wrapper around the browser's native WebAuthn API
 * (`navigator.credentials`/`PublicKeyCredential`) for PLATFORM authenticators (Touch ID/Face ID
 * via the OS's Secure Enclave/Keychain). Everything here only works inside a secure context
 * (HTTPS, or `localhost`) — see backend DESIGN.md's TLS section for why `*.ewallet-lab.local`
 * needed a TLS Ingress added before this ticket could do anything at all.
 *
 * **Security scope — explicit, not hidden (see frontend DESIGN.md for the full writeup)**: this
 * lab does NOT implement full FIDO2 server-side verification. The `challenge` below is generated
 * CLIENT-SIDE with `crypto.getRandomValues` and is never issued by, or checked against, the
 * server — a real relying party would issue a fresh server-side challenge per ceremony and verify
 * the signed assertion against it (anti-replay). What ceremony success here DOES guarantee (a
 * browser/OS-level guarantee, not something this lab's code can fake): `navigator.credentials
 * .get()`'s promise only resolves if the platform authenticator actually ran a successful user
 * verification (a real Touch ID scan) against a credential bound to this exact origin. What it
 * does NOT guarantee: that the credential's public key was ever cryptographically checked by a
 * server against this specific challenge/assertion. `user-service` only stores "this user
 * registered credential id X" for the step-up UX decision + an audit trail — never verifies a
 * signature.
 */

// Typed as `ArrayBuffer` (not `Uint8Array`) because `lib.dom.d.ts`'s WebAuthn types expect
// `BufferSource` for `challenge`, and some TS/lib combinations infer `Uint8Array<ArrayBufferLike>`
// (which also covers `SharedArrayBuffer`, not assignable to the stricter `ArrayBufferView
// <ArrayBuffer>` WebAuthn expects) for a freshly-allocated typed array's `.buffer`.
function randomChallenge(): ArrayBuffer {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes.buffer as ArrayBuffer;
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function userIdBytes(userId: string): BufferSource {
  return new TextEncoder().encode(userId) as BufferSource;
}

/** Device/browser capability check — independent of whether THIS user has registered anything. */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Runs the WebAuthn registration ceremony (shows the OS's Touch ID/Face ID prompt once).
 * Requests a discoverable/resident credential so a later `verifyPlatformCredential()` can run
 * without needing to know the credential id up front (no `allowCredentials` needed at step-up
 * time — the platform authenticator itself looks up which of its stored credentials match this
 * origin). Throws if the user cancels or the browser/OS rejects the ceremony — callers should
 * catch and show a clear error, not assume this always resolves.
 */
export async function registerPlatformCredential(
  userId: string,
  userName: string,
  rpName = 'Ewallet Lab'
): Promise<{ credentialId: string; publicKey: string | null }> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: rpName },
      user: { id: userIdBytes(userId), name: userName, displayName: userName },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required',
        requireResidentKey: true,
      },
      timeout: 60000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error('WebAuthn registration returned no credential');
  const response = credential.response as AuthenticatorAttestationResponse;
  const publicKey =
    typeof response.getPublicKey === 'function' ? response.getPublicKey() : null;
  return {
    credentialId: toBase64Url(credential.rawId),
    publicKey: publicKey ? toBase64Url(publicKey) : null,
  };
}

/**
 * Runs the WebAuthn authentication ("get") ceremony for step-up confirmation. Resolves `true`
 * only if the OS actually completed a platform-authenticator user-verification; resolves `false`
 * (never throws) on cancel/timeout/no-matching-credential so callers can show a plain "thất
 * bại/đã huỷ" message instead of an unhandled rejection.
 */
export async function verifyPlatformCredential(): Promise<boolean> {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge(),
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return assertion != null;
  } catch {
    return false;
  }
}

const LOCAL_FLAG_PREFIX = 'ewallet-lab-webauthn-registered:';

/**
 * Per-device, per-user flag written right after a successful `registerPlatformCredential()` on
 * THIS browser/device. Deliberately local (not a server round-trip) because the thing it gates —
 * whether to show the Touch ID UI in `StepUpModal` instead of the old button — is itself a
 * per-device fact: a credential registered on the operator's MacBook does not mean THIS browser
 * tab has a matching platform credential to offer. `user-service`'s `/webauthn/credentials` is
 * still the durable source of truth (used by the registration screen to show "already registered
 * elsewhere" context) — this flag is a fast, offline-safe cache for the step-up UI decision only.
 */
export function markPlatformCredentialRegistered(userId: string, credentialId: string): void {
  try {
    localStorage.setItem(LOCAL_FLAG_PREFIX + userId, credentialId);
  } catch {
    // best-effort only, same trade-off as packages/session's saveSession
  }
}

export function hasPlatformCredentialRegisteredLocally(userId: string): boolean {
  try {
    return !!localStorage.getItem(LOCAL_FLAG_PREFIX + userId);
  } catch {
    return false;
  }
}
