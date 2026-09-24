import {
  ApiError,
  type PaymentRequest,
  type UserResponse,
  type VietQrBank,
  paymentRequestService,
  topupService,
  transferService,
  userService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { describeApiError } from '@ewallet-lab/ui';
import { useState } from 'react';
import { BankTransferForm } from './screens/BankTransferForm';
import { BankTransferOutStatusScreen } from './screens/BankTransferOutStatusScreen';
import { LuckyMoneyHome } from './screens/LuckyMoneyHome';
import { PaymentLinkCreate } from './screens/PaymentLinkCreate';
import { PaymentLinkCreated } from './screens/PaymentLinkCreated';
import { PaymentLinkPay } from './screens/PaymentLinkPay';
import { PaymentReminderHome } from './screens/PaymentReminderHome';
import { TransferAmount } from './screens/TransferAmount';
import { TransferDone } from './screens/TransferDone';
import { TransferHome } from './screens/TransferHome';

type Step =
  | { name: 'home' }
  | { name: 'amount'; recipient: UserResponse }
  | { name: 'bank'; bank: VietQrBank }
  | { name: 'bank-status'; orderId: string }
  | { name: 'done'; toName: string; amount: number; newBalance: number }
  // Issue #3 — payment-link
  | { name: 'payment-link-create' }
  | { name: 'payment-link-created'; link: PaymentRequest }
  | { name: 'pay-link'; token: string }
  // Issue #8 — payment-reminder
  | { name: 'payment-reminder' }
  // Issue #10 — lucky money
  | { name: 'lucky-money' };

/**
 * Exposed as `./App` (see vite.config.ts). Real P2P transfer — see
 * transfer-service/src/main/java/.../TransferService.java for the saga this calls into
 * (lookup recipient → debit sender → credit recipient, with compensation on failure).
 *
 * `initialPayToken` is set by the shell's minimal deep-link mechanism (issue #3's Task step 3 —
 * shell reads `window.location.pathname` once at startup, see shell/src/App.tsx) when this app is
 * opened via a shared `.../pay/<token>` URL instead of through the normal "Chuyển tiền" tile.
 */
export default function App({
  session,
  initialPayToken,
  onDone,
  onComingSoon,
}: {
  session: Session;
  initialPayToken?: string;
  onDone: () => void;
  onComingSoon: (feature: string) => void;
}) {
  const [step, setStep] = useState<Step>(
    initialPayToken ? { name: 'pay-link', token: initialPayToken } : { name: 'home' },
  );

  async function handleSearch(phone: string): Promise<string | null> {
    if (phone === session.phone) {
      return 'Không thể chuyển tiền cho chính mình.';
    }
    try {
      const recipient = await userService.getByPhone(phone);
      setStep({ name: 'amount', recipient });
      return null;
    } catch (e) {
      return describeApiError(e instanceof ApiError ? e.status : undefined, 'transfer');
    }
  }

  if (step.name === 'home') {
    return (
      <TransferHome
        onSearch={handleSearch}
        onSelectBank={(bank) => setStep({ name: 'bank', bank })}
        onComingSoon={(feature) => {
          // issue #3 + #8: these 2 tiles are now real (payment-request-service), not comingSoon.
          if (feature === 'payment-link') {
            setStep({ name: 'payment-link-create' });
            return;
          }
          if (feature === 'payment-reminder') {
            setStep({ name: 'payment-reminder' });
            return;
          }
          if (feature === 'lucky-money') {
            setStep({ name: 'lucky-money' });
            return;
          }
          onComingSoon(feature);
        }}
      />
    );
  }

  if (step.name === 'payment-link-create') {
    return (
      <PaymentLinkCreate
        onBack={() => setStep({ name: 'home' })}
        onSubmit={async (amount, message) => {
          try {
            const link = await paymentRequestService.createLink(session.id, session.phone, session.name, amount, message);
            setStep({ name: 'payment-link-created', link });
            return null;
          } catch (e) {
            return describeApiError(e instanceof ApiError ? e.status : undefined, 'payment-link');
          }
        }}
      />
    );
  }

  if (step.name === 'payment-link-created') {
    return (
      <PaymentLinkCreated link={step.link} shellOrigin={window.location.origin} onDone={() => setStep({ name: 'home' })} />
    );
  }

  if (step.name === 'pay-link') {
    return (
      <PaymentLinkPay
        token={step.token}
        selfUserId={session.id}
        onBack={onDone}
        onPaid={async (paid) => {
          // PaymentRequestDto doesn't carry the payer's new balance (only an internal reference
          // string) — fetch it fresh from wallet-service, the single source of truth for balances.
          const wallet = await walletService.getBalance(session.id);
          setStep({ name: 'done', toName: paid.creatorName, amount: paid.amount, newBalance: wallet.balance });
        }}
      />
    );
  }

  if (step.name === 'payment-reminder') {
    return (
      <PaymentReminderHome
        selfUserId={session.id}
        selfPhone={session.phone}
        selfName={session.name}
        onBack={() => setStep({ name: 'home' })}
      />
    );
  }

  if (step.name === 'lucky-money') {
    return <LuckyMoneyHome selfUserId={session.id} selfName={session.name} onBack={() => setStep({ name: 'home' })} />;
  }

  if (step.name === 'bank') {
    return (
      <BankTransferForm
        bank={step.bank}
        senderName={session.name}
        onBack={() => setStep({ name: 'home' })}
        onContinue={async (accountNumber, amount) => {
          try {
            const res = await topupService.initiateBankTransferOut(session.id, step.bank.code, accountNumber, amount);
            setStep({ name: 'bank-status', orderId: res.orderId });
            return null;
          } catch (e) {
            return describeApiError(e instanceof ApiError ? e.status : undefined, 'bank-transfer-out');
          }
        }}
      />
    );
  }

  if (step.name === 'bank-status') {
    return <BankTransferOutStatusScreen orderId={step.orderId} onDone={onDone} />;
  }

  if (step.name === 'amount') {
    return (
      <TransferAmount
        recipient={step.recipient}
        onBack={() => setStep({ name: 'home' })}
        onSubmit={async (amount) => {
          try {
            const res = await transferService.transfer(session.id, step.recipient.phone, amount);
            setStep({ name: 'done', toName: res.toName, amount, newBalance: res.newBalance });
            return null;
          } catch (e) {
            return describeApiError(e instanceof ApiError ? e.status : undefined, 'transfer');
          }
        }}
      />
    );
  }

  return <TransferDone toName={step.toName} amount={step.amount} newBalance={step.newBalance} onDone={onDone} />;
}
