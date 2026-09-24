import { ApiError, userService } from '@ewallet-lab/api-client';
import type { Session } from '@ewallet-lab/session';
import { describeApiError } from '@ewallet-lab/ui';
import { useState } from 'react';
import { PhoneEntry } from './screens/PhoneEntry';
import { Register } from './screens/Register';

type Step = { name: 'phone' } | { name: 'register'; phone: string };

/**
 * Exposed remote entry point (see vite.config.ts `exposes['./App']`). Deliberately
 * prop-driven rather than reading a shared session context — see
 * packages/session/src/useSession.ts for why. The shell owns what happens
 * after auth; this micro-app only knows how to produce a Session.
 *
 * `isNewUser` tells the shell whether to run the onboarding wizard (see
 * shell/src/screens/Onboarding.tsx) — MoMo's own account-creation guide
 * (momo.vn/hoi-dap/cac-buoc-thuc-hien) only walks *new* signups through
 * link-bank + first top-up, not people who already have an account.
 */
export default function App({
  onAuthenticated,
}: {
  onAuthenticated: (session: Session, isNewUser: boolean) => void;
}) {
  const [step, setStep] = useState<Step>({ name: 'phone' });

  async function handlePhoneSubmit(phone: string): Promise<string | null> {
    try {
      const user = await userService.getByPhone(phone);
      onAuthenticated(user, false);
      return null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setStep({ name: 'register', phone });
        return null;
      }
      return describeApiError(e instanceof ApiError ? e.status : undefined, 'phone');
    }
  }

  async function handleRegister(phone: string, name: string): Promise<string | null> {
    try {
      const user = await userService.register(phone, name);
      onAuthenticated(user, true);
      return null;
    } catch (e) {
      return describeApiError(e instanceof ApiError ? e.status : undefined, 'register');
    }
  }

  if (step.name === 'register') {
    return (
      <Register
        phone={step.phone}
        onBack={() => setStep({ name: 'phone' })}
        onSubmit={handleRegister}
      />
    );
  }

  return <PhoneEntry onSubmit={handlePhoneSubmit} />;
}
