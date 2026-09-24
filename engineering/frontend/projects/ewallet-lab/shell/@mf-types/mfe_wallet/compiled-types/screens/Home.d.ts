import type { Session } from '@ewallet-lab/session';
/**
 * Exposed as `./Home` (see vite.config.ts). Home screen groups follow the
 * independent MoMo UX case study's finding on the real app's information
 * architecture: primary balance + the small set of core functions first,
 * secondary/recent activity below.
 * https://minh.la/ui-ux-case-study-momo/
 */
export default function Home({ session, onTopup, onComingSoon, }: {
    session: Session;
    onTopup: () => void;
    onComingSoon: (feature: string) => void;
}): import("react").JSX.Element;
