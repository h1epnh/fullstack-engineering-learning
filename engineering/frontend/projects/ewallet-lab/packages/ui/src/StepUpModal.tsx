import { useEffect, useState } from 'react';
import { loadSession } from '@ewallet-lab/session';
import { Button } from './Button';
import { Icon } from './Icon';
import {
  hasPlatformCredentialRegisteredLocally,
  isPlatformAuthenticatorAvailable,
  verifyPlatformCredential,
} from './webauthn';

/**
 * Issue #15 — mô phỏng bước "xác thực bổ sung" (step-up) của QĐ 2345/QĐ-NHNN khi 1 giao dịch
 * chuyển tiền/thanh toán/nạp ví vượt 10.000.000đ/lần hoặc tổng trong ngày đạt 20.000.000đ.
 *
 * **Issue #41 — nâng cấp lên Touch ID THẬT, có fallback**: nếu thiết bị/trình duyệt hỗ trợ
 * platform authenticator (`PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()`)
 * VÀ user hiện tại (đọc qua `loadSession()`, không phải prop mới — xem lý do dưới) đã đăng ký
 * Touch ID trên CHÍNH thiết bị này (xem Account.tsx trong shell), modal hiện UI "Chạm Touch ID"
 * gọi `navigator.credentials.get()` THẬT — `onConfirm()` chỉ được gọi khi ceremony đó resolve
 * thành công. Nếu không khả dụng/chưa đăng ký, fallback NGUYÊN VẸN behavior cũ (nút xác nhận
 * thường). Ranh giới thật (KHÔNG phải so khớp CCCD theo QĐ 2345/eKYC #40): xem `webauthn.ts`'s
 * class comment + backend/frontend DESIGN.md's mục Touch ID (#41) cho mức độ verify đã làm/bỏ
 * qua phía server.
 *
 * **Vì sao đọc `loadSession()` thay vì nhận `userId` qua prop mới**: constraint của issue #41 là
 * KHÔNG đổi public API (`message`/`onConfirm`/`onCancel`) — 8 call site hiện tại (#15/#18/#26/#37
 * và các màn khác) không được yêu cầu sửa gì. `loadSession()` đọc `localStorage` trực tiếp (cùng
 * cơ chế `packages/session` đã dùng), không phải React Context xuyên Module Federation boundary
 * (tránh đúng pitfall đã ghi ở frontend DESIGN.md §3).
 */
export function StepUpModal({
  message,
  onConfirm,
  onCancel,
}: {
  /** Message text từ backend (đã là copy tiếng Việt cụ thể, có dẫn ngưỡng thật) — hiển thị
   * nguyên văn thay vì viết lại, để không lệch số liệu giữa các service. */
  message: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [touchIdReady, setTouchIdReady] = useState(false);
  const [touchIdRunning, setTouchIdRunning] = useState(false);
  const [touchIdError, setTouchIdError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const session = loadSession();
    if (!session || !hasPlatformCredentialRegisteredLocally(session.id)) {
      return; // giữ nguyên fallback — chưa đăng ký trên thiết bị này
    }
    isPlatformAuthenticatorAvailable().then((available) => {
      if (!cancelled && available) setTouchIdReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  async function confirmWithTouchId() {
    setTouchIdRunning(true);
    setTouchIdError(null);
    try {
      const ok = await verifyPlatformCredential();
      if (!ok) {
        setTouchIdError('Xác thực Touch ID thất bại hoặc đã bị huỷ. Vui lòng thử lại.');
        return;
      }
      setLoading(true);
      await onConfirm();
    } finally {
      setTouchIdRunning(false);
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 10, 20, 0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--el-surface)',
          borderRadius: '18px 18px 0 0',
          padding: '24px 20px calc(20px + var(--el-safe-bottom, 0px))',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--el-accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="fingerprint" size={28} style={{ color: 'var(--el-accent-ink)' }} />
          </span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--el-font-display)',
            fontSize: 17,
            fontWeight: 800,
            textAlign: 'center',
            margin: '0 0 8px',
          }}
        >
          Cần xác thực bổ sung
        </h2>
        <p style={{ fontSize: 13, color: 'var(--el-muted)', textAlign: 'center', margin: '0 0 4px', lineHeight: 1.5 }}>
          {message}
        </p>

        {touchIdReady ? (
          <>
            <p style={{ fontSize: 11.5, color: 'var(--el-faint)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.4 }}>
              Đây là xác thực sinh trắc học THẬT của thiết bị này (Touch ID/Face ID qua WebAuthn) —
              xác nhận ĐÚNG THIẾT BỊ/ĐÚNG NGƯỜI ĐANG CẦM MÁY, KHÁC với cơ chế thật QĐ 2345 yêu cầu
              (ngân hàng/trung gian thanh toán so khớp với dữ liệu sinh trắc học trên CCCD gắn chip
              qua NFC — xem eKYC, issue #40). App lab này KHÔNG thực hiện bước so khớp CCCD đó.
            </p>
            {touchIdError && (
              <p style={{ fontSize: 12.5, color: 'var(--el-danger, #c0392b)', textAlign: 'center', margin: '0 0 12px', fontWeight: 600 }}>
                {touchIdError}
              </p>
            )}
            <Button onClick={confirmWithTouchId} disabled={touchIdRunning || loading} style={{ marginBottom: 10 }}>
              {touchIdRunning || loading ? 'Đang xác thực…' : 'Chạm Touch ID để xác nhận'}
            </Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11.5, color: 'var(--el-faint)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.4 }}>
              Đây là bản mô phỏng cho mục đích học tập — nếu thiết bị/trình duyệt của bạn hỗ trợ
              Touch ID/Face ID và bạn đã đăng ký trong mục "Cá nhân", lần sau bước này sẽ dùng
              sinh trắc học thật. Nhấn "Tôi xác nhận đây là tôi" để giả lập bước xác thực đó.
            </p>
            <Button onClick={confirm} disabled={loading} style={{ marginBottom: 10 }}>
              {loading ? 'Đang xác nhận…' : 'Tôi xác nhận đây là tôi'}
            </Button>
          </>
        )}

        <Button variant="ghost" onClick={onCancel} disabled={loading || touchIdRunning}>
          Huỷ giao dịch
        </Button>
      </div>
    </div>
  );
}
