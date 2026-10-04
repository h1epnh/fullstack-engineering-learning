/**
 * Single source of truth for the sidebar AND the router — for BOTH spaces (Developer/Business,
 * see issue #17). To add a page:
 *   1. Add one entry to the right NAV_GROUPS array below (DEV_NAV_GROUPS or BIZ_NAV_GROUPS).
 *   2. Add `"your-id": YourComponent` to the registry in src/pages/index.tsx.
 * That's it — App.tsx renders both the sidebar and the active page purely from this list plus the
 * registry; no other file needs to change.
 *
 * Architecture decision (issue #17's "điểm rẽ kiến trúc"): option (a) from the issue — ONE flat
 * `PAGES` registry shared by both spaces (ids never collide because every Business id is prefixed
 * `biz-`), while `NAV_GROUPS` becomes a function of `space` (two separate arrays) instead of one
 * global constant. Rejected option (b) — rendering Business as static content outside the
 * `PAGES`/hash-router mechanism — because it would lose per-page deep-linking for Business, which
 * the Acceptance criteria/Task implicitly wants (shareable links into specific business topics).
 * See README.md's "Developer/Business space switch" section for the full writeup.
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

export type Space = 'developer' | 'business';

const DEV_NAV_GROUPS: NavGroup[] = [
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

/**
 * Business space — nghiệp vụ sản phẩm, không phải kiến trúc kỹ thuật (xem issue #17). Mọi nội dung
 * ở các trang `biz-*` phải truy ngược được về một mục cụ thể trong backend DESIGN.md; không có
 * trang nào ở đây mô tả service/API/DB — những thứ đó ở lại các trang Developer phía trên.
 */
const BIZ_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [{ id: 'biz-overview', label: 'Giới thiệu' }],
  },
  {
    label: 'Giới hạn & an toàn giao dịch',
    items: [{ id: 'biz-limits', label: 'Hạn mức & xác thực bổ sung', badge: 'Quan trọng' }],
  },
  {
    label: 'Chuyển tiền & Thanh toán',
    items: [{ id: 'biz-transfer-payments', label: 'Chuyển tiền, Nạp/Rút, Hoá đơn' }],
  },
  {
    label: 'Lì xì, Chia tiền & Nhắc nợ',
    items: [{ id: 'biz-social-payments', label: 'Lì xì, Chia tiền, Link & Nhắc trả tiền' }],
  },
  {
    label: 'Ví Gia đình & Túi Thần Tài',
    items: [{ id: 'biz-family-savings', label: 'Ví Gia đình, Túi Thần Tài' }],
  },
  {
    label: "What's next",
    items: [{ id: 'biz-coming-soon', label: 'Chưa làm thật (Sắp có)', soon: true }],
  },
];

export const DEFAULT_PAGE_BY_SPACE: Record<Space, string> = {
  developer: 'overview',
  business: 'biz-overview',
};

/** Kept for any call site that only ever deals with Developer space (none left post-#17, but an
 * explicit default is safer than a silent fallback). */
export const DEFAULT_PAGE = DEFAULT_PAGE_BY_SPACE.developer;

export function navGroupsFor(space: Space): NavGroup[] {
  return space === 'business' ? BIZ_NAV_GROUPS : DEV_NAV_GROUPS;
}

export function isKnownPage(space: Space, id: string): boolean {
  return navGroupsFor(space).some((g) => g.items.some((i) => i.id === id));
}

/**
 * Hash <-> (space, page) encoding — the "cân nhắc thêm" from issue #17, resolved explicitly rather
 * than left as a silent default: Business IS encoded into the hash (`#business/<id>`), so a
 * Business page link is directly shareable, same as any Developer page link.
 *
 * Developer space deliberately keeps the ORIGINAL unprefixed shape (`#overview`, no `#developer/`
 * prefix) so every link that existed before #17 keeps resolving exactly as before — this is the
 * "không phá vỡ link cũ" constraint from the issue. Business is the only space that gets a prefix.
 */
export function parseHash(hash: string): { space: Space; page: string } {
  const raw = hash.replace(/^#/, '');
  if (raw.startsWith('business/')) {
    const page = raw.slice('business/'.length);
    return {
      space: 'business',
      page: isKnownPage('business', page) ? page : DEFAULT_PAGE_BY_SPACE.business,
    };
  }
  return {
    space: 'developer',
    page: isKnownPage('developer', raw) ? raw : DEFAULT_PAGE_BY_SPACE.developer,
  };
}

export function buildHash(space: Space, page: string): string {
  return space === 'business' ? `#business/${page}` : `#${page}`;
}
