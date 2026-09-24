import type { Session } from '@ewallet-lab/session';
/**
 * Exposed remote entry point (see vite.config.ts `exposes['./App']`). Deliberately
 * prop-driven rather than reading a shared session context — see
 * packages/session/src/useSession.ts for why. The shell owns what happens
 * after auth; this micro-app only knows how to produce a Session.
 */
export default function App({ onAuthenticated }: {
    onAuthenticated: (session: Session) => void;
}): import("react").JSX.Element;
