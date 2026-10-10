import {
  ApiError,
  STEP_UP_REQUIRED_STATUS,
  type PaymentRequest,
  type SplitGroup,
  type UserResponse,
  type VietQrBank,
  paymentRequestService,
  topupService,
  transferService,
  userService,
  walletService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { StepUpModal, describeApiError } from '@ewallet-lab/ui';
import { useState } from 'react';
import { BankTransferForm } from './screens/BankTransferForm';
import { BankTransferOutStatusScreen } from './screens/BankTransferOutStatusScreen';
import { FundDetail } from './screens/FundDetail';
import { FundHome } from './screens/FundHome';
import { LuckyMoneyHome } from './screens/LuckyMoneyHome';
import { PaymentLinkCreate } from './screens/PaymentLinkCreate';
import { PaymentLinkCreated } from './screens/PaymentLinkCreated';
import { PaymentLinkPay } from './screens/PaymentLinkPay';
import { PaymentReminderHome } from './screens/PaymentReminderHome';
import { RecurringTransfers } from './screens/RecurringTransfers';
import { SavedPayees } from './screens/SavedPayees';
import { SplitBillCreate } from './screens/SplitBillCreate';
import { SplitBillCreated } from './screens/SplitBillCreated';
import { SplitBillGroup } from './screens/SplitBillGroup';
import { TransferAmount } from './screens/TransferAmount';
import { TransferDone } from './screens/TransferDone';
import { TransferHome } from './screens/TransferHome';

type Step =
  | { name: 'home' }
  | { name: 'amount'; recipient: UserResponse }
  | { name: 'bank'; bank: VietQrBank }
  | { name: 'bank-status'; orderId: string }
  | { name: 'done'; toName: string; toPhone: string; amount: number; newBalance: number }
  // Issue #31 — recurring-transfer
  | { name: 'recurring-transfers' }
  // Issue #32 — saved-payees
  | { name: 'saved-payees' }
  // Issue #3 — payment-link
  | { name: 'payment-link-create' }
  | { name: 'payment-link-created'; link: PaymentRequest }
  | { name: 'pay-link'; token: string }
  // Issue #8 — payment-reminder
  | { name: 'payment-reminder' }
  // Issue #10 — lucky money
  | { name: 'lucky-money' }
  // Issue #11 — split-bill (MoMo thật đã ngừng tính năng này 31/08/2025, xem backend DESIGN.md)
  | { name: 'split-create' }
  | { name: 'split-created'; group: SplitGroup }
  | { name: 'split-group'; groupId: string }
  // Issue #14 — quỹ nhóm (fund-service). FundDetail handles its own data loading + issue #15's
  // step-up locally (StepUpModal composed as an overlay, not a separate Step here — see
  // FundDetail's javadoc for why that's safe/simpler than every other money-moving flow above).
  | { name: 'fund-list' }
  | { name: 'fund-detail'; fundId: string }
  // Issue #15 — step-up authentication (mô phỏng QĐ 2345/QĐ-NHNN)
  | { name: 'step-up'; message: string; onConfirm: () => Promise<void>; onCancel: () => void };

/** Issue #11 — split-bill's 400s (cross-field validation like "gửi đúng 1 trong 2 chế độ" or
 * "số người chia phải từ 2 đến 20") already have a precise, useful backend message (see
 * CreateSplitRequestDto/PaymentRequestService.resolveShareAmounts) — showing it verbatim (now
 * possible since http.ts's `request()` reads the response body into `ApiError.message`, added for
 * issue #15's step-up copy) is more useful here than `describeApiError`'s generic per-status-code
 * fallback. */
function describeSplitError(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return 'Không kết nối được tới máy chủ. Kiểm tra lại các service đã chạy chưa rồi thử lại.';
}

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

  /**
   * Issue #15 — on a 428 response, park the UI on a `step-up` screen (a full "screen" like the
   * rest of this state machine, not a modal layered over the previous one) instead of showing an
   * inline error, so `onConfirm` can re-run the exact same request with `stepUpConfirmed: true`.
   */
  async function submitTransfer(recipient: UserResponse, amount: number, stepUpConfirmed: boolean): Promise<string | null> {
    try {
      const res = await transferService.transfer(session.id, recipient.phone, amount, stepUpConfirmed);
      setStep({ name: 'done', toName: res.toName, toPhone: recipient.phone, amount, newBalance: res.newBalance });
      return null;
    } catch (e) {
      if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
        setStep({
          name: 'step-up',
          message: e.message,
          onConfirm: () => submitTransfer(recipient, amount, true).then(() => undefined),
          onCancel: () => setStep({ name: 'amount', recipient }),
        });
        return null;
      }
      return describeApiError(e instanceof ApiError ? e.status : undefined, 'transfer');
    }
  }

  async function submitBankTransferOut(
    bank: VietQrBank,
    accountNumber: string,
    amount: number,
    stepUpConfirmed: boolean,
  ): Promise<string | null> {
    try {
      const res = await topupService.initiateBankTransferOut(session.id, bank.code, accountNumber, amount, stepUpConfirmed);
      setStep({ name: 'bank-status', orderId: res.orderId });
      return null;
    } catch (e) {
      if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
        setStep({
          name: 'step-up',
          message: e.message,
          onConfirm: () => submitBankTransferOut(bank, accountNumber, amount, true).then(() => undefined),
          onCancel: () => setStep({ name: 'bank', bank }),
        });
        return null;
      }
      return describeApiError(e instanceof ApiError ? e.status : undefined, 'bank-transfer-out');
    }
  }

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
        selfUserId={session.id}
        onSearch={handleSearch}
        onSelectBank={(bank) => setStep({ name: 'bank', bank })}
        onComingSoon={(feature) => {
          if (feature === 'saved-payees') {
            setStep({ name: 'saved-payees' });
            return;
          }
          if (feature === 'recurring-transfer') {
            setStep({ name: 'recurring-transfers' });
            return;
          }
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
          if (feature === 'split-bill') {
            setStep({ name: 'split-create' });
            return;
          }
          if (feature === 'fund') {
            setStep({ name: 'fund-list' });
            return;
          }
          onComingSoon(feature);
        }}
      />
    );
  }

  if (step.name === 'saved-payees') {
    return (
      <SavedPayees
        selfUserId={session.id}
        onSelectPayee={(phone) => handleSearch(phone)}
        onBack={() => setStep({ name: 'home' })}
      />
    );
  }

  if (step.name === 'recurring-transfers') {
    return (
      <RecurringTransfers
        selfUserId={session.id}
        onBack={() => setStep({ name: 'home' })}
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

  if (step.name === 'split-create') {
    return (
      <SplitBillCreate
        onBack={() => setStep({ name: 'home' })}
        onSubmitEven={async (label, totalAmount, peopleCount, message) => {
          try {
            const group = await paymentRequestService.createSplitEven(
              session.id, session.phone, session.name, label, totalAmount, peopleCount, message);
            setStep({ name: 'split-created', group });
            return null;
          } catch (e) {
            return describeSplitError(e);
          }
        }}
        onSubmitCustom={async (label, amounts, message) => {
          try {
            const group = await paymentRequestService.createSplitCustom(
              session.id, session.phone, session.name, label, amounts, message);
            setStep({ name: 'split-created', group });
            return null;
          } catch (e) {
            return describeSplitError(e);
          }
        }}
      />
    );
  }

  if (step.name === 'split-created') {
    return (
      <SplitBillCreated
        group={step.group}
        shellOrigin={window.location.origin}
        onViewCollected={() => setStep({ name: 'split-group', groupId: step.group.groupId })}
        onDone={() => setStep({ name: 'home' })}
      />
    );
  }

  if (step.name === 'split-group') {
    return <SplitBillGroup groupId={step.groupId} onBack={() => setStep({ name: 'home' })} />;
  }

  if (step.name === 'fund-list') {
    return (
      <FundHome
        selfUserId={session.id}
        onOpenFund={(fundId) => setStep({ name: 'fund-detail', fundId })}
        onBack={() => setStep({ name: 'home' })}
      />
    );
  }

  if (step.name === 'fund-detail') {
    return <FundDetail fundId={step.fundId} selfUserId={session.id} onBack={() => setStep({ name: 'fund-list' })} />;
  }

  if (step.name === 'bank') {
    return (
      <BankTransferForm
        bank={step.bank}
        senderName={session.name}
        onBack={() => setStep({ name: 'home' })}
        onContinue={(accountNumber, amount) => submitBankTransferOut(step.bank, accountNumber, amount, false)}
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
        onSubmit={(amount) => submitTransfer(step.recipient, amount, false)}
      />
    );
  }

  if (step.name === 'step-up') {
    return <StepUpModal message={step.message} onConfirm={step.onConfirm} onCancel={step.onCancel} />;
  }

  return (
    <TransferDone
      toName={step.toName}
      toPhone={step.toPhone}
      selfUserId={session.id}
      amount={step.amount}
      newBalance={step.newBalance}
      onDone={onDone}
    />
  );
}
