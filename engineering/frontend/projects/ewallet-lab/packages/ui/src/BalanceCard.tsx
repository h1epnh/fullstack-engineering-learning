import { useState } from 'react';

export function formatVnd(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' đ';
}

/**
 * Big-number balance tile at the top of the wallet home screen — the primary
 * piece of information on the page, per MoMo's own guideline to let users
 * "easily distinguish primary information from secondary information."
 */
export function BalanceCard({ balance, loading }: { balance: number | null; loading: boolean }) {
  const [hidden, setHidden] = useState(false);
  return (
    <div
      style={{
        background: `linear-gradient(155deg, var(--el-accent), var(--el-accent-ink))`,
        borderRadius: 18,
        padding: '22px 20px',
        color: '#fff0f6',
        boxShadow: 'var(--el-shadow)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.04em', opacity: 0.85 }}>
          SỐ DƯ VÍ
        </span>
        <button
          onClick={() => setHidden((h) => !h)}
          aria-label={hidden ? 'Hiện số dư' : 'Ẩn số dư'}
          style={{
            background: 'rgba(255,255,255,.15)',
            border: 0,
            borderRadius: 8,
            color: '#fff0f6',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 9px',
            cursor: 'pointer',
          }}
        >
          {hidden ? 'Hiện' : 'Ẩn'}
        </button>
      </div>
      <div
        style={{
          fontFamily: 'var(--el-font-display)',
          fontSize: 30,
          fontWeight: 800,
          marginTop: 10,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {loading ? '···' : hidden ? '••••••• đ' : formatVnd(balance ?? 0)}
      </div>
    </div>
  );
}
