# Ewallet Lab Web — Microfrontend Architecture

Frontend for [`engineering/backend/projects/ewallet-lab`](../../../backend/projects/ewallet-lab/).
UX/IA is modeled on the real MoMo app's functional patterns (not its branding — see
[Disclaimer](#disclaimer)). Sources used are cited throughout instead of guessed.

## Disclaimer

Functional clone for study purposes only. No MoMo trademark, logo, or brand color is used anywhere
in this codebase — see `packages/ui/src/tokens.css` for the deliberately different palette (same
teal/ink/amber identity as [`engineering/docs/ewallet-lab`](../../../docs/ewallet-lab/)).

## 1. Why a microfrontend architecture

The backend is already split into independently-deployable microservices (`user-service`,
`wallet-service`, `topup-service`) — see `ewallet-lab/DESIGN.md`. A monolithic React SPA calling
all three from one codebase would put the frontend back into a single deployable unit and undo
that boundary from the UI side, which defeats the point of the lab (practicing real service
boundaries end-to-end, not just on the backend).

### Options considered

| Approach | Independent deploy? | Runtime cost | Verdict |
|---|---|---|---|
| Single React app, three API clients | No — one build, one deploy | Lowest | Rejected — just code-split monolith, not a microfrontend |
| iframes per feature | Yes | High (full page loads, awkward state sharing) | Rejected — poor UX for a wallet app; the classic iframe-MFE justification (hard isolation for a large legacy portal) doesn't apply here |
| Web Components (Custom Elements) | Yes | Low, framework-agnostic | Viable, but less representative of the React + Module Federation pattern that's actually common in job postings for this stack |
| **Module Federation (runtime composition)** | **Yes — each app has its own `vite build`, its own `dist/`, deployable to its own static host** | Low with shared singletons | **Chosen** |

**Decision: Module Federation via [`@module-federation/vite`](https://module-federation.io/).** Each
micro-app is its own Vite project with its own `package.json`, builds independently, and exposes
components at runtime through a `remoteEntry.js` the shell loads with a plain dynamic `import()`.
This is the same "own build, own deploy, own repo-worthy unit" property the backend microservices
already have — the frontend now has service boundaries, not just component boundaries.

## 2. Micro-app map

One micro-app per backend bounded context, 1:1:

| Micro-app | Exposes | Backend called | Port (dev/preview) |
|---|---|---|---|
| `shell` (host) | — (consumer only) | none directly | 5173 |
| `mfe-auth` | `./App` | `user-service` :8090 | 5174 |
| `mfe-wallet` | `./Home`, `./History`, `./AllServices`, `./Notifications` | `wallet-service` :8091 | 5175 |
| `mfe-topup` | `./App` | `topup-service` :8092 | 5176 |
| `mfe-transfer` | `./App` | `transfer-service` :8094, `user-service` :8090 (recipient lookup), `topup-service` :8092 (bank-transfer-out), `payment-request-service` :8096 (payment-link + payment-reminder, issue #3/#8), `lucky-money-service` :8097 (issue #10) | 5177 |
| `mfe-bill-payment` | `./App` | `bill-payment-service` :8095 | 5178 |

This table was previously stale (it never listed `mfe-transfer`, which shipped alongside
`transfer-service` — issue #1) — fixed here alongside adding `mfe-bill-payment` for the same
`bill-payment-service` (issue #2). Every backend bounded context with a browser-facing feature now
has a 1:1 micro-app; the Home screen's quick-action grid still uses `ComingSoon.tsx` inline copy for
every feature that has **no** backend counterpart yet (see backend `DESIGN.md`'s Services table for
what's actually scaffolded before adding a new remote here).

## 3. Cross-app state: props, not a shared Context

A well-known Module Federation pitfall: even with `shared: { react: { singleton: true } }`
deduplicating the React *library*, a `React.createContext()` call compiled into `mfe-wallet`'s own
bundle and one compiled into the shell's bundle are two different object identities. A remote
reading `useContext()` against a Context it imported from its own bundle will not see values a
Provider in a *different* bundle sets, and this fails silently (falls back to the context's default
value) rather than throwing — the kind of bug that's easy to ship and hard to debug.

This lab sidesteps it entirely: the shell is the sole owner of session state
(`packages/session/src/useSession.ts`) and passes `session` plus callbacks (`onAuthenticated`,
`onTopup`, `onDone`, `onComingSoon`, ...) as plain props into whichever remote it currently mounts.
No state crosses the federation boundary except through a component's own prop interface — the
same contract discipline the backend's `AdjustBalanceRequest`/`TopupResponseDto` records already
apply at the HTTP layer, just applied to the frontend's own composition seam instead.

`packages/session`, `packages/api-client`, and `packages/ui` are **not** federated — they're plain
npm workspace packages, source-linked (no separate build step: each app's Vite dev/build processes
their `.tsx`/`.ts` files directly, same as any monorepo using workspace symlinks). Duplicating a
few KB of shared UI/client code into each remote's bundle is an accepted, deliberate trade for
independent buildability — the alternative (federating them too) would make every remote's build
depend on those packages being independently versioned and shared at runtime, which is unnecessary
complexity for code that isn't the size of React itself.

## 4. UX/IA — grounded in MoMo's own sources, not guessed

Two real sources were used (see the developer docs' "MoMo spec references" precedent — the same
discipline now extended to UX, not just API specs):

1. **MoMo's own developer-portal design guideline** —
   [General UX Principles](https://developers.momo.vn/v3/docs/app-center/design-guideline/general-ux-principles/).
   Concrete rules applied directly in this codebase:
   - *"Use no more than three modules in the bottom tab bar."* → `shell/src/App.tsx` `NAV_ITEMS` has
     exactly 3 (Trang chủ / Lịch sử / Cá nhân); `BottomNav` even logs a warning if handed more, so
     the rule can't silently regress.
   - *"Easily distinguish primary information from secondary information."* → `BalanceCard` is the
     single largest, highest-contrast element on the Home screen; recent transactions sit visually
     below it.
   - *"Report the reason precisely... guide the user to correct it."* → `packages/ui/src/formErrors.ts`
     maps each HTTP status to a specific Vietnamese message per screen context, and `TextField`
     always renders the error inline next to the offending field.
   - *"If data takes a long time to load, display a progress bar... provide an abort option"* /
     *"avoid displaying multiple loading effects at the same time."* → `ProgressBar` is the one
     loading primitive used everywhere; `TopupStatusScreen`'s polling loop has an explicit "Huỷ"
     button.
   - *"Reduce direct input... use predefined options."* → bank selection in `LinkBank.tsx` is a
     `<select>` from a fixed list, not a free-text bank-name field.

2. **Independent UX case study of the real app** —
   [UI&UX Case Study - MoMo & ZaloPay](https://minh.la/ui-ux-case-study-momo/). Its critique of the
   *original* MoMo app's IA (functions mixed without hierarchy, core actions requiring two-handed
   reach) and its proposed regrouping (core functions → frequently-used → less-common → branding)
   is what the Home screen's layout order follows: balance card first, then the 3-per-row quick
   action grid ordered by how complete each feature actually is (Nạp tiền is real; the rest are
   marked coming-soon rather than hidden, so the grid's shape doesn't jump around as features land).

## 5. Dev workflow — build+preview remotes, dev the one you're changing

`@module-federation/vite`'s dev-server-to-dev-server remote consumption has known gaps (no
cross-remote HMR yet, per [module-federation.io](https://module-federation.io/integrations/build-tool/vite.html)).
Rather than fight that, this repo uses the same split real MFE deployments use: remotes are built
and served as static output, and only the app you're actively working on runs a live dev server.

```bash
npm install                 # once, from this directory (npm workspaces)
npm run dev                 # builds all 5 remotes, previews them, and starts the shell dev server
```

Working on one remote's UI: run `npm run dev -w mfe-wallet` (etc.) directly — each micro-app has
its own `index.html` + `src/main.tsx` standalone harness (a mock session, no shell, no other
remotes needed) precisely so it can be developed and demoed in isolation. That standalone
buildability is the actual point of splitting these apart, not just an architecture diagram.

Backend services must be running separately (`cd ../../../backend/projects/ewallet-lab && docker
compose up --build`) — `packages/api-client/src/http.ts` defaults to
`localhost:8090/8091/8092/8094/8095`, overridable via `VITE_USER_SERVICE_URL` etc. CORS is opened
for `http://localhost:*` on all Spring services (lab-only, not hardened — see each service's
`config/CorsConfig.java`).

## 6. Known limitations — not hidden

- **Not browser-tested end-to-end.** Every app's `vite build` succeeds and the shell correctly
  resolves all 4 exposed remote modules (verified via `vite build` + serving `remoteEntry.js` +
  curling the shell's dev-transformed `main.tsx`/`App.tsx`), but no headless-browser or manual
  click-through pass has been done in this environment (no browser automation tool was available).
- **`packages/ui`/`api-client`/`session` are duplicated per remote bundle**, not federated — see §3
  for why that's a deliberate trade, not an oversight.
- **No routing library, still true for the app as a whole.** Navigation is plain `useState` in the
  shell (3 tabs + several full-screen flows). Issue #3 reopened this **only** for one URL
  (`.../pay/<token>`, see §7) — that one-shot `window.location.pathname` parse is not a router and
  doesn't generalize to any other screen; a real deployment would still want a proper routing
  library for URL-addressable navigation everywhere else.
- **`mfe-bill-payment`'s "due amount" is entirely mock** (deterministic hash of category +
  customer code, computed server-side by `bill-payment-service` — see backend `DESIGN.md`'s "Luồng
  bill payment" section). The UI does not fabricate a real biller brand or claim a real
  integration; the lookup screen says so explicitly.
- **split-bill/fund/send-card/etc. remain comingSoon** — `payment-link` (#3), `payment-reminder`
  (#8) (see §7), and `lucky-money` (#10) (see §9) are now real; see backend `DESIGN.md`'s Services
  table for what else is actually scaffolded.

## 7. Payment link (issue #3) + payment reminder (issue #8) — deep-link + reused screens

Both wired inside **`mfe-transfer`** (no new remote/micro-app — the Task in both issues scoped this
to existing `mfe-transfer` screens, not a new bounded context), calling the new
`payment-request-service` :8096 (see backend `DESIGN.md`'s "Link nhận tiền + Nhắc trả tiền" section
for the backend architecture decision and full flow).

- **`TransferHome.tsx`'s "Dịch vụ khác" grid**: `payment-link` and `payment-reminder` tiles now have
  `wired: true` (full opacity, not the dimmed 0.55 used for genuinely-comingSoon tiles) and are
  intercepted in `App.tsx`'s `onComingSoon` wrapper before ever reaching the shell's `ComingSoon`
  screen — their entries were removed from `shell/src/screens/ComingSoon.tsx`'s `COPY` map.
- **Minimal deep-link mechanism (issue #3's Task step 3, reopening §6/§7's routing limitation for
  exactly one screen)**: `shell/src/App.tsx` parses `window.location.pathname` **once**, at mount,
  via a plain regex (`/^\/pay\/([0-9a-fA-F-]{36})$/` — no history API usage, no route table, no
  library). If it matches, the shell's initial `flow` state is set to `'transfer'` and the token is
  passed down as `TransferApp`'s `initialPayToken` prop, which makes `mfe-transfer`'s own `Step`
  state start at `{ name: 'pay-link', token }` instead of `{ name: 'home' }`. A `useRef` flag
  (`deepLinkConsumedRef`) makes this **one-shot**: once the pay-link flow finishes (`onDone`),
  re-entering "Chuyển tiền" normally (e.g. from the wallet home tile) lands on `mfe-transfer`'s own
  home screen again, not back on the same token. This is deliberately not a router — it doesn't
  generalize, and isn't meant to (see §6).
- **`PaymentLinkCreate.tsx`/`PaymentLinkCreated.tsx`**: amount + optional message → creates the
  request → shows the shareable URL (`${window.location.origin}/pay/<id>`) with a copy button.
  Structure loosely adapted from MoMo's public **Collection Link** docs
  (developers.momo.vn/v3/vi/docs/payment/api/collection-link/, merchant-side — **not** a confirmed
  P2P personal-link spec; MoMo does not publish one, per agent-designer's research comment on issue
  #3) — flagged as adapted in the create screen's own copy, not presented as a verified spec.
- **`PaymentLinkPay.tsx`**: reached via the deep link (or, in principle, by navigating there while
  already inside `mfe-transfer`), fetches by opaque token (`GET /payment-requests/links/{token}`)
  since the payer doesn't know the creator's phone number ahead of time, unlike the regular P2P
  search flow. Explicitly tells the user paying a link is open to "any valid Ewallet Lab account
  with the URL" — a lab simplification called out on-screen, not silently under-secured.
- **`PaymentReminderHome.tsx`**: 1 screen, 3 tabs (create / đã gửi / đã nhận) since whoever taps the
  tile could be either role on a given day. The create tab reuses the same phone-search pattern as
  `TransferHome.tsx`'s `onSearch` (issue #8's Task explicitly asks for this). The "đã nhận" tab is
  **polled on mount/tab-switch, not pushed** — there is no notification infrastructure in this lab
  (backend DESIGN.md says the same) — called out in the tab's own code comment, not presented as a
  real push feature.
- **Not verified with real browser automation** (click-through of the new screens) — no such tool
  was available in this session. What *is* verified: clean `npm run build -w mfe-transfer`/`-w
  shell`, both images rebuilt with the correct `ewallet-lab/<name>:local` tag and redeployed, the
  running bundles grepped for new code (`payment-requests`, `initialPayToken`), the full
  create→fetch→pay HTTP flow exercised end-to-end through real Ingress
  (`http://api.ewallet-lab.local`), and `http://shell.ewallet-lab.local/pay/<token>` confirmed to
  return **200** via nginx's SPA `try_files` fallback (so the deep-link path isn't blocked at the
  HTTP/Ingress layer) — same class of gap agent-dev already flagged for issue #4's camera input.

## 8. QR payload format & camera limitation (issue #4)

`receive`/`qr-pay` on the wallet Home screen are now real screens, not `comingSoon` — an app-own-QR
(`mfe-wallet/src/screens/ReceiveQr.tsx`) and a scan input inside the existing "Chuyển tiền" flow
(`mfe-transfer/src/screens/QrScanner.tsx`, wired into `TransferHome.tsx`). Both are additive: no new
backend endpoint, no change to `userService.getByPhone`/`transferService.transfer` (already used by
manual-phone-entry P2P transfer).

- **Payload format — invented for this lab, NOT a real standard**: `ewalletlab://pay?phone=<phone>`
  (see `ReceiveQr.tsx`'s `qrPayloadFor` / `TransferHome.tsx`'s `parseEwalletLabQrPhone`, which must
  stay in sync — they're duplicated rather than shared across the `mfe-wallet`/`mfe-transfer`
  Module Federation boundary, same trade-off as `packages/ui` per §3). Scanning a real VietQR/bank
  EMV QR string is explicitly out of scope and is rejected (`parseEwalletLabQrPhone` returns `null`
  for anything that isn't this exact scheme+host) — see issue #4 Constraints for why.
- **Scan mechanism**: browser `BarcodeDetector` API (`{ formats: ['qr_code'] }`) against a live
  `<video>` element fed by `getUserMedia({ video: { facingMode: 'environment' } })`. No `jsQR`-style
  JS fallback decoder was added — browsers without `BarcodeDetector` (Firefox, Safari as of
  writing) show a plain "not supported, enter phone manually" message instead; manual phone entry
  always remains available as the primary input method.
- **Camera access requires a secure context (HTTPS or `localhost`)** in every major browser —
  `*.ewallet-lab.local` Ingress is plain HTTP, so live camera scanning cannot be exercised through
  it as deployed. **Verification actually performed, plainly documented rather than skipped**:
  - Both new screens build cleanly (`npm run build -w mfe-wallet`, `npm run build -w mfe-transfer`,
    `npm run build -w shell`) and `npx tsc --noEmit` passes for `mfe-wallet`/`mfe-transfer`.
  - Images rebuilt (`ewallet-lab/mfe-wallet:local`, `ewallet-lab/mfe-transfer:local`,
    `ewallet-lab/shell:local`), redeployed to minikube, bundle content grepped in-cluster to
    confirm the new code is actually running (not just building).
  - The payload encode/decode round-trip (`qrPayloadFor` → `parseEwalletLabQrPhone`) was verified
    directly (both success and 3 rejection cases: a real VietQR/EMV string, random text, wrong
    URL host) — this is the exact logic the camera loop hands off to once it decodes a frame.
  - The business flow a successful scan feeds into (`userService.getByPhone` then
    `transferService.transfer`) was exercised end-to-end against the real cluster with 2 freshly
    registered users and a real balance — this is unchanged by this ticket (same call path as
    manual phone entry) but confirms nothing regressed.
  - **Not verified**: an actual camera pointed at an actual rendered QR code decoding through a
    real browser tab. No fake-camera-device browser automation (e.g. Chromium's
    `--use-fake-device-for-media-stream`/`--use-file-for-fake-video-capture` flags, which would let
    a real `BarcodeDetector` decode a synthetic video of a generated QR end-to-end) was attempted
    in this pass — flagged here as a gap for whoever verifies this next, not hidden.

## 9. Lucky money (issue #10) — `LuckyMoneyHome.tsx`, calls lucky-money-service directly

Wired inside `mfe-transfer` (no new remote, same reasoning as §7 — the Task scoped this to an
existing micro-app). Backend architecture decisions (why a separate service from
payment-request-service, why lazy-expiry, sourced amount/48h limits) are in backend `DESIGN.md`'s
"Lì xì 1-1 nội bộ (issue #10)" section — this section covers the UI side only.

- **`TransferHome.tsx`'s `lucky-money` tile** now has `wired: true` (full opacity) and is
  intercepted in `App.tsx`'s `onComingSoon` wrapper, same pattern as `payment-link`/`payment-reminder`
  — removed from `shell/src/screens/ComingSoon.tsx`'s `COPY` map.
- **`LuckyMoneyHome.tsx`** — 1 screen, 3 tabs (Gửi lì xì / Đã gửi / Đã nhận), same shape as
  `PaymentReminderHome.tsx` (§7) since whoever taps the tile could be sender or recipient. The send
  tab reuses the phone-search pattern from `TransferHome.tsx`'s `onSearch`, then shows an amount
  field bounded client-side by `LUCKY_MONEY_MIN_AMOUNT`/`LUCKY_MONEY_MAX_AMOUNT` (exported from
  `@ewallet-lab/api-client`'s `luckyMoneyService.ts`, mirroring lucky-money-service's own
  `@DecimalMin`/`@DecimalMax` — client-side check is UX-only, the server validates independently)
  and states plainly on-screen that the sender's balance is debited immediately (escrow) and
  auto-refunded after 48h if unclaimed — not hidden as an implementation detail.
- **"Đã nhận" tab** shows a "Nhận lì xì" button on each `PENDING` item — same lazy-expiry-on-read
  model as backend: this screen doesn't poll for expiry itself, it just re-fetches
  (`luckyMoneyService.listReceived`) on mount/tab-switch, and the list it gets back already reflects
  whatever `lucky-money-service`'s own `GET` lazy-check flipped server-side.
- **MVP scope only, called out in the send tab's own copy**: no group lucky money (max 9 people, a
  real MoMo feature per agent-designer's research), no random-amount mode, and no SMS-invite flow
  for a phone with no Ewallet Lab account (`userService.getByPhone` 404 is surfaced as a plain
  error via `describeApiError`'s new `'lucky-money'` context, not a fake "invite sent" success).
- **Not verified with real browser automation** — same gap as §7/§8. What *is* verified: clean
  `npm run build -w mfe-transfer`, image rebuilt with the correct tag (+ new
  `VITE_LUCKY_MONEY_SERVICE_URL` build-arg) and redeployed, running bundle grepped for new strings
  ("Giật lì xì", "Nhận lì xì", "escrow"), and the full send→escrow→claim and send→expire→refund
  HTTP flows exercised end-to-end through real Ingress (`http://api.ewallet-lab.local`).

## 10. Ví Trả Sau — mock BNPL (issue #18) — `BnplWallet.tsx`, calls bnpl-service directly

> **Disclaimer (mandatory, also on-screen):** this is a **learning simulation**. It is **NOT** a real
> lending / consumer-credit product, and **NO real bank or finance company** is behind this lab's
> "Ví Trả Sau". Limit/interest/fee numbers come from MoMo's public page for study only; the lab is
> not connected to any credit institution.

Backend decisions (why a standalone `bnpl-service`, the late-fee model, claim-before-debit, the
`BNPL_REPAYMENT` monthly-limit exemption, sources) are in backend `DESIGN.md`'s "Ví Trả Sau" section
— this section is the UI side only.

- **Entry point**: `Home.tsx`'s multi-wallet strip "Ví Trả Sau" `MiniWallet` is now clickable (shows
  "Mô phỏng ›") → shell flow `{ name: 'bnpl' }` → `mfe_wallet/BnplWallet` (new expose, no new
  remote). `onBnpl` is an *optional* Home prop so an older shell deployed separately falls back to
  the generic coming-soon screen instead of crashing. The `FEED_TEASERS` "Ví Trả Sau, vay nhanh"
  teaser is **deliberately untouched** (it also advertises "vay nhanh", out of scope).
- **Disclaimer is not small print** (issue #18 Constraints):
  - a **blocking modal** (`role="dialog"`, `aria-modal`) before the first open, listing the 3 required
    points (`DISCLAIMER_POINTS`); "Xác nhận" stays disabled until the user ticks "Tôi đã đọc và hiểu…".
    The backend independently refuses `/open` without `acceptedDisclaimer: true`.
  - a **persistent amber banner** (`DISCLAIMER_BANNER`, bold, 2px border — not grey text) at the top
    of every state of the screen: not opened, opened, draw form, repay form.
- **States**: not opened (terms summary: 20tr fixed limit, 0% if on time, 33.000đ/month with
  activity, due day 1 of next month, 4 late-fee tiers) → opened (available/total limit, total due,
  nearest due date with "QUÁ HẠN" flag, "Mua sắm trả sau (mô phỏng)" form, "Trả nợ từ ví chính"
  form with a "fill full amount" shortcut, statement cards per month with late-fee rate/days late,
  recent draws, repayment history incl. FAILED attempts).
- Client-side checks (integer amounts, ≥1.000đ draw, ≤ available limit, ≤ total due) are UX only;
  the server validates independently. Errors go through `describeApiError`'s new `'bnpl-open' |
  'bnpl-draw' | 'bnpl-repay'` contexts.
- **`BNPL_REPAYMENT`** added to `TransactionType` in api-client and `TransactionRow`'s `TYPE_META`
  (label "Trả nợ Ví Trả Sau", sign −1) — without it History would fall back to a "+" sign.
- **Build arg**: `mfe-wallet/Dockerfile` now takes `VITE_BNPL_SERVICE_URL` (CLAUDE.md's most
  recurring bug). Build with
  `--build-arg VITE_WALLET_SERVICE_URL=http://api.ewallet-lab.local --build-arg VITE_BNPL_SERVICE_URL=http://api.ewallet-lab.local`.
  The shell must be rebuilt too (new flow + `remotes.d.ts`).
- **Verified**: `tsc --noEmit` + `npm run build` clean for mfe-wallet; shell builds. Driven in
  headless Chromium against the standalone harness + real local `bnpl-service`/`wallet-service`/
  Postgres: open via modal (confirm disabled until checkbox), draw, failed repay (empty wallet →
  409 copy + FAILED row in history). **Not yet verified** through minikube/Ingress
  (`shell.ewallet-lab.local`) — no Docker daemon in the environment this was built in.

## 11. Điểm thưởng (issue #19) — `LoyaltyRewards.tsx`, calls loyalty-service directly

A mock, in-house loyalty program — **no real partner, brand or voucher catalog**; the only reward is
cashback into the user's own main wallet. Rules, sources and the race strategy are in backend
`DESIGN.md`'s "Điểm thưởng (issue #19)" section.

- **Entry point / no misleading UI**: `Home.tsx`'s old `suggested` teaser ("Ưu đãi & hoàn tiền —
  Voucher đối tác, tích điểm") claimed "tích điểm" while only opening coming-soon. It is now split:
  a real **"Điểm thưởng"** teaser (`key: 'loyalty'`, optional `onLoyalty` prop → shell flow
  `{ name: 'loyalty' }` → `mfe_wallet/LoyaltyRewards`), and the remaining "Ưu đãi & hoàn tiền —
  Voucher đối tác" teaser, which still goes to coming-soon.
- **Screen**: points + cashback value, tier chip, rolling-12-month bill spend with progress to the
  next tier, redeem form (min points, live "Nhận về" preview), earn rules + full tier table, point
  history (earned per bill with the tier used; redemptions incl. FAILED/refunded), and a plain
  footnote that it's a simulation with no partners. Shows a warning when loyalty-service couldn't
  sync with wallet-service (`synced=false`).
- `LOYALTY_REDEMPTION` added to api-client `TransactionType` + `TransactionRow` ("Hoàn tiền từ điểm
  thưởng", sign +1); `describeApiError` gets a `'loyalty-redeem'` context.
- **Build arg**: `mfe-wallet/Dockerfile` now also takes `VITE_LOYALTY_SERVICE_URL`; the shell must be
  rebuilt for the new flow.
- **Verified**: `tsc` + build for mfe-wallet, shell builds. Headless Chromium against the harness and
  real local loyalty-service, wallet-service and Postgres. Not yet verified through minikube/Ingress.
## 12. Step-up authentication modal (issue #15) — `StepUpModal` in `packages/ui`

Mô phỏng bước "xác thực bổ sung" của QĐ 2345/QĐ-NHNN khi 1 giao dịch chuyển tiền/thanh toán/nạp ví
vượt ngưỡng — xem backend `DESIGN.md`'s "Step-up xác thực..." cho nguồn số liệu, phạm vi, và lý do
kiến trúc phía backend. Section này chỉ nói phần UI.

- **`StepUpModal` (`packages/ui/src/StepUpModal.tsx`)** — 1 component dùng chung, không phải
  federated (cùng trade-off duplicated-per-bundle đã nêu ở §3). Bottom-sheet cố định
  (`position: fixed; inset: 0`) với icon `fingerprint`, hiển thị **nguyên văn message từ backend**
  (không viết lại copy ở tầng frontend) + 1 dòng phụ nói rõ đây là mô phỏng, KHÔNG có sinh trắc
  học/WebAuthn thật — tránh ngộ nhận đã tích hợp thật. 2 nút: "Tôi xác nhận đây là tôi" (gọi lại
  đúng request ban đầu kèm `stepUpConfirmed: true`) và "Huỷ giao dịch" (quay lại màn nhập trước đó).
- **`http.ts`'s `request()` giờ đọc `res.text()` cho response lỗi** thay vì luôn tạo message chung
  chung — hầu hết `@ExceptionHandler` phía backend trả plain-text body là chính copy tiếng Việt đã
  sourced (không phải JSON envelope); đọc `ApiError.message` này để hiển thị nguyên văn trong modal
  thay vì đoán lại copy. `describeApiError` (dùng cho các lỗi khác, mã hoá theo `context`) không đổi
  — 428 không đi qua `describeApiError`, nó có luồng riêng (xem dưới).
- **Mỗi flow debit/topup tự quản lý 1 step `'step-up'` trong state machine của `App.tsx`** (transfer
  + bank-transfer-out trong `mfe-transfer`, topup + withdraw trong `mfe-topup`, bill-pay trong
  `mfe-bill-payment`) — không dùng modal chồng lên màn hiện tại, mà coi step-up là 1 "màn" đầy đủ
  như các bước khác trong cùng state machine (nhất quán với cách toàn bộ app điều hướng bằng
  `useState<Step>` phẳng, không có router — xem §6). Khi gọi service gặp `ApiError` với
  `status === STEP_UP_REQUIRED_STATUS` (428, export từ `@ewallet-lab/api-client`), chuyển sang
  step này thay vì hiện lỗi inline; `onConfirm` gọi lại đúng hàm submit với `stepUpConfirmed: true`;
  `onCancel` quay về đúng step trước đó (giữ nguyên dữ liệu đã nhập — số tiền, người nhận/tài khoản
  NH — để người dùng không phải nhập lại từ đầu nếu chọn Huỷ rồi thử lại).
- **Không có build-arg/`VITE_*_SERVICE_URL` mới** — bước xác nhận không gọi thêm service mới nào từ
  frontend (endpoint read-only `GET /wallets/{userId}/step-up-check` mới của wallet-service chỉ
  được gọi từ `topup-service` phía server, không phải từ browser).
- **Không verify bằng browser automation thật** — cùng loại gap đã ghi ở §7/§8/§9. Đã verify: build
  sạch `npm run build -w mfe-transfer`/`-w mfe-topup`/`-w mfe-bill-payment`, cả 3 image rebuild
  đúng tag và redeploy, bundle chạy thật grep ra đúng chuỗi mới ("Cần xác thực bổ sung", "Tôi xác
  nhận đây là tôi", `stepUpConfirmed`), và toàn bộ luồng HTTP thật (428 → gọi lại kèm
  `stepUpConfirmed: true` → 200) exercised qua Ingress thật cho cả transfer/topup/withdraw/
  bank-transfer-out/bill-pay (xem backend DESIGN.md's phần verify cho số liệu cụ thể).

## 13. Chia tiền (split-bill, issue #11) — 3 màn mới trong `mfe-transfer`

MoMo THẬT đã NGỪNG tính năng này từ 31/08/2025 — xem backend DESIGN.md's "Chia tiền (split-bill,
issue #11)" cho nguồn + lý do kiến trúc (mỗi share là 1 `PaymentRequest` kind=`LINK` bình thường,
không service/DB mới). Section này chỉ nói phần UI.

- **`split-bill` tile trong `TransferHome.tsx`'s `OTHER_SERVICES`** giờ `wired: true`, intercept
  trong `App.tsx`'s `onComingSoon` wrapper (cùng pattern `payment-link`/`payment-reminder`/
  `lucky-money`) — gỡ khỏi `shell/src/screens/ComingSoon.tsx`'s `COPY`.
- **`SplitBillCreate.tsx`** — form với toggle "Chia đều" (tổng tiền + số người, preview mỗi người
  trả bao nhiêu, làm tròn xuống + phần dư vào người đầu) / "Tuỳ chỉnh từng người" (danh sách input
  động, thêm/bớt người, 2–20 người). Copy nói rõ "đơn giản hoá có chủ đích, không phải cơ chế bảo
  mật thực tế" (đúng cảnh báo đã dùng ở `PaymentLinkCreate.tsx`, vì mỗi share bản chất là 1 LINK).
- **`SplitBillCreated.tsx`** — sau khi tạo, hiện từng share (tên "Người N", số tiền) kèm nút "Sao
  chép link" riêng (URL `.../pay/<shareId>`, y hệt `PaymentLinkCreated.tsx` — không phải component
  dùng chung vì layout khác, nhưng cùng cơ chế: mỗi share's `id` chính là LINK token).
- **`SplitBillGroup.tsx`** — "Danh sách đã thu": thanh tiến độ tự vẽ (không dùng component `Progress`
  có sẵn — đó là `ProgressBar`, 1 spinner cho loading, không phải progress bar theo %) + danh sách
  share kèm `StatusPill`. Refresh thủ công (nút "Làm mới") hoặc khi mount — không có push
  notification, cùng gap "adapted, không giả vờ đã làm push" đã ghi ở §7 (payment-reminder).
  Reachable từ màn kết quả ngay sau khi tạo, KHÔNG có route/deep-link riêng để quay lại xem sau
  (đúng scope MVP — nếu cần, người tạo có thể lưu lại `groupId` thủ công, ngoài phạm vi issue #11).
- **Việc trả 1 share KHÔNG có màn riêng** — payer mở đúng `.../pay/<shareId>` và rơi vào
  `PaymentLinkPay.tsx` có sẵn (vì share là LINK thật), không có code UI mới cho việc "trả 1 phần
  chia tiền" — đúng tinh thần "reuse toàn bộ, không viết code path debit/credit hay UI pay mới".
- **`describeSplitError`** (App.tsx) — thay vì `describeApiError`'s copy chung theo status code,
  hiện NGUYÊN VĂN message backend cho lỗi tạo split (400 "phải gửi đúng 1 trong 2 chế độ", "số
  người chia phải từ 2 đến 20") — các message này đã đủ cụ thể/hữu ích từ backend, viết lại sẽ chỉ
  làm mất thông tin. Khả thi nhờ `http.ts`'s `request()` giờ đọc `res.text()` vào `ApiError.message`
  (thêm cho issue #15's step-up copy, tái dùng lại ở đây).
- **Chưa nối `StepUpModal` vào luồng trả tiền split-share** (`PaymentLinkPay.tsx`) — ghi nhận ở
  backend DESIGN.md's mục Chia tiền, đây là gap còn lại ngoài yêu cầu của issue #11 (chỉ ảnh hưởng
  các share >10.000.000đ/lần hoặc khi cộng dồn ngày của payer vượt ngưỡng — khá hiếm với quy mô
  chia tiền thông thường).
- **Không có build-arg/`VITE_*_SERVICE_URL` mới** — chỉ dùng lại `VITE_PAYMENT_REQUEST_SERVICE_URL`
  đã có sẵn từ issue #3/#8.
- **Không verify bằng browser automation thật** — cùng loại gap đã ghi ở §7–§12. Đã verify:
  build sạch `npm run build -w mfe-transfer` (+ `npx tsc --noEmit` sạch) và `-w shell`, cả 2 image
  rebuild đúng tag và redeploy, bundle chạy thật grep ra đúng chuỗi mới ("Chia tiền", "Tuỳ chỉnh
  từng người", "Danh sách đã thu", `createSplitEven`), và toàn bộ luồng HTTP thật (tạo split chia
  đều + tuỳ chỉnh, trả từng share, `GET /splits/{groupId}` phản ánh đúng trạng thái, double-pay
  409, và **8 request đồng thời vào cùng 1 share → 1/8 200 + 7/8 409 sạch**) exercised qua Ingress
  thật (`http://api.ewallet-lab.local`) với nhiều user đăng ký qua chính Ingress.

## 14. Túi Thần Tài (issue #13) — `SavingsPocket.tsx` trong `mfe-wallet`, gọi thẳng `wallet-service`

Kiến trúc, nguồn lãi suất (ZaloPay 4%/năm đã verify vs MoMo 6%/năm cố tình không dùng), và cơ chế
lazy-compute đều ở backend `DESIGN.md`'s "Túi Thần Tài" section — section này chỉ nói phần UI.

- **`Home.tsx`'s "multi-wallet strip"** (`MiniWallet` — trước đây tĩnh, chỉ có "Ví chính") giờ có
  thêm ô "Túi Thần Tài" **`onClick`-able** (gọi `onSavingsPocket`), hiện `formatVnd(pocketBalance)`
  khi đã mở hoặc "Chưa mở" nếu chưa — khác "Ví Trả Sau" bên cạnh, vẫn cố tình để `comingSoon`
  (`onClick` không set) vì ngoài phạm vi issue #13. `Home.tsx` gọi `savingsPocketService.view()`
  cùng lúc với balance ví chính lúc mount để tô đúng số dư mà không cần người dùng mở màn trước.
- **`SavingsPocket.tsx`** — 1 màn, 2 trạng thái: **chưa mở** (form nhập số tiền mở lần đầu, tối
  thiểu 10.000đ — copy nói rõ "sinh lãi mỗi ngày (mô phỏng)") và **đã mở** (thẻ số dư + lãi suất
  hiện tại, 2 nút "Nạp thêm"/"Rút về ví chính" dùng chung 1 form amount). Không có màn/step riêng
  cho "xem lịch sử lãi" — mỗi lần `view`/`deposit`/`withdraw` chỉ trả về balance đã cộng lãi luỹ kế
  tới thời điểm gọi (đúng cách backend tính, không có breakdown "lãi ngày X là bao nhiêu" ở tầng
  UI hay API).
- **Disclaimer mô phỏng hiện NGUYÊN VĂN trên UI, không chỉ trong tài liệu kỹ thuật**: dòng cuối màn
  "đã mở" nói rõ "Lãi suất trên là MÔ PHỎNG cho mục đích học tập — không có quỹ đầu tư/ngân hàng
  lưu ký thật đứng sau, khác thực tế MoMo/ZaloPay có đối tác quỹ/ngân hàng thật" — đúng yêu cầu của
  Acceptance criteria issue #13 (tuyên bố rõ ràng, không chỉ ở DESIGN.md).
- **Không có build-arg/`VITE_*_SERVICE_URL` mới** — `savingsPocketService.ts` tái dùng
  `API_BASE.wallet` đã có sẵn (túi sống trong chính `wallet-service`, không phải service riêng,
  đúng quyết định kiến trúc (a) trên issue #13).
- **`describeApiError`'s `'savings-pocket'` context mới** trong `formErrors.ts` — copy lỗi riêng
  cho 409 (số dư không đủ/đã mở trước đó/dưới mức tối thiểu — backend trả message tiếng Việt cụ thể
  qua `res.text()`, không cần mã hoá lại ở tầng frontend cho case này).
- **Không verify bằng browser automation thật** — cùng loại gap đã ghi ở §7–§13. Đã verify: build
  sạch `npm run build -w mfe-wallet`, image rebuild đúng tag và redeploy, bundle chạy thật grep ra
  đúng chuỗi mới ("Túi Thần Tài", "MÔ PHỎNG cho mục đích học tập"), và toàn bộ luồng HTTP thật
  (mở/nạp/rút, lãi tích luỹ theo thời gian, 409 khi vượt hạn/không đủ số dư, và race 20 request mở
  đồng thời sau khi fix — xem backend DESIGN.md's phần verify cho số liệu cụ thể) qua Ingress thật.

## 15. Ví Gia Đình (issue #12) — `FamilyWallet.tsx` trong `mfe-wallet`, gọi `family-wallet-service`

Nguồn (VNPay, KHÔNG PHẢI MoMo), 3 lựa chọn kiến trúc đã dừng lại hỏi trước khi code, và quyết định
đã chọn (overlay (a) + enforce tại `wallet-service`'s debit path) đều ở backend `DESIGN.md`'s "Ví
Gia Đình" section — section này chỉ nói phần UI.

- **Tile "Ví Gia đình" hoàn toàn MỚI trong `Home.tsx`'s quick-action grid** (không map vào tile
  `ComingSoon` nào có sẵn, đúng như Context của issue #12 đã lưu ý — tính năng này không tồn tại
  trong danh sách MoMo comingSoon gốc vì nó không phải ý tưởng của MoMo). Icon
  `family_restroom` (Material Symbols, đúng quy ước icon toàn dự án), `real: true` ngay từ đầu
  (không qua trạng thái comingSoon).
- **`FamilyWallet.tsx`** — màn của "parent": form thêm/cập nhật hạn mức (nhập SĐT thành viên +
  hạn mức/tháng, upsert — 1 API call, không có toggle "thêm mới" vs "sửa" riêng ở UI, khớp đúng
  `addOrUpdateMember`'s upsert semantics phía backend) + danh sách thành viên, mỗi thẻ hiện thanh
  tiến độ "đã chi/hạn mức" (đỏ nếu ≥100%) và nút "Xem lịch sử chi tiêu" (toggle inline, gọi
  `memberHistory`, tái dùng `TransactionRow` có sẵn từ `packages/ui` — không viết lại component
  hiển thị giao dịch).
- **Không có màn hình riêng cho "member"** — nếu 1 member vượt hạn mức, họ chỉ thấy lỗi 409 xuất
  hiện Ở ĐÚNG màn hình chuyển tiền/thanh toán/rút tiền hiện có (`mfe-transfer`/`mfe-topup`/
  `mfe-bill-payment`) qua đúng luồng lỗi 409 chung đã có sẵn (dùng chung fallback "Số dư không đủ…"
  hiện có cho MỌI loại 409 khác từ `wallet-service`'s debit path, kể cả hạn mức tháng/pháp luật
  issue #7) — KHÔNG có message/UI riêng phân biệt "vượt hạn mức gia đình" khỏi "vượt hạn mức pháp
  luật"/"số dư không đủ" ở tầng member. Đây là giới hạn đã biết, ghi rõ ở đây để không ai nhầm là
  bug: phân biệt rõ ràng cần backend trả về 1 field/error-code riêng cho từng loại 409, ngoài phạm
  vi issue #12.
- **`describeApiError`'s `'family-wallet'` context mới** — copy cho 400 ("không thể đặt hạn mức
  cho chính mình"), 404 ("không tìm thấy tài khoản Ewallet Lab với SĐT này"), 409 ("thành viên này
  đã thuộc gia đình khác").
- **Build-arg MỚI**: `mfe-wallet/Dockerfile` thêm `ARG`/`ENV VITE_FAMILY_WALLET_SERVICE_URL` (đúng
  lỗi tái diễn ghi trong CLAUDE.md — mỗi remote gọi thêm service mới phải tự thêm build-arg riêng,
  không dùng chung với `VITE_WALLET_SERVICE_URL` dù cùng là "ví" về mặt tên gọi).
- **Ngoài phạm vi MVP** (ghi rõ theo đúng yêu cầu của issue #12 — giới hạn có chủ đích, không phải
  bug bị bỏ sót; chi tiết lý do ở backend `DESIGN.md`'s "Ví Gia Đình" section): (1) không có "ví
  con" không cần tài khoản riêng — member luôn là 1 user đã tồn tại, tự đăng nhập bằng tài khoản
  của chính mình, không có khái niệm "đăng nhập hộ"; (2) **không có giao diện app riêng cho trẻ
  em** — `FamilyWallet.tsx` và toàn bộ luồng chi tiêu của member dùng chung đúng 1 bộ UI
  `mfe-transfer`/`mfe-topup`/`mfe-bill-payment`/`mfe-wallet` như mọi user khác, không có theme/màn
  hình rút gọn riêng; (3) **không có thông báo real-time khi member chi tiêu** — nút "Xem lịch sử
  chi tiêu" trên `FamilyWallet.tsx` chỉ gọi API khi parent chủ động bấm (không poll nền, không
  push/websocket), parent phải tự mở lại màn hình để thấy giao dịch mới của member.
- **Không verify bằng browser automation thật** — cùng loại gap đã ghi ở §7–§14. Đã verify: build
  sạch `npm run build -w mfe-wallet`, image rebuild đúng tag (kèm build-arg mới) và redeploy, bundle
  chạy thật grep ra đúng chuỗi mới ("Ví Gia đình", "Xem lịch sử chi tiêu", ý tưởng VNPay), và toàn
  bộ luồng HTTP thật (thêm thành viên, member chi tiêu dưới/vượt hạn mức, xem lịch sử, và race
  thêm-thành-viên-đồng-thời sau khi fix — xem backend DESIGN.md's phần verify cho số liệu cụ thể)
  qua Ingress thật với 2 user đăng ký qua chính Ingress (1 parent, 1 member).

## 16. Quỹ nhóm (issue #14) — `FundHome.tsx`/`FundDetail.tsx` trong `mfe-transfer`, gọi `fund-service`

Kiến trúc đã chốt, nguồn UX đã fetch trực tiếp momo.vn/quy-nhom, luồng tiền (debit-trước/credit-
trước tuỳ thao tác), và bug fix race condition khi mời thành viên đồng thời đều ở backend
`DESIGN.md`'s "Quỹ nhóm" section — section này chỉ nói phần UI.

- **Tile "Quỹ" trong `mfe-transfer`'s `OTHER_SERVICES`** (vốn đã tồn tại sẵn, comingSoon) nay
  `wired: true`, đi khỏi shell's `ComingSoon.tsx`. Khác với split-bill/payment-link (1 state máy
  tuyến tính trong `App.tsx`), quỹ nhóm có 2 "screen" riêng trong `Step` union:
  `fund-list` (danh sách quỹ của tôi + tạo quỹ mới, `FundHome.tsx`) và `fund-detail` (chi tiết 1
  quỹ, `FundDetail.tsx`) — giống cấu trúc `split-group`/`split-create` của issue #11.
- **`FundHome.tsx`**: `fundService.listForMember(session.id)` hiển thị mọi quỹ user đang tham gia
  (creator hoặc member) + số dư + trạng thái (`DISSOLVED` hiện badge xám). Form tạo quỹ mới (tên +
  mục đích không bắt buộc) — tạo xong tự mở luôn `FundDetail` của quỹ vừa tạo.
- **`FundDetail.tsx`**: thẻ số dư quỹ, form "Góp quỹ" (mọi thành viên), form "Rút tiền"/nút "Giải
  thể quỹ" (CHỈ hiện nếu `fund.creatorUserId === selfUserId`, khớp đúng MVP chỉ-creator-được-rút
  của backend), danh sách thành viên, lịch sử giao dịch (ẩn/hiện, không tái dùng `TransactionRow`
  của `packages/ui` vì `FundTransactionType` {CONTRIBUTION, WITHDRAWAL, DISSOLVE} khác hẳn
  `TransactionType` {TOPUP, WITHDRAW, TRANSFER_OUT, TRANSFER_IN, BILL_PAYMENT} của ví chính — tự vẽ
  1 bảng map icon/label/dấu +/- riêng cho loại này thay vì ép kiểu).
- **Step-up (#15) xử lý CỤC BỘ ngay trong `FundDetail.tsx`, KHÔNG đẩy lên `App.tsx`'s `Step`
  union** — khác với transfer/bank-transfer-out (vốn có 1 step `'step-up'` riêng ở tầng `App.tsx`).
  Lý do: `StepUpModal` vốn đã là 1 overlay `position: fixed` (`zIndex: 1000`), không bắt buộc phải
  là "cả màn hình" — composable trực tiếp bên trong bất kỳ screen nào đang giữ state liên quan
  (amount vừa nhập, callback `onConfirm` retry đúng request cũ với `stepUpConfirmed: true`). Làm
  cục bộ ở đây tránh phải nhồi thêm `fundId`/`amount` vào `App.tsx`'s `Step` union chỉ cho 1 luồng
  — các luồng khác dùng `Step`-level vì chúng vốn đã đa bước (chọn người nhận → nhập tiền → xác
  nhận), còn góp quỹ là 1 form đơn lẻ ngay trên cùng màn hình.
- **`describeFundError` riêng, KHÔNG dùng `describeApiError`'s union type** — cùng lý do
  `describeSplitError` của issue #11: `fund-service` trả về rất nhiều message 403/404/409 khác
  nhau, đã cụ thể/có nguồn sẵn ở tầng Java (`FundMutationExecutor`/`FundService`), hiển thị nguyên
  văn hữu ích hơn gộp vào vài bin chung của `describeApiError`. Đây là ngoại lệ đã có tiền lệ (#11),
  không phải lần đầu lệch khỏi quy ước CLAUDE.md "luôn mở rộng `describeApiError`" — áp dụng khi số
  lượng message riêng biệt đủ nhiều để việc gộp bin làm mất thông tin hữu ích.
- **Build-arg MỚI**: `mfe-transfer/Dockerfile` thêm `ARG`/`ENV VITE_FUND_SERVICE_URL` — đã verify
  grep bundle đang chạy thật trong cluster KHÔNG còn `localhost:8099` (giá trị default khi quên
  build-arg), chỉ có `api.ewallet-lab.local`.
- **Creator tự động là 1 `FundMember` của quỹ do chính họ tạo** (xem backend
  `FundService.create`) — hiển thị nguyên trong danh sách thành viên kèm nhãn "(người tạo)", không
  có UI đặc biệt nào khác biệt họ khỏi member thường ngoài 2 action rút/giải thể chỉ họ nhìn thấy.
- **Ngoài phạm vi MVP** (giống phần tương ứng ở backend DESIGN.md): không có luồng "member yêu cầu
  rút + creator duyệt" (MoMo thật có, lab bỏ hẳn bước duyệt trung gian — creator rút trực tiếp
  không cần request từ member nào); không có màn hình riêng hiển thị hạn mức 2 quỹ tự tạo/20 quỹ
  tham gia/200 thành viên/quỹ của MoMo thật (lab không giới hạn các con số này); không có UI sinh
  lãi ("Sinh Lời Trên Quỹ Nhóm").
- **Không verify bằng browser automation thật** — cùng loại gap đã ghi ở §7–§15. Đã verify: build
  sạch `npm run build -w mfe-transfer` + `npx tsc --noEmit` sạch, image rebuild đúng tag (kèm
  build-arg mới) và redeploy, grep bundle `mfe-transfer` đang chạy thật trong cluster ra đúng chuỗi
  mới ("Quỹ nhóm", `fundService`) và đúng `api.ewallet-lab.local` (không phải `localhost:8099`), và
  toàn bộ luồng HTTP thật (tạo quỹ, mời 2 thành viên, góp quỹ đồng thời, rút/giải thể bởi creator,
  chặn member/outsider, race ≥8 và ≥20-30 concurrent) qua Ingress thật — xem backend DESIGN.md's
  phần verify cho số liệu cụ thể.

## 17. Quản lý chi tiêu (issue #16) — `SpendingReport.tsx` trong `mfe-wallet`, gọi `wallet-service`

Nguồn MoMo thật, định nghĩa "chi tiêu", phạm vi cắt (chỉ làm "Báo cáo", không category/ngân sách/
chatbot) và query strategy đều ở backend `DESIGN.md`'s "Quản lý chi tiêu" section — section này chỉ
nói phần UI. Không phải điểm rẽ kiến trúc — không build-arg mới (gọi lại đúng
`VITE_WALLET_SERVICE_URL` đã có sẵn, cùng service với `getBalance`/`getTransactions`).

- **Tile "Quản lý chi tiêu" trong `Home.tsx`'s `MAIN_GRID`** đổi `real: true` (trước đó rơi vào
  `ComingSoon` generic fallback vì `ComingSoon.tsx`'s `COPY` map chưa từng có entry `spending`).
  `handleGridClick` thêm 1 nhánh rẽ riêng cho key `spending` (gọi `onSpendingReport`) — đặt TRƯỚC
  nhánh `else if (item.real) onTransfer()` dùng chung cho các tile `real` khác, tránh bị nhánh đó
  nuốt mất và điều hướng nhầm sang `mfe-transfer`.
- **`SpendingReport.tsx`** — màn mới, expose qua Module Federation (`./SpendingReport` trong
  `mfe-wallet/vite.config.ts`), wire ở `shell/src/App.tsx` (flow `'spending-report'`) giống đúng
  pattern `FamilyWallet`/`SavingsPocket`. 2 nút toggle "Tuần này"/"Tháng này" (không dùng component
  `Tabs` nào — codebase chưa có, tự vẽ 2 nút giống style segmented control), gọi
  `walletService.getSpendingReport(session.id, period)` mỗi khi đổi period. Card tổng chi tiêu +
  breakdown 3 loại (Rút tiền/Chuyển tiền/Thanh toán hoá đơn) với thanh tỷ lệ phần trăm trên tổng —
  tái dùng đúng kiểu thanh progress thủ công (`div` cao 6px) đã dùng ở `FamilyWallet.tsx`'s hạn mức
  gia đình, không phải component `ProgressBar` của `packages/ui` (component đó là spinner "đang
  tải", không phải thanh phần trăm) — `ProgressBar` CÓ được tái dùng đúng vai trò của nó, cho
  trạng thái loading khi đang gọi API.
- **`walletService.getSpendingReport`** (api-client) — type `SpendingReport`/`SpendingPeriod` mới
  trong `walletService.ts`, breakdown kiểu `Partial<Record<TransactionType, number>>` (không phải
  `Record` đầy đủ, dù backend luôn trả đủ cả 3 key — giữ type phòng thủ phía frontend, không ép
  buộc giả định về response shape của 1 service khác).
- **Không có UI cho "so sánh kỳ trước"** — backend không trả field này (nice-to-have, không làm ở
  MVP này), frontend không tự bịa UI cho dữ liệu không tồn tại.
- **Không verify bằng browser automation thật** — cùng loại gap đã ghi ở §7–§16. Đã verify: build
  sạch `npm run build -w mfe-wallet` + `npm run build -w shell` + `npx tsc --noEmit -p mfe-wallet`
  sạch, image rebuild đúng tag (`mfe-wallet`, `shell`) và redeploy, grep bundle `mfe-wallet` đang
  chạy thật trong cluster ra đúng chuỗi mới ("Tuần"/"Tháng"/"chi tiêu"/nguồn "quan-ly-chi-tieu")
  trong chunk `SpendingReport-*.js`, và đúng path `spending-report` + base URL
  `api.ewallet-lab.local` (không phải `localhost:8091`) trong chunk `walletService-*.js`. Verify
  luồng HTTP thật qua Ingress (`http://api.ewallet-lab.local`, user đăng ký qua chính Ingress): tạo
  đủ 4 loại giao dịch → `spending-report?period=week`/`month` đều trả đúng tổng + breakdown, TOPUP
  không bị tính — xem backend DESIGN.md's phần verify cho số liệu cụ thể. CORS qua origin
  `http://shell.ewallet-lab.local` xác nhận `Access-Control-Allow-Origin` đúng.

## 18. Sàn Đầu Tư (issue #25) — Chứng chỉ quỹ mở mô phỏng (`InvestmentFund.tsx` trong `mfe-wallet`)

Nguồn khảo sát MoMo thật: `momo.vn/san-dau-tu` (hợp tác đối tác quản lý quỹ Dragon Capital, SSIAM, VCBF, IPAAM). Đây là sản phẩm thuộc nhóm tích luỹ/đầu tư sinh lời có tiềm năng biên lợi nhuận cao (phí phân phối/AUM) theo định hướng backlog của dự án. Khác với Túi Thần Tài (issue #13, lãi suất cố định mô phỏng ~4.7%/năm, số dư luôn tăng), **Sàn Đầu Tư là sản phẩm có rủi ro thị trường: Giá trị tài sản ròng (NAV/CCQ) biến động từng phiên và CÓ THỂ GIẢM**.

### 4 Ý Disclaimer rủi ro thị trường bắt buộc
Tuân thủ tuyệt đối yêu cầu của Issue #25 và chỉ đạo kiến trúc, frontend triển khai đầy đủ 4 ý disclaimer rủi ro thị trường:
1. **Mô phỏng học tập trong Ewallet Lab**: Sản phẩm sandbox nhằm nghiên cứu và thực hành kiến trúc hệ thống tài chính, không phải tổ chức phát hành hay đại lý phân phối chứng chỉ quỹ được cấp phép.
2. **KHÔNG PHẢI lời khuyên đầu tư thật**: Mọi số liệu, tỷ suất sinh lời và khuyến nghị chỉ có giá trị mô phỏng kỹ thuật.
3. **KHÔNG CÓ quỹ/công ty quản lý quỹ thật nào đứng sau**: Các thương hiệu quỹ lớn chỉ là nguồn tham khảo mô hình hợp tác, không có quan hệ đối tác thực tế.
4. **Giá trị "NAV" mô phỏng CÓ THỂ GIẢM**: Khác biệt cốt lõi với Túi Thần Tài — nhà đầu tư có thể chịu lỗ số dư mô phỏng nếu thị trường suy giảm, không cam kết bảo toàn vốn hay lợi nhuận tối thiểu.

### Cơ chế hiển thị Disclaimer
- **Modal chặn luồng (`MarketRiskDisclaimerModal`)**: Tự động hiển thị khi người dùng lần đầu truy cập Sàn Đầu Tư hoặc khi người dùng chuẩn bị thực hiện giao dịch mua chứng chỉ quỹ. Modal hiển thị đầy đủ 4 ý disclaimer và yêu cầu tick checkbox xác nhận trước khi nút "Xác nhận & Tiếp tục" được kích hoạt.
- **Banner thường trực (`PermanentDisclaimerBanner`)**: Ghim ở đầu mọi màn hình của Sàn Đầu Tư với style cảnh báo (`--el-amber-soft`, icon `warning`), kèm nút "Chi tiết ›" để mở lại modal disclaimer bất cứ lúc nào.

### Cấu trúc màn hình và luồng tương tác
- **Entry point**: Màn hình chính `Home.tsx` tích hợp thẻ truy cập nhanh "Sàn Đầu Tư · Chứng chỉ quỹ mở" ngay dưới strip số dư các ví, đồng thời có teaser trong mục "Khám phá thêm" (`FEED_TEASERS`).
- **Màn hình `InvestmentFund.tsx`** (expose qua Module Federation `./InvestmentFund`, tích hợp trong `shell/src/App.tsx` với flow `'investment-fund'`):
  - **Tab 1 — Khám phá Quỹ (Marketplace)**: Danh sách 3 chứng chỉ quỹ mở mô phỏng phân theo khẩu vị rủi ro:
    - `VF-GROWTH` (Quỹ Cổ Phiếu Tăng Trưởng) — Rủi ro cao, NAV ban đầu 15.000đ.
    - `VF-BALANCED` (Quỹ Cân Bằng Năng Động) — Rủi ro vừa (50% cổ phiếu, 50% trái phiếu), NAV ban đầu 12.000đ.
    - `VF-BOND` (Quỹ Trái Phiếu An Toàn) — Rủi ro thấp, NAV ban đầu 10.500đ.
    - Thẻ quỹ hiển thị NAV hiện tại, tỷ lệ % tăng/giảm (+/-) với màu sắc trực quan (accent/green khi dương, red/danger khi âm), phân loại rủi ro.
    - Bấm vào quỹ mở Card chi tiết quỹ: Biểu đồ/bảng lịch sử 5 phiên gần nhất, chiến lược đầu tư và nút "Đặt lệnh Mua CCQ".
  - **Tab 2 — Tài sản của tôi (Portfolio)**:
    - Card tổng quan tài sản: Tổng giá trị đầu tư, Tổng vốn đã mua, Lợi nhuận tạm tính (VND và %).
    - Danh sách CCQ nắm giữ: Tên quỹ, số lượng CCQ, NAV hiện tại, giá trị danh mục, lãi/lỗ (+/-) kèm nút "Bán CCQ" và "Mua thêm".
    - Lịch sử đặt lệnh: Danh sách các lệnh MUA/BÁN đã khớp, hiển thị thời gian, số lượng CCQ, tổng tiền và badge trạng thái `MATCHED`.
- **Luồng Đặt lệnh Mua (Buy Flow)**:
  - Nhập số tiền đầu tư (tối thiểu 10.000đ), có các nút chọn nhanh (50k, 100k, 500k, 1M, 10M).
  - Tự động quy đổi số CCQ dự kiến: `Số tiền / NAV`.
  - Hiển thị số dư ví chính khả dụng.
  - Tuân thủ QĐ 2345/QĐ-NHNN: Tích hợp `StepUpModal` khi số tiền mua > 10.000.000đ hoặc vượt hạn mức tích luỹ ngày.
  - Khi xác nhận, gọi `POST /investments/orders/buy` với `disclaimerAccepted: true`. Tiền trích nợ ví chính với loại giao dịch `INVESTMENT_BUY` (tính vào hạn mức tháng Điều 26 TT 40).
- **Luồng Đặt lệnh Bán (Sell Flow)**:
  - Nhập số lượng CCQ muốn bán hoặc chọn checkbox "Bán tất cả".
  - Tự động tính số tiền dự kiến nhận về ví: `Số CCQ × NAV`.
  - Bán không cần Step-up vì là dòng tiền vào (credit ví chính với loại giao dịch `INVESTMENT_SELL`), không tính vào hạn mức chi tiêu tháng.
- **Nút "Mô phỏng phiên NAV"**: Gọi `POST /investments/funds/tick-nav` để tạo biến động giá ngẫu nhiên (tăng hoặc giảm trong biên độ ±5%), giúp kiểm thử real-time việc tính toán P&L lãi/lỗ và phản ứng giao diện.

## 19. Thanh toán hoá đơn tự động (issue #26) — Auto-debit Mandates trong `mfe-bill-payment`

Nguồn khảo sát MoMo thật: `momo.vn/hoi-dap/thanh-toan-hoa-don-tu-dong` (tính năng đăng ký uỷ quyền trích nợ tự động, cài đặt hạn mức thanh toán tối đa Max cap và chu kỳ quét cước).

### Thiết kế UI/UX và luồng tương tác
- **Toggle đăng ký Auto-debit (`BillConfirm.tsx`)**:
  - Đặt ngay bên dưới thông tin chi tiết hoá đơn tại bước xác nhận thanh toán.
  - Switch/checkbox: "Tự động thanh toán kỳ sau (Auto-debit)" kèm badge "Tiện ích".
  - Khi bật toggle, mở rộng khung cấu hình với design token rõ ràng (`--el-surface-2`, `--el-line`, `--el-shadow`):
    - **Hạn mức thanh toán tối đa mỗi kỳ (Max cap)**: Trường nhập số tiền với gợi ý mặc định tự động làm tròn lên 1.5x số tiền hoá đơn hiện tại (ví dụ hoá đơn 350.000đ -> mặc định max cap 550.000đ).
    - **Cơ chế an toàn (Safety Protection)**: Ghi chú giải thích rõ ràng "Nếu hoá đơn kỳ tới vượt quá hạn mức này, hệ thống sẽ KHÔNG tự động trừ tiền mà gửi thông báo để bạn duyệt thủ công" — tránh trường hợp hoá đơn phát sinh bất thường (rò rỉ nước, thiết bị điện chập chờn) làm cạn tiền ví người dùng.
    - **Nguồn tiền trích nợ**: Mặc định là Ví chính.
    - **Thời điểm quét**: Định kỳ hàng tháng khi nhà cung cấp phát hành hoá đơn mới.
- **Thẻ xác nhận kết quả (`BillReceipt.tsx`)**:
  - Sau khi thanh toán thành công, nếu người dùng đã bật Auto-debit, màn hình biên lai hiển thị Card nổi bật với `StatusPill` trạng thái `ACTIVE` ("Đang bật").
  - Ghi nhận rõ mã khách hàng, loại dịch vụ và hạn mức tối đa/kỳ đã đăng ký.
- **Quản lý uỷ quyền tự động (`BillLookupForm.tsx`)**:
  - Bổ sung thanh tab chuyển đổi: "Tra cứu hoá đơn" và "Uỷ quyền tự động (Auto-debit)".
  - Tab "Uỷ quyền tự động" liệt kê tất cả các mandate đã đăng ký của người dùng, hiển thị loại dịch vụ, mã khách hàng, hạn mức tối đa/kỳ và nút "Huỷ uỷ quyền" cho phép người dùng chủ động tắt tính năng bất kỳ lúc nào.
- **Mô-đun quản lý uỷ quyền (`mandates.ts`)**: Lưu trữ và đồng bộ trạng thái mandate cục bộ theo từng `userId`, sẵn sàng kết nối liền mạch với `bill-payment-service` backend khi các endpoint mandate REST API hoàn thiện.

## 20. Heo Tiết Kiệm / Mục tiêu tiết kiệm (issue #27) — Goal-based Savings trong `mfe-wallet`

Nguồn khảo sát MoMo thật: `momo.vn/heo-dat-momo` (Heo Đất MoMo / Tiết kiệm mục tiêu — tính năng chia nhỏ dòng tiền cá nhân theo từng mục tiêu tích luỹ cụ thể như Quỹ dự phòng, Mua xe, Du lịch...).
Kiến trúc: Theo phương án (a) đã chốt bởi Operator, `SavingsGoal` mở rộng trực tiếp trên `wallet-service` (cùng DB `ewallet_wallet` và bảng `transactions`). Frontend tái sử dụng biến `VITE_WALLET_SERVICE_URL`, không cần khai báo service URL mới.

### Thiết kế UI/UX và luồng tương tác
- **Entry point**:
  - `Home.tsx` tích hợp mục "Heo Tiết Kiệm" trong danh sách "Khám phá thêm" (`FEED_TEASERS`), icon `savings`, điều hướng trực tiếp sang màn hình `SavingsGoals.tsx`.
- **Màn hình `SavingsGoals.tsx`** (expose qua Module Federation `./SavingsGoals`, wire trong `shell/src/App.tsx` với flow `'savings-goals'`):
  - **Banner lưu ý học tập**: Ghim ở đầu màn hình với badge cảnh báo thông tin mô phỏng ("Heo Tiết Kiệm là tính năng mô phỏng cho mục đích học tập. Tiền được quản trị nội bộ theo phương án mở rộng ví chính, không sinh lãi suất ngân hàng").
  - **Thẻ tổng quan tích luỹ**: Hiển thị tổng số tiền đang tiết kiệm trên tất cả mục tiêu (`totalSaved`), số dư ví chính khả dụng và nút "+ Tạo mục tiêu".
  - **Danh sách mục tiêu**:
    - Mỗi mục tiêu hiển thị tên mục tiêu, hạn chót (`targetDate`), `StatusPill` trạng thái (`IN_PROGRESS` / `COMPLETED`).
    - Thanh tiến độ ProgressBar hiển thị tỷ lệ % hoàn thành (`currentAmount / targetAmount`), tự động đổi màu đậm khi đã đạt 100%.
    - Các nút hành động: "Nạp thêm" (từ ví chính vào mục tiêu), "Rút về ví" (từ mục tiêu về ví chính), "Lịch sử" (xem nhật ký giao dịch của mục tiêu).
  - **Modal Tạo mục tiêu mới**: Nhập tên mục tiêu, số tiền kỳ vọng (tối thiểu 10.000đ), ngày dự kiến hoàn thành.
  - **Modal Nạp tiền vào mục tiêu**: Nhập số tiền nạp từ ví chính. Tuân thủ QĐ 2345/QĐ-NHNN: Tích hợp `StepUpModal` khi giao dịch nạp vượt 10.000.000đ.
  - **Modal Rút tiền về ví chính**: Kiểm tra số dư mục tiêu khả dụng, loại trừ rủi ro rút quá số dư thực tế.
  - **Modal Lịch sử giao dịch**: Hiển thị danh sách các lần Nạp/Rút tương ứng của mục tiêu với timestamp và phân biệt màu số tiền (+/-).

## 21. Gói Voucher Hội Viên / Voucher Pass (issue #28) — `VoucherPass.tsx` trong `mfe-wallet` & tích hợp Voucher trong `mfe-bill-payment`

Nguồn tham khảo UX: MoMo Hội Viên Tiết Kiệm / Voucher Pass (mô hình người dùng trả phí mua gói hội viên định kỳ để nhận chùm voucher giảm giá cho các dịch vụ tiện ích như thanh toán hoá đơn, nạp điện thoại).

### Disclaimer bắt buộc
Ghim thường trực ở đầu màn hình `VoucherPass.tsx` với cảnh báo học tập mô phỏng:
*"Gói Voucher Hội Viên và Voucher giảm giá mô phỏng cho mục đích học tập — không có đối tác thương mại, sàn TMĐT hay ngân hàng thật đứng sau."*

### Cấu trúc màn hình và luồng tương tác
- **Entry point**:
  - `Home.tsx` tích hợp mục "Gói Voucher Hội Viên" trong danh sách "Khám phá thêm" (`FEED_TEASERS`), icon `sell`, điều hướng trực tiếp sang màn hình `VoucherPass.tsx`.
- **Màn hình `VoucherPass.tsx`** (expose qua Module Federation `./VoucherPass`, wire trong `shell/src/App.tsx` với flow `'voucher-pass'`):
  - **Banner lưu ý học tập**: Ghim ở đầu màn hình với badge cảnh báo thông tin mô phỏng.
  - **Tab 1 — Gói Hội Viên (Marketplace)**:
    - Danh sách các gói pass trong catalog (`PASS_BILL_SAVER`, `PASS_STUDENT`, `PASS_MEGA_COMBO`).
    - Mỗi gói hiển thị tên gói, giá mua (10.000đ - 25.000đ), tổng trị giá voucher nhận được (lên đến 45.000đ), số lượng voucher và thời hạn sử dụng.
    - Nút "Mua gói" trích tiền ví chính với giao dịch `VOUCHER_PASS_PURCHASE`. Sau khi mua thành công, tự động cập nhật danh sách voucher của tôi.
  - **Tab 2 — Voucher của tôi (My Vouchers)**:
    - Danh sách các voucher người dùng đang sở hữu, phân loại theo `StatusPill` (`AVAILABLE`, `USED`, `EXPIRED`).
    - Thẻ voucher hiển thị tiêu đề, mức giảm giá (số tiền cố định hoặc phần trăm kèm trần giảm giá), đơn hàng tối thiểu và hạn sử dụng.
- **Tích hợp Voucher trong `mfe-bill-payment`**:
  - **Màn hình xác nhận (`BillConfirm.tsx`)**:
    - Khi người dùng tra cứu ra hoá đơn, tự động gọi `voucherPassService.getUsableVouchers(userId, category, amount)` để lọc các voucher phù hợp danh mục và thoả mãn điều kiện đơn hàng tối thiểu.
    - Khối "Ưu đãi Voucher Pass": Tự động gợi ý voucher ưu đãi nhất hoặc cho phép người dùng chọn áp dụng từ danh sách.
    - Tự động tính toán số tiền giảm giá và số tiền thực trả:
      - Hiển thị giá gốc, số tiền voucher giảm giá (`-formatVnd(discountAmount)`), và tổng thanh toán thực tế.
      - Nút xác nhận thanh toán phản ánh số tiền sau giảm giá.
    - Truyền `voucherId` sang `billPaymentService.pay` để backend thực hiện atomic claim và trừ tiền ví chính.
  - **Biên lai thanh toán (`BillReceipt.tsx`)**:
    - Khi hoá đơn có áp dụng voucher (`discountAmount > 0`), biên lai hiển thị rõ ràng: Hoá đơn gốc (gạch ngang), Số tiền voucher giảm giá, và Số tiền thực tế trích trừ ví chính.

## 22. Bộ lọc lịch sử giao dịch thông minh & Xuất sao kê tài chính (issue #36) — `History.tsx` trong `mfe-wallet`, gọi `wallet-service`

Không có service mới, không có remote mới — nâng cấp đúng 1 màn hình (`History.tsx`) đã tồn tại từ
đầu dự án, trước đây chỉ gọi `walletService.getTransactions` (toàn bộ ledger, không lọc, không
phân trang). Backend tương ứng: wallet-service's `GET /wallets/{userId}/transactions/search` +
`GET /wallets/{userId}/statement` + `GET /wallets/{userId}/statement/export` (xem backend
DESIGN.md's mục "Bộ lọc lịch sử giao dịch thông minh & Xuất sao kê tài chính").

### Bộ lọc (Smart Filters)

- 3 tab lọc nhanh theo dòng tiền: **Tất cả / Tiền vào (+) / Tiền ra (-)** — map 1-1 với backend's
  `TransactionDirection` (query param `direction=IN|OUT`, bỏ trống = không lọc).
- 2 ô chọn ngày (`<input type="date">`, qua `TextField`) cho `fromDate`/`toDate`. Lưu ý xử lý
  biên: `toDate` của 1 ngày cụ thể là 00:00 ngày đó, nhưng backend's `toDate` là **exclusive upper
  bound** (xem `WalletService#searchTransactions`) — frontend tự cộng thêm 24h vào `toDate` trước
  khi gửi, để "Đến ngày 09/10" thực sự bao gồm TRỌN ngày 09/10, không bị cắt mất lúc 00:00:00.
- Phân trang qua nút "Tải thêm giao dịch" (không dùng scroll-infinite — đơn giản hơn, đủ cho MVP),
  `page`/`size` (mặc định 20/trang) bind trực tiếp vào `TransactionPage`'s `totalPages` để biết khi
  nào ẩn nút (hết trang).
- Đổi filter (tab/ngày) → reset về `page=0`, gọi lại từ đầu — không cộng dồn kết quả cũ của filter
  khác vào danh sách.

### Xuất sao kê tài chính

Nút "Xuất sao kê tháng" mở modal (style tái dùng đúng pattern `StepUpModal` — bottom-sheet, không
tạo component `Modal` chung mới cho riêng 1 chỗ dùng): chọn tháng qua `<input type="month">` → tự
gọi `walletService.getStatement` → hiển thị tóm tắt **Số dư đầu kỳ → Tổng tiền vào → Tổng tiền ra →
Số dư cuối kỳ** (đúng tên 4 mục acceptance criteria yêu cầu) → nút "Tải file CSV sao kê" mở URL
`walletService.getStatementCsvUrl(...)` bằng `window.open` (không qua `http.get` vì đây là file,
không phải JSON) — trình duyệt tự nhận `Content-Disposition: attachment` từ backend và hiện prompt
tải xuống, không cần code tải file thủ công ở frontend.

### Gap đã phát hiện khi làm ticket này — `TYPE_META`/`TransactionType` union thiếu vài giá trị

`packages/ui/TransactionRow.tsx`'s `TYPE_META` (quyết định icon/label/dấu +/- cho mỗi loại giao
dịch) và `packages/api-client/walletService.ts`'s `TransactionType` union **thiếu** `REFUND`,
`SAVINGS_GOAL_DEPOSIT`, `SAVINGS_GOAL_WITHDRAW`, `VOUCHER_PASS_PURCHASE` — gap có từ TRƯỚC ticket
này (các issue #27/#28 thêm enum vào backend nhưng không có ai cập nhật `TYPE_META`), chỉ lộ ra rõ
khi `History.tsx` giờ hiển thị TOÀN BỘ ledger qua bộ lọc mới (trước đây ít khi hiển thị đủ nhiều
loại giao dịch trong 1 lần xem để nhận ra gap). Đã bổ sung đủ cả 4, dấu +/- khớp đúng backend's
`TransactionType.direction()` (single source of truth mới thêm ở issue #36, xem backend DESIGN.md)
— không tự suy đoán, đọc trực tiếp javadoc của từng `TransactionType` constant trước khi gán dấu.

### Đã verify

- Build sạch `npm run build -w mfe-wallet` (exit 0) — 1 lỗi KHÔNG liên quan từ Module Federation's
  DTS type-generation step (`Home.tsx`/`SavingsGoals.tsx`/`TelcoTopup.tsx`/`VoucherPass.tsx` — các
  file đã có lỗi type TRƯỚC ticket này, không phải do thay đổi của #36 gây ra, xác nhận bằng cách
  chạy lại đúng lệnh `tsc` mà Vite báo lỗi và đọc danh sách file — không có `History.tsx`/
  `walletService.ts`/`TransactionRow.tsx` nào trong đó).
- Image rebuild đúng tag `ewallet-lab/mfe-wallet:local`, deploy thật, `imageID` pod khớp digest
  local. Grep bundle đang chạy thật trên pod xác nhận nội dung mới: `walletService-*.js` chứa
  `transactions/search`; `History-*.js` chứa `Xuất sao kê`; `http-*.js` baked đúng
  `http://api.ewallet-lab.local` cho `API_BASE.wallet` (không phải `localhost:8091` mặc định).
- **Chưa verify bằng browser automation thật** (click UI, chọn ngày, tải file CSV qua trình duyệt)
  — không có tool đó trong phiên này, cùng loại gap đã ghi nhận ở issue #3/#4/#8/#10. Đã verify đầy
  đủ phần backend (toàn bộ 3 endpoint mới) qua Ingress thật với dữ liệu thật trong backend
  DESIGN.md's mục tương ứng, và xác nhận TypeScript compile sạch cho code mới — phần còn thiếu DUY
  NHẤT là tương tác UI thật qua trình duyệt.

## 23. Thanh toán dịch vụ số & Giải trí (issue #30) — `DigitalServices.tsx` trong `mfe-bill-payment`, mở rộng `bill-payment-service`

Nguồn khảo sát MoMo thật: Mục "Dịch vụ số / Giải trí" (Spotify Premium, Netflix, VieON VIP, Google Play & Apple Gift Cards). Mở rộng dịch vụ hoá đơn hiện hữu (`bill-payment-service`) thay vì tạo pod mới, tiết kiệm tài nguyên cluster.

### Bắt buộc: Banner Disclaimer Lab Học Tập
Tuân thủ nghiêm ngặt quy định:
- Banner thường trực: *"Mô phỏng Lab học tập: Dịch vụ số & giải trí (Spotify, Netflix, VieON, App Store) được mô phỏng trong môi trường lab học tập — không có quan hệ thương mại thực tế với các nhà cung cấp."*

### Kiến trúc Backend (`bill-payment-service`)
- **Entities & Schema**:
  - Entity `DigitalSubscriptionOrder`: Lưu `userId`, `packageCode`, `packageName`, `category`, `price`, `accountIdentifier`, `activationCode`, `status`, `billPaymentId`.
  - Bổ sung `BillCategory` enum: `DIGITAL_SUBSCRIPTION`, `ENTERTAINMENT_STREAMING`, `APP_STORE_CODE`. Cập nhật CHECK constraint tương ứng trên Postgres DB `ewallet_bill_payment`.
  - Tính toàn vẹn sổ cái (Ledger Sanctity): Mỗi đơn hàng mua dịch vụ số tạo 1 bản ghi `BillPayment` với số tiền thanh toán, và gọi `wallet-service.debit(userId, price, "BILL_PAYMENT")`.
  - Trình sinh mã kích hoạt: Mã gồm 12 ký tự chữ hoa/số ngẫu nhiên chia 3 cụm `XXXX-YYYY-ZZZZ` (ví dụ: `SPTI-RKFS-LDMM`, `GPLY-DTWJ-KHF4`).
- **Endpoints**:
  - `GET /bills/digital-services`: Danh mục 5 gói dịch vụ (Spotify 59k, Netflix 260k, VieON 69k, Google Play 100k, Apple 100k).
  - `POST /bills/digital-services/subscribe`: Đặt mua gói, trừ tiền ví chính, sinh mã kích hoạt. Xử lý lỗi `HttpClientErrorException` (428 Step-up required, 409 Insufficient balance).
  - `GET /bills/digital-services/history?userId={userId}`: Lịch sử đơn hàng sắp xếp theo thời gian mới nhất.
  - `GET /bills/digital-services/{id}`: Xem chi tiết mã kích hoạt theo đơn hàng.

### Giao diện Người Dùng (`mfe-bill-payment`)
- Bổ sung tab "Dịch vụ số" trong thanh điều hướng của `BillLookupForm.tsx` (bên cạnh "Hoá đơn tiện ích" và "Uỷ quyền tự động").
- Component `DigitalServices.tsx`:
  - Hiển thị danh mục gói dịch vụ số kèm giá niêm yết rõ ràng.
  - Ô nhập email/số điện thoại tài khoản thụ hưởng.
  - Nút thanh toán tích hợp xử lý xác thực nâng cao (`StepUpModal` theo QĐ 2345/QĐ-NHNN).
  - Màn hình biên lai hiển thị mã kích hoạt nổi bật với nút "Sao chép mã" một chạm.
  - Mục xem lại danh sách mã kích hoạt đã mua và lịch sử giao dịch.

### Kết quả Kiểm Thử Độc Lập (E2E Verification via Ingress 18080)
Kịch bản kiểm thử tự động tại `scratch/test_verify_issue30.py` vượt qua 100%:
1. `GET /bills/digital-services`: Trả về đầy đủ danh mục 5 gói dịch vụ số.
2. Khởi tạo tài khoản & nạp 500.000 VND thành công.
3. Mua Spotify Premium: Trừ ví đúng 59.000 VND, sinh mã `SPTI-RKFS-LDMM`, trạng thái `COMPLETED`.
4. Mua mã thẻ Google Play: Trừ ví đúng 100.000 VND, sinh mã `GPLY-DTWJ-KHF4`, trạng thái `COMPLETED`.
5. `GET /bills/digital-services/history`: Trả về chính xác 2 đơn hàng theo thứ tự mới nhất.
6. `GET /bills/digital-services/{id}`: Trả về thông tin chi tiết đơn hàng khớp 100%.
7. Chặn tài khoản không đủ số dư: Bị từ chối chính xác với HTTP 409 Conflict ("Số dư không đủ để thanh toán gói dịch vụ số").
8. **Concurrency Race Test**: 10 luồng mua đồng thời với số dư chỉ đủ đúng 3 gói (177.000 VND) -> Kết quả chính xác tuyệt đối: 3 thành công (201), 7 xung đột (409), số dư ví cuối cùng đúng 0 VND, tuyệt đối không bị race condition hay double-debit.




## 23. Hệ thống Nhiệm vụ tích điểm / Gamification (issue #38) — `LoyaltyRewards.tsx` mở rộng, gọi `loyalty-service`

Mở rộng CHÍNH màn hình `LoyaltyRewards.tsx` (issue #19) thêm 2 widget mới ngay dưới `TierCard` —
không màn hình mới, không remote mới. Backend tương ứng: xem backend DESIGN.md's mục "Hệ thống
Nhiệm vụ tích điểm / Gamification (issue #38)".

### Widget "Điểm danh 7 ngày" (`CheckinStreakCard`)

7 ô vuông, ô đã đạt trong chuỗi hiện tại tô màu accent, ô mốc ngày 3/ngày 7 viền riêng + nhãn
"+15"/"+50". Tính `filledDays` = `currentStreakDay` (nếu ĐÃ điểm danh hôm nay, số này là ngày thật)
hoặc `currentStreakDay - 1` (nếu CHƯA điểm danh hôm nay, số này là ngày DỰ KIẾN nếu bấm ngay bây
giờ — xem `CheckInStatusDto`'s javadoc backend) — tránh tô sai 1 ô so với trạng thái thật. Nút
"Điểm danh ngay" disable khi `checkedInToday=true`, hiện số điểm dự kiến nhận ngay trên nút (preview
tính từ `currentStreakDay`, không cần gọi API thử).

### Widget "Nhiệm vụ kiếm điểm" (`MissionsCard`)

Danh sách 3 nhiệm vụ, icon đổi theo trạng thái (`radio_button_unchecked`/`check_circle`/`task_alt`
cho `IN_PROGRESS`/`COMPLETED`/`CLAIMED`). Nút "Nhận điểm" chỉ hiện khi `COMPLETED` — tự ẩn khi chưa
hoàn thành (không có nút disable gây hiểu nhầm "có thể bấm nhưng sẽ lỗi"), đổi thành badge "Đã
nhận" khi `CLAIMED`.

### Gap đã phát hiện + fix luôn — lịch sử điểm hiển thị sai label cho entry check-in/mission

Backend tái dùng `PointEntryKind.EARN` cho CẢ 3 nguồn điểm (thanh toán hoá đơn/điểm danh/nhiệm vụ),
phân biệt qua `tier` field (tiền tố `CHECK_IN_DAY_<n>`/`MISSION_<code>` — xem backend DESIGN.md).
`LoyaltyRewards.tsx`'s lịch sử điểm TRƯỚC KHI sửa sẽ hiện SAI "Thanh toán hoá đơn 0đ" cho MỌI entry
check-in/mission (vì code cũ giả định MỌI `EARN` đều từ bill payment). Đã thêm hàm
`describeEarnOrRedeem` đọc tiền tố `tier` để hiện đúng "Điểm danh ngày N trong chuỗi" / "Nhận điểm
nhiệm vụ: <code>" — và bỏ dòng phụ "· hạng <tier>" cho 2 loại entry này (tier ở đây không phải tên
hạng thật, hiện ra sẽ gây hiểu nhầm).

### `describeApiError` — thêm 2 context mới (`daily-checkin`, `mission-claim`)

Theo đúng convention CLAUDE.md ("thêm field mới vào union type khi thêm luồng nghiệp vụ mới, không
hardcode message rời rạc") — 409 của check-in (`"Bạn đã điểm danh hôm nay rồi."`) và mission-claim
(`"Nhiệm vụ này chưa hoàn thành hôm nay, hoặc đã được nhận điểm rồi."`) đều map qua
`packages/ui/formErrors.ts`, không viết message rời trong `LoyaltyRewards.tsx`.

### Đã verify

- Build sạch `npm run build -w mfe-wallet` (exit 0, không lỗi mới trong `LoyaltyRewards.tsx`/
  `loyaltyService.ts`/`formErrors.ts` — xác nhận bằng cách chạy lại `tsc` riêng, cùng cách verify
  đã dùng ở issue #36).
- Image rebuild đúng tag `ewallet-lab/mfe-wallet:local`, deploy thật, `imageID` khớp. Grep bundle
  đang chạy xác nhận "check-in"/"Điểm danh 7 ngày"/"Nhiệm vụ kiếm điểm" có trong
  `LoyaltyRewards-*.js` thật trên pod.
- Backend (3 endpoint mới + streak math + concurrency) đã verify đầy đủ qua Ingress thật với dữ
  liệu thật trong backend DESIGN.md — bao gồm 1 giao dịch `transfer-service` thật làm
  `DAILY_TRANSFER` chuyển `COMPLETED` đúng.
- **Chưa verify bằng browser automation thật** (click UI, xem 7 ô streak render đúng màu) — không
  có tool đó trong phiên này, cùng loại gap đã ghi nhận ở các issue #3/#4/#8/#10/#36.

## 24. Danh bạ người thụ hưởng & Lập lịch chuyển tiền định kỳ (issues #31, #32) — `mfe-transfer`

Mở rộng `mfe-transfer` thành trung tâm quản lý giao dịch P2P nâng cao với 2 màn hình mới (`SavedPayees.tsx`, `RecurringTransfers.tsx`) và tích hợp trực tiếp vào màn hình chính `TransferHome.tsx` cùng màn hình kết quả `TransferDone.tsx`.

### 1. Danh bạ người thụ hưởng (`SavedPayees.tsx` — Issue #32)

- **Giao diện & Chức năng**:
  - Danh sách người nhận hiển thị avatar tạo từ họ tên, nickname (nếu có), SĐT, icon yêu thích (ngôi sao vàng).
  - Thanh tìm kiếm tức thời theo tên/SĐT/nickname.
  - Quick action: Chuyển tiền nhanh ngay khi bấm vào người nhận, tự động điều hướng sang màn hình chuyển tiền với số điện thoại được điền sẵn.
  - Quản lý danh bạ: Thêm người nhận mới (tự động tra cứu tên từ `user-service`), cập nhật nickname, toggle yêu thích, xoá khỏi danh bạ kèm modal xác nhận an toàn.
- **Tích hợp vào Home**: Thanh "Chuyển nhanh cho người quen" cuộn ngang (horizontal avatar scroll) đặt ngay trên đầu `TransferHome.tsx` hiển thị các người nhận yêu thích và giao dịch gần đây, cho phép chuyển tiền 1 chạm.
- **Tích hợp vào Kết quả**: Nút "Lưu người nhận vào danh bạ" xuất hiện tại `TransferDone.tsx` sau khi giao dịch P2P thành công (nếu người nhận chưa có trong danh bạ), mở modal cho phép đặt nickname ngay lập tức.

### 2. Chuyển tiền định kỳ (`RecurringTransfers.tsx` — Issue #31)

- **Giao diện & Chức năng**:
  - Thẻ hiển thị các lịch chuyển tiền theo tần suất: Hàng ngày, Hàng tuần (kèm thứ trong tuần), Hàng tháng (kèm ngày trong tháng).
  - Trạng thái rõ ràng với `StatusPill`: Đang bật (`ACTIVE` - xanh lá), Tạm dừng (`PAUSED` - vàng cam), Đã huỷ (`CANCELLED` - xám).
  - Nút chuyển trạng thái nhanh (Tạm dừng / Kích hoạt lại / Huỷ lịch).
  - Nút "Lịch sử thực thi" mở modal chi tiết các lần chạy trong quá khứ kèm trạng thái `SUCCESS` / `FAILED_INSUFFICIENT_FUNDS` / `FAILED_STEP_UP_REQUIRED` và thông điệp lỗi cụ thể.
  - Form tạo lịch mới: Nhập SĐT, số tiền, lời nhắn, chọn chu kỳ và ngày kích hoạt. Tích hợp cảnh báo rõ ràng về giới hạn QĐ 2345/QĐ-NHNN (chỉ cho phép định kỳ tự động ≤ 10.000.000đ).

### 3. Đã verify

- Build sạch `npm run build -w mfe-transfer` (exit 0, Vite rollup hoàn tất).
- Rebuild docker image `ewallet-lab/mfe-transfer:local` và rollout thành công lên Minikube.
- Độc lập kiểm thử E2E backend thông qua Ingress Nginx (18080) đạt 100% 13/13 scenarios.

## 25. Nguồn tiền thanh toán ưu tiên & Trả góp Ví Trả Sau BNPL (issue #37) — `mfe-bill-payment`

Nâng cấp `mfe-bill-payment` hỗ trợ người dùng lựa chọn linh hoạt nguồn tiền thanh toán giữa **Ví chính** và **Ví Trả Sau (BNPL)**, đồng thời hiển thị cảnh báo, số dư và hạn mức trực quan theo thời gian thực.

### 1. Nguồn tiền thanh toán (`BillConfirm.tsx`)
- Thẻ lựa chọn nguồn tiền trực quan (Radio Cards):
  - **Ví chính**: Hiển thị số dư khả dụng từ `wallet-service`. Tự động vô hiệu hoá (disabled) kèm nhãn "Số dư không đủ" nếu số dư < số tiền thanh toán sau giảm giá.
  - **Ví Trả Sau (BNPL)**: Hiển thị hạn mức khả dụng từ `bnpl-service`. Nếu người dùng chưa mở Ví Trả Sau (`opened == false`), hiển thị badge "Chưa kích hoạt" và vô hiệu hoá lựa chọn. Nếu hạn mức < số tiền thanh toán, hiển thị nhãn "Hạn mức không đủ".
- Tự động gợi ý chuyển đổi nguồn tiền (Auto-fallback Suggestion):
  - Nếu nguồn tiền mặc định không đủ điều kiện (ví dụ: ví chính không đủ tiền nhưng BNPL đủ hạn mức), giao diện hiển thị banner thông báo đề xuất chuyển sang nguồn tiền còn lại.
- Tích hợp Step-Up Modal:
  - Nếu thanh toán bằng BNPL với số tiền > 10.000.000đ, màn hình mở `StepUpModal` (mô phỏng xác thực sinh trắc học theo QĐ 2345/QĐ-NHNN) trước khi gửi yêu cầu `pay()`.

### 2. Biên lai thanh toán (`BillReceipt.tsx`)
- Hiển thị badge nguồn tiền đã thanh toán: `Ví chính` (màu trung tính) hoặc `Ví Trả Sau` (màu tím/brand BNPL nổi bật).
- Hiển thị số dư ví chính hoặc hạn mức Ví Trả Sau còn lại sau khi thanh toán.

### 3. Đã verify
- Cập nhật `packages/api-client/src/billPaymentService.ts` bổ sung `PaymentSource`.
- Build sạch `npm run build -w mfe-bill-payment` (exit 0, rollup sạch).
- Rebuild docker image `ewallet-lab/mfe-bill-payment:local` và rollout thành công lên Minikube.
- Độc lập kiểm thử E2E backend/frontend thông qua Ingress Nginx (18080) đạt 100% 9/9 scenarios.

## 26. Mua vé xe khách, tàu hoả, máy bay (issue #33) — `mfe-bill-payment`

Mở rộng `mfe-bill-payment` với phân hệ đặt vé du lịch và vận tải trực tuyến (`TravelTicketing.tsx`) được tích hợp vào thanh điều hướng tab "Vé xe & Vé bay" trên màn hình chính `BillLookupForm.tsx`.

### 1. Tìm kiếm chuyến đi & Đặt vé
- Bộ lọc phương tiện linh hoạt: Tất cả, Xe khách (BUS), Máy bay (FLIGHT), Tàu hoả (TRAIN).
- Tra cứu theo điểm đi, điểm đến, và ngày khởi hành với danh sách chuyến đi trực quan.
- Hiển thị đầy đủ thông tin: Hãng vận chuyển (Phương Trang, Vietnam Airlines, Vietjet Air, Đường Sắt Việt Nam...), giá vé, số ghế trống khả dụng, và thời gian khởi hành/đến.
- Form nhập thông tin hành khách: Họ tên, số điện thoại, và số ghế mong muốn.
- Tuyên bố miễn trừ trách nhiệm bắt buộc: *"Hệ thống đặt vé du lịch và vé điện tử mô phỏng cho mục đích học tập — không có chuyến bay hay xe khách thật nào được đặt"*.

### 2. Quản lý Vé điện tử & Huỷ vé (E-Ticket)
- Tab "Vé của tôi" hiển thị danh sách vé điện tử đã đặt.
- Vé điện tử với mã đặt chỗ lớn (`BK-XXXXXX`), mã vé (`TK-XXXXXX`), trạng thái `Đã xác nhận` / `Đã huỷ & Hoàn tiền`.
- Khung mô phỏng mã QR vé điện tử dùng để làm thủ tục check-in hoặc lên xe.
- Tính năng Huỷ vé: Hoàn lại **85% giá vé** về ví chính của người dùng kèm modal xác nhận an toàn, phục hồi lại ghế trống cho chuyến đi.

### 3. Đã verify
- Thêm `travelBookingService` trong `packages/api-client`.
- Build sạch `npm run build -w mfe-bill-payment` (exit 0, rollup hoàn tất).
- Rebuild docker image `ewallet-lab/mfe-bill-payment:local` và rollout thành công lên Minikube.
- Độc lập kiểm thử E2E backend/frontend thông qua Ingress Nginx (18080) đạt 100% 7/7 test suites (bao gồm concurrency race test 10 luồng tranh 1 ghế cuối cùng không overselling).

## 27. Bảo hiểm vi mô (issue #35) — `MicroInsurance.tsx` trong `mfe-bill-payment`

Tích hợp sản phẩm bảo hiểm vi mô (Xe máy bắt buộc TNDS & Tai nạn cá nhân) vào thanh điều hướng tab "Bảo hiểm" trong `BillLookupForm.tsx`.

### 1. Banner Disclaimer Lab Học Tập Bắt Buộc
Hiển thị thường trực ở đầu giao diện:
*"Sản phẩm bảo hiểm vi mô và Giấy chứng nhận điện tử hoàn toàn là MÔ PHỎNG cho mục đích học tập — KHÔNG có công ty bảo hiểm thật đứng sau và KHÔNG có giá trị pháp lý thay thế bảo hiểm thật khi tham gia giao thông."*

### 2. Luồng Chọn Sản Phẩm & Mua Bảo Hiểm
- Danh mục sản phẩm:
  - **Bảo hiểm bắt buộc TNDS xe máy**: 66.000đ / 12 tháng, quyền lợi tối đa 150.000.000đ. Form yêu cầu bắt buộc: Họ tên, Số CCCD, Biển số xe.
  - **Bảo hiểm tai nạn cá nhân cơ bản**: 30.000đ / 30 ngày, quyền lợi tối đa 20.000.000đ. Form yêu cầu: Họ tên, Số CCCD.
- Xác thực số dư ví chính và xử lý lỗi trực quan (ví dụ báo số dư không đủ).

### 3. Giấy Chứng Nhận Điện Tử (E-Certificate)
- Tab "Hợp đồng của tôi": Danh sách các gói bảo hiểm đã mua kèm `StatusPill` (`ACTIVE`, `EXPIRED`).
- Màn hình E-Certificate trang trọng:
  - Khung giấy chứng nhận với huy hiệu bảo vệ mô phỏng, số chứng nhận lớn (`BH-XM-*`, `BH-TN-*`).
  - Thông tin chủ sở hữu, biển số xe, thời hạn hiệu lực rõ ràng từ ngày cấp đến ngày hết hạn.
  - Mã QR mô phỏng dùng để quét tra cứu thông tin hợp đồng.

### 4. Đã verify
- Thêm `insuranceService` trong `packages/api-client`.
- Build sạch `npm run build -w mfe-bill-payment` (exit 0, rollup hoàn tất).
- Rebuild docker image `ewallet-lab/mfe-bill-payment:local` và rollout thành công lên Minikube.
- Độc lập kiểm thử E2E backend/frontend thông qua Ingress Nginx (18080) đạt 100% 9/9 test suites.

## 28. Thiệp mừng điện tử & Lì xì theo chủ đề (issue #34) — `GiftCards.tsx` trong `mfe-transfer`

Tích hợp sản phẩm Thiệp mừng điện tử & Lì xì theo chủ đề vào `mfe-transfer` với màn hình mới `GiftCards.tsx`, kích hoạt từ nút "Gửi thiệp" trong danh sách dịch vụ khác trên `TransferHome.tsx`.

### 1. Luồng Gửi Thiệp Mừng (Send Flow)
- Tìm kiếm người nhận theo số điện thoại (tự động tra cứu tên từ `user-service`).
- Bộ chọn mẫu thiệp gồm 4 chủ đề trang trọng:
  - `BIRTHDAY_CHEER`: Sinh nhật (Icon bánh kem, tông màu vàng/cam).
  - `WEDDING_LOVE`: Cưới hỏi (Icon trái tim, tông màu đỏ/hồng).
  - `THANK_YOU_WARM`: Cảm ơn (Icon bàn tay cái, tông màu xanh lá).
  - `CONGRATS_SUCCESS`: Chúc mừng thành công (Icon cúp vàng, tông màu tím/vàng).
- Khung xem trước trực tiếp (Live Preview): Thẻ thiệp hiển thị biểu tượng chủ đề, lời chúc tuỳ biến, người gửi, người nhận và số tiền mừng dự kiến.
- Ô nhập số tiền mừng (kèm các nút chọn nhanh 50k, 100k, 200k, 500k, 1M, 2M) và ô chỉnh sửa lời chúc cá nhân hoá.
- Tích hợp `StepUpModal` theo QĐ 2345/QĐ-NHNN khi số tiền gửi > 10.000.000đ.

### 2. Luồng Mở Thiệp & Phản Hồi Cảm Ơn (Receive & Reply Flow)
- Tab "Thiệp đã nhận": Danh sách các thiệp người dùng nhận được từ bạn bè, phân loại `Thiệp mới` / `Đã mở`.
- Hiệu ứng bóc phong bì thiệp mừng: Mở modal xem thiệp trang trọng với số tiền mừng lớn và lời chúc ý nghĩa.
- Gửi lời cảm ơn: Khung phản hồi trực tiếp cho phép người nhận gửi lời cảm ơn nhanh đến người gửi (tối đa 255 ký tự).
- Tab "Đã gửi": Theo dõi trạng thái thiệp người gửi đã trao (Người nhận đã mở chưa, thời điểm mở) và xem lại lời cảm ơn phản hồi từ người nhận.

### 3. Đã verify
- Thêm `giftCardService` trong `packages/api-client`.
- Cập nhật `TransferHome.tsx` và `App.tsx` wire tính năng `send-card`.
- Build sạch `npm run build -w mfe-transfer` (exit 0, rollup hoàn tất).
- Rebuild docker image `ewallet-lab/mfe-transfer:local` và rollout thành công lên Minikube.
- Độc lập kiểm thử E2E backend/frontend thông qua Ingress Nginx (18080) đạt 100% 13/13 test suites.



