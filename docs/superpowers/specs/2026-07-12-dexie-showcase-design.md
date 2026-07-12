# Dexie Showcase Design

## Goal

Turn `/dexie-showcase` from a placeholder into a small, polished teaching surface for Dexie.js. The page should show useful local-first app patterns and explain when Dexie is a better fit than simpler browser storage or a server database.

## User experience

The page is a single “Local Lab” workspace with tabs for three independent mini-apps:

- **Tasks:** create tasks, toggle completion, filter by all/active/done, and delete tasks. This demonstrates live reads plus straightforward CRUD.
- **Contacts:** create, edit, search, and delete contacts. This demonstrates indexed lookup and record updates.
- **Notes:** create notes, select a note, edit title/body with a short autosave delay, and delete notes. This demonstrates a selected-record editor backed by local persistence.

The database is seeded with a small starter dataset only when the relevant tables are empty. Each app shows its local record count and a useful empty state. Buttons and inputs have accessible labels and keyboard-visible focus states.

Below the apps, a “Why Dexie?” section compares:

- `localStorage`: convenient key/value persistence, but synchronous, unindexed, and awkward for structured collections.
- Raw IndexedDB: asynchronous, indexed, and browser-native, but verbose and easy to make cumbersome to maintain.
- Dexie: a small typed wrapper around IndexedDB with readable queries, schema versioning, transactions, and reactive `useLiveQuery` integration.
- A server database: best for shared, cross-device data, but requires a backend, network access, auth, and conflict handling; Dexie is a strong complement for offline-first/local data rather than a universal replacement.

## Technical design

`lib/dexie-db.ts` owns one typed Dexie database named `DexieShowcaseDatabase`. It defines `Task`, `Contact`, and `Note` interfaces and tables with indexed fields needed by the UI. The schema is versioned and remains browser-only in practice because all reads and writes happen from the client component.

`app/dexie-showcase/page.tsx` becomes a client component. It uses `useLiveQuery` from `dexie-react-hooks` for each active collection and calls table methods directly for small UI actions. Notes use a debounced save effect that updates the current record without making the editor feel laggy. Seed data is inserted through an idempotent helper that checks table counts first.

The route will use its own scoped CSS module so the showcase can have a deliberate visual identity without changing unrelated pages. The visual direction is a warm “field notebook / local lab”: cream paper surfaces, ink-black type, cobalt navigation accents, and citrus highlights for persisted/local status. The layout is responsive, with the app controls collapsing into a single column on narrow screens.

## Error handling

Database actions are wrapped in small async handlers. A compact inline status message reports failures such as an unavailable IndexedDB context. Destructive actions use an explicit delete button and the notes editor clears its selection safely after deletion. The UI remains usable while a live query is loading.
