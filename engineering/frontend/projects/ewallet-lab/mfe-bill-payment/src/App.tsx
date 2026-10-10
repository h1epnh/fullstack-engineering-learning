import {
  ApiError,
  STEP_UP_REQUIRED_STATUS,
  type BillCategory,
  type BillLookupResponse,
  type BillPaymentReceipt,
  type PaymentSource,
  billPaymentService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { StepUpModal, describeApiError } from '@ewallet-lab/ui';
import { useState } from 'react';
import { registerMandate } from './mandates';
import { BillConfirm, type AutoDebitOption } from './screens/BillConfirm';
import { BillLookupForm } from './screens/BillLookupForm';
import { BillReceipt } from './screens/BillReceipt';

type Step =
  | { name: 'lookup' }
  | { name: 'confirm'; bill: BillLookupResponse }
  | { name: 'done'; receipt: BillPaymentReceipt; autoDebit?: AutoDebitOption }
  // Issue #15 — step-up authentication (mô phỏng QĐ 2345/QĐ-NHNN)
  | { name: 'step-up'; message: string; onConfirm: () => Promise<void>; onCancel: () => void };

/**
 * Exposed as `./App` (see vite.config.ts). Real, synchronous flow against bill-payment-service —
 * see BillPaymentService.java's class Javadoc for why this is a plainly-labelled mock biller
 * (deterministic hash amount, not a real integration) and why pay is synchronous (no
 * mock-bank-gateway/IPN round-trip the way top-up/bank-transfer-out have).
 */
export default function App({
  session,
  onDone,
}: {
  session: Session;
  onDone: () => void;
  onComingSoon: (feature: string) => void;
}) {
  const [step, setStep] = useState<Step>({ name: 'lookup' });

  async function handleLookup(category: BillCategory, customerCode: string): Promise<string | null> {
    try {
      const bill = await billPaymentService.lookup(category, customerCode);
      setStep({ name: 'confirm', bill });
      return null;
    } catch (e) {
      return describeApiError(e instanceof ApiError ? e.status : undefined, 'bill-payment');
    }
  }

  if (step.name === 'lookup') {
    return <BillLookupForm userId={session.id} onLookup={handleLookup} />;
  }

  if (step.name === 'confirm') {
    const bill = step.bill;

    async function submitPay(
      stepUpConfirmed: boolean,
      autoDebitOption?: AutoDebitOption,
      voucherId?: string,
      paymentSource?: PaymentSource,
    ): Promise<string | null> {
      try {
        const receipt = await billPaymentService.pay(
          session.id,
          bill.category,
          bill.customerCode,
          stepUpConfirmed,
          voucherId,
          paymentSource,
        );
        if (autoDebitOption?.enabled) {
          // Đăng ký thật với backend (bill-payment-service's AutoBillRegistration) — không
          // phải chỉ lưu localStorage — để scheduler/trigger-run thực sự xử lý kỳ sau.
          // Không chặn luồng nhận biên lai nếu đăng ký mandate lỗi (thanh toán đã thành công).
          try {
            await registerMandate(session.id, bill.category, bill.customerCode, autoDebitOption.maxCap);
          } catch {
            // Thanh toán đã thành công; chỉ việc đăng ký auto-debit thất bại — không rollback.
          }
        }
        setStep({ name: 'done', receipt, autoDebit: autoDebitOption });
        return null;
      } catch (e) {
        if (e instanceof ApiError && e.status === STEP_UP_REQUIRED_STATUS) {
          setStep({
            name: 'step-up',
            message: e.message,
            onConfirm: () => submitPay(true, autoDebitOption, voucherId, paymentSource).then(() => undefined),
            onCancel: () => setStep({ name: 'confirm', bill }),
          });
          return null;
        }
        return describeApiError(e instanceof ApiError ? e.status : undefined, 'bill-payment');
      }
    }

    return (
      <BillConfirm
        bill={step.bill}
        userId={session.id}
        onBack={() => setStep({ name: 'lookup' })}
        onConfirm={(autoDebitOption, voucherId, paymentSource) => submitPay(false, autoDebitOption, voucherId, paymentSource)}
      />
    );
  }

  if (step.name === 'step-up') {
    return <StepUpModal message={step.message} onConfirm={step.onConfirm} onCancel={step.onCancel} />;
  }

  return <BillReceipt receipt={step.receipt} autoDebit={step.autoDebit} onDone={onDone} />;
}
