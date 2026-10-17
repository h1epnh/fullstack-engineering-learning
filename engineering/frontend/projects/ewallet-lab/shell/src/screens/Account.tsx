import type { Session } from '@ewallet-lab/session';
import { ApiError, webauthnService } from '@ewallet-lab/api-client';
import {
  Button,
  Card,
  Screen,
  hasPlatformCredentialRegisteredLocally,
  isPlatformAuthenticatorAvailable,
  markPlatformCredentialRegistered,
  registerPlatformCredential,
} from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

type WebauthnState =
  | { phase: 'checking' }
  | { phase: 'unsupported' } // device/browser has no platform authenticator at all
  | { phase: 'ready'; registeredHere: boolean; registeredElsewhere: boolean }
  | { phase: 'registering' }
  | { phase: 'error'; message: string };

/**
 * Kept in the shell rather than as its own remote: it's a thin view over session state the shell
 * already owns — see the file's original comment. Issue #41 adds the first backend call this
 * screen ever makes (`webauthnService`, user-service) — see `shell/Dockerfile`'s new
 * `VITE_USER_SERVICE_URL` build-arg, the frontend CLAUDE.md's most recurring bug class.
 */
export function Account({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [webauthn, setWebauthn] = useState<WebauthnState>({ phase: 'checking' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const available = await isPlatformAuthenticatorAvailable();
      if (cancelled) return;
      if (!available) {
        setWebauthn({ phase: 'unsupported' });
        return;
      }
      const registeredHere = hasPlatformCredentialRegisteredLocally(session.id);
      let registeredElsewhere = false;
      try {
        const status = await webauthnService.status(session.id);
        registeredElsewhere = status.registered && !registeredHere;
      } catch {
        // best-effort only — the status badge is informational, never blocks registration
      }
      if (!cancelled) setWebauthn({ phase: 'ready', registeredHere, registeredElsewhere });
    })();
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  async function handleRegister() {
    setWebauthn({ phase: 'registering' });
    try {
      const { credentialId, publicKey } = await registerPlatformCredential(session.id, session.name);
      await webauthnService.register(session.id, credentialId, publicKey, navigator.userAgent);
      markPlatformCredentialRegistered(session.id, credentialId);
      setWebauthn({ phase: 'ready', registeredHere: true, registeredElsewhere: false });
    } catch (e) {
      const message =
        e instanceof ApiError
          ? 'Đăng ký thành công trên thiết bị nhưng lưu lên hệ thống bị lỗi — vui lòng thử lại.'
          : 'Đăng ký Touch ID thất bại hoặc bị huỷ. Vui lòng thử lại.';
      setWebauthn({ phase: 'error', message });
    }
  }

  return (
    <Screen title="Cá nhân">
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--el-faint)', fontWeight: 600 }}>HỌ VÀ TÊN</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{session.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--el-faint)', fontWeight: 600 }}>SỐ ĐIỆN THOẠI</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{session.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--el-faint)', fontWeight: 600 }}>USER ID</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--el-font-mono)', color: 'var(--el-muted)' }}>
              {session.id}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Bảo mật thiết bị — Touch ID</div>
          <p style={{ fontSize: 12, color: 'var(--el-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
            Đăng ký Touch ID/Face ID (WebAuthn platform authenticator) cho thiết bị này — lần tới
            khi cần "xác thực bổ sung" (giao dịch &gt;10tr/lần theo QĐ 2345), bạn sẽ chạm Touch ID
            thật thay vì bấm nút xác nhận mô phỏng. Đây là xác thực ĐÚNG THIẾT BỊ/ĐÚNG NGƯỜI ĐANG
            CẦM MÁY, KHÔNG phải cơ chế so khớp CCCD gắn chip như quy định thật yêu cầu (xem eKYC,
            issue #40).
          </p>

          {webauthn.phase === 'checking' && (
            <p style={{ fontSize: 12, color: 'var(--el-faint)' }}>Đang kiểm tra thiết bị…</p>
          )}

          {webauthn.phase === 'unsupported' && (
            <p style={{ fontSize: 12, color: 'var(--el-faint)' }}>
              Thiết bị/trình duyệt này không hỗ trợ Touch ID/Face ID (WebAuthn platform
              authenticator) — luồng xác thực bổ sung sẽ dùng nút xác nhận mô phỏng như trước.
            </p>
          )}

          {webauthn.phase === 'ready' && webauthn.registeredHere && (
            <p style={{ fontSize: 12.5, color: 'var(--el-accent-ink)', fontWeight: 600 }}>
              ✓ Đã đăng ký Touch ID cho thiết bị này.
            </p>
          )}

          {webauthn.phase === 'ready' && !webauthn.registeredHere && (
            <>
              {webauthn.registeredElsewhere && (
                <p style={{ fontSize: 11.5, color: 'var(--el-faint)', margin: '0 0 8px' }}>
                  Tài khoản này đã đăng ký Touch ID trên (một) thiết bị khác — thiết bị này cần
                  đăng ký riêng (platform authenticator gắn với từng máy, không dùng chung được).
                </p>
              )}
              <Button onClick={handleRegister}>Đăng ký Touch ID cho thiết bị này</Button>
            </>
          )}

          {webauthn.phase === 'registering' && (
            <Button disabled>Đang chờ xác thực Touch ID…</Button>
          )}

          {webauthn.phase === 'error' && (
            <>
              <p style={{ fontSize: 12, color: 'var(--el-danger, #c0392b)', margin: '0 0 8px', fontWeight: 600 }}>
                {webauthn.message}
              </p>
              <Button onClick={handleRegister}>Thử lại</Button>
            </>
          )}
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button variant="ghost" onClick={onLogout}>
          Đăng xuất
        </Button>
      </div>
    </Screen>
  );
}
