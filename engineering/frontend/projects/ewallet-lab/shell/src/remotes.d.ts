import type { ComponentType } from 'react';
import type { Session } from '@ewallet-lab/session';

declare module 'mfe_auth/App' {
  const App: ComponentType<{ onAuthenticated: (session: Session, isNewUser: boolean) => void }>;
  export default App;
}

declare module 'mfe_wallet/Home' {
  const Home: ComponentType<{
    session: Session;
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
  }>;
  export default Home;
}

declare module 'mfe_wallet/LoyaltyRewards' {
  const LoyaltyRewards: ComponentType<{ session: Session; onBack: () => void }>;
  export default LoyaltyRewards;
}

declare module 'mfe_wallet/BnplWallet' {
  const BnplWallet: ComponentType<{ session: Session; onBack: () => void }>;
  export default BnplWallet;
}

declare module 'mfe_wallet/ReceiveQr' {
  const ReceiveQr: ComponentType<{ session: Session; onBack: () => void }>;
  export default ReceiveQr;
}

declare module 'mfe_wallet/SavingsPocket' {
  const SavingsPocket: ComponentType<{ session: Session; onBack: () => void }>;
  export default SavingsPocket;
}

declare module 'mfe_wallet/FamilyWallet' {
  const FamilyWallet: ComponentType<{ session: Session; onBack: () => void }>;
  export default FamilyWallet;
}

declare module 'mfe_wallet/SpendingReport' {
  const SpendingReport: ComponentType<{ session: Session; onBack: () => void }>;
  export default SpendingReport;
}

declare module 'mfe_wallet/InvestmentFund' {
  const InvestmentFund: ComponentType<{ session: Session; onBack: () => void }>;
  export default InvestmentFund;
}

declare module 'mfe_wallet/History' {
  const History: ComponentType<{ session: Session }>;
  export default History;
}

declare module 'mfe_wallet/AllServices' {
  const AllServices: ComponentType<{ onComingSoon: (feature: string) => void }>;
  export default AllServices;
}

declare module 'mfe_wallet/Notifications' {
  const Notifications: ComponentType<{ session: Session }>;
  export default Notifications;
}

declare module 'mfe_topup/App' {
  const App: ComponentType<{
    session: Session;
    onDone: () => void;
    onComingSoon: (feature: string) => void;
  }>;
  export default App;
}

declare module 'mfe_transfer/App' {
  const App: ComponentType<{
    session: Session;
    onDone: () => void;
    onComingSoon: (feature: string) => void;
  }>;
  export default App;
}

declare module 'mfe_bill_payment/App' {
  const App: ComponentType<{
    session: Session;
    onDone: () => void;
    onComingSoon: (feature: string) => void;
  }>;
  export default App;
}
