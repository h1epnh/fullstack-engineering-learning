import type { ReactNode } from 'react';
const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  PENDING: { bg: 'var(--el-amber-soft)', fg: 'var(--el-amber)', label: 'Đang xử lý' },
  CONFIRMED: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Thành công' },
  FAILED: { bg: 'var(--el-danger-soft)', fg: 'var(--el-danger)', label: 'Thất bại' },
  // payment-request-service (issue #3/#8) + lucky-money-service (issue #10) statuses.
  PAID: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Đã trả' },
  CLAIMED: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Đã nhận' },
  CANCELLED: { bg: 'var(--el-surface-2)', fg: 'var(--el-faint)', label: 'Đã huỷ' },
  EXPIRED: { bg: 'var(--el-danger-soft)', fg: 'var(--el-danger)', label: 'Đã hết hạn' },
  EXPIRED_REFUNDED: { bg: 'var(--el-danger-soft)', fg: 'var(--el-danger)', label: 'Hết hạn, đã hoàn tiền' },
  // auto-debit (issue #26) + investment-fund (issue #25) + savings-goals (issue #27) + voucher-pass (issue #28)
  ACTIVE: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Đang hoạt động' },
  PAUSED: { bg: 'var(--el-amber-soft)', fg: 'var(--el-amber)', label: 'Tạm dừng' },
  MATCHED: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Đã khớp' },
  IN_PROGRESS: { bg: 'var(--el-amber-soft)', fg: 'var(--el-amber)', label: 'Đang tiết kiệm' },
  COMPLETED: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Hoàn thành' },
  AVAILABLE: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)', label: 'Khả dụng' },
  USED: { bg: 'var(--el-surface-2)', fg: 'var(--el-faint)', label: 'Đã dùng' },
};

// tsc-red "tone" forms — these were silently dropped before (only `status` was accepted),
// so pills rendered EMPTY. `tone` here is a colour hint (success/amber/neutral/muted/primary),
// `label` a pre-built label, `children` a body to show; `status` still wins when present.
const TONES: Record<string, { bg: string; fg: string }> = {
  success: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)' },
  positive: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)' },
  accent: { bg: 'var(--el-accent-soft)', fg: 'var(--el-accent-ink)' },
  amber: { bg: 'var(--el-amber-soft)', fg: 'var(--el-amber)' },
  warning: { bg: 'var(--el-amber-soft)', fg: 'var(--el-amber)' },
  neutral: { bg: 'var(--el-surface-2)', fg: 'var(--el-faint)' },
  muted: { bg: 'var(--el-surface-2)', fg: 'var(--el-faint)' },
};

export function StatusPill({
  status,
  tone,
  label,
  children,
}: {
  status?: string;
  tone?: string;
  label?: string;
  children?: ReactNode;
}) {
  const lookup = status != null ? STYLES[status] ?? null : null;
  const toneStyle = lookup ? null : (TONES[tone ?? ''] ?? null);
  const bg = lookup?.bg ?? toneStyle?.bg ?? 'var(--el-surface-2)';
  const fg = lookup?.fg ?? toneStyle?.fg ?? 'var(--el-faint)';
  const text =
    label ??
    (typeof children === 'string' ? children : children) ??
    (lookup?.label ?? status ?? '');
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: 11.5,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}
