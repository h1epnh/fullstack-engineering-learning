import type { Session } from '@ewallet-lab/session';
/** Exposed as `./History` (see vite.config.ts) — the full, unbounded transaction ledger. */
export default function History({ session }: {
    session: Session;
}): import("react").JSX.Element;
