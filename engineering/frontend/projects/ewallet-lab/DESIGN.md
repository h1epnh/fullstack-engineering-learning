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

## 8b. VietQR chuẩn NAPAS cho màn "Nhận tiền" (issue #44) — `ReceiveQr.tsx` + `vietQrService.ts`

Màn "Nhận tiền" có 2 tab: **QR nội bộ** (§8, không đổi: `ewalletlab://pay?phone=…`, #4/#39 không bị
đụng) và **QR ngân hàng (VietQR)**. Thuần frontend, không endpoint/entity backend mới, không build-arg
mới (browser gọi thẳng `img.vietqr.io`; `LinkedBankAccount` lấy qua `topupService.getLinkedAccounts`
mà `mfe-wallet` vốn đã có `VITE_TOPUP_SERVICE_URL`).

- **Luồng**: chọn 1 `LinkedBankAccount` của chính session user (lọc `a.userId === session.id`, không
  sinh QR cho tài khoản người khác) → map `bankCode` → `bin` bằng `vietQrService.listBanks()` (so
  khớp `code` không phân biệt hoa thường; không có trong danh sách thì báo rõ, không đoán BIN) → dựng
  URL bằng `buildVietQrImageUrl`: `https://img.vietqr.io/image/<BIN>-<SỐ_TK>-compact2.svg?amount=&addInfo=&accountName=`.
  `addInfo` đi qua `sanitizeVietQrText` (bỏ dấu tiếng Việt, đ->d, chỉ giữ `[A-Za-z0-9 ]`, tối đa 50 ký
  tự — đúng quy tắc nguồn). Số tiền để trống = QR không nhúng số tiền (người quét tự nhập).
- **Rate limit / lỗi**: debounce 700ms khi gõ số tiền/nội dung; set URL đã tải thành công (cộng
  `cache-control: public, max-age=86400` của server) nên chọn lại cùng tham số không gọi lại; tải bằng
  `Image()` preload, lỗi -> thông báo rõ + nút "Thử lại". Không dùng `fetch()` vì (xem bên dưới) phản
  hồi 429 không có header CORS nên `fetch` không đọc được status.
- **"Giả lập" nói thẳng trên UI** (`data-testid="vietqr-mock-notice"`): QR đúng chuẩn nên app ngân hàng
  thật đọc được, nhưng tài khoản liên kết là dữ liệu giả lập; tiền chuyển vào từ ngân hàng ngoài
  KHÔNG tự cộng vào ví lab. Không có luồng "đã nhận tiền" giả nào được thêm trong ticket này.
- Logo ngân hàng chỉ lấy từ `bank.logo` của VietQR API (đã lọc `momo` như cũ). Không dùng logo MoMo.

### Spike `img.vietqr.io` — thử thật ngày 2026-10-18 (đã xác minh bằng `curl`, không suy đoán)

| Câu hỏi | Kết quả |
|---|---|
| Cần API key? | **Không.** `GET https://img.vietqr.io/image/970415-113366668888-qr_only.png` -> 200 `image/png` không header xác thực nào. |
| URL pattern còn đúng sau đợt đổi API tháng 10/2026? | **Còn đúng** tại thời điểm thử (hôm nay 2026-10-18): `<BIN>-<STK>-<template>.png` + `?amount=&addInfo=&accountName=`. Chưa thấy dấu hiệu đổi; vẫn là rủi ro bên thứ ba. |
| **Thay đổi giữa 2 lần thử** | 2026-10-18: `.png` trả 200 `image/png` trực tiếp. **2026-10-22: `.png` trả `301` -> cùng URL đuôi `.svg`** (200 `image/svg+xml`, `access-control-allow-origin: *`; SVG gồm `<image>` PNG base64 cho logo/khung + `<path>` vector cho chính mã QR). Đây là dấu hiệu đợt đổi API tháng 10/2026 đang triển khai. App dùng thẳng `.svg` (tránh 1 redirect/lượt đếm). Mọi tool giải mã phải rasterize SVG (đã làm bằng Chrome) — trích PNG base64 bên trong KHÔNG chứa mã QR. |
| Header khi 200 | `access-control-allow-origin: *`, `cache-control: public, max-age=86400`, `cross-origin-resource-policy: cross-origin`, `vary: User-Agent, Sec-Fetch-Dest`, CSP `img-src data:` (CSP áp lên chính ảnh, không ảnh hưởng trang nhúng). Dùng được bằng thẻ `<img>`. |
| Rate limit | **Có, và thực thi thật**: bắn 100 request song song (50 đồng thời) -> 72x 200, 28x 429. Body 429: `{"code":"429","desc":"Truy vấn vượt quá mức thông thường. Vui lòng liên hệ quản trị viên để nâng cấp hạn mức sử dụng","data":null}` (`content-type: application/json`). |
| 429 có CORS header? | **Không** (không có `access-control-allow-origin`). Trong Chrome, `fetch()` cross-origin tới URL đang bị 429 bị chặn CORS và JS không đọc được status. Vì vậy UI dùng `<img>` + thông báo chung "có thể bị giới hạn". |
| Thời gian bị chặn | Sau 100 request dồn dập (+ vòng poll mỗi 5s của tôi), IP dev bị 429 liên tục ~**35 phút** (hết lúc ~17:47 cùng ngày, khớp header `retry-after: 2026` giây trong phản hồi 429), dài hơn nhiều so với cửa sổ "10 giây" ghi trên trang. Poll liên tục có thể tự kéo dài lệnh chặn. Đừng test tải bằng vòng lặp tới `img.vietqr.io`. |
| `accountName` | Truyền được nhưng **không** thấy trong chuỗi EMVCo (không có tag 59) — chỉ dùng để vẽ tên lên ảnh template `compact2`. |
| Điều khoản sử dụng / phí | **CHƯA ĐỌC.** Chưa xác minh điều khoản thương mại, SLA hay cam kết ổn định. |

### Giải mã QR để đối chiếu EMVCo (zxing-cpp, trên ảnh tải thật từ `img.vietqr.io`)

- Không số tiền (BIN 970415, STK 113366668888):
  `00020101021138560010A0000007270126000697041501121133666688880208QRIBFTTA53037045802VN6304F443`
  — tag 38 -> GUID `A000000727` (NAPAS), BIN `970415`, STK `113366668888`, dịch vụ `QRIBFTTA` (chuyển nhanh
  tới tài khoản), tag 53=`704` (VND), tag 58=`VN`, tag 01=`11` (QR tĩnh, không số tiền).
- Có số tiền 79000 + nội dung "Thanh toan don hang":
  `00020101021238560010A0000007270126000697041501121133666688880208QRIBFTTA53037045405790005802VN62230819Thanh toan don hang6304EAC8`
  — tag 01=`12` (QR động), tag 54=`79000`, tag 62/08=`Thanh toan don hang`.
- **Luồng UI thật qua Ingress (Chrome, tài khoản liên kết MB / 0123456789, URL `.svg` do chính UI dựng)**:
  - Không số tiền: `00020101021138540010A00000072701240006970422011001234567890208QRIBFTTA53037045802VN6304B1A7`
    -> BIN `970422` (MB), STK `0123456789`.
  - Số tiền 79000 + nội dung gõ "Thanh toán đơn hàng #12!": `00020101021238540010A00000072701240006970422011001234567890208QRIBFTTA53037045405790005802VN62260822Thanh toan don hang 1263042D73`
    -> tag 54 = `79000`, tag 62/08 = `Thanh toan don hang 12` (UI đã bỏ dấu và ký tự `#!`).
- `Lưu ảnh` (VietQR): `fetch()` cross-origin bị CORS chặn trong trình duyệt nên fallback mở ảnh ở tab mới; mặc định thử `fetch` -> blob.
- Kiểm thử trình duyệt: Chrome headless (playwright-core) qua `kubectl port-forward` tới ingress-nginx + `--host-resolver-rules`, vì `minikube tunnel` không sống. Đã xác nhận: bật 429 giả (route) -> hiện thông báo + Thử lại; chặn mạng -> cùng thông báo; tab QR nội bộ vẫn hiển thị.

### Ranh giới đã biết

- Đây KHÔNG phải thanh toán thật: không có webhook/IPN nào xác nhận tiền về, không có `mock-bank-gateway`
  cho chiều nhận tiền. Muốn minh hoạ "đã nhận tiền" phải làm ticket riêng và vẫn dán nhãn giả lập.
- Phụ thuộc bên thứ ba không SLA: nếu `img.vietqr.io` đổi URL/thêm API key (đợt thay đổi tháng
  10/2026), tính năng này hỏng ở UI với thông báo lỗi chung; QR nội bộ vẫn chạy.

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

## 29. Định danh cấp độ ví eKYC & Hạn mức xác thực (issue #40) — `Home.tsx` trong `mfe-wallet`

Tích hợp giao diện quản lý cấp độ định danh (eKYC tier) vào màn hình chính `Home.tsx` của `mfe-wallet`.

### 1. Banner cảnh báo trạng thái Chưa định danh (`UNVERIFIED`)
- Khi người dùng ở trạng thái `UNVERIFIED`, màn hình chính hiển thị banner cảnh báo màu vàng cam nổi bật:
  - Thông điệp: *"Ví chưa định danh eKYC — Hạn mức tối đa 5.000.000đ/tháng. Xác thực CCCD để mở hạn mức 100.000.000đ/tháng."*
  - Nút bấm *"Xác thực ngay"* mở modal giả lập định danh eKYC.
- Khi người dùng đã định danh (`VERIFIED`), hiển thị huy hiệu xanh lá cây tinh gọn: *"✓ eKYC Đã xác thực"* ngay cạnh tên người dùng.

### 2. Hộp thoại xác thực định danh (eKYC Verification Modal)
- Người dùng nhập số Căn cước công dân (12 chữ số) kèm ghi chú quy định Thông tư 41/2025/TT-NHNN.
- Thao tác gửi gọi đến `userService.verifyKyc(userId, cccdNumber)` để cập nhật trạng thái tài khoản lên `VERIFIED`.
- Sau khi xác thực thành công, modal đóng lại, banner cảnh báo biến mất, trạng thái hiển thị được cập nhật ngay lập tức mà không cần tải lại trang.

### 3. Đã verify
- Cập nhật `userService.ts` trong `packages/api-client` bổ sung kiểu `KycTier` và hàm `verifyKyc()`.
- Tích hợp banner và modal eKYC vào `Home.tsx` của `mfe-wallet`.
- Build sạch `npm run build -w mfe-wallet` (hoàn tất trong 3.34s).
- Rebuild docker image `ewallet-lab/mfe-wallet:local` và rollout thành công lên Minikube.
- Độc lập kiểm thử E2E qua Ingress Nginx (18080) đạt 100% các bước kiểm thử.

## 30. Tài khoản Merchant / Doanh nghiệp & QR Đa Năng thu hộ — Phí rút tiền merchant (issue #39)

Tích hợp giao diện và mô hình 2-sided platform cho người dùng doanh nghiệp/hộ kinh doanh (Merchant):

### 1. Mô hình 2-Sided Platform & Trải nghiệm Người dùng
- **Phía Consumer**: Hoàn toàn miễn phí khi quét mã QR thanh toán của cửa hàng/merchant (sử dụng hạ tầng QR hiện có của lab `parseEwalletLabQrPhone`).
- **Phía Merchant**:
  - Khởi tạo mã QR Đa Năng nhận tiền cố định: `ewalletlab://pay?merchant={id}&phone={phone}&name={name}`.
  - Phí thu hộ giao dịch: Hoàn toàn MIỄN PHÍ (0đ).
  - Rút tiền về ngân hàng:
    * Miễn phí hoàn toàn cho hạn mức 30.000.000đ/tháng dương lịch.
    * Vượt 30.000.000đ/tháng: tính phí 0,5% trên phần rút vượt hạn mức (chính sách MoMo thật ngày 20/09/2023).
- **Lưu ý & Disclaimer**: Mô phỏng phục vụ học tập, không có thẩm định hồ sơ đăng ký kinh doanh/KYC doanh nghiệp thật.

### 2. Giao diện Nạp/Rút (`mfe-topup`)
- Màn hình `NapRut.tsx`:
  - Trong chế độ Rút tiền (`mode === 'withdraw'`), hiển thị thông báo chính sách rút tiền merchant rõ ràng:
    * *"💡 Chính sách rút tiền Merchant: Miễn phí hạn mức 30.000.000đ/tháng dương lịch; vượt hạn mức tính phí 0,5% trên phần rút vượt (chính sách MoMo 20/09/2023). Mô phỏng phục vụ học tập."*
- Màn hình kết quả `WithdrawDone.tsx`:
  - Hiển thị chi tiết số dư mới và dòng thông báo phí rút tiền riêng biệt màu đỏ nếu có phát sinh phí vượt hạn mức (`fee > 0`).

### 3. Đã verify
- Cập nhật `packages/api-client`: Bổ sung `merchantService.ts` (`register`, `getByUserId`, `getById`), cập nhật `WithdrawalResponse` mang trường `fee`.
- Cập nhật `mfe-topup`: Hiển thị chính sách phí và chi tiết phí tại `NapRut.tsx`, `WithdrawDone.tsx`, `App.tsx`.
- Build sạch `npm run build -w mfe-topup`.
- Rebuild docker image `ewallet-lab/mfe-topup:local` và deploy lên Minikube.
- Độc lập kiểm thử E2E qua Ingress Nginx (18080) đạt 100% 11/11 test cases bao gồm concurrency 20 requests.

## 31. Touch ID thật (WebAuthn) cho Step-up — issue #41 — `StepUpModal` (packages/ui) + Account.tsx (shell)

TLS cho Ingress + bảng `webauthn_credentials` mới ở backend `DESIGN.md`'s mục cùng tên — section
này chỉ nói phần UI. **Yêu cầu cứng của issue #41 đã tuân thủ: KHÔNG đổi public API của
`StepUpModal`** (`message`/`onConfirm`/`onCancel`) — cả 8 call site thật trong repo hiện tại
(`mfe-transfer/App.tsx`, `mfe-topup/App.tsx`, `mfe-bill-payment/App.tsx`,
`mfe-transfer/FundDetail.tsx`, `mfe-wallet/SavingsGoals.tsx`, `mfe-wallet/InvestmentFund.tsx`,
`mfe-bill-payment/DigitalServices.tsx`) **không bị sửa một dòng nào** — nâng cấp hoàn toàn nằm bên
trong component.

### 1. Vì sao đọc `loadSession()` thay vì nhận `userId` qua prop mới

Để biết "user hiện tại đã đăng ký Touch ID trên thiết bị này chưa" mà không thêm prop, `StepUpModal`
tự `import { loadSession } from '@ewallet-lab/session'` và đọc trực tiếp — đây là lý do
`packages/ui/package.json` giờ có dependency mới `@ewallet-lab/session` (trước đây `packages/ui`
hoàn toàn không phụ thuộc package nào khác trong monorepo). Đây là đọc `localStorage` trực tiếp
(đồng bộ, không phải network, không phải React Context) — tránh đúng pitfall Module Federation
Context đã ghi ở §3 (Context compile vào 2 bundle khác nhau là 2 identity khác nhau).

### 2. `packages/ui/src/webauthn.ts` — helper WebAuthn thuần, không React

Export `isPlatformAuthenticatorAvailable()`, `registerPlatformCredential()`,
`verifyPlatformCredential()`, `markPlatformCredentialRegistered()`/`hasPlatformCredentialRegisteredLocally()`.

- **`registerPlatformCredential`**: gọi `navigator.credentials.create()` với
  `authenticatorAttachment: 'platform'`, `userVerification: 'required'`, **`residentKey:
  'required'`/`requireResidentKey: true`** — yêu cầu discoverable credential để
  `verifyPlatformCredential()` lúc step-up KHÔNG cần biết trước `credentialId` (không cần
  `allowCredentials`, platform authenticator tự tìm credential phù hợp với origin hiện tại).
- **`verifyPlatformCredential`**: gọi `navigator.credentials.get()` KHÔNG kèm `allowCredentials`,
  trả `true` nếu ceremony thành công, `false` (không throw) nếu huỷ/thất bại — để caller hiện lỗi rõ
  thay vì unhandled rejection.
- **Mức độ bảo mật — minh bạch, đúng yêu cầu Constraints của issue #41**: `challenge` sinh bằng
  `crypto.getRandomValues` ở CLIENT, KHÔNG phải server issue + verify lại (không chống được replay
  theo đúng chuẩn FIDO2). Điều ceremony THẬT sự đảm bảo (do browser/OS, không phải code lab này):
  promise chỉ resolve khi Secure Enclave xác nhận user thật đã chạm Touch ID khớp với credential
  đã bind vào origin này. Điều KHÔNG được đảm bảo: server chưa bao giờ verify signature/challenge —
  xem backend `DESIGN.md`'s mục cùng tên cho đầy đủ lý do & ranh giới.
- **`markPlatformCredentialRegistered`/`hasPlatformCredentialRegisteredLocally`**: flag
  `localStorage` theo key `ewallet-lab-webauthn-registered:<userId>`, viết ngay sau khi đăng ký
  thành công TRÊN THIẾT BỊ ĐÓ. **Quyết định kiến trúc quan trọng**: `StepUpModal` dùng flag LOCAL
  này để quyết định hiện UI Touch ID, **KHÔNG gọi `GET /users/{id}/webauthn/credentials`** (server)
  — lý do: platform authenticator gắn với TỪNG THIẾT BỊ (Secure Enclave riêng từng máy), server chỉ
  biết "user đã đăng ký ở đâu đó", không biết "đã đăng ký ở ĐÚNG MÁY ĐANG CHẠY ceremony này chưa".
  Dùng server-check sẽ gây false positive (hiện nút Touch ID trên máy B dù chỉ máy A có credential,
  ceremony sẽ fail vô lý) — flag local chính xác hơn cho đúng câu hỏi cần trả lời, đồng thời giữ
  `packages/ui` không có network call nào (đúng convention cũ của package này — mọi HTTP call nằm ở
  `packages/api-client`, `packages/ui` thuần presentational).

### 3. `StepUpModal.tsx` — logic mới, fallback nguyên vẹn

`useEffect` khi mount: đọc session, nếu có flag local + device hỗ trợ
(`isPlatformAuthenticatorAvailable()`) → `touchIdReady = true`. Render có 2 nhánh:
- **`touchIdReady`**: nút "Chạm Touch ID để xác nhận" gọi `verifyPlatformCredential()` → chỉ gọi
  `onConfirm()` nếu `true`; `false` → hiện lỗi "Xác thực Touch ID thất bại hoặc đã bị huỷ..." ngay
  trong modal, KHÔNG gọi `onConfirm()`, giao dịch KHÔNG hoàn tất — đúng acceptance criteria "huỷ
  giữa chừng". Copy phụ mới: nói rõ đây là xác thực ĐÚNG THIẾT BỊ/ĐÚNG NGƯỜI CẦM MÁY (WebAuthn thật),
  KHÁC cơ chế QĐ 2345 thật (so khớp CCCD gắn chip qua NFC — xem eKYC #40), không ngụ ý tương đương.
- **else (fallback)**: 100% UI/behavior cũ của issue #15 — nút "Tôi xác nhận đây là tôi" gọi
  `onConfirm()` trực tiếp. Copy phụ cập nhật nhẹ (không còn khẳng định tuyệt đối "lab này KHÔNG có
  sinh trắc học/WebAuthn thật" — giờ có, chỉ là thiết bị này chưa đăng ký/không hỗ trợ), nhưng hành
  vi gọi `onConfirm()` không đổi 1 dòng so với trước #41.
- Nút "Huỷ giao dịch" giữ nguyên ở cả 2 nhánh.

### 4. Đăng ký Touch ID — `Account.tsx` (shell, tab "Cá nhân")

Không tạo remote mới — đúng lý do `Account.tsx` đã kept-in-shell từ đầu (thin view, không gọi
backend) — issue #41 là lần ĐẦU TIÊN `Account.tsx`/shell gọi trực tiếp 1 backend service
(`webauthnService`, `user-service`), nên `shell/package.json` thêm dependency
`@ewallet-lab/api-client` và `shell/Dockerfile` thêm **build-arg mới
`VITE_USER_SERVICE_URL`** (trước #41, shell hoàn toàn không có build-arg `VITE_*_SERVICE_URL` nào —
đúng lớp lỗi tái diễn nhiều nhất của dự án, flagged ở CLAUDE.md, không bỏ sót lần này).

- Card "Bảo mật thiết bị — Touch ID" mới dưới thông tin tài khoản: kiểm tra device capability +
  flag local trên mount; nếu chưa đăng ký trên thiết bị này → nút "Đăng ký Touch ID cho thiết bị
  này" → `registerPlatformCredential()` (ceremony tạo credential thật) → `webauthnService.register()`
  (POST lên `user-service`, lưu `credentialId`/`publicKey`) → `markPlatformCredentialRegistered()`
  (ghi flag local). Lỗi ở bước ceremony hoặc POST đều hiện thông báo rõ + nút "Thử lại", không rơi
  vào trạng thái lưng chừng im lặng.
- Nếu đã đăng ký trên thiết bị này → "✓ Đã đăng ký Touch ID cho thiết bị này". Nếu server báo đã
  đăng ký ở thiết bị KHÁC (server có nhưng local không) → dòng phụ giải thích vì sao cần đăng ký
  riêng cho thiết bị này (platform authenticator không dùng chung giữa máy).
- Nếu device/browser không hỗ trợ platform authenticator → thông báo rõ, không có nút đăng ký.

### 5. Đã verify (frontend) — và phần KHÔNG thể verify trong môi trường agent

- Build sạch: `npm run build -w packages/ui` (qua mỗi remote tiêu thụ nó),
  `npm run build -w shell`/`-w mfe-wallet`/`-w mfe-transfer`/`-w mfe-topup`/`-w mfe-bill-payment`
  — cả 5 exit 0. `npx tsc --noEmit` sạch cho tất cả (1 lỗi TS kiểu `Uint8Array<ArrayBufferLike>` vs
  `BufferSource` tự giới thiệu trong `webauthn.ts` do lib.dom.d.ts generic hoá — đã fix bằng ép kiểu
  rõ ràng tại đúng điểm tạo buffer, không `as any` tràn lan).
- 6 image rebuild đúng tag (`ewallet-lab/{shell,mfe-wallet,mfe-transfer,mfe-topup,mfe-bill-payment,
  user-service}:local`), redeploy thật lên minikube, `imageID` của pod đối chiếu khớp đúng digest
  vừa build (không chỉ tin `kubectl rollout status`).
- Grep bundle đang chạy thật trong pod xác nhận code mới có mặt: `shell` có "Đăng ký Touch ID", cả 4
  remote còn lại (qua `packages/ui`) có "Chạm Touch ID".
- **Backend round-trip thật qua Ingress** (`http://api.ewallet-lab.local`): register user mới →
  `POST .../webauthn/credentials` → `GET` trả `registered:true` → `SELECT` trực tiếp Postgres khớp
  đúng row. Đăng ký trùng `credentialId` → 409.
- **Regression #15 thật qua Ingress**: luồng cũ 428 (thiếu `stepUpConfirmed`) → retry kèm
  `stepUpConfirmed:true` → 200 vẫn đúng y hệt trước #41 (backend logic KHÔNG đổi, chỉ đổi message
  tĩnh — xem backend DESIGN.md) — xác nhận fallback path (user chưa đăng ký Touch ID) không
  regression.
- **TLS cluster-internal**: xem backend DESIGN.md's mục cùng tên.
- **KHÔNG thể verify trong phiên agent này (không có hardware, ghi rõ theo đúng yêu cầu issue #41,
  KHÔNG tự nhận đã test)**:
  1. Ceremony Touch ID thật (`navigator.credentials.create()`/`.get()` với Touch ID prompt thật
     xuất hiện trên macOS) — cần hardware Touch ID, chỉ operator tự làm được.
  2. Truy cập `https://shell.ewallet-lab.local/` từ browser thật trên host (cổng 443 chưa được
     port-forward ra host trong môi trường agent — xem backend DESIGN.md's mục TLS, phần "Chưa
     verify được").
  3. `isUserVerifyingPlatformAuthenticatorAvailable()` trả `true` thật trên 1 máy có Touch ID — chỉ
     xác nhận được code gọi đúng API, không chạy được trong headless/no-hardware environment.

  **Checklist operator cần tự chạy để đóng issue #41** (đã có đủ hạ tầng, chỉ thiếu bước tay):
  1. Đảm bảo port 443 được forward ra host (`minikube tunnel` hoặc tương đương cho NodePort 31783 —
     xem backend DESIGN.md's mục TLS cho chi tiết cổng).
  2. Mở `https://shell.ewallet-lab.local/` trên Safari/Chrome, accept cảnh báo self-signed cert.
  3. Đăng nhập, vào tab "Cá nhân" → "Đăng ký Touch ID cho thiết bị này" → xác nhận Touch ID prompt
     thật xuất hiện → thành công.
  4. Thực hiện 1 giao dịch >10.000.000đ (transfer/BNPL/bất kỳ luồng dùng `StepUpModal`) → xác nhận
     modal hiện "Chạm Touch ID để xác nhận" (không phải nút cũ) → chạm Touch ID → giao dịch hoàn
     tất.
  5. Thử lại, lần này nhấn Esc/rút tay giữa ceremony → xác nhận giao dịch KHÔNG hoàn tất, lỗi hiện
     rõ, modal vẫn mở (có thể bấm lại hoặc Huỷ giao dịch).

### 6. Mixed-content audit sau TLS — follow-up, phát hiện sau khi operator tự test (#41)

Sau khi thêm TLS (mục 1), operator tự test thật và báo `shell` qua `https://` trắng trang vì nhiều
remote vẫn gọi `http://` thuần (bị browser chặn mixed-content). Rà soát lại toàn bộ Dockerfile của
mọi remote (không chỉ tin danh sách đã biết) lộ ra 2 lớp bug khác nhau, không chỉ "quên đổi scheme":

- **`mfe-wallet/Dockerfile` bị revert mất toàn bộ build-stage** ở chính commit eKYC #40
  (`dd6fc9c4`) — đổi thành `COPY dist` thuần (không `ARG` nào), nên image chỉ đóng gói lại
  `dist/` cũ đã build sẵn trên đĩa, không hề áp bất kỳ build-arg nào kể cả khi operator "fix" lại
  build-arg — vì Docker build không rebuild từ source nữa. Khôi phục về multi-stage build.
- **Build-arg thiếu từ trước, không liên quan TLS**: `mfe-transfer` thiếu `VITE_WALLET_SERVICE_URL`
  (App.tsx gọi `walletService.getBalance()`); `mfe-bill-payment` thiếu `VITE_BNPL_SERVICE_URL` +
  `VITE_WALLET_SERVICE_URL`; `mfe-wallet` (cả bản trước khi bị revert) thiếu
  `VITE_USER_SERVICE_URL`/`VITE_TOPUP_SERVICE_URL`/`VITE_INVESTMENT_FUND_SERVICE_URL` — chỉ có 4/7
  biến source thật cần. Tất cả đã bổ sung đủ, cùng lúc đổi hết comment ví dụ `docker build` từ
  `http://` sang `https://` trong 6 Dockerfile (`shell`, `mfe-auth`, `mfe-wallet`, `mfe-topup`,
  `mfe-transfer`, `mfe-bill-payment`).
- Rebuild + redeploy cả 6 image, `imageID` khớp digest, grep bundle đang chạy trên cả 6 pod xác
  nhận **không còn `http://*.ewallet-lab.local` nào sót lại**; verify qua Ingress thật (port-forward
  `18443:443`) 200/201 cho cả 7 host (`shell`, 5 `mfe-*`, `api`). Chi tiết đầy đủ trong comment
  GitHub issue #41.
- **Hạn chế cố hữu KHÔNG tự fix được**: cert self-signed → mỗi hostname là 1 origin riêng trong
  browser, accept warning ở 1 host không tự trust các host khác. Operator phải tự mở từng URL
  (`shell` + 5 `remoteEntry.js` của mfe-* + `api`) 1 lần trên address bar, bấm "Proceed anyway" cho
  TỪNG host, trước khi module-federation fetch ngầm từ `shell` tới các host đó chạy được.


## 32. Danh mục "Tất cả dịch vụ" Zero-ComingSoon, Tìm kiếm Nhanh & Ghim Tiện ích Yêu thích (Issue #93) — `AllServices.tsx` & `Home.tsx`

### 1. Bối cảnh & Khảo sát MoMo thực tế
- **Nguồn thực tế đã đối chiếu**: `momo.vn` và `momo.vn/quan-ly-chi-tieu` (mục "Hướng dẫn Thêm dịch vụ yêu thích").
- **Vấn đề trước đây**: `AllServices.tsx` có 10 ô dịch vụ bị gán cứng `comingSoon: true`, người dùng không có cách nào truy cập trực tiếp các tính năng đã hoàn thiện ở backend/MFE (Bảo hiểm, Đặt vé, Dịch vụ số, Heo tiết kiệm...).
- **Giải pháp thiết kế**:
  1. Phân nhóm 100% dịch vụ hiện có thành 6 danh mục lớn trực quan (Zero-"Coming Soon").
  2. Bổ sung **Thanh tìm kiếm tức thì (Instant Search)** có hỗ trợ gõ không dấu tiếng Việt chuẩn.
  3. Tính năng **Ghim dịch vụ yêu thích (Pinned Favorites)** cho phép tuỳ biến tối đa 7 ô dịch vụ trên lưới `MAIN_GRID` tại `Home.tsx` (ô thứ 8 cố định là nút "Xem thêm" / "Tất cả dịch vụ" điều hướng sang `AllServices.tsx`).

### 2. Cấu trúc Phân nhóm 6 Danh mục Dịch vụ
| Nhóm Dịch Vụ | Icon / Token Màu | Danh sách dịch vụ con & Điểm điều hướng |
| :--- | :--- | :--- |
| **1. Chuyển & Nhận tiền** | `payments` (`--el-accent`) | Chuyển tiền ví-ví (`transfer`), Chuyển VietQR 24/7 (`bank-transfer`), Nhận tiền QR (`receive`), Chuyển định kỳ (`scheduled-transfer` #31), Chia tiền nhóm (`split-bill` #116), Chuyển kèm thiệp (`send-card` #92) |
| **2. Hoá đơn & Viễn thông** | `receipt_long` (`#1a73e8`) | Hoá đơn & Auto-debit (`bill-payment` #26), Nạp tiền ĐT & Mã thẻ (`phone-topup` #29), Data 4G/5G (`phone-data`), Mua eSIM du lịch (`esim` #96), Hoá đơn điện tử (`e-invoice` #119), Phí chung cư & Khoản vay (`loan-bill` #112) |
| **3. Tài chính & Đầu tư** | `trending_up` (`--el-amber`) | Túi Thần Tài & Auto-sweep (`savings-pocket` #13/#86), Ví Trả Sau & Trả góp (`bnpl` #18/#91), Sàn Đầu Tư CCQ & SIP (`investment-fund` #25/#95), Heo Tiết Kiệm (`savings-goals` #27), Điểm tin cậy (`trust-score` #94), Vàng 999.9 (`gold` #115) |
| **4. Bảo hiểm & Sức khoẻ** | `health_and_safety` (`#0f9d58`) | Bảo hiểm vi mô xe máy/tai nạn (`micro-insurance` #35), BHXH tự nguyện & BHYT gia đình (`social-insurance` #113), Đặt khám & Viện phí online (`medical-fee` #97) |
| **5. Du lịch & Giải trí** | `flight_takeoff` (`#8e24aa`) | Vé xe khách / máy bay (`travel-ticketing` #33), Vé xem phim & Dịch vụ số (`digital-services` #30), Nạp thẻ Game (`games` #99), Gói Voucher Pass (`voucher-pass` #28) |
| **6. Gia đình & Cộng đồng** | `groups` (`#e65100`) | Ví Gia Đình (`family-wallet` #12), Quỹ nhóm bạn bè (`fund` #14), Lì xì nhóm & Vua may mắn (`lucky-money` #100), Sổ vay mượn 2 chiều (`p2p-loan` #123), Giao hàng COD (`delivery-cod` #124) |

### 3. Đặc tả UI & Wireframe ASCII

```
┌─────────────────────────────────────────────────────────┐
│ ← Tất cả dịch vụ                   [Sửa ghim Trang chủ] │
├─────────────────────────────────────────────────────────┤
│ 🔍 [ Tìm dịch vụ, tiện ích (vd: điện, vé xe, vàng...) ]│
├─────────────────────────────────────────────────────────┤
│ Gợi ý tìm kiếm: [Tiền điện] [Vé xe] [Nạp thẻ] [Vàng]    │
├─────────────────────────────────────────────────────────┤
│ 📌 DỊCH VỤ ĐÃ GHIM TRANG CHỦ (6/8)                      │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                 │
│ │ ↗️    │ │ 🏦    │ │ 🧾    │ │ 📱    │                 │
│ │Chuyển │ │VietQR │ │Hoá đơn│ │Nạp ĐT │                 │
│ └───────┘ └───────┘ └───────┘ └───────┘                 │
├─────────────────────────────────────────────────────────┤
│ 1. CHUYỂN & NHẬN TIỀN                                   │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                 │
│ │ ↗️    │ │ 🏦    │ │ 📥    │ │ 💌    │                 │
│ │Ví-Ví  │ │VietQR │ │Nhận QR│ │Thiệp  │                 │
│ └───────┘ └───────┘ └───────┘ └───────┘                 │
│ ┌───────┐ ┌───────┐                                     │
│ │ ⏱️    │ │ 👥    │                                     │
│ │Định kỳ│ │Chia t.│                                     │
│ └───────┘ └───────┘                                     │
│                                                         │
│ 2. HOÁ ĐƠN & VIỄN THÔNG                                 │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                 │
│ │ 🧾    │ │ 📱    │ │ 📶    │ │ 🌐    │                 │
│ │Hoá đơn│ │Nạp ĐT │ │Data 4G│ │eSIM   │                 │
│ └───────┘ └───────┘ └───────┘ └───────┘                 │
└─────────────────────────────────────────────────────────┘
```

### 4. Thuật toán Tìm kiếm & Cơ chế Ghim Trang chủ
- **Bỏ dấu tiếng Việt**: Chuẩn hoá chuỗi đầu vào bằng regex loại bỏ dấu diacritics:
  `const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();`
- **Tìm kiếm đa trường**: Khớp với `title`, `description`, và mảng `keywords` (ví dụ từ khoá "evn", "tiền điện" đều dẫn tới Hoá đơn Điện).
- **Cơ chế lưu Pinned Favorites**:
  - Key: `localStorage.getItem('ewallet_pinned_favorites_' + userId)`.
  - Mặc định: 7 tính năng đầu tiên + ô số 8 là nút "Xem thêm" (`more-services`).
  - Khi bật chế độ "Sửa ghim", mỗi icon có badge dấu trừ đỏ `-` để xoá hoặc dấu cộng xanh `+` để thêm vào danh sách ghim (tối đa 7 dịch vụ tuỳ chỉnh, ô thứ 8 luôn cố định là nút "Xem thêm" / "Tất cả dịch vụ"). Rung nhẹ (haptic shake) hoặc hiện toast thông báo khi người dùng cố tình ghim quá 7 mục.

---

## 33. Chuyển tiền kèm Thiệp mừng, Số tiền Phong thuỷ & Lì xì nhóm Vua May Mắn (Issues #92, #100) — `SendCardModal.tsx` & `GroupLuckyMoney.tsx`

### 1. Bối cảnh & Khảo sát MoMo thực tế
- **Nguồn khảo sát**: MoMo "Chuyển tiền mừng" và "Lì xì nhóm giật bao may mắn" (chiến dịch Tết & sự kiện quanh năm).
- **Mục tiêu**: Gia tăng tính kết nối xã hội (Social Payments), biến giao dịch chuyển tiền khô khan thành hành động chúc mừng giàu cảm xúc.

### 2. Chuyển tiền kèm Thiệp mừng & Số tiền Phong thuỷ (Issue #92)
- **4 Chủ đề thiệp tiêu chuẩn**:
  1. `BIRTHDAY` (Sinh nhật): Nền pastel cam/hồng, pháo giấy, bánh kem, icon `cake`.
  2. `THANK_YOU` (Tri ân & Cảm ơn): Nền xanh ngọc nhẹ, đoá hoa, icon `volunteer_activism`.
  3. `CELEBRATION` (Chúc mừng / Hỷ sự): Nền đỏ son may mắn, phong bao đỏ, hoa mai, icon `celebration`.
  4. `CHEER_UP` (Động viên / Cổ vũ): Nền vàng năng lượng, ánh mặt trời, tách cà phê, icon `emoji_events`.
- **Lưới gợi ý Số tiền Phong thuỷ May mắn (Auspicious Amounts)**:
  - `68.000đ` (Lộc Phát) · `88.000đ` (Phát Phát) · `99.000đ` (Trường Cửu Vĩnh Cửu)
  - `168.000đ` (Nhất Lộc Phát) · `686.868đ` (Đại Lộc Đại Phát) · `999.999đ` (Tam Cửu Đại Cát)
  - Bấm chọn số tiền sẽ tự động điền vào ô `amount` kèm ghi chú chúc mừng ý nghĩa.
- **Trải nghiệm Mở Thiệp của Người Nhận**:
  - Dialog toàn màn hình với hoạt ảnh phong bì thư rung nhẹ -> trượt mở nắp bao -> bung thiệp thiệp động kèm lời chúc cá nhân hoá.
  - Nút CTA: "Cảm ơn người gửi 💌" (tự động gửi notification cảm kích về người chuyển) hoặc "Nhận vào ví ngay".

```
┌─────────────────────────────────────────────────────────┐
│ Gửi kèm thiệp mừng & Tiền may mắn                       │
├─────────────────────────────────────────────────────────┤
│ Chọn chủ đề thiệp:                                      │
│ [🎂 Sinh nhật]  [💐 Cảm ơn]  [🎊 Chúc mừng]  [🌟 Cổ vũ] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  🎉 Chúc Mừng Sinh Nhật Tuổi Mới!                   │ │
│ │  "Chúc bạn tuổi mới rực rỡ, thành công và luôn      │ │
│ │   hạnh phúc ngập tràn nhé!"                         │ │
│ └─────────────────────────────────────────────────────┘ │
│ Chọn số tiền phong thuỷ:                                │
│ [ 68.000đ - Lộc Phát ]      [ 88.000đ - Phát Tài ]      │
│ [ 168.000đ - Nhất Lộc Phát] [ 99.000đ - Trường Cửu ]    │
│ Lời nhắn gửi kèm (tối đa 150 ký tự):                    │
│ [ Sinh nhật vui vẻ nha bạn thân ơi! 🎂                ] │
├─────────────────────────────────────────────────────────┤
│ [ Huỷ ]                           [ Tiếp tục chuyển tiền ]│
└─────────────────────────────────────────────────────────┘
```

### 3. Lì xì nhóm & Bảng xếp hạng "Vua May Mắn" (Issue #100)
- **2 Chế độ chia bao lì xì**:
  - `RANDOM_LUCK` (Chia ngẫu nhiên): Thuật toán chia ngẫu nhiên đảm bảo mỗi bao tối thiểu 1.000đ, người có số tiền lớn nhất đăng quang "Vua May Mắn".
  - `EQUAL` (Chia đều): Chia chính xác `totalAmount / totalEnvelopes`.
- **Escrow trừ tiền trước**: Ví người tạo bị trừ tiền ngay khi khởi tạo phòng; nếu sau 24h còn bao chưa mở, hệ thống tự động hoàn tiền thừa về ví qua Outbox worker.
- **Trải nghiệm Giật Lì Xì (Interactive Grab)**:
  - Bao lì xì đỏ lắc nhẹ (shake animation) kèm nút "Giật ngay".
  - Hiệu ứng bung pháo hoa chúc mừng (Confetti animation).
  - **Bảng xếp hạng (King of Luck Leaderboard)**:
    - Người nhận tiền cao nhất có vương miện vàng 👑 và badge "Vua May Mắn".
    - Người nhận ít nhất có badge "Bình An".
    - Hiển thị danh sách avatar, thời gian mở đến từng giây, tổng số bao đã mở (vd: 5/5 bao).

---

## 34. Quản lý chi tiêu PFM 2.0 & Trung tâm Dự báo Hoá đơn Bills Radar 30 ngày (Issues #88, #89) — `SpendingReport.tsx` & `BillsRadar.tsx`

### 1. Bối cảnh & Khảo sát MoMo thực tế
- **Nguồn khảo sát**: MoMo "Quản lý chi tiêu" (`momo.vn/quan-ly-chi-tieu`) và "Lịch thanh toán hoá đơn".
- **Vấn đề**: Người dùng cần kiểm soát ngân sách tháng theo từng nhóm danh mục và chủ động chuẩn bị tiền trước khi các hoá đơn định kỳ đến hạn trừ nợ.

### 2. Quản lý Chi tiêu PFM 2.0 (Issue #88)
- **8 Danh mục chi tiêu chuẩn hoá**:
  1. Ăn uống (`FOOD_DRINK` - `#f57c00`)
  2. Mua sắm (`SHOPPING` - `#7b1fa2`)
  3. Hoá đơn nhà ở (`BILLS` - `#1976d2`)
  4. Di chuyển (`TRANSPORT` - `#388e3c`)
  5. Giải trí (`ENTERTAINMENT` - `--el-accent`)
  6. Y tế & Giáo dục (`HEALTH_EDU` - `#d32f2f`)
  7. Đầu tư (`INVESTMENT` - `#fbc02d`)
  8. Khác (`OTHER` - `#757575`)
- **Ngân sách tháng & 3 Ngưỡng màu trực quan**:
  - `< 80%`: Thanh xanh an toàn.
  - `80% – 99%`: Thanh vàng hổ phách (`--el-amber`), badge cảnh báo "Sắp chạm ngân sách!".
  - `>= 100%`: Thanh đỏ báo động (`--el-danger`), badge "Đã vượt ngân sách!".
- **Ghi chép chi tiêu ngoài ví (Offline Cash Expense)**:
  - Nút "+ Ghi chi tiêu tiền mặt" mở Bottom Sheet nhập nhanh: Số tiền, danh mục, thời gian, ghi chú. Tích hợp trực tiếp vào báo cáo tổng quan.

```
┌─────────────────────────────────────────────────────────┐
│ Quản lý chi tiêu PFM 2.0             [+ Ghi tiền mặt]   │
├─────────────────────────────────────────────────────────┤
│ Tháng 10/2026                 Tổng chi: 12.450.000 đ    │
│ Ngân sách tháng: 15.000.000 đ (Đã dùng 83% - Sắp chạm)  │
│ [████████████████████████████░░░░░░] 83% (Vàng cảnh báo)│
├─────────────────────────────────────────────────────────┤
│ CHI TIẾT THEO DANH MỤC                                  │
│ 🍔 Ăn uống (5.200.000 đ / 6.000.000 đ)                  │
│    [████████████████████░░░░░] 86%  ⚠️ Sắp hết          │
│ 🛍️ Mua sắm (4.100.000 đ / 3.500.000 đ)                  │
│    [█████████████████████████] 117% 🚨 Vượt 600.000đ    │
│ 🧾 Hoá đơn (2.150.000 đ / 3.000.000 đ)                  │
│    [███████████████░░░░░░░░░░] 71%  ✅ An toàn          │
└─────────────────────────────────────────────────────────┘
```

### 3. Trung tâm Dự báo Hoá đơn Bills Radar 30 Ngày (Issue #89)
- **Lịch hoá đơn 30 ngày (Bills Radar Calendar)**:
  - Quét toàn bộ hoá đơn đến hạn trong 7 ngày tới (Gấp) và 30 ngày tới.
  - So sánh: `Tổng hoá đơn 7 ngày tới` vs `Số dư ví chính khả dụng`.
  - Nếu `Tổng hoá đơn > Số dư ví`: Hiển thị thanh cảnh báo thiếu tiền kèm nút 1 chạm "Nạp tiền ngay".
- **Cảnh báo Hoá đơn Tăng Đột Biến (`SpikeWarningBadge`)**:
  - Tiêu chí kích hoạt: Số tiền cước kỳ này tăng `>= 30%` so với mức trung bình 3 kỳ trước.
  - Trạng thái: `HELD_FOR_SPIKE_REVIEW` (tạm dừng trừ tiền Auto-debit để bảo vệ người dùng).
  - Khung cảnh báo màu vàng viền nổi bật:
    - Cảnh báo: *"Hoá đơn Tiền điện kỳ này là 1.450.000đ (tăng 52% so với trung bình 3 tháng gần nhất 950.000đ)."*
    - Hành động xử lý:
      * Nút `Duyệt thanh toán` (`POST /bills/auto-pay/{id}/approve-spike`): Cho phép trừ tiền và gạch nợ.
      * Nút `Bỏ qua kỳ này` (`POST /bills/auto-pay/{id}/skip-cycle`): Bỏ qua chu kỳ này để khách hàng đối soát với nhà đèn, không huỷ uỷ quyền các tháng sau.

---

## 35. Trung tâm Thông báo Tài chính & Hộp thư Nhắc việc 1 chạm (Issue #117) — `NotificationCenter.tsx` & `Home.tsx`

### 1. Bối cảnh & Khảo sát MoMo thực tế
- **Nguồn khảo sát**: Hộp thư thông báo MoMo (chuông trên Header trang chủ phân tách rõ: Giao dịch, Nhắc việc, Ưu đãi).
- **Vấn đề**: Người dùng nhận Lì xì, Thiệp mừng, Lời nhắc nợ hoặc Hoá đơn mới nhưng không hề có chấm đỏ thông báo trên `Home.tsx`, dễ bị trôi giao dịch.

### 2. Thiết kế Chuông Thông Báo & Badge Đỏ trên `Home.tsx`
- Biểu tượng `NotificationBell` góc trên phải màn hình chính hiển thị `badge` số lượng tin chưa đọc.
- Hiệu ứng lắc chuông nhẹ (Subtle Bell Swing) khi có sự kiện cần xử lý ngay.

### 3. Cấu trúc Màn hình Trung Tâm Thông Báo (4 Tab Phân Loại)
```
┌─────────────────────────────────────────────────────────┐
│ ← Thông báo                 [Đánh dấu đã đọc tất cả]    │
├─────────────────────────────────────────────────────────┤
│ [Tất cả (5)]  [Cần xử lý (2)]  [Biến động (3)]  [Lịch (0)]│
├─────────────────────────────────────────────────────────┤
│ 🔥 CẦN XỬ LÝ NGAY                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🧧 Lì xì Tết từ Nam Nguyễn                          │ │
│ │ Bạn nhận được 1 phong bao lì xì may mắn!           │ │
│ │ 10 phút trước                       [Mở lì xì ngay] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💸 Lời nhắc trả tiền từ Minh Trần                    │ │
│ │ Tiền ăn trưa nhóm phở bò: 65.000 đ                  │ │
│ │ 1 giờ trước                         [Thanh toán ngay]│ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ Cảnh báo tiền điện tăng đột biến (+52%)          │ │
│ │ Tiền điện T10: 1.450.000đ (bình thường 950.000đ)    │ │
│ │ Hôm qua                             [Xem & Duyệt]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 📊 BIẾN ĐỘNG SỐ DƯ                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ↗️ Chuyển tiền thành công                           │ │
│ │ Chuyển 200.000 đ tới Lê Hoàng. Số dư: 4.820.000 đ    │ │
│ │ 14:30 28/10/2026                    [Xem biên lai]  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4. Nút Hành Động 1 Chạm (1-Tap Action CTA)
- Mỗi thẻ thông báo thuộc nhóm `ACTION_REQUIRED` đều đính kèm Deep-link dẫn thẳng tới modal thao tác:
  - Sự kiện Lì xì -> Mở thẳng popup giật bao lì xì.
  - Lời nhắc nợ -> Mở thẳng màn hình xác nhận chuyển trả đúng số tiền yêu cầu.
  - Thiệp mừng -> Mở thiệp động chúc mừng.
  - Cảnh báo Spike cước -> Mở hộp thoại duyệt hoặc bỏ qua cước kỳ này.
- Bấm "Đánh dấu đã đọc tất cả" sẽ xóa bộ đếm badge chưa đọc trên `Home.tsx` và chuyển trạng thái tin sang màu nền trung tính.

---

## 36. Cửa Hàng eSIM Du Lịch Quốc Tế & Nhận Mã QR Kích Hoạt Tức Thì (Issue #96) — `TelcoTopup.tsx` & `TravelBooking.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: MoMo eSIM Du lịch Quốc tế (`momo.vn/esim-du-lich`) & Revolut eSIM (`revolut.com/esim`).
- **Nghiệp vụ**: Người dùng đi du lịch/công tác nước ngoài có thể đặt mua gói dữ liệu di động eSIM mà không cần tháo lắp SIM vật lý hay chờ nhận hàng. Hệ thống cấp tức thì Mã QR chuẩn GSMA (`LPA:1$...`) và thông số cài đặt thủ công (`SM-DP+ Address` & `Activation Code`) ngay sau khi thanh toán.

### 2. Sơ đồ Wireframe ASCII — Tab eSIM Quốc Tế & Chi Tiết Đơn Hàng

```
┌─────────────────────────────────────────────────────────┐
│ ← eSIM Du Lịch Quốc Tế              [eSIM Của Tôi (1)]  │
├─────────────────────────────────────────────────────────┤
│ 🔍 Tìm kiếm quốc gia / vùng lãnh thổ...                 │
├─────────────────────────────────────────────────────────┤
│ ĐIỂM ĐẾN PHỔ BIẾN                                       │
│ [🇹🇭 Thái Lan] [🇸🇬🇲🇾 Sing-Mã] [🇯🇵 Nhật Bản] [🇰🇷 Hàn Quốc]│
├─────────────────────────────────────────────────────────┤
│ GÓI CƯỚC THÁI LAN (TRUE/DTAC 5G ROAMING)                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🇹🇭 1GB / ngày - 5 Ngày                    95.000 đ │ │
│ │ • Hết tốc độ cao về 128kbps không ngắt mạng         │ │
│ │ • Nhận mã kích hoạt QR tức thì                      │ │
│ │                                         [Chọn Mua]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🇹🇭 2GB / ngày - 7 Ngày (Phổ biến)        145.000 đ │ │
│ │ • Tốc độ cao 5G không giới hạn gọi nội địa Thái     │ │
│ │ • Hoàn tiền nếu không kích hoạt được                │ │
│ │                                         [Chọn Mua]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🇹🇭 Không giới hạn 5G - 7 Ngày            210.000 đ │ │
│ │                                         [Chọn Mua]  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ← Chi Tiết Cài Đặt eSIM             [Chia sẻ] [Lưu ảnh] │
├─────────────────────────────────────────────────────────┤
│            🎉 ĐẶT MUA THÀNH CÔNG!                       │
│     Gói cước: Thái Lan 2GB/ngày - 7 ngày                │
├─────────────────────────────────────────────────────────┤
│      ┌───────────────────────────────────────────┐      │
│      │               █████████████               │      │
│      │               ██  █████  ██               │      │
│      │               ██  MÃ QR  ██   (GSMA LPA)  │      │
│      │               █████████████               │      │
│      └───────────────────────────────────────────┘      │
│        Quét mã QR bằng Camera máy phụ hoặc cài đặt      │
├─────────────────────────────────────────────────────────┤
│ CÀI ĐẶT THỦ CÔNG                                        │
│ • Địa chỉ SM-DP+:                                       │
│   rsp.esim.ewallet-lab.local             [Sao chép]     │
│ • Mã kích hoạt (Activation Code):                       │
│   MATCH-9812-7410                        [Sao chép]     │
│ • Chuỗi GSMA LPA:                                       │
│   LPA:1$rsp.esim.ewallet-lab.local$MATCH-9812-7410      │
├─────────────────────────────────────────────────────────┤
│ HƯỚNG DẪN CÀI ĐẶT NHANH (iOS / Android)                │
│ 1. Mở Cài đặt > Di động (Cellular) > Thêm eSIM.         │
│ 2. Quét mã QR ở trên hoặc Dán mã SM-DP+ và Kích hoạt.   │
│ 3. Chỉ Bật chuyển vùng dữ liệu (Data Roaming) khi đến!  │
└─────────────────────────────────────────────────────────┘
```

### 3. Quy chuẩn Thiết kế Token & Trạng Thái eSIM
- **Token bảng màu**:
  - Mã QR viền card nổi bật: `--el-surface-2`, bo góc `12px`, padding `16px`.
  - Nút sao chép 1 chạm: Nút phụ `--el-surface`, border `--el-line`, font `--el-font-code` cho chuỗi kích hoạt.
  - Huy hiệu trạng thái gói (`EsimOrderStatus`):
    - `READY_TO_INSTALL`: Xanh dương nhạt `--el-info` ("Sẵn sàng cài đặt").
    - `INSTALLED_ACTIVE`: Xanh lá `--el-success` ("Đang hoạt động").
    - `EXPIRED`: Xám mờ `--el-muted` ("Đã hết hạn").
- **Tích hợp liên kết chéo (Cross-Selling)**:
  - Trên màn hình hoàn tất đặt vé máy bay quốc tế (`TravelBooking.tsx`), hiển thị card gợi ý: *"Chuẩn bị bay tới Thái Lan? Mua eSIM 5G chỉ từ 95.000đ để có mạng ngay khi hạ cánh"*.

---

## 37. Cửa Hàng Thẻ Game Giải Trí & Trung Tâm Săn Ưu Đãi Thương Hiệu (Issue #99) — Mở Khóa Tile `games` & `deals`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: MoMo Nạp thẻ game chiết khấu 3-5% & Cửa hàng Ưu đãi / Deals Hub.
- **Mục tiêu**: Thay thế toàn bộ dead-end `ComingSoon.tsx` của 2 tile `games` ("Game - Ứng dụng") và `deals` ("Săn ưu đãi") trên `AllServices.tsx` bằng 2 màn hình hoạt động thực tế 100%: `GameCardStore.tsx` và `DealsHub.tsx`.

### 2. Sơ đồ Wireframe ASCII — Cửa Hàng Thẻ Game (`GameCardStore.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Mua Thẻ Game & Giải Trí           [Lịch sử thẻ đã mua]│
├─────────────────────────────────────────────────────────┤
│ NHÀ PHÁT HÀNH                                           │
│ [🟢 GARENA]  [🔵 ZING CARD]  [🟠 VCOIN]  [🔴 GATE]      │
│ [🟣 FUNCARD] [🟡 APPOTA]    [⚪ GOOGLE PLAY]            │
├─────────────────────────────────────────────────────────┤
│ CHỌN MỆNH GIÁ                                           │
│ ┌───────────────────────┐   ┌───────────────────────┐   │
│ │ 20.000 đ              │   │ 50.000 đ              │   │
│ │ Giá: 19.400 đ (-3%)   │   │ Giá: 48.500 đ (-3%)   │   │
│ └───────────────────────┘   └───────────────────────┘   │
│ ┌───────────────────────┐   ┌───────────────────────┐   │
│ │ 100.000 đ  [Phổ biến] │   │ 200.000 đ             │   │
│ │ Giá: 97.000 đ (-3%)   │   │ Giá: 194.000 đ (-3%)  │   │
│ └───────────────────────┘   └───────────────────────┘   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 500.000 đ   Giá: 485.000 đ (-3% Tiết kiệm 15.000đ)  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ THANH TOÁN & NHẬN MÃ THẺ                                │
│ Nguồn tiền: Ví chính (Số dư: 1.250.000 đ)               │
│ Tổng thanh toán: 97.000 đ (Tiết kiệm 3.000 đ)           │
│ [             MUA NGAY (CHIẾT KHẤU 3%)                ] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🎟️ THẺ GAME ĐÃ MUA THÀNH CÔNG                          │
│ Nhà phát hành: Garena 100.000 đ                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Mã PIN (Mã Nạp Thẻ):                                │ │
│ │ 8492 1048 2910 4721                      [Sao chép] │ │
│ │                                                     │ │
│ │ Số Serial:                                          │ │
│ │ 1000 4829 1048                           [Sao chép] │ │
│ │                                                     │ │
│ │ Hạn sử dụng: 31/12/2027                             │ │
│ └─────────────────────────────────────────────────────┘ │
│ [           Sao chép cả PIN & Serial 1 chạm           ] │
│ [      Tiếp tục mua thẻ      ] [ Xem lịch sử thẻ ]     │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Trung Tâm Săn Ưu Đãi Thương Hiệu (`DealsHub.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Săn Ưu Đãi & Voucher Pass               [Kho voucher] │
├─────────────────────────────────────────────────────────┤
│ 🏷️ DANH MỤC: [Tất cả] [Ăn uống] [Cà phê] [Phim] [Siêu thị]│
├─────────────────────────────────────────────────────────┤
│ ⚡ FLASH DEALS GIỜ VÀNG (Kết thúc sau 02:45:12)         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☕ Highlands Coffee - Giảm 30.000đ đơn từ 69.000đ    │ │
│ │ Còn 45 lượt • Đổi bằng 50 điểm hoặc 0 đ             │ │
│ │                                      [Thu thập ngay]│ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 🎟️ GÓI TIẾT KIỆM VOUCHER PASS (Tiết kiệm đến 70%)       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🍔 Gói Ăn Uống Thả Ga (4 voucher x 50.000đ)          │ │
│ │ Giá gốc: 200.000 đ -> Mua gói chỉ: 29.000 đ         │ │
│ │                                           [Mua gói] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎬 Gói Xem Phim Cuối Tuần (2 vé CGV 2D)             │ │
│ │ Giá gốc: 220.000 đ -> Mua gói chỉ: 139.000 đ        │ │
│ │                                           [Mua gói] │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy tắc Tương Tác & Phím Sao Chép 1 Chạm
- **Sao chép PIN / Serial**: Nút icon copy hỗ trợ visual feedback "Đã chép!" (`Copied!`) trong 2 giây.
- **Áp dụng ưu đãi trực tiếp**: Nút "Dùng ngay" trên voucher đã thu thập sẽ mở deep-link sang đúng dịch vụ thanh toán (ví dụ Voucher Highlands -> mở QR Thanh toán tại quầy; Voucher CGV -> mở màn hình Đặt vé xem phim).

---

## 38. Đặt Vé Xem Phim Trực Tuyến, Sơ Đồ Ghế Tương Tác & Combo Bắp Nước (Issue #105) — `MovieBooking.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: MoMo Vé Phim (đối tác CGV, Lotte Cinema, Galaxy, Beta Cinemas).
- **Trải nghiệm trọng tâm**:
  1. Chọn suất chiếu rạp thuận tiện.
  2. Sơ đồ ghế phòng chiếu trực quan (Seat Map) phân hạng màu sắc rõ ràng.
  3. Kiểm tra quy tắc chống bỏ trống 1 ghế lẻ (Single-Seat Gap / Orphan Seat Rule) trước khi giữ chỗ.
  4. Chọn combo bắp nước và sinh vé điện tử phong cách vé xem phim cổ điển kèm QR check-in.

### 2. Sơ đồ Wireframe ASCII — Sơ Đồ Ghế Phòng Chiếu & Orphan Seat Warning
```
┌─────────────────────────────────────────────────────────┐
│ ← CGV Vincom Center • Suất 19:30 • Phòng 03 [2D Phụ đề]│
├─────────────────────────────────────────────────────────┤
│                   ════ MÀN CHIẾU ════                   │
│                                                         │
│   Hàng                                                  │
│    A    [ ][ ][ ]  [ ][ ][ ][ ]  [ ][ ][ ]  (Thường)    │
│    B    [ ][ ][ ]  [x][x][ ][ ]  [ ][ ][ ]  (Thường)    │
│    C    [ ][ ][ ]  [ ][ ][ ][ ]  [ ][ ][ ]  (Thường)    │
│    D    [ ][ ][ ]  [ ][x][x][ ]  [ ][ ][ ]  (VIP)       │
│    E    [ ][ ][ ]  [ ][●][●][ ]  [ ][ ][ ]  (VIP - Chọn)│
│    F    [ ][ ][ ]  [ ][ ][ ][ ]  [ ][ ][ ]  (VIP)       │
│    G    [====]     [====]        [====]     (Couple)    │
│                                                         │
│   Chú thích: [ ] Trống   [●] Đang chọn   [x] Đã bán     │
│              [====] Ghế Đôi Sweetbox                    │
├─────────────────────────────────────────────────────────┤
│ ⚠️ CẢNH BÁO QUY TẮC RẠP PHIM (ORPHAN SEAT)              │
│ Bạn không thể để trống 1 ghế lẻ duy nhất ở giữa hoặc    │
│ sát mép lối đi. Vui lòng chọn ghế liền kề!              │
├─────────────────────────────────────────────────────────┤
│ ĐANG CHỌN: E5, E6 (Ghế VIP) - Thời gian giữ: 09:42     │
│ Tạm tính: 210.000 đ                                     │
│ [              TIẾP TỤC: CHỌN BẮP NƯỚC                ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Chọn Combo Bắp Nước & Vé Điện Tử Răng Cưa
```
┌─────────────────────────────────────────────────────────┐
│ COMBO BẮP NƯỚC RẠP                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🍿 Solo Combo (1 Bắp ngọt 60oz + 1 Nước 32oz)       │ │
│ │ 79.000 đ                              [-] [ 1 ] [+] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🍿 Couple Combo (1 Bắp lớn 2 vị + 2 Nước 32oz)      │ │
│ │ 109.000 đ                             [-] [ 0 ] [+] │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Tổng tiền: 289.000 đ (2 vé VIP + 1 Solo Combo)          │
│ [                THANH TOÁN BẰNG VÍ                   ] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ • • • • • • • • VÉ XEM PHIM ĐIỆN TỬ • • • • • • • • • • │
│ - - - - - - - - - - - - - - - - - - - - - - - - - - - - │
│ 🎬 DUNE: HÀNH TINH CÁT (2D Phụ đề tiếng Việt)          │
│ 🏛️ CGV Vincom Đồng Khởi - Phòng chiếu 03               │
│ 🕒 19:30 - Thứ Bảy, 31/10/2026                         │
│ 💺 Ghế: E5, E6 (VIP) • 🍿 Combo: 1x Solo Combo          │
├─────────────────────────────────────────────────────────┤
│      ┌───────────────────────────────────────────┐      │
│      │               █████████████               │      │
│      │               ██  MÃ QR   ██              │      │
│      │               ██ CHECK-IN ██              │      │
│      │               █████████████               │      │
│      └───────────────────────────────────────────┘      │
│ Mã lấy vé tự động: CGV-8921-3401                        │
│ - - - - - - - - - - - - - - - - - - - - - - - - - - - - │
│ • • • • • • • (Đường viền răng cưa cổ điển) • • • • • • │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy tắc Kỹ thuật & Token UI
- **Phân loại màu ghế**:
  - Ghế thường (Hàng A-C): Border `--el-line`, background `--el-surface`.
  - Ghế VIP (Hàng D-F): Border `--el-amber`, background `--el-surface-2`.
  - Ghế Couple Sweetbox (Hàng G): Màu hồng đặc trưng `--el-accent-subtle`.
  - Ghế đang chọn: Nền hồng MoMo `--el-accent`, icon check trắng.
  - Ghế đã bán (`SOLD`): Nền xám tối `--el-muted`, ký tự gạch chéo disabled.
- **Xử lý tranh chấp ghế đồng thời (Concurrency Control)**:
  - Khi API trả về `409 Conflict`, hiển thị Banner màu đỏ `--el-danger`: *"Rất tiếc! Ghế E5 vừa có khách khác đặt trước. Vui lòng chọn ghế khác."* kèm tự động load lại ma trận ghế mới nhất.

---

## 39. Tích Lũy Vàng 999.9 Trực Tuyến & Đặt Lịch Nhận Vàng Vật Chất (Issue #115) — Tab "🪙 Tiệm Vàng Online" trên `Wealth.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: eGold DOJI (`egold.doji.vn`), MoMo Bảng Giá Vàng & Tích Luỹ Tài Sản, Revolut Commodities Gold.
- **Bản chất nghiệp vụ**:
  - Cho phép người dùng mua tích luỹ vàng nhẫn 999.9 với số vốn nhỏ từ **0,1 chỉ** (khoảng ~800.000đ - 900.000đ tuỳ thời giá).
  - Phản ánh trung thực cơ chế chênh lệch giá Mua vào / Bán ra (`Bid-Ask Spread`).
  - Gửi giữ hộ miễn phí trong Tủ Vàng Điện Tử (`GoldVaultHolding`), cho phép bán chốt lời 24/7 về Ví hoặc đặt lịch nhận vàng vật chất ép vỉ tại cửa hàng đối tác khi đạt từ $\ge 1,0$ chỉ.

### 2. Sơ đồ Wireframe ASCII — Tab Tiệm Vàng Online & Tủ Vàng Tích Luỹ
```
┌─────────────────────────────────────────────────────────┐
│ ← Tài Chính - Tích Luỹ              [Lịch sử giao dịch] │
├─────────────────────────────────────────────────────────┤
│ [Chứng chỉ quỹ] [🪙 Vàng nhẫn 999.9] [Tích lũy sinh lời]│
├─────────────────────────────────────────────────────────┤
│ 🏆 TỦ VÀNG CỦA TÔI                                      │
│ Tổng sở hữu: 2,50 chỉ                                   │
│ Giá trị thị trường: 21.875.000 đ                        │
│ Lợi nhuận tạm tính: +1.125.000 đ (+5.42%)  📈 Tăng     │
│ Giá vốn trung bình: 8.300.000 đ / chỉ                   │
├─────────────────────────────────────────────────────────┤
│ BẢNG GIÁ VÀNG TRỰC TUYẾN (Cập nhật: 10:30 Hôm nay)      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🪙 Vàng Nhẫn Tròn Trơn 999.9 (Hưng Thịnh Vương)     │ │
│ │ Giá mua lại (Bid):           Giá bán ra (Ask):      │ │
│ │ 8.650.000 đ / chỉ            8.750.000 đ / chỉ      │ │
│ │ Spread: 100.000 đ / chỉ                             │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🥇 Vàng Miếng SJC 999.9 (Bội số 1 chỉ)              │ │
│ │ Giá mua lại (Bid):           Giá bán ra (Ask):      │ │
│ │ 8.820.000 đ / chỉ            8.980.000 đ / chỉ      │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ [ Mua tích lũy từ 0.1 chỉ ]  [ Bán chốt lời về ví ]     │
│ [          🪙 Đặt lịch rút vàng vật chất tại quầy       ] │
├─────────────────────────────────────────────────────────┤
│ ℹ️ Tuyên bố: Mô phỏng phục vụ nghiên cứu & học tập     │
│ (Lab Simulation). Không phải dịch vụ kinh doanh vàng.   │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Đặt Lịch Nhận Vàng Vật Chất
```
┌─────────────────────────────────────────────────────────┐
│ ← Đặt Lịch Rút Vàng Vật Chất Tại Quầy                  │
├─────────────────────────────────────────────────────────┤
│ Số dư vàng khả dụng rút: 2,50 chỉ                       │
│ ⚠️ Chỉ hỗ trợ rút nguyên chỉ (bội số 1.0 chỉ)          │
├─────────────────────────────────────────────────────────┤
│ CHỌN SỐ LƯỢNG RÚT:                                      │
│ [-] [ 2 ] [+] chỉ Vàng Nhẫn Tròn Trơn Ép Vỉ 999.9       │
│ Phí gia công & ép vỉ bảo an: Miễn phí                   │
├─────────────────────────────────────────────────────────┤
│ ĐỊA ĐIỂM & THỜI GIAN NHẬN VÀNG                          │
│ Cửa hàng: Tiệm Vàng Lab Chi nhánh Quận 1 (TP.HCM)       │
│ Ngày hẹn nhận: 02/11/2026 (Trong giờ hành chính)        │
├─────────────────────────────────────────────────────────┤
│ Mã phiếu hẹn QR: GOLD-PICKUP-2026-9812                 │
│ [                    XÁC NHẬN HẸN LẤY VÀNG            ] │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy tắc Thiết kế & Phòng ngừa Rủi ro
- **Chênh lệch Bid-Ask rõ ràng**:
  - Khi Mua: tính theo giá `askPricePerChi` (Giá bán ra).
  - Khi Bán: tính theo giá `bidPricePerChi` (Giá mua vào từ khách).
  - Khung màu vàng kim `--el-amber` kết hợp `--el-surface-2` mang phong cách tiệm vàng sang trọng, tin cậy.
- **Điều kiện rút vàng vật chất**:
  - Khóa nút "Đặt lịch rút vàng" nếu tổng số dư $< 1.0$ chỉ, kèm tooltip: *"Cần tích luỹ tối thiểu từ 1,0 chỉ trở lên để quy đổi nhận vàng vật chất ép vỉ."*

---

## 40. Chia Tiền Hóa Đơn Theo Từng Món & Tự Động Phân Bổ Tỷ Lệ (Issue #116) — Mở Rộng `SplitBill.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: MoMo / ZaloPay Chia Tiền & Splitwise Pro Itemized Receipt Splitter.
- **Vấn đề giải quyết**: Khi đi ăn uống theo nhóm hoặc đặt tiệc, mỗi người gọi các món khác nhau với giá khác nhau. Trên hoá đơn tổng luôn có thêm Thuế VAT (8% hoặc 10%), Phí phục vụ (Service Charge 5%) và Voucher giảm giá đơn hàng (Discount). Việc chia đều thì bất công, còn tự tính tay tỷ lệ phân bổ thuế/voucher rất phức tạp và dễ nhầm lẫn.

### 2. Sơ đồ Wireframe ASCII — Chia Tiền Hóa Đơn Từng Món (`SplitBill.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Chia Tiền Hóa Đơn                [Mẫu hóa đơn mẫu]    │
├─────────────────────────────────────────────────────────┤
│ [Chia đều số người]    [🧾 Chia theo từng món ăn]       │
├─────────────────────────────────────────────────────────┤
│ DANH SÁCH MÓN ĂN                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Bò Wagyu Nướng             280.000 đ             │ │
│ │    Người ăn: [👨 Nam] [👩 Lan]  (Mỗi người 140k)     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 2. Lẩu Thái Tomyum             360.000 đ             │ │
│ │    Người ăn: [👨 Nam] [👩 Lan] [🧔 Hùng] (Mỗi ng 120k)│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 3. Nước ép cam (Chỉ Hùng)      55.000 đ             │ │
│ │    Người ăn: [🧔 Hùng]                               │ │
│ └─────────────────────────────────────────────────────┘ │
│ [+ Thêm món mới]                                        │
├─────────────────────────────────────────────────────────┤
│ THUẾ & PHỤ PHÍ CHUNG CỦA HÓA ĐƠN                        │
│ • Thuế VAT (10%):           +69.500 đ                   │
│ • Phí phục vụ (5%):         +34.750 đ                   │
│ • Voucher Giảm giá:         -50.000 đ                   │
│ ─────────────────────────────────────────────────────── │
│ Tổng tiền thực trả cả bàn:   749.250 đ                  │
├─────────────────────────────────────────────────────────┤
│ BẢNG TÍNH PHÂN BỔ TỶ TRỌNG MINH BẠCH (PRO-RATA)         │
│ 👨 Nam:  Tiền món 260k + Thuế/Giảm (+19.980đ) = 279.980đ│
│ 👩 Lan:  Tiền món 260k + Thuế/Giảm (+19.980đ) = 279.980đ│
│ 🧔 Hùng: Tiền món 175k + Thuế/Giảm (+14.290đ) = 189.290đ│
│ Tổng cộng kiểm tra: 749.250 đ (Khớp 100% đến từng đồng) │
├─────────────────────────────────────────────────────────┤
│ [           GỬI YÊU CẦU CHIA TIỀN CHO CẢ NHÓM         ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Màn hình Thành viên Nhận Yêu Cầu Thanh Toán
```
┌─────────────────────────────────────────────────────────┐
│ 🧾 CHI TIẾT YÊU CẦU THANH TOÁN TIỀN ĂN                  │
│ Người tạo: Nam Nguyễn • Bữa tối Haidilao cuối tuần      │
├─────────────────────────────────────────────────────────┤
│ MÓN BẠN ĐÃ DÙNG:                                        │
│ • 1/3 Lẩu Thái Tomyum:               120.000 đ          │
│ • 1x Nước ép cam:                     55.000 đ          │
│ Tiền món của bạn:                    175.000 đ          │
│                                                         │
│ PHÂN BỔ THUẾ & ƯU ĐÃI (Tỷ trọng 24.6%):                 │
│ • Thuế VAT 10% & Phí dịch vụ 5%:     +26.500 đ          │
│ • Chiết khấu giảm giá bàn ăn:        -12.210 đ          │
│ ─────────────────────────────────────────────────────── │
│ TỔNG SỐ TIỀN CẦN TRẢ:                189.290 đ          │
├─────────────────────────────────────────────────────────┤
│ [                XÁC NHẬN CHUYỂN TIỀN NGAY            ] │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy chuẩn Thuật toán UI & Trải nghiệm
- **Chạm avatar gán người ăn**: Mỗi avatar thành viên có viền màu riêng. Chạm vào avatar dưới mỗi món ăn để toggle bật/tắt người tham gia. Tiền món tự động chia đều cho số avatar được chọn.
- **Bảo đảm không lệch số dư (Zero Rounding Error)**:
  - Công thức: `finalAmount_i = round(subtotal_i + netAdjustment * (subtotal_i / totalSubtotal))`.
  - Khoản dư làm tròn vài đồng lẻ do số thập phân được cộng trực tiếp vào phần của người đầu tiên (người tạo yêu cầu) để $\sum finalAmount == totalAmount$ tuyệt đối.
- **Minh bạch hóa**: Khi người nhận mở link/thông báo thanh toán, danh sách món họ đã ăn được liệt kê cụ thể kèm cách tính thuế/giảm giá phân bổ, giúp tránh hoàn toàn tranh cãi hoặc ngại ngùng khi chia tiền nhóm.

---

## 41. Quản Lý Thiết Bị Tin Cậy (WebAuthn Passkeys) & Đóng Băng Ví Khẩn Cấp SOS (Issue #98) — `Account.tsx` & `Home.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu Pháp lý & Thị trường**: Thông tư 50/2024/TT-NHNN về an toàn bảo mật trực tuyến trong ngân hàng, MoMo / Revolut Security Center.
- **Nghiệp vụ**:
  - Người dùng có thể kiểm tra danh sách thiết bị đã đăng ký xác thực sinh trắc học (Passkeys / WebAuthn), xóa/thu hồi quyền truy cập của từng máy cũ hoặc máy bị mất.
  - Tính năng **Đóng Băng Ví Khẩn Cấp (Emergency Wallet Freeze SOS)** cho phép chủ ví lập tức khóa toàn bộ chiều rút/chuyển tiền ra ngoài khi nghi ngờ lộ mật khẩu hoặc mất điện thoại, nhưng vẫn cho phép nhận tiền vào. Luồng kích hoạt được thiết kế chống bấm nhầm (Double Confirmation / Slider to Lock).

### 2. Sơ đồ Wireframe ASCII — Màn hình Quản Lý Thiết Bị & Khóa Ví Khẩn Cấp (`Account.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Trung Tâm An Toàn & Bảo Mật                           │
├─────────────────────────────────────────────────────────┤
│ 🛡️ BẢO VỆ TÀI KHOẢN VÀ THIẾT BỊ                        │
│                                                         │
│ 📱 THIẾT BỊ TIN CẬY ĐÃ ĐĂNG KÝ (2 thiết bị)             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💻 MacBook Pro 14" (Touch ID)         [Thiết bị này]│ │
│ │ Đăng ký: 12/10/2026 • Hoạt động: Vừa xong           │ │
│ │ Khóa WebAuthn: cred-98124...          (Không thể xóa)│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 📱 iPhone 16 Pro (Face ID)                          │ │
│ │ Đăng ký: 05/09/2026 • Hoạt động: Hôm qua             │ │
│ │ Khóa WebAuthn: cred-31049...           [🗑️ Thu hồi] │ │
│ └─────────────────────────────────────────────────────┘ │
│ [+ Đăng ký thêm thiết bị / Passkey mới]                 │
├─────────────────────────────────────────────────────────┤
│ 🚨 KHU VỰC KHẨN CẤP (SOS)                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ ĐÓNG BĂNG VÍ KHẨN CẤP                            │ │
│ │ Khi nghi ngờ lộ tài khoản hoặc mất điện thoại:      │ │
│ │ • Tạm khóa ngay chiều chuyển tiền, thanh toán, rút  │ │
│ │ • Chiều nhận tiền vào ví vẫn hoạt động bình thường   │ │
│ │ • Chỉ mở khóa lại bằng Sinh trắc học eKYC           │ │
│ │                                                     │ │
│ │ [       🚨 YÊU CẦU ĐÓNG BĂNG VÍ KHẨN CẤP        ]   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚠️ XÁC NHẬN ĐÓNG BĂNG VÍ KHẨN CẤP (CHỐNG CHẠM NHẦM)    │
├─────────────────────────────────────────────────────────┤
│ Hành động này sẽ TẠM KHÓA TOÀN BỘ giao dịch chi tiêu   │
│ trên mọi thiết bị cho tới khi bạn xác thực lại eKYC!    │
│                                                         │
│ Để xác nhận, vui lòng nhập chữ "KHOA VI" vào ô dưới:    │
│ [ KHOA VI                                             ] │
│                                                         │
│        ───► [ Kéo thanh trượt để Khóa ngay ] ───►       │
│                                                         │
│ [                     HỦY BỎ                          ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Trạng Thái Ví Đang Bị Đóng Băng trên `Home.tsx`
```
┌─────────────────────────────────────────────────────────┐
│ 🚨 BANNER CẢNH BÁO BẢO VỆ TOÀN CỤC                      │
│ ⚠️ VÍ ĐANG Ở CHẾ ĐỘ ĐÓNG BĂNG BẢO VỆ KHẨN CẤP          │
│ Mọi lệnh rút/chuyển tiền bị tạm dừng.       [Mở khóa ngay]
├─────────────────────────────────────────────────────────┤
│ SỐ DƯ VÍ: 5.420.000 đ                      [🔒 Đang khóa]│
├─────────────────────────────────────────────────────────┤
│ LƯỚI TÍNH NĂNG CHÍNH:                                   │
│ [ ↗️ Chuyển tiền ] [ 🧾 Thanh toán ]  [ 💳 Rút tiền ]    │
│ (Bị làm mờ + Badge ổ khóa "Tạm khóa chi tiêu SOS")       │
│                                                         │
│ [ 📥 Nạp tiền ]    [ 🏷️ Nhận tiền QR ]                    │
│ (Vẫn hoạt động bình thường để nhận tiền an toàn)         │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy chuẩn Trạng thái, Tokens & Micro-interactions
- **Phòng chống bấm nhầm (Accidental Lock Prevention)**:
  - Nút kích hoạt ban đầu màu đỏ viền `--el-danger`. Khi bấm sẽ mở Modal xác nhận 2 tầng: Yêu cầu gõ chính xác chuỗi `KHOA VI` hoa không dấu và Kéo thanh trượt (Slide-to-confirm).
- **Thu hồi thiết bị (Revoke Device)**:
  - Thiết bị hiện tại đang đăng nhập (`Current Device`) có nhãn "Thiết bị này", nút Thu hồi bị vô hiệu hóa để tránh người dùng tự khóa chính mình khỏi phiên làm việc hiện tại.
  - Khi thu hồi thiết bị khác: Hiện Dialog xác nhận *"Bạn có chắc chắn muốn thu hồi quyền truy cập của 'iPhone 16 Pro'? Thiết bị này sẽ bị đăng xuất và không thể xác thực Passkey cho tới khi đăng ký lại."*
- **Mở khóa ví (Unfreeze Flow)**:
  - Bấm nút "Mở khóa ngay" trên Banner hoặc trong Cài đặt -> Mở camera quét khuôn mặt sống (eKYC Liveness Match) hoặc yêu cầu xác thực WebAuthn hợp lệ từ thiết bị tin cậy.

---

## 42. Trung Tâm Quản Lý Gói Đăng Ký Số & Lá Chắn Tự Hủy Dùng Thử (Issue #103) — `DigitalSubscription.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: Revolut Subscription Manager & Free-Trial Shield, MoMo Quản lý dịch vụ liên kết / Thanh toán định kỳ.
- **Nỗi đau người dùng (Free Trial Trap)**: Người dùng hay đăng ký các gói dùng thử miễn phí hoặc gói khuyến mại tháng đầu (Netflix, YouTube Premium, Spotify, ChatGPT Plus, iCloud, Google One...), nhưng rất hay quên hủy trước hạn dẫn tới việc bị trừ tiền ngầm các tháng sau.
- **Giải pháp**:
  - Thống kê tổng số tiền thuê bao số cố định hàng tháng (`monthlyTotalVnd`).
  - Cung cấp "Lá chắn dùng thử": Tự động kích hoạt trạng thái `CANCEL_AT_PERIOD_END` ngay lúc mua/dùng thử. Khách hàng vẫn dùng trọn vẹn 30 ngày kỳ hiện tại nhưng 100% không bị trừ tiền kỳ tiếp theo.

### 2. Sơ đồ Wireframe ASCII — Trung Tâm Quản Lý Thuê Bao Số (`DigitalSubscription.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Gói Đăng Ký Dịch Vụ Số                [Lịch sử gói]   │
├─────────────────────────────────────────────────────────┤
│ 💳 TỔNG CHI PHÍ THUÊ BAO HÀNG THÁNG                     │
│ 407.000 đ / tháng                                       │
│ • Đang bật tự động gia hạn: 2 dịch vụ                   │
│ • Gói sắp trừ tiền: YouTube Premium (79k) sau 3 ngày    │
├─────────────────────────────────────────────────────────┤
│ DỊCH VỤ ĐANG HOẠT ĐỘNG (ACTIVE SUBSCRIPTIONS)           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ▶️ YouTube Premium Cá Nhân                79.000 đ/th│ │
│ │ Hết hạn kỳ này: 02/11/2026 (Còn 4 ngày)             │ │
│ │ Tự động gia hạn: [ BẬT ● ]      [Hủy gia hạn kỳ sau]│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 🎵 Spotify Premium 1 Tháng               59.000 đ/th│ │
│ │ Hết hạn kỳ này: 24/11/2026                          │ │
│ │ Tự động gia hạn: [ BẬT ● ]      [Hủy gia hạn kỳ sau]│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 🤖 ChatGPT Plus (OpenAI)                499.000 đ/th│ │
│ │ Hết hạn kỳ này: 15/11/2026                          │ │
│ │ 🛡️ ĐÃ BẬT LÁ CHẮN TỰ HỦY: Kỳ sau sẽ không trừ tiền! │ │
│ │ [ Kích hoạt lại gia hạn ]                           │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ KHÁM PHÁ GÓI DỊCH VỤ MỚI                                │
│ [ 🎬 Netflix ]  [ ☁️ iCloud+ 50GB ]  [ 📦 Google One ]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ĐĂNG KÝ GÓI: NETFLIX STANDARD (1 THÁNG)                 │
├─────────────────────────────────────────────────────────┤
│ Giá gói cước: 260.000 đ / tháng                         │
│ Chu kỳ: 30 ngày kể từ ngày thanh toán                  │
├─────────────────────────────────────────────────────────┤
│ 🛡️ LÁ CHẮN TỰ ĐỘNG BẢO VỆ VÍ (KHUYÊN DÙNG)              │
│ [X] Tự động hủy gia hạn sau kỳ này                     │
│     (Vẫn xem trọn vẹn 30 ngày, bảo đảm không bị trừ     │
│      tiền ngoài ý muốn ở chu kỳ sau)                    │
│                                                         │
│ Đặt mức giá trần tối đa khi gia hạn (Max Cap):          │
│ [ 260.000 đ                                           ] │
│ (Chặn trừ tiền nếu nhà cung cấp tự ý tăng giá cước)     │
├─────────────────────────────────────────────────────────┤
│ [             THANH TOÁN & BẬT LÁ CHẮN                ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Trạng Thái Rỗng & Xử Lý Lỗi
```
┌─────────────────────────────────────────────────────────┐
│ 📭 TRẠNG THÁI RỖNG (EMPTY STATE)                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │               🛡️✨                                  │ │
│ │     Chưa có gói thuê bao nào được liên kết          │ │
│ │  Bạn chưa đăng ký dịch vụ số định kỳ nào.           │ │
│ │  Đăng ký ngay các dịch vụ giải trí phổ biến bên     │ │
│ │  dưới kèm Lá Chắn Bảo Vệ Ví chống trừ tiền ngầm!    │ │
│ │            [ Khám phá danh mục dịch vụ ]            │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy chuẩn Tokens & Tương Tác
- **Badge Lá chắn Tự hủy**: Màu xanh ngọc `--el-info` với icon `shield`, hiển thị chữ *"Kỳ sau sẽ không trừ tiền"*.
- **Gạt toggle Gia hạn tự động**:
  - Gạt sang OFF: Không hủy gói ngay lập tức mà gọi `PATCH .../renewal` chuyển sang `CANCEL_AT_PERIOD_END`, giữ nguyên mã kích hoạt và hạn dùng hiện tại.
  - Hiển thị Toast thông báo: *"Đã tắt gia hạn tự động. Bạn vẫn có thể sử dụng dịch vụ đến hết ngày DD/MM/YYYY."*
- **Trần giá cước (`maxRenewalPrice`)**: Khi nhà cung cấp tăng giá cước vượt trần, hệ thống tự động treo giao dịch gia hạn và gửi thông báo nhắc duyệt ở Mục 35.

---

## 43. Hũ Tiết Kiệm Mục Tiêu 2.0: Khóa Hũ Kỷ Luật & Thử Thách Tiết Kiệm (Issue #109) — `Wealth.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: Monzo Locked Pots, Starling Spaces, Timo Goal Save, MoMo Heo đất tích lũy.
- **Nghiệp vụ**:
  - Hũ tiết kiệm thông thường hay thất bại do người dùng rút tiền ngẫu hứng (Impulse Withdrawal).
  - Bổ sung **Chế độ Khóa Kỷ Luật (`commitmentLocked`)**: Khóa hũ cho tới ngày mục tiêu hoặc khi chạm 100% số tiền đích.
  - Cung cấp **Mẫu Thử Thách Tiết Kiệm 52 Tuần / 30 Ngày**: Lộ trình nạp tiền tăng dần từng kỳ có bảng theo dõi trực quan và thưởng Huy hiệu + Điểm Loyalty khi hoàn thành mục tiêu.

### 2. Sơ đồ Wireframe ASCII — Màn hình Hũ Tiết Kiệm & Lộ Trình Thử Thách
```
┌─────────────────────────────────────────────────────────┐
│ ← Hũ Tiết Kiệm Mục Tiêu             [+ Tạo hũ mới]      │
├─────────────────────────────────────────────────────────┤
│ 🎯 DANH SÁCH MỤC TIÊU CỦA TÔI                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💻 Mua MacBook Pro M4           🔒 ĐÃ KHÓA KỶ LUẬT  │ │
│ │ Tiến độ: 24.000.000 đ / 40.000.000 đ (60%)          │ │
│ │ [████████████████░░░░░░░░░░] Hạn: 31/12/2026        │ │
│ │ Còn thiếu: 16.000.000 đ • 🔒 Mở khóa khi đạt 100%   │ │
│ │ [ Bỏ ống thêm ]                    [Xin mở khóa sớm]│ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 📅 Thử thách tiết kiệm 52 tuần   [Tuần 18/52]       │ │
│ │ Tích lũy: 1.710.000 đ / 13.780.000 đ (12.4%)        │ │
│ │ Kỳ này (Tuần 18): Cần bỏ ống 180.000 đ              │ │
│ │ [       ⚡ BỎ ỐNG TUẦN 18 (180.000 Đ) NGAY        ] │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ BẢNG THEO DÕI THỬ THÁCH 52 TUẦN (CHALLENGE CHECKLIST)   │
│ [v] T1   [v] T2   [v] T3   [v] T4   [v] T5   [v] T6     │
│ [v] T7   [v] T8   [v] T9   [v] T10  [v] T11  [v] T12    │
│ [v] T13  [v] T14  [v] T15  [v] T16  [v] T17  [●] T18    │
│ [ ] T19  [ ] T20  [ ] T21  [ ] T22  [ ] T23  [ ] T24... │
│ Ghi chú: [v] Đã bỏ ống   [●] Kỳ hiện tại   [ ] Chưa đến │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚠️ XIN MỞ KHÓA SỚM (PHÁ VỠ KỶ LUẬT TIẾT KIỆM)           │
├─────────────────────────────────────────────────────────┤
│ Hũ "Mua MacBook Pro M4" đang được bảo vệ kỷ luật!       │
│ Rút tiền trước hạn sẽ làm chậm mục tiêu của bạn.        │
│                                                         │
│ ⏳ THỜI GIAN CHỜ HẠ NHIỆT (COOLING-OFF PERIOD): 24 GIỜ  │
│ Yêu cầu mở khóa sẽ có hiệu lực sau 24 giờ kể từ lúc gửi│
│ để giúp bạn cân nhắc kỹ lưỡng tránh tiêu xài cảm tính.  │
│                                                         │
│ [           TÔI VẪN MUỐN GỬI YÊU CẦU MỞ KHÓA          ] │
│ [              TIẾP TỤC GIỮ KỶ LUẬT (HỦY)             ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Màn hình Chúc Mừng Hoàn Thành Mục Tiêu 100%
```
┌─────────────────────────────────────────────────────────┐
│ 🎉 • • • • CHÚC MỪNG BẠN ĐÃ CÁN ĐÍCH! • • • • 🎉        │
├─────────────────────────────────────────────────────────┤
│            🏆 BẬC THẦY KỶ LUẬT TIẾT KIỆM                │
│                                                         │
│ Hũ "Mua MacBook Pro M4" đã hoàn thành xuất sắc!         │
│ Số tiền tích lũy: 40.000.000 đ / 40.000.000 đ (100%)    │
│                                                         │
│ 🎁 PHẦN THƯỞNG HOÀN THÀNH:                              │
│ • +500 Điểm Thưởng Loyalty                             │
│ • Voucher Pass mua sắm giảm 100.000 đ                   │
│                                                         │
│ [           RÚT TOÀN BỘ TIỀN VỀ VÍ CHÍNH              ] │
│ [              TẠO MỤC TIÊU TIẾP THEO                 ] │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy chuẩn Tokens & Micro-interactions
- **Thanh tiến độ (Progress Bar)**:
  - Khi đang tích lũy: Gradient `--el-accent` đến tím dịu.
  - Khi chạm 100%: Chuyển sang xanh lá thành công `--el-success` kèm biểu tượng cúp vàng 🏆.
- **Micro-interaction bỏ ống**: Khi bấm "Bỏ ống kỳ này", hoạt ảnh đồng xu vàng rơi vào hũ kêu "ting" kèm số tiền cộng dồn nhảy số mượt mà (count-up animation).
- **Phá khóa kỷ luật**: Nút "Xin mở khóa sớm" dùng style nút phụ xám viền mờ `--el-line`, không dùng màu đỏ bắt mắt để tránh kích thích người dùng bấm vào.

---

## 44. Biệt Danh Nhận Tiền Cá Nhân Hóa `@Paytag` & Ẩn Số Điện Thoại Riêng Tư (Issue #111) — `Account.tsx`, `ReceiveQr.tsx` & `Transfer.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: Revolut Revtag (`@username`), Wise Wisetag, TPBank/MBBank Account Alias, MoMo Link Nhận Tiền Cá Nhân.
- **Vấn đề**: Người dùng bán hàng online, nhận tiền quyên góp hoặc giao dịch với người lạ thường ngần ngại cung cấp số điện thoại thật vì sợ bị lộ thông tin cá nhân và bị gọi điện làm phiền.
- **Giải pháp**:
  - Đăng ký một biệt danh `@paytag` duy nhất (VD: `@minhanh`, `@hiepnh`).
  - Khi nhận tiền qua `@paytag`, số điện thoại thật được tự động che `090***6789`, người chuyển chỉ thấy tên chủ ví đã xác thực eKYC.

### 2. Sơ đồ Wireframe ASCII — Cài Đặt `@Paytag` & Danh Thiếp Nhận Tiền (`Account.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Cài Đặt Biệt Danh Nhận Tiền (@Paytag)                 │
├─────────────────────────────────────────────────────────┤
│ 🏷️ BIỆT DANH CỦA BẠN                                    │
│ [ @hiepnh                                             ] │
│ ✅ Biệt danh hợp lệ và khả dụng!                        │
│ Quy tắc: 3-20 ký tự, chữ thường, số, dấu chấm/gạch dưới│
├─────────────────────────────────────────────────────────┤
│ 🔒 BẢO VỆ QUYỀN RIÊNG TƯ                                │
│ [ BẬT ● ] Ẩn số điện thoại khi nhận tiền qua @Paytag    │
│ Khi bật, người chuyển chỉ thấy tên thật eKYC và số      │
│ điện thoại được che dạng: 090***6789                    │
├─────────────────────────────────────────────────────────┤
│ 💳 DANH THIẾP NHẬN TIỀN CÁ NHÂN                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  EWALLET LAB PAYTAG                                 │ │
│ │  👤 NGUYEN HOANG HIEP (Đã xác thực eKYC ✓)          │ │
│ │  🏷️ @hiepnh                                         │ │
│ │  📱 090***6789                                      │ │
│ │  🔗 ewallet.local/@hiepnh               [Sao chép]  │ │
│ └─────────────────────────────────────────────────────┘ │
│ [           LƯU THAY ĐỔI BIỆT DANH                    ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Chuyển Tiền Theo `@Paytag` (`Transfer.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Chuyển Tiền Ví                                        │
├─────────────────────────────────────────────────────────┤
│ NGƯỜI NHẬN                                              │
│ [ @minhanh                                            ] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 TRẦN MINH ANH  (eKYC VERIFIED ✓)                  │ │
│ │ 🏷️ Paytag: @minhanh • 📱 SĐT: 091***4567             │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ SỐ TIỀN CHUYỂN                                          │
│ [ 250.000 đ                                           ] │
│ Lời nhắn: [ Tiền mua áo thun vintage                  ] │
├─────────────────────────────────────────────────────────┤
│ Nguồn tiền: Ví chính (Số dư: 1.500.000 đ)               │
│ Phí chuyển tiền: Miễn phí                               │
│ [                 XÁC NHẬN CHUYỂN TIỀN                ] │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy tắc Validation, Trạng Thái Lỗi & Bảo Mật
- **Validation Biệt danh theo thời gian thực**:
  - Gõ phím tới đâu validate tới đó (`debounce 300ms`).
  - Regex: `^[a-z0-9._]{3,20}$`.
  - Danh sách từ khoá cấm hệ thống (Reserved Keywords): `admin`, `system`, `support`, `momo`, `ewallet`, `root` -> Báo lỗi đỏ `--el-danger`: *"Biệt danh này đã được bảo lưu bởi hệ thống."*
  - Nếu đã tồn tại người dùng khác -> Báo lỗi: *"Biệt danh @... đã có người sử dụng. Vui lòng chọn tên khác."*
- **Quy tắc An Toàn eKYC**:
  - Chỉ người dùng có trạng thái `kycStatus == VERIFIED` mới được kích hoạt nhận tiền qua `@paytag` nhằm ngăn chặn kẻ gian mạo danh người nổi tiếng hoặc nhãn hàng để lừa đảo.

---

## 45. Sổ Quản Lý Vay Mượn Cá Nhân 2 Chiều & Trả Nợ Từng Phần (Issue #123) — `PaymentReminder.tsx` / `PersonalDebtBook.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu**: MoMo / ZaloPay Nhắc Trả Tiền & Sổ Nợ, Splitwise / Toss IOU Tracker.
- **Nghiệp vụ**:
  - Trong đời sống thực tế, khi bạn bè mượn nhau khoản tiền lớn (ví dụ 5 triệu đồng), người vay thường trả góp thành nhiều đợt tùy theo khả năng tài chính (trả trước 2 triệu, tuần sau trả 1,5 triệu, còn lại trả cuối tháng).
  - Hệ thống cung cấp **Sổ Quản Lý Vay Mượn Cá Nhân 2 Chiều**:
    1. Theo dõi vị thế công nợ ròng ("Cần thu về" vs "Cần trả người khác").
    2. Hỗ trợ trả nợ linh hoạt từng phần (`PARTIALLY_PAID`) cho tới khi số nợ còn lại về 0 (`PAID`).
    3. Lưu lại nhật ký các đợt trả góp chi tiết để hai bên cùng đối soát minh bạch.

### 2. Sơ đồ Wireframe ASCII — Sổ Quản Lý Vay Mượn 2 Chiều (`PersonalDebtBook.tsx`)
```
┌─────────────────────────────────────────────────────────┐
│ ← Sổ Vay Mượn & Nhắc Nợ             [+ Tạo khoản nợ mới]│
├─────────────────────────────────────────────────────────┤
│ ⚖️ VỊ THẾ CÔNG NỢ RÒNG                                  │
│ ┌───────────────────────────┐ ┌───────────────────────┐ │
│ │ 💚 Bạn cần thu về         │ │ 🧡 Bạn cần trả        │ │
│ │ + 3.500.000 đ             │ │ - 1.200.000 đ         │ │
│ └───────────────────────────┘ └───────────────────────┘ │
│ Vị thế ròng: + 2.300.000 đ (Đang cho vay nhiều hơn)     │
├─────────────────────────────────────────────────────────┤
│ [ Người khác nợ tôi (2) ]     [ Tôi đang nợ người khác (1) ]
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 Hoàng Nam - "Tiền cọc phòng du lịch Đà Lạt"      │ │
│ │ Gốc: 5.000.000 đ • Hạn trả: 15/11/2026               │ │
│ │ Tiến độ: Đã trả 2.000.000 đ (40%)                   │ │
│ │ [██████████░░░░░░░░░░░░░░] CÒN NỢ: 3.000.000 đ      │ │
│ │ Trạng thái: [🟡 ĐÃ TRẢ MỘT PHẦN]                     │ │
│ │                                                     │ │
│ │ [ Xem lịch sử trả góp ]             [ Nhắc trả tiền ]│ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ← Trả Tiền Khoản Nợ: "Tiền cọc phòng du lịch"          │
├─────────────────────────────────────────────────────────┤
│ Người nhận: Hoàng Nam • Tổng nợ ban đầu: 5.000.000 đ    │
│ Số tiền còn lại phải trả: 3.000.000 đ                   │
├─────────────────────────────────────────────────────────┤
│ CHỌN HÌNH THỨC THANH TOÁN:                             │
│ ( ) Trả hết toàn bộ số nợ còn lại (3.000.000 đ)         │
│ (●) Trả một phần tùy chọn:                             │
│     Số tiền trả đợt này:                                │
│     [ 1.500.000 đ                                     ] │
│     (Còn nợ lại sau đợt này: 1.500.000 đ)               │
│                                                         │
│ Lời nhắn: [ Tiền lương về trả trước đợt 2 nhé Nam ơi! ] │
├─────────────────────────────────────────────────────────┤
│ Nguồn tiền: Ví chính (Số dư: 4.820.000 đ)               │
│ [             XÁC NHẬN CHUYỂN TIỀN TRẢ GÓP            ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Sơ đồ Wireframe ASCII — Lịch Sử Chi Tiết Từng Lần Trả Góp
```
┌─────────────────────────────────────────────────────────┐
│ 📜 LỊCH SỬ CÁC ĐỢT TRẢ GÓP                              │
│ Khoản nợ: Tiền cọc phòng du lịch (Gốc 5.000.000 đ)      │
├─────────────────────────────────────────────────────────┤
│ • Đợt 2: 1.500.000 đ                    14:20 Hôm nay   │
│   Ghi chú: Tiền lương về trả trước đợt 2                │
│   Dư nợ còn lại sau đợt: 1.500.000 đ                    │
│ ─────────────────────────────────────────────────────── │
│ • Đợt 1: 2.000.000 đ                    09:15 20/10/2026│
│   Ghi chú: Trả trước một phần nhé                       │
│   Dư nợ còn lại sau đợt: 3.000.000 đ                    │
│ ─────────────────────────────────────────────────────── │
│ • Tạo khoản mượn: 5.000.000 đ           10:00 15/10/2026│
├─────────────────────────────────────────────────────────┤
│ [                       ĐÓNG                          ] │
└─────────────────────────────────────────────────────────┘
```

### 4. Quy chuẩn Tokens, Trạng Thái & Xử Lý Đồng Thời
- **Bảng huy hiệu trạng thái (`PaymentRequestStatus`)**:
  - `PENDING`: Badge vàng `--el-amber` ("Chưa trả").
  - `PARTIALLY_PAID`: Badge cam `--el-warning` ("Đã trả một phần").
  - `PAID`: Badge xanh lá `--el-success` ("Đã hoàn tất 100%").
- **Kiểm soát đồng thời (Concurrency Control)**:
  - Nếu có 2 luồng trả nợ cùng lúc dẫn tới số tiền trả vượt quá `remainingAmount`, hệ thống chặn với mã `409 Conflict` và hiện thông báo: *"Khoản nợ này vừa được cập nhật thanh toán từ giao dịch khác. Số nợ còn lại hiện tại là X đ."*
- **Thông báo nhắc nợ tinh tế**:
  - Nút "Nhắc trả tiền" gửi notification 1 chạm sang Trung tâm Thông báo (Mục 35) của người nợ, kèm deep-link mở thẳng form thanh toán đã điền sẵn số nợ còn lại.

---

## 46. Xác Thực Sinh Trắc Học FIDO2 / WebAuthn Passkeys & Ký Số Giao Dịch Động (Dynamic Linking) — `Account.tsx` & `StepUpModal.tsx`

### 1. Bối cảnh & Khảo sát Thực tế
- **Tham chiếu Pháp lý & Chuẩn Công nghiệp**:
  - **Quyết định 2345/QĐ-NHNN & Thông tư 50/2024/TT-NHNN**: Yêu cầu xác thực tăng cường (Step-up Authentication) đối với giao dịch chuyển tiền/thanh toán trên 10.000.000đ/lần hoặc tổng giá trị trên 20.000.000đ/ngày.
  - **Chuẩn FIDO2 / WebAuthn Level 3 (W3C)**: Thay thế mật khẩu và mã OTP truyền thống (vốn dễ bị tấn công Phishing, SIM swap, Man-in-the-middle) bằng cặp khóa bất đối xứng sinh ra an toàn trong phần cứng thiết bị (Apple Secure Enclave, Android Titan M/StrongBox).
  - **Ký Số Giao Dịch Động (Dynamic Linking / Transaction Signing — P3)**: Khóa phiên ký gắn chặt với các thông số của chính giao dịch đó (Số tiền, Tài khoản người nhận, Mã định danh giao dịch `TX-...`), ngăn chặn kẻ tấn công chuyển hướng tiền sang tài khoản gian lận trong quá trình xác thực.

### 2. Luồng Đăng Ký FIDO2 Passkey (`Account.tsx`)
- **Vị trí**: Khu vực *Bảo mật & Xác thực Sinh trắc học* trên màn hình `Account.tsx`.
- **Hộp thoại kích hoạt**:
  - Biểu tượng Passkey FIDO2 đặc trưng (`fingerprint` kết hợp `key`).
  - Cho phép người dùng đặt tên thiết bị thân thiện (Ví dụ: "MacBook Pro M3", "iPhone 16 Pro Max", "YubiKey 5C") hoặc tự động nhận diện từ User-Agent.
  - Gọi ceremony `navigator.credentials.create()` với cấu hình `userVerification: 'required'`, `authenticatorAttachment: 'platform'`.
- **Trạng thái hiển thị**:
  - Huy hiệu "Đã kích hoạt Passkey" với icon tích xanh.
  - Danh sách các khóa đã đăng ký kèm mã định danh rút gọn (`cred-xxxx...`), ngày tạo và lần xác thực gần nhất.

#### Sơ đồ Wireframe ASCII — Đăng Ký Passkey FIDO2
```
┌─────────────────────────────────────────────────────────┐
│ ← Cài Đặt Bảo Mật & Xác Thực FIDO2                      │
├─────────────────────────────────────────────────────────┤
│ 🔐 XÁC THỰC SINH TRẮC HỌC KHÔNG MẬT KHẨU (PASSKEYS)     │
│ Đăng ký vân tay (Touch ID) hoặc khuôn mặt (Face ID) để   │
│ ký số an toàn cho giao dịch giá trị cao theo QĐ 2345.   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔑 TẠO PASSKEY MỚI CHO THIẾT BỊ NÀY                 │ │
│ │                                                     │ │
│ │ Tên nhận diện thiết bị:                              │ │
│ │ [ MacBook Pro M3 (Cơ quan)                        ] │ │
│ │ (Giúp bạn dễ phân biệt khi quản lý nhiều thiết bị)  │ │
│ │                                                     │ │
│ │ [       🛡️ KÍCH HOẠT TOUCH ID / FACE ID NGAY       ] │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 📱 PASSKEYS ĐÃ LIÊN KẾT (2)                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💻 MacBook Pro M3 (Cơ quan)           [Thiết bị này]│ │
│ │ Mã khóa: cred_8f921... • Tạo ngày: 15/10/2026       │ │
│ │ Lần dùng gần nhất: 10:15 Hôm nay      [✓ Đang bật]  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 📱 iPhone 16 Pro                                    │ │
│ │ Mã khóa: cred_3a104... • Tạo ngày: 01/09/2026       │ │
│ │ Lần dùng gần nhất: Hôm qua             [🗑️ Thu hồi] │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Luồng Ký Xác Nhận Giao Dịch Động (Transaction Signing / Dynamic Linking) — `StepUpModal.tsx`
- **Thay thế StepUpModal đơn giản trước đây**:
  - Trước đây, `StepUpModal` chỉ hiển thị dòng chữ thông báo đơn điệu và một nút bấm mô phỏng.
  - Phiên bản mới tích hợp **Dynamic Linking**: Ràng buộc dữ liệu giao dịch trực tiếp vào Challenge của WebAuthn.
- **Thành phần hiển thị trên Modal**:
  1. **Khung tóm tắt giao dịch được liên kết (Transaction Summary Card)**:
     - Số tiền giao dịch: Nổi bật với kích thước lớn và màu `--el-accent` (Ví dụ: `15.000.000 đ`).
     - Người nhận / Đơn vị thụ hưởng: Tên chủ tài khoản hoặc dịch vụ (Ví dụ: `Nguyễn Văn B` hoặc `Điện lực TP.HCM`).
     - Mã xác thực giao dịch động: `Mã phiên: TX-8921-3401`.
  2. **Vùng quét sinh trắc học tương tác (Biometric Scanning Area)**:
     - Biểu tượng vân tay `fingerprint` với hiệu ứng vòng tròn gợn sóng nhịp tim (Pulse wave animation).
     - Dòng chỉ dẫn: *"Chạm cảm biến Touch ID hoặc nhìn vào Face ID để ký xác nhận giao dịch"*.
  3. **Xử lý trạng thái lỗi & Fallback**:
     - Khi người dùng huỷ hoặc quét sai: Hiển thị hộp thoại lỗi cảnh báo đỏ `--el-danger` kèm nút "Thử lại".
     - Khi thiết bị không hỗ trợ hoặc chưa đăng ký FIDO2: Tự động chuyển sang chế độ dự phòng an toàn (Mã OTP xác thực bổ sung) với cảnh báo rõ ràng.

#### Sơ đồ Wireframe ASCII — Hộp Thoại Ký Xác Nhận Giao Dịch Động (Dynamic Linking)
```
┌─────────────────────────────────────────────────────────┐
│              CẦN XÁC THỰC BỔ SUNG (QĐ 2345)             │
├─────────────────────────────────────────────────────────┤
│ Giao dịch vượt ngưỡng 10.000.000 đ. Vui lòng xác thực   │
│ sinh trắc học để ký duyệt lệnh chuyển tiền.             │
├─────────────────────────────────────────────────────────┤
│ 📋 THÔNG TIN GIAO DỊCH ĐƯỢC LIÊN KẾT ĐỘNG (P3)          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Số tiền ký duyệt:       15.000.000 đ                │ │
│ │ Người nhận tiền:        NGUYEN VAN B                │ │
│ │ Tài khoản / Ví:         0912 345 678                │ │
│ │ Mã giao dịch động:      TX-8921-3401                │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                   (((  ( 🫆 )  )))                      │
│             [ Hiệu ứng gợn sóng sinh trắc ]             │
│                                                         │
│     Đang chờ bạn chạm Touch ID / Face ID trên máy...    │
├─────────────────────────────────────────────────────────┤
│ [            CHẠM TOUCH ID ĐỂ KÝ GIAO DỊCH            ] │
│ [                     HỦY GIAO DỊCH                   ] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⚠️ XÁC THỰC THẤT BẠI HOẶC BỊ HỦY                        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ❌ Không nhận diện được vân tay hoặc bạn đã bấm hủy  │ │
│ │    trên cửa sổ hệ thống.                            │ │
│ └─────────────────────────────────────────────────────┘ │
│ [                 THỬ LẠI XÁC THỰC                    ] │
│ [      Xác thực bằng phương thức dự phòng (Mô phỏng)   ] │
│ [                     HỦY GIAO DỊCH                   ] │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Bảng Quy Chuẩn Tokens & Trạng Thái Xử Lý

| Thành phần UI | Token Màu / Typo | Ý nghĩa & Hành vi |
| :--- | :--- | :--- |
| **Biểu tượng FIDO2** | `--el-accent` / `--el-accent-soft` | Icon `fingerprint` hoặc `key` nền tròn mềm mại 52x52px |
| **Thẻ Dynamic Linking** | `--el-surface-2`, border `--el-line` | Bo góc 12px, nền tương phản nhẹ, font số tiền đậm 18px `--el-font-display` |
| **Hiệu ứng Pulse Wave** | Gradient mờ từ `--el-accent` | 3 vòng tròn đồng tâm mở rộng mô phỏng sóng radar sinh trắc học |
| **Nút Hành động Ký số** | Nền `--el-accent`, chữ trắng | Label thay đổi: "Chạm Touch ID để ký giao dịch" -> "Đang ký số..." |
| **Banner lỗi xác thực** | `--el-danger`, nền `--el-danger-surface` | Viền đỏ nhạt, icon `error`, chữ đậm giải thích nguyên nhân |
| **Nút Fallback** | Nền `--el-surface`, viền `--el-line` | Dùng khi không có phần cứng FIDO2 hoặc gặp lỗi liên tục |

### 5. Xử Lý Trường Hợp Biên (Edge Cases & Fallback)
1. **Trình duyệt / Thiết bị không hỗ trợ FIDO2 (`isUserVerifyingPlatformAuthenticatorAvailable == false`)**:
   - Tự động ẩn nút Touch ID/Face ID.
   - Hiển thị banner hướng dẫn: *"Thiết bị này chưa hỗ trợ sinh trắc học FIDO2. Sử dụng bước xác nhận dự phòng theo QĐ 2345."* kèm nút xác nhận thông thường.
2. **Người dùng hủy trên hộp thoại hệ thống (`NotAllowedError` / User Cancelled)**:
   - Giữ nguyên thông tin tóm tắt giao dịch, hiển thị nút "Thử lại" thay vì đóng modal đột ngột làm mất dữ liệu form chuyển tiền.
3. **Thao tác ký số bị timeout (`TimeoutError`)**:
   - Sau 60 giây không có phản hồi từ cảm biến sinh trắc học, modal tự động hủy phiên ký và hiển thị thông báo: *"Hết thời gian chờ xác thực. Vui lòng thử lại."*



