import type { Session } from '@ewallet-lab/session';
/** Exposed as `./App` (see vite.config.ts). Mirrors DESIGN.md "Top-up flow". */
export default function App({ session, onDone }: {
    session: Session;
    onDone: () => void;
}): import("react").JSX.Element;
