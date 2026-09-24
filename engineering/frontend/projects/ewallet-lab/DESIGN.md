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
