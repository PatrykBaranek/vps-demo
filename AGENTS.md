# AGENTS.md

This file provides guidance to AI agents (opencode) when working in this repository.

## Project overview

A Next.js 16 (App Router) demo app showcasing several integrations: RSS feed
reading with AI summarization (OpenRouter), local-first data with Dexie (posts,
bookmarks, cached AI summaries, and a Dexie showcase), Sentry error monitoring,
and Google Tag Manager. Deployed as a standalone Next.js build behind Docker on
a VPS (Vercel builds are also supported). All application data lives
client-side in the browser (IndexedDB) — there is no server database and no
authentication.

## Stack

- **Framework**: Next.js 16.4 (App Router, React 19.3, React Compiler enabled,
  `cacheComponents: true`, `partialPrefetching: true`). `output: "standalone"`
  is set for self-hosted builds and skipped when `VERCEL=1`.
- **Language**: TypeScript 7 (strict mode)
- **Styling**: Tailwind CSS v4, shadcn/ui (`components/ui`, style "base-nova",
  built on `@base-ui/react`), `lucide-react` icons. Global styles and custom
  component classes live in `app/globals.css`.
- **Data**: Dexie.js (IndexedDB, client-side only). Two databases:
  `lib/dexie-db.ts` (`DexieShowcaseDatabase` — tasks/contacts/notes for the
  Dexie showcase) and `lib/app-db.ts` (`VpsDemoAppDatabase` — posts, RSS
  sources, bookmarks, AI summary cache). App data is seeded once via Dexie's
  `on('populate')` event; reactive reads use `useLiveQuery` from
  `dexie-react-hooks`.
- **AI**: Vercel AI SDK (`ai` v7) with the OpenRouter provider
  (`@openrouter/ai-sdk-provider`); `gpt-tokenizer` for token-aware input
  truncation in `app/api/ai-summary`.
- **RSS**: `rss-parser` (server-side, in `app/api/rss-fetch`)
- **Monitoring**: Sentry (`@sentry/nextjs` v11) for browser, Node.js, and Edge
  runtimes; analytics via `@next/third-parties` (Google Tag Manager)
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
pnpm typecheck        # tsc --noEmit
pnpm lint             # oxlint (config in .oxlintrc.json)
```

There is no test script — do not assume `pnpm test` exists. Verify changes
with `pnpm lint`, `pnpm typecheck` and `pnpm build` (the same checks CI runs).

Linting uses **oxlint**, not ESLint: `eslint-config-next` relies on
typescript-eslint, which does not support TypeScript 7. Lint errors fail CI;
warnings (e.g. `react/set-state-in-effect`) do not. `components/ui/` is
excluded because it is shadcn-generated.

Dependencies are managed with pnpm (version pinned via `packageManager` in
`package.json`); only packages listed under `allowBuilds`
in `pnpm-workspace.yaml` (currently `@sentry/cli`) may run install scripts.
Commit `pnpm-lock.yaml` with any dependency change — Docker installs with
`--frozen-lockfile`.

## Structure

- `app/` — App Router routes: `/` (home), `/posts` and `/posts/[id]`,
  `/rss-feed`, `/dexie-showcase`, and `/sentry-example-page`. Feature routes
  are self-contained folders (e.g. `app/rss-feed/`, `app/posts/`) mixing
  `page.tsx` with their own client components rather than a shared
  components tree. `app/error.tsx` and `app/global-error.tsx` report to
  Sentry. Data-driven pages keep a thin server `page.tsx` (metadata +
  static markup) that renders a `'use client'` component reading Dexie via
  `useLiveQuery` (see `app/posts/`, `app/rss-feed/`, `app/dexie-showcase/`).
- `app/api/` — Route handlers (`ai-summary`, `rss-fetch`,
  `sentry-example-api`). These stay server-side because they need secrets / a
  CORS proxy (`ai-summary` streams an OpenRouter summary; `rss-fetch` proxies
  and parses external RSS URLs; `sentry-example-api` intentionally throws to
  test Sentry).
- `components/` — Shared components; `components/ui/` is shadcn-managed
  (add new primitives via the shadcn CLI, not by hand-authoring).
- `components/navbar/` — Navigation bar (barrel export via `index.ts`)
- `lib/` — Client/server singletons: `dexie-db.ts`, `app-db.ts`, `utils.ts`.
- Root Sentry/instrumentation files: `instrumentation.ts` (loads
  `sentry.server.config.ts` / `sentry.edge.config.ts`),
  `instrumentation-client.ts` (browser init). `next.config.ts` is wrapped in
  `withSentryConfig`.
- `docs/` — Research notes (e.g. self-hosted observability).

## Data layer

- All app data lives in IndexedDB via Dexie.js
- Reactive reads use `useLiveQuery` from `dexie-react-hooks`
- App data is seeded once via Dexie's `on('populate')` event
- Schema changes go through a new `version(n).stores(...)` call (see
  `lib/app-db.ts`); never edit an existing version's schema
- Booleans are not indexable in IndexedDB — filter them in JS
- No server database or authentication

## Environment variables

Defined in `.env` (not committed; `.env*` is gitignored):

- `OPENROUTER_API_KEY` — used by `app/api/ai-summary`
- `GTM_CONTAINER_ID` — Google Tag Manager container (`app/layout.tsx`)
- `NEXT_PUBLIC_SENTRY_DSN` — browser DSN; must be present at build time (the
  Docker build passes it as a build arg). Optional
  `NEXT_PUBLIC_SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_SENTRY_RELEASE`.
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE` — server/Edge Sentry
  config (DSN falls back to the public one)
- `SENTRY_AUTH_TOKEN` (plus `SENTRY_ORG` / `SENTRY_PROJECT`) — optional, enables
  source-map upload during `next build`

Never print or log the values of these.

## CI

GitHub Actions in `.github/workflows/` (no CD — deployment is manual):

- `ci.yml` — on PRs and pushes to `master`: `pnpm lint`, `pnpm typecheck`,
  `pnpm build`; `pnpm audit --prod --audit-level=high`; and a Docker image
  build (not pushed).
- `codeql.yml` — CodeQL security analysis on PRs, pushes to `master`, and
  weekly.
- `.github/dependabot.yml` — weekly updates for npm (minor/patch grouped,
  3-day cooldown), GitHub Actions, and the Docker base image (Node majors
  ignored).

Keep CI green: run the same commands locally before pushing.

## Docker

`docker-compose.yml` runs a single standalone Next.js service (`Dockerfile`,
multi-stage, Node 24 slim; the base tag is written literally so Dependabot can
bump it) — no database. `NEXT_PUBLIC_SENTRY_DSN` is forwarded
as a build arg. The `develop.watch` block lists exactly which paths trigger a
rebuild — update it if you add new top-level source directories or root
config files.

## Subagents

Available opencode subagents for complex tasks:
- **CoderAgent**: Execute multi-step coding subtasks
- **explore**: Fast codebase exploration and search
- **TestEngineer**: Test authoring and TDD
- **CodeReviewer**: Code review and security analysis
- **OpenFrontendSpecialist**: UI/design work
- **OpenDevopsSpecialist**: CI/CD and deployment
- **DocWriter**: Documentation authoring
