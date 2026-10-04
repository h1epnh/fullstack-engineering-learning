import { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

/**
 * Issue #15 — mô phỏng bước "xác thực bổ sung" (step-up) của QĐ 2345/QĐ-NHNN khi 1 giao dịch
 * chuyển tiền/thanh toán/nạp ví vượt 10.000.000đ/lần hoặc tổng trong ngày đạt 20.000.000đ.
 *
 * **Đây chỉ là mô phỏng khái niệm — KHÔNG có sinh trắc học/WebAuthn thật.** Nút "Xác nhận" chỉ giả
 * lập "xác thực thành công" rồi gọi lại đúng request ban đầu kèm `stepUpConfirmed: true`. Copy dưới
 * đây cố tình nói rõ điều đó, không ngụ ý đã tích hợp sinh trắc học thật.
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

  async function confirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
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
        <p style={{ fontSize: 11.5, color: 'var(--el-faint)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.4 }}>
          Đây là bản mô phỏng cho mục đích học tập — lab này KHÔNG có sinh trắc học/WebAuthn thật.
          Nhấn "Tôi xác nhận đây là tôi" chỉ để giả lập bước xác thực đó.
        </p>
        <Button onClick={confirm} disabled={loading} style={{ marginBottom: 10 }}>
          {loading ? 'Đang xác nhận…' : 'Tôi xác nhận đây là tôi'}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Huỷ giao dịch
        </Button>
      </div>
    </div>
  );
}
