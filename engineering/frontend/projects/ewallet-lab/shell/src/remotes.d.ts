/**
 * Ambient type declarations for the shell's Module Federation remotes (exposed by each remote's
 * vite.config.ts `exposes`, resolved at RUNTIME by the federation runtime — tsc cannot see them).
 *
 * IMPORTANT — this file MUST stay a global script: NO top-level `import`/`export` statements.
 * tsconfig.base.json sets `"moduleDetection": "force"`, so a top-level import turns this file
 * into a module, which downgrades every `declare module` below from an ambient declaration to a
 * module *augmentation* of modules that cannot be resolved statically — every `import 'mfe_*'`
 * in src/App.tsx then fails with TS2307. Type references therefore use the two global aliases
 * below (inline `import('...').Type` queries) instead of top-level imports.
 *
 * Keep the props in sync with each remote's exposed component when they change.
 */
type RemoteSession = import('@ewallet-lab/session').Session;
type RemoteCmp<T extends object = {}> = import('react').ComponentType<T>;

declare module 'mfe_auth/App' {
  const App: RemoteCmp<{ onAuthenticated: (session: RemoteSession, isNewUser: boolean) => void }>;
  export default App;
}

declare module 'mfe_wallet/Home' {
  const Home: RemoteCmp<{
    session: RemoteSession;
    onTopup: () => void;
    onTransfer: () => void;
    onBillPayment: () => void;
    onReceive: () => void;
    onMoreServices: () => void;
    onComingSoon: (feature: string) => void;
    onOpenNotifications: () => void;
    onBnpl?: () => void;
    onLoyalty?: () => void;
    onSavingsPocket: () => void;
    onFamilyWallet: () => void;
    onSpendingReport: () => void;
    onInvestmentFund?: () => void;
    /** Issue #27 — Heo Tiết Kiệm */
    onSavingsGoals?: () => void;
    /** Issue #28 — Gói Voucher Hội viên */
    onVoucherPass?: () => void;
    /** Issue #29 — Nạp tiền điện thoại (optional; falls back to coming-soon) */
    onPhoneTopup?: () => void;
  }>;
  export default Home;
}

declare module 'mfe_wallet/LoyaltyRewards' {
  const LoyaltyRewards: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default LoyaltyRewards;
}

declare module 'mfe_wallet/BnplWallet' {
  const BnplWallet: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default BnplWallet;
}

declare module 'mfe_wallet/ReceiveQr' {
  const ReceiveQr: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default ReceiveQr;
}

declare module 'mfe_wallet/SavingsPocket' {
  const SavingsPocket: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default SavingsPocket;
}

declare module 'mfe_wallet/FamilyWallet' {
  const FamilyWallet: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default FamilyWallet;
}

declare module 'mfe_wallet/SpendingReport' {
  const SpendingReport: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default SpendingReport;
}

declare module 'mfe_wallet/InvestmentFund' {
  const InvestmentFund: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default InvestmentFund;
}

declare module 'mfe_wallet/History' {
  const History: RemoteCmp<{ session: RemoteSession }>;
  export default History;
}

declare module 'mfe_wallet/AllServices' {
  const AllServices: RemoteCmp<{ onComingSoon: (feature: string) => void }>;
  export default AllServices;
}

declare module 'mfe_wallet/Notifications' {
  const Notifications: RemoteCmp<{ session: RemoteSession }>;
  export default Notifications;
}

declare module 'mfe_topup/App' {
  const App: RemoteCmp<{
    session: RemoteSession;
    onDone: () => void;
    onComingSoon: (feature: string) => void;
  }>;
  export default App;
}

declare module 'mfe_transfer/App' {
  const App: RemoteCmp<{
    session: RemoteSession;
    onDone: () => void;
    onComingSoon: (feature: string) => void;
    /** Issue #3 — shell deep-link: open straight at the pay-link screen for a `pay` token. */
    initialPayToken?: string;
  }>;
  export default App;
}

declare module 'mfe_bill_payment/App' {
  const App: RemoteCmp<{
    session: RemoteSession;
    onDone: () => void;
    onComingSoon: (feature: string) => void;
  }>;
  export default App;
}

declare module 'mfe_wallet/TelcoTopup' {
  const TelcoTopup: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default TelcoTopup;
}

declare module 'mfe_wallet/SavingsGoals' {
  const SavingsGoals: RemoteCmp<{ session: RemoteSession; onBack: () => void }>;
  export default SavingsGoals;
}

declare module 'mfe_wallet/VoucherPass' {
  const VoucherPass: RemoteCmp<{
    session: RemoteSession;
    onBack: () => void;
    onGoToBillPayment?: () => void;
  }>;
  export default VoucherPass;
}
