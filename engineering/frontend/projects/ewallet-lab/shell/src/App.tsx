import { useSession } from '@ewallet-lab/session';
import { type NavItem, BottomNav, ProgressBar } from '@ewallet-lab/ui';
import { Suspense, lazy, useRef, useState, type ReactNode } from 'react';
import { Account } from './screens/Account';
import { ComingSoon } from './screens/ComingSoon';
import { Onboarding } from './screens/Onboarding';

const AuthApp = lazy(() => import('mfe_auth/App'));
const WalletHome = lazy(() => import('mfe_wallet/Home'));
const WalletHistory = lazy(() => import('mfe_wallet/History'));
const WalletAllServices = lazy(() => import('mfe_wallet/AllServices'));
const WalletNotifications = lazy(() => import('mfe_wallet/Notifications'));
const WalletReceiveQr = lazy(() => import('mfe_wallet/ReceiveQr'));
const TopupApp = lazy(() => import('mfe_topup/App'));
const TransferApp = lazy(() => import('mfe_transfer/App'));
const BillPaymentApp = lazy(() => import('mfe_bill_payment/App'));

/** Shared "sub-page reached from Home, not a bottom tab" chrome — used by all-services and notifications. */
function WithBack({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 0,
          color: 'var(--el-muted)',
          fontSize: 13,
          padding: '16px 16px 0',
          cursor: 'pointer',
        }}
      >
        ← Quay lại
      </button>
      {children}
    </div>
  );
}

/**
 * 5 tabs matching the real MoMo app's own bottom nav (verified from screenshots), with the
 * center QR button raised — see packages/ui/src/BottomNav.tsx. First tab is labeled "Trang chủ"
 * rather than the brand name, same reasoning as the rest of this app's own naming (DESIGN.md
 * disclaimer): copy the structure, not the trademark.
 */
const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Ewallet', icon: 'home' },
  { key: 'deals', label: 'Ưu đãi', icon: 'sell' },
  { key: 'qr', label: 'Quét mọi QR', icon: 'qr_code_scanner', special: true },
  { key: 'history', label: 'Giao dịch', icon: 'receipt_long' },
  { key: 'account', label: 'Tôi', icon: 'person' },
];

type Flow =
  | { name: 'none' }
  | { name: 'topup' }
  | { name: 'transfer' }
  | { name: 'bill-payment' }
  | { name: 'all-services' }
  | { name: 'notifications' }
  | { name: 'receive' }
  | { name: 'coming-soon'; feature: string };

/**
 * Minimal deep-link mechanism (issue #3's Task step 3) — the shell has no routing library
 * (frontend DESIGN.md §6, "out of scope for this pass", reopened only for this one screen). Reads
 * `window.location.pathname` once at startup and, if it matches `/pay/<token>`, routes straight
 * into mfe-transfer's pay-link screen instead of the normal home tab. Deliberately not a router:
 * no history.pushState, no other routes, no navigation library — just this one-shot parse.
 */
function parseDeepLinkPayToken(): string | null {
  const match = window.location.pathname.match(/^\/pay\/([0-9a-fA-F-]{36})$/);
  return match ? match[1] : null;
}

export default function App() {
  const { session, login, logout } = useSession();
  const [tab, setTab] = useState('home');
  const [deepLinkPayToken] = useState<string | null>(parseDeepLinkPayToken);
  // One-shot: once the deep-link flow finishes (or the user navigates away), re-entering
  // "transfer" normally (e.g. via the wallet home tile) must land on mfe-transfer's own home
  // screen again, not keep reopening the same pay-link screen forever.
  const deepLinkConsumedRef = useRef(false);
  const [flow, setFlow] = useState<Flow>(deepLinkPayToken ? { name: 'transfer' } : { name: 'none' });
  const [onboarding, setOnboarding] = useState(false);

  if (!session) {
    return (
      <Suspense fallback={<ProgressBar label="Đang tải mfe-auth…" />}>
        <AuthApp
          onAuthenticated={(nextSession, isNewUser) => {
            login(nextSession);
            setOnboarding(isNewUser);
          }}
        />
      </Suspense>
    );
  }

  if (onboarding) {
    return <Onboarding session={session} onComplete={() => setOnboarding(false)} />;
  }

  if (flow.name === 'topup') {
    return (
      <Suspense fallback={<ProgressBar label="Đang tải mfe-topup…" />}>
        <TopupApp
          session={session}
          onDone={() => setFlow({ name: 'none' })}
          onComingSoon={(feature) => setFlow({ name: 'coming-soon', feature })}
        />
      </Suspense>
    );
  }

  if (flow.name === 'transfer') {
    const payToken = deepLinkPayToken && !deepLinkConsumedRef.current ? deepLinkPayToken : undefined;
    return (
      <Suspense fallback={<ProgressBar label="Đang tải mfe-transfer…" />}>
        <TransferApp
          session={session}
          initialPayToken={payToken}
          onDone={() => {
            deepLinkConsumedRef.current = true;
            setFlow({ name: 'none' });
          }}
          onComingSoon={(feature) => setFlow({ name: 'coming-soon', feature })}
        />
      </Suspense>
    );
  }

  if (flow.name === 'bill-payment') {
    return (
      <Suspense fallback={<ProgressBar label="Đang tải mfe-bill-payment…" />}>
        <BillPaymentApp
          session={session}
          onDone={() => setFlow({ name: 'none' })}
          onComingSoon={(feature) => setFlow({ name: 'coming-soon', feature })}
        />
      </Suspense>
    );
  }

  if (flow.name === 'coming-soon') {
    return <ComingSoon feature={flow.feature} onBack={() => setFlow({ name: 'none' })} />;
  }

  if (flow.name === 'all-services') {
    return (
      <WithBack onBack={() => setFlow({ name: 'none' })}>
        <Suspense fallback={<ProgressBar label="Đang tải mfe-wallet…" />}>
          <WalletAllServices onComingSoon={(feature) => setFlow({ name: 'coming-soon', feature })} />
        </Suspense>
      </WithBack>
    );
  }

  if (flow.name === 'notifications') {
    return (
      <WithBack onBack={() => setFlow({ name: 'none' })}>
        <Suspense fallback={<ProgressBar label="Đang tải mfe-wallet…" />}>
          <WalletNotifications session={session} />
        </Suspense>
      </WithBack>
    );
  }

  if (flow.name === 'receive') {
    return (
      <Suspense fallback={<ProgressBar label="Đang tải mfe-wallet…" />}>
        <WalletReceiveQr session={session} onBack={() => setFlow({ name: 'none' })} />
      </Suspense>
    );
  }

  return (
    <div>
      {tab === 'home' && (
        <Suspense fallback={<ProgressBar label="Đang tải mfe-wallet…" />}>
          <WalletHome
            session={session}
            onTopup={() => setFlow({ name: 'topup' })}
            onTransfer={() => setFlow({ name: 'transfer' })}
            onBillPayment={() => setFlow({ name: 'bill-payment' })}
            onReceive={() => setFlow({ name: 'receive' })}
            onMoreServices={() => setFlow({ name: 'all-services' })}
            onComingSoon={(feature) => setFlow({ name: 'coming-soon', feature })}
            onOpenNotifications={() => setFlow({ name: 'notifications' })}
          />
        </Suspense>
      )}
      {tab === 'deals' && (
        <ComingSoon feature="deals" onBack={() => setTab('home')} />
      )}
      {tab === 'history' && (
        <Suspense fallback={<ProgressBar label="Đang tải mfe-wallet…" />}>
          <WalletHistory session={session} />
        </Suspense>
      )}
      {tab === 'account' && <Account session={session} onLogout={logout} />}

      <BottomNav
        items={NAV_ITEMS}
        active={tab}
        onChange={setTab}
        onSpecialClick={(key) => setFlow({ name: 'coming-soon', feature: key })}
      />
    </div>
  );
}
