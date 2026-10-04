# Ewallet Lab — Developer Docs

Developer-portal site cho [`ewallet-lab`](../../backend/projects/ewallet-lab/): Overview, Architecture,
In-house services (API reference), Partners & specs, Frontend, Deployment, Roadmap.

Built with React + Vite (not the earlier hand-written HTML — see "Why React" below). Data-driven
so it scales: adding a page is "one entry in `src/nav.ts` + one component registered in
`src/pages/index.tsx`", no other file changes.

## Run

```bash
npm install
npm run dev       # http://localhost:5173, hot reload
npm run build     # outputs dist/ — plain static files, deployable anywhere (Cloudflare Pages, S3, nginx...)
npm run preview   # serve the dist/ build locally
```

## Structure

```
src/
  nav.ts             single source of truth for sidebar + valid routes, for BOTH spaces
  pages/index.tsx    id -> page component registry (must match nav.ts ids), one flat map for both spaces
  pages/*.tsx        one component per Developer page
  pages/biz/*.tsx    one component per Business page
  components.tsx     shared content pieces (Note, Ep, FieldsTable, FlowDiagram, RoadmapItem, BizFeature...)
  NavContext.tsx      lets any page link to another (<PageLink to="...">) without prop-drilling
  App.tsx             layout (sidebar, mobile menu, theme toggle, space switch) + hash router
  styles.css          ported from the original static site, class names unchanged
```

## Developer/Business space switch (issue #17)

The sidebar has a segmented control (under the brand mark, where a static "Developer Docs" label
used to be) that switches between two independent spaces:

- **Developer** (default) — exactly the content that existed before this switch: architecture,
  service API references, deployment. Nothing changed here.
- **Business** — a new space translating `ewallet-lab`'s actual product business rules (limits,
  step-up auth, escrow/refund windows, family-wallet enforcement...) into non-technical language.
  Every rule on these pages is translated from a specific section of the backend `DESIGN.md` — this
  space is not feature marketing copy, and intentionally contains zero architecture/API detail
  (that stays in Developer space).

**Architecture decision — how one `NAV_GROUPS`/`PAGES` became two spaces** (the "điểm rẽ kiến trúc"
the issue flagged, not a severity-4 architecture call like #12/#13/#14, so resolved directly rather
than asking first, per the issue's own instruction):

- Chose **option (a)** from the issue: a single flat `PAGES` registry shared by both spaces (every
  Business page id is prefixed `biz-`, e.g. `biz-overview`, `biz-limits`, so ids never collide with
  Developer's unprefixed ids), while `nav.ts`'s `NAV_GROUPS` became a function of the current
  `space` state (`navGroupsFor(space)`, backed by two separate arrays, `DEV_NAV_GROUPS` and
  `BIZ_NAV_GROUPS`) instead of one global constant.
- Rejected **option (b)** (rendering Business as static content entirely outside the
  `PAGES`/hash-router mechanism): it would have been slightly simpler for Business's current small
  page count, but it throws away per-page deep-linking for Business content, which is exactly the
  kind of link a reader would want to share (e.g. "read the limits page"). Option (a) costs one
  prefix convention and gives deep-linking for free, since the hash router already exists.
- **Space IS encoded into the hash**, the "cân nhắc thêm" the issue raised explicitly rather than
  leaving it an unexamined default: Business pages use `#business/<id>` (e.g.
  `#business/biz-limits`), fully shareable like any Developer link. Developer space deliberately
  keeps the **original unprefixed hash shape** (`#overview`, no `#developer/` prefix) so every link
  that existed before this change keeps resolving exactly as before — `nav.ts`'s `parseHash`/
  `buildHash` encode this asymmetry explicitly (see their doc comments) rather than leaving it as
  an implicit special case buried in `App.tsx`.
- Space itself is **not** persisted to `localStorage` (unlike the theme toggle) — it's derived
  purely from the current hash, and switching spaces via the segmented control navigates to that
  space's default page (`DEFAULT_PAGE_BY_SPACE`), which updates the hash. This keeps a single
  source of truth (the URL) instead of two potentially-conflicting ones (URL vs. stored
  preference).

## Why React (not the original static HTML)

The first version was a single hand-written `index.html` with manual `data-page`/`data-target`
attributes. It worked, but every new page meant writing a full HTML section by hand with no type
safety. This version keeps the exact same visual design (CSS ported near-verbatim) but makes
content additions mechanical and type-checked — the tradeoff is a `npm install`/build step where
there wasn't one before.

## Deploying

`npm run build`'s `dist/` output is a plain static site (no server-side code, no env vars) — fine
for Cloudflare Pages, GitHub Pages, S3+CloudFront, or just committing `dist/` somewhere. Cloudflare
Pages: connect the repo, set the build command to `npm run build` and the output directory to
`engineering/docs/ewallet-lab/dist` (or run the build yourself and use direct-upload / `wrangler
pages deploy dist`).

Cập nhật docs này song song mỗi khi `ewallet-lab` có service/tính năng mới — theo nguyên tắc đã lưu
là luôn có docs đi kèm service (xem `always_build_developer_docs_with_services` trong memory).
