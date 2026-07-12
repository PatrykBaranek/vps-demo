# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project overview

A Next.js 16 (App Router) demo app showcasing several integrations: RSS feed
reading with AI summarization, a TanStack AI chat demo, a Web API playground,
local-first data with Dexie, bookmarks, and AdSense. Deployed as a standalone
Next.js build behind Docker on a VPS. All application data lives client-side in
the browser (IndexedDB) — there is no server database and no authentication.

## Stack

- **Framework**: Next.js 16 (App Router, React 19, React Compiler enabled,
  `cacheComponents: true`, `output: "standalone"`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui (`components/ui`), style "base-nova"
- **Data**: Dexie.js (IndexedDB, client-side only). Two databases:
  `lib/dexie-db.ts` (`DexieShowcaseDatabase` — tasks/contacts/notes for the
  Dexie showcase) and `lib/app-db.ts` (`VpsDemoAppDatabase` — posts, RSS
  sources, bookmarks). App data is seeded once via Dexie's `on('populate')`
  event; reactive reads use `useLiveQuery` from `dexie-react-hooks`.
- **AI**: Vercel AI SDK (`ai`), `@tanstack/ai`, OpenRouter provider
- **Package manager**: pnpm

## Common commands

```bash
pnpm dev              # start dev server
pnpm build            # production build
pnpm start            # start production server (non-standalone)
pnpm start:standalone # copy .env into .next/standalone and run the standalone server
```

There is no configured lint or test script — do not assume `pnpm lint` or
`pnpm test` exist.

## Structure

- `app/` — App Router routes. Feature routes are self-contained folders
  (e.g. `app/rss-feed/`, `app/tanstack-ai/`, `app/web-api/`) mixing
  `page.tsx` with their own client components rather than a shared
  components tree. Data-driven pages keep a thin server `page.tsx` (metadata +
  static markup) that renders a `'use client'` component reading Dexie via
  `useLiveQuery` (see `app/posts/`, `app/rss-feed/`, `app/dexie-showcase/`).
- `app/api/` — Route handlers (`ai-summary`, `rss-fetch`). These stay
  server-side because they need secrets / a CORS proxy (`ai-summary` uses the
  OpenRouter key; `rss-fetch` proxies external RSS URLs).
- `components/` — Shared components; `components/ui/` is shadcn-managed
  (add new primitives via the shadcn CLI, not by hand-authoring).
- `lib/` — Client/server singletons: `dexie-db.ts` (showcase DB) and
  `app-db.ts` (app data DB), `ads.ts`, `utils.ts`.

## Environment variables

Defined in `.env` (not committed): `OPENROUTER_API_KEY`,
`NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`. Never print or log the values of these.

## Docker

`docker-compose.yml` runs a single standalone Next.js service (`Dockerfile`) —
no database. The `develop.watch` block lists exactly which paths trigger a
rebuild — update it if you add new top-level source directories.
