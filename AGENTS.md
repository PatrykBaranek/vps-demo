# AGENTS.md

This file provides guidance to AI agents (opencode) when working in this repository.

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
- **Styling**: Tailwind CSS v4, shadcn/ui (`components/ui`), style "base-nova".
  Custom CRT/terminal keyframes and `neon-*` utilities in `app/globals.css`.
- **Data**: Dexie.js (IndexedDB, client-side only). Two databases:
  `lib/dexie-db.ts` (`DexieShowcaseDatabase` — tasks/contacts/notes for the
  Dexie showcase) and `lib/app-db.ts` (`VpsDemoAppDatabase` — posts, RSS
  sources, bookmarks). App data is seeded once via Dexie's `on('populate')`
  event; reactive reads use `useLiveQuery` from `dexie-react-hooks`.
- **AI**: Vercel AI SDK (`ai`), `@tanstack/ai`, OpenRouter provider
- **Package manager**: pnpm

## File naming conventions

- **Directories**: kebab-case (e.g., `app/rss-feed/`, `app/dexie-showcase/`)
- **Source files (.ts/.tsx)**: kebab-case (e.g., `rss-feed-client.tsx`, `app-db.ts`)
- **Component function names**: PascalCase (e.g., `RssFeedClient`, `ArticleDrawer`)
- **shadcn/ui primitives**: lowercase files in `components/ui/` (e.g., `button.tsx`)
- **Next.js special files**: lowercase (e.g., `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`)
- **Barrel files**: `index.ts` in the component directory

## Component patterns

- Feature pages use a **server `page.tsx`** + co-located **client component** named `{feature}-client.tsx`:
  - `app/posts/page.tsx` + `app/posts/posts-client.tsx`
  - `app/dexie-showcase/page.tsx` + `app/dexie-showcase/dexie-showcase-client.tsx`
  - `app/rss-feed/page.tsx` + `app/rss-feed/components/rss-feed-client.tsx`
- Place `'use client'` only on components that need browser APIs (hooks, events, state)
- Shared components go in `components/`; feature-specific components stay co-located

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
- `components/navbar/` — Navigation bar (barrel export via `index.ts`)
- `lib/` — Client/server singletons: `dexie-db.ts`, `app-db.ts`, `utils.ts`.

## Data layer

- All app data lives in IndexedDB via Dexie.js
- Reactive reads use `useLiveQuery` from `dexie-react-hooks`
- App data is seeded once via Dexie's `on('populate')` event
- No server database or authentication

## Environment variables

Defined in `.env` (not committed): `OPENROUTER_API_KEY`,
`NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`. Never print or log the values of these.

## Docker

`docker-compose.yml` runs a single standalone Next.js service (`Dockerfile`) —
no database. The `develop.watch` block lists exactly which paths trigger a
rebuild — update it if you add new top-level source directories.

## Subagents

Available opencode subagents for complex tasks:
- **CoderAgent**: Execute multi-step coding subtasks
- **explore**: Fast codebase exploration and search
- **TestEngineer**: Test authoring and TDD
- **CodeReviewer**: Code review and security analysis
- **OpenFrontendSpecialist**: UI/design work
- **OpenDevopsSpecialist**: CI/CD and deployment
- **DocWriter**: Documentation authoring
