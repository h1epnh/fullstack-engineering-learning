import { ApiError, type LinkedBankAccount, topupService, walletService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { ProgressBar, describeApiError } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';
import { LinkBank } from './screens/LinkBank';
import { NapRut } from './screens/NapRut';
import { TopupStatusScreen } from './screens/TopupStatusScreen';
import { WithdrawDone } from './screens/WithdrawDone';

type Step =
  | { name: 'loading' }
  | { name: 'link-bank' }
  | { name: 'main'; account: LinkedBankAccount; mode: 'topup' | 'withdraw' }
  | { name: 'topup-status'; orderId: string }
  | { name: 'withdraw-done'; balance: number };

/**
 * Exposed as `./App` (see vite.config.ts). Structure mirrors the real MoMo "Nạp/Rút" screen —
 * see NapRut.tsx for the UI details and shell/src/screens/Onboarding.tsx for how the top-up half
 * of this flow doubles as the new-account onboarding step.
 */
export default function App({
  session,
  onDone,
  onComingSoon,
}: {
  session: Session;
  onDone: () => void;
  onComingSoon: (feature: string) => void;
}) {
  const [step, setStep] = useState<Step>({ name: 'loading' });
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    Promise.all([topupService.getLinkedAccounts(session.id), walletService.getBalance(session.id)]).then(
      ([accounts, bal]) => {
        setBalance(bal.balance);
        setStep(
          accounts.length > 0 ? { name: 'main', account: accounts[0], mode: 'topup' } : { name: 'link-bank' },
        );
      },
    );
  }, [session.id]);

  if (step.name === 'loading') return <ProgressBar label="Đang kiểm tra tài khoản liên kết…" />;

  if (step.name === 'link-bank') {
    return (
      <LinkBank
        onLink={(bankCode, accountNumber) => topupService.linkBankAccount(session.id, bankCode, accountNumber)}
        onLinked={(account) => setStep({ name: 'main', account, mode: 'topup' })}
      />
    );
  }

  if (step.name === 'main') {
    return (
      <NapRut
        mode={step.mode}
        onModeChange={(mode) => setStep({ ...step, mode })}
        balance={balance}
        account={step.account}
        onComingSoon={onComingSoon}
        onSubmitTopup={async (amount) => {
          try {
            const res = await topupService.initiateTopup(session.id, amount);
            setStep({ name: 'topup-status', orderId: res.orderId });
            return null;
          } catch (e) {
            return describeApiError(e instanceof ApiError ? e.status : undefined, 'topup');
          }
        }}
        onSubmitWithdraw={async (amount) => {
          try {
            const res = await topupService.initiateWithdrawal(session.id, amount);
            setStep({ name: 'withdraw-done', balance: res.balance });
            return null;
          } catch (e) {
            return describeApiError(e instanceof ApiError ? e.status : undefined, 'withdraw');
          }
        }}
      />
    );
  }

  if (step.name === 'withdraw-done') {
    return <WithdrawDone balance={step.balance} onDone={onDone} />;
  }

  return <TopupStatusScreen orderId={step.orderId} onDone={onDone} />;
}
