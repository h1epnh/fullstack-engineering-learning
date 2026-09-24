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
};

export function StatusPill({ status }: { status: string }) {
  const s = STYLES[status] ?? { bg: 'var(--el-surface-2)', fg: 'var(--el-faint)', label: status };
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        fontSize: 11.5,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  );
}
