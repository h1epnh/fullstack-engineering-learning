import type { Session } from '@ewallet-lab/session';
import { ProgressBar } from '@ewallet-lab/ui';
import { Suspense, lazy, useState } from 'react';
import { ComingSoon } from './ComingSoon';

const TopupApp = lazy(() => import('mfe_topup/App'));

/**
 * New-account onboarding wizard, sequenced to match MoMo's own published
 * account-creation guide: https://www.momo.vn/hoi-dap/cac-buoc-thuc-hien
 * (Tải và đăng ký → Liên kết ngân hàng → Nạp tiền lần đầu, tối thiểu 10.000đ).
 * "Tạo tài khoản" already happened in mfe-auth by the time this mounts;
 * mfe-topup's own App already implements exactly steps 2+3 as one flow
 * (check linked accounts → link if needed → amount → status), so this wraps
 * it with step framing rather than re-implementing that state machine here.
 * Referral/promo-code step from the real guide is campaign-specific, not
 * core onboarding — intentionally left out.
 */
export function Onboarding({ session, onComplete }: { session: Session; onComplete: () => void }) {
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  if (comingSoon) {
    return <ComingSoon feature={comingSoon} onBack={() => setComingSoon(null)} />;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--el-line)',
        }}
      >
        <StepDot done label="Tạo tài khoản" />
        <div style={{ flex: 1, height: 1, background: 'var(--el-line)' }} />
        <StepDot active label="Liên kết & nạp lần đầu" />
      </div>
      <p
        style={{
          fontSize: 11.5,
          color: 'var(--el-faint)',
          textAlign: 'center',
          margin: '10px 16px 0',
        }}
      >
        Theo đúng trình tự hướng dẫn của MoMo cho tài khoản mới — chỉ khác: lab này không yêu cầu
        eKYC/định danh khuôn mặt thật.
      </p>
      <Suspense fallback={<ProgressBar label="Đang tải…" />}>
        <TopupApp session={session} onDone={onComplete} onComingSoon={setComingSoon} />
      </Suspense>
    </div>
  );
}

function StepDot({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          background: done || active ? 'var(--el-accent)' : 'var(--el-surface-2)',
          color: done || active ? '#fff0f6' : 'var(--el-faint)',
        }}
      >
        {done ? '✓' : active ? '●' : ''}
      </span>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: active ? 700 : 500,
          color: active ? 'var(--el-ink)' : 'var(--el-faint)',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}
