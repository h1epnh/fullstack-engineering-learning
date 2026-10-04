import {
  ApiError,
  STEP_UP_REQUIRED_STATUS,
  type LinkedBankAccount,
  topupService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { ProgressBar, StepUpModal, describeApiError } from '@ewallet-lab/ui';
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
  | { name: 'withdraw-done'; balance: number }
  // Issue #15 — step-up authentication (mô phỏng QĐ 2345/QĐ-NHNN)
  | { name: 'step-up'; message: string; onConfirm: () => Promise<void>; onCancel: () => void };

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
    const mainStep = step;

    async function submitTopup(amount: number, stepUpConfirmed: boolean): Promise<string | null> {
      try {
        const res = await topupService.initiateTopup(session.id, amount, stepUpConfirmed);
        setStep({ name: 'topup-status', orderId: res.orderId });
        return null;
      } catch (e) {
        if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
          setStep({
            name: 'step-up',
            message: e.message,
            onConfirm: () => submitTopup(amount, true).then(() => undefined),
            onCancel: () => setStep(mainStep),
          });
          return null;
        }
        return describeApiError(e instanceof ApiError ? e.status : undefined, 'topup');
      }
    }

    async function submitWithdraw(amount: number, stepUpConfirmed: boolean): Promise<string | null> {
      try {
        const res = await topupService.initiateWithdrawal(session.id, amount, stepUpConfirmed);
        setStep({ name: 'withdraw-done', balance: res.balance });
        return null;
      } catch (e) {
        if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
          setStep({
            name: 'step-up',
            message: e.message,
            onConfirm: () => submitWithdraw(amount, true).then(() => undefined),
            onCancel: () => setStep(mainStep),
          });
          return null;
        }
        return describeApiError(e instanceof ApiError ? e.status : undefined, 'withdraw');
      }
    }

    return (
      <NapRut
        mode={step.mode}
        onModeChange={(mode) => setStep({ ...step, mode })}
        balance={balance}
        account={step.account}
        onComingSoon={onComingSoon}
        onSubmitTopup={(amount) => submitTopup(amount, false)}
        onSubmitWithdraw={(amount) => submitWithdraw(amount, false)}
      />
    );
  }

  if (step.name === 'withdraw-done') {
    return <WithdrawDone balance={step.balance} onDone={onDone} />;
  }

  if (step.name === 'step-up') {
    return <StepUpModal message={step.message} onConfirm={step.onConfirm} onCancel={step.onCancel} />;
  }

  return <TopupStatusScreen orderId={step.orderId} onDone={onDone} />;
}
