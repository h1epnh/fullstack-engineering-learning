import {
  ApiError,
  type BillCategory,
  type BillLookupResponse,
  type BillPaymentReceipt,
  billPaymentService,
} from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { describeApiError } from '@ewallet-lab/ui';
import { useState } from 'react';
import { BillConfirm } from './screens/BillConfirm';
import { BillLookupForm } from './screens/BillLookupForm';
import { BillReceipt } from './screens/BillReceipt';

type Step =
  | { name: 'lookup' }
  | { name: 'confirm'; bill: BillLookupResponse }
  | { name: 'done'; receipt: BillPaymentReceipt };

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
    return <BillLookupForm onLookup={handleLookup} />;
  }

  if (step.name === 'confirm') {
    return (
      <BillConfirm
        bill={step.bill}
        onBack={() => setStep({ name: 'lookup' })}
        onConfirm={async () => {
          try {
            const receipt = await billPaymentService.pay(session.id, step.bill.category, step.bill.customerCode);
            setStep({ name: 'done', receipt });
            return null;
          } catch (e) {
            return describeApiError(e instanceof ApiError ? e.status : undefined, 'bill-payment');
          }
        }}
      />
    );
  }

  return <BillReceipt receipt={step.receipt} onDone={onDone} />;
}
