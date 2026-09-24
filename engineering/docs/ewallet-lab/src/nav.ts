/**
 * Single source of truth for the sidebar AND the router. To add a new page:
 *   1. Add one entry here (pick an existing group, or add a new group object).
 *   2. Add `"your-id": YourComponent` to the registry in src/pages/index.tsx.
 * That's it — App.tsx renders both the sidebar and the active page purely from
 * this list plus the registry; no other file needs to change.
 */
export type NavItem = {
  id: string;
  label: string;
  soon?: boolean;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'overview', label: 'Introduction' },
      { id: 'conventions', label: 'Conventions & disclaimer' },
    ],
  },
  {
    label: 'Architecture',
    items: [
      { id: 'architecture', label: 'System design' },
      { id: 'topup-flow', label: 'Top-up data flow' },
    ],
  },
  {
    label: 'In-house services',
    items: [
      { id: 'svc-user', label: 'user-service' },
      { id: 'svc-wallet', label: 'wallet-service' },
      { id: 'svc-topup', label: 'topup-service' },
    ],
  },
  {
    label: 'Partners & specs',
    items: [
      { id: 'partner-bank', label: 'mock-bank-gateway' },
      { id: 'momo-spec', label: 'MoMo spec references' },
    ],
  },
  {
    // Room to grow — add a page per topic (testing, accessibility, ...) rather
    // than growing one page into a catch-all.
    label: 'Frontend',
    items: [
      { id: 'web-client', label: 'Microfrontend architecture' },
      { id: 'frontend-design', label: 'Design & UI system' },
    ],
  },
  {
    // Local-K8s today; room for a real-EKS page once one exists for real.
    label: 'Deployment',
    items: [{ id: 'deploy-k8s', label: 'Kubernetes (local)' }],
  },
  {
    label: "What's next",
    items: [{ id: 'roadmap', label: 'Roadmap', soon: true, badge: '2 planned' }],
  },
];

export const DEFAULT_PAGE = 'overview';

export function isKnownPage(id: string): boolean {
  return NAV_GROUPS.some((g) => g.items.some((i) => i.id === id));
}
