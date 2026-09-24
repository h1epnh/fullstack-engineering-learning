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
  nav.ts            single source of truth for sidebar + valid routes
  pages/index.tsx    id -> page component registry (must match nav.ts ids)
  pages/*.tsx        one component per page
  components.tsx     shared content pieces (Note, Ep, FieldsTable, FlowDiagram, RoadmapItem...)
  NavContext.tsx      lets any page link to another (<PageLink to="...">) without prop-drilling
  App.tsx             layout (sidebar, mobile menu, theme toggle) + hash router
  styles.css          ported from the original static site, class names unchanged
```

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
