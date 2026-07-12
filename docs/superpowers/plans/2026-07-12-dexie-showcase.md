# Dexie Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished `/dexie-showcase` Local Lab with Tasks, Contacts, and Notes mini-apps backed by Dexie.js, plus a concise comparison of Dexie with other browser and server storage options.

**Architecture:** Keep the browser database definition in `lib/dexie-db.ts`. Implement the showcase as one client-side route component with typed live queries, small async CRUD handlers, and a debounced notes editor. Scope all route-specific visual treatment to `app/dexie-showcase/dexie-showcase.module.css` so unrelated routes remain unchanged.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Dexie 4, `dexie-react-hooks`, CSS Modules, existing Tailwind setup, and Lucide icons already available in the repository.

## Global Constraints

- Use the existing `dexie` and `dexie-react-hooks` dependencies; do not add another persistence library.
- Keep all database access in the client because IndexedDB is browser-local.
- Do not add a verification/onboarding stage to the showcase UI.
- Preserve unrelated working-tree changes and limit edits to the Dexie showcase, its database module, and the new design/plan documents.
- Use `useLiveQuery` for reactive collection reads and Dexie table methods for writes.
- Keep the page responsive and keyboard accessible.

---

### Task 1: Define the typed Dexie database and seed helper

**Files:**
- Modify: `lib/dexie-db.ts`

**Interfaces:**
- Produces `Task`, `Contact`, and `Note` types, the exported `db`, and `seedDexieShowcase()` for the route component.
- `Task` fields: `id: number`, `title: string`, `completed: boolean`, `createdAt: number`.
- `Contact` fields: `id: number`, `name: string`, `email: string`, `company: string`, `favorite: boolean`.
- `Note` fields: `id: number`, `title: string`, `body: string`, `updatedAt: number`, `color: 'yellow' | 'blue' | 'pink'`.

- [ ] **Step 1: Replace the placeholder Friend schema with typed showcase entities.**

Use a single `Dexie('DexieShowcaseDatabase')` instance with these stores:

```ts
db.version(1).stores({
  tasks: '++id, completed, createdAt',
  contacts: '++id, name, email, favorite',
  notes: '++id, updatedAt, color',
});
```

Type it as `Dexie & { tasks: EntityTable<Task, 'id'>; contacts: EntityTable<Contact, 'id'>; notes: EntityTable<Note, 'id'> }`.

- [ ] **Step 2: Add an idempotent starter-data helper.**

`seedDexieShowcase()` should run a read-only count check for each table and add starter records only when that table is empty. It should use one read-write transaction over all three tables so a first-run seed is atomic:

```ts
await db.transaction('rw', db.tasks, db.contacts, db.notes, async () => {
  if ((await db.tasks.count()) === 0) await db.tasks.bulkAdd(taskSeeds);
  if ((await db.contacts.count()) === 0) await db.contacts.bulkAdd(contactSeeds);
  if ((await db.notes.count()) === 0) await db.notes.bulkAdd(noteSeeds);
});
```

- [ ] **Step 3: Run the TypeScript check for the database module.**

Run: `pnpm exec tsc --noEmit`

Expected: the command exits successfully. If existing unrelated errors are reported, record them and keep the database module errors at zero.

- [ ] **Step 4: Commit the database layer.**

```bash
git add lib/dexie-db.ts
git commit -m "feat: add typed Dexie showcase database"
```

### Task 2: Build the Local Lab shell and Tasks app

**Files:**
- Create: `app/dexie-showcase/dexie-showcase.module.css`
- Modify: `app/dexie-showcase/page.tsx`

**Interfaces:**
- `page.tsx` exports the route component and owns the `activeApp` state, shared status state, seeding effect, and live queries.
- The Tasks tab consumes `db.tasks` and exposes add, toggle, filter, and delete actions.

- [ ] **Step 1: Add the client boundary and shared page state.**

Start `page.tsx` with `'use client'`, imports for `useEffect`, `useMemo`, `useState`, `useTransition`, `useLiveQuery`, Dexie types, and Lucide icons. Use these app keys: `'tasks' | 'contacts' | 'notes'`.

On mount, call `seedDexieShowcase()` and set a short inline error status if it rejects. Use live queries for all three tables so tab counts stay current:

```ts
const tasks = useLiveQuery(() => db.tasks.orderBy('createdAt').reverse().toArray(), [], []);
const contacts = useLiveQuery(() => db.contacts.orderBy('name').toArray(), [], []);
const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [], []);
```

- [ ] **Step 2: Implement the Local Lab header and tabs.**

Render the page title, a small “IndexedDB / local-first” status pill, the copy explaining that data survives reloads without a server, and three tab buttons with live counts. Use `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls`.

- [ ] **Step 3: Implement the Tasks panel.**

Add a controlled title input and form that calls `db.tasks.add({ title, completed: false, createdAt: Date.now() })`. Add All/Active/Done filter buttons, a derived filtered list, check buttons that call `db.tasks.update(id, { completed: !completed })`, and delete buttons that call `db.tasks.delete(id)`.

Use an empty state when the filtered result is empty and show the completed/total summary. Disable submit for blank titles and clear the input after a successful add.

- [ ] **Step 4: Add the first visual pass for the shell and Tasks.**

The CSS module should establish:

```css
.page { min-height: 100vh; width: 100%; color: #20221f; }
.hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2rem; }
.workspace { background: #f7f3e8; border: 1px solid #d9d2c2; border-radius: 28px; box-shadow: 0 24px 60px rgba(38, 35, 25, .12); }
.accent { color: #1457d2; }
```

Add responsive rules at `max-width: 720px` to make the hero, controls, and task rows one column. Include visible `:focus-visible` styles for buttons and inputs.

- [ ] **Step 5: Run the TypeScript check and commit the working Tasks tab.**

Run: `pnpm exec tsc --noEmit`

Expected: no new TypeScript errors.

```bash
git add app/dexie-showcase/page.tsx app/dexie-showcase/dexie-showcase.module.css
git commit -m "feat: build Dexie showcase tasks app"
```

### Task 3: Add Contacts and Notes apps

**Files:**
- Modify: `app/dexie-showcase/page.tsx`
- Modify: `app/dexie-showcase/dexie-showcase.module.css`

**Interfaces:**
- Contacts consumes `contacts: Contact[]` and uses `db.contacts.add`, `update`, and `delete`.
- Notes consumes `notes: Note[]`, maintains `selectedNoteId`, and uses `db.notes.add`, `update`, and `delete`.

- [ ] **Step 1: Implement the Contacts tab state and form.**

Keep one form state object with `name`, `email`, and `company`. On submit, add a contact with `favorite: false`, then reset the form. Render a search input and filter the live contacts list with a case-insensitive match against name, email, or company.

Each contact row should show initials, name, company, email, a favorite toggle using `db.contacts.update(id, { favorite: !favorite })`, and a delete button. Provide an inline edit mode for one row at a time; saving calls `db.contacts.update(id, { name, email, company })`.

- [ ] **Step 2: Implement the Notes tab with debounced autosave.**

Select the first note when notes load and keep `selectedNoteId` valid after deletes. Render note cards in a sidebar and a title/body editor for the selected note. When title or body changes, update local editor state immediately and schedule:

```ts
const timeout = window.setTimeout(() => {
  void db.notes.update(selectedNoteId, {
    title: draftTitle,
    body: draftBody,
    updatedAt: Date.now(),
  });
}, 450);
return () => window.clearTimeout(timeout);
```

Add a “New note” action with a default yellow color and a delete action that clears the editor when the selected note is removed. Show a quiet “Saved locally” label after the debounce completes.

- [ ] **Step 3: Add responsive styling for Contacts and Notes.**

Style contacts as a compact directory list with a cobalt search control and circular initials. Style notes as a two-pane paper editor on desktop and a stacked list/editor on mobile. Use the note color field for the card accent and keep textarea resizing intentional.

- [ ] **Step 4: Run the TypeScript check and commit.**

Run: `pnpm exec tsc --noEmit`

Expected: no new TypeScript errors.

```bash
git add app/dexie-showcase/page.tsx app/dexie-showcase/dexie-showcase.module.css
git commit -m "feat: add Dexie contacts and notes apps"
```

### Task 4: Add the Dexie benefits comparison and polish the page

**Files:**
- Modify: `app/dexie-showcase/page.tsx`
- Modify: `app/dexie-showcase/dexie-showcase.module.css`

**Interfaces:**
- The comparison is static content in the route and does not write to the database.

- [ ] **Step 1: Add the “Why Dexie?” comparison.**

Render four comparison cards with these exact concepts and copy:

```ts
[
  { label: 'localStorage', title: 'Tiny key/value cache', body: 'Simple, but synchronous and awkward for structured collections or indexed queries.' },
  { label: 'IndexedDB', title: 'Powerful browser primitive', body: 'Async and durable, but its native API is verbose for everyday app code.' },
  { label: 'Dexie', title: 'A calmer IndexedDB layer', body: 'Typed tables, readable queries, schema versions, transactions, and live React updates.' },
  { label: 'Server database', title: 'Shared source of truth', body: 'Best for accounts and collaboration, with the cost of a backend, network, auth, and sync.' },
]
```

Include a short bottom line: Dexie is especially useful for offline-first drafts, private local data, fast local search, and reducing network dependency; it complements rather than replaces a server database for shared data.

- [ ] **Step 2: Add empty/loading/error states and accessibility polish.**

Use stable fallback arrays while live queries resolve, set `aria-busy` on the active panel during initial loading, provide labels for icon-only buttons, and render the database error status inline without exposing stack traces.

- [ ] **Step 3: Add visual polish.**

Add a subtle ruled-paper background, small uppercase metadata labels, staggered `fadeUp` entrance animation with `prefers-reduced-motion` support, and hover/focus states for cards and controls. Keep the route visually distinct from the site’s existing generic glass shell while preserving the global navbar.

- [ ] **Step 4: Run final developer sanity checks.**

Run: `pnpm exec tsc --noEmit`

Expected: no new TypeScript errors.

Run: `pnpm build`

Expected: the Next.js build completes successfully.

- [ ] **Step 5: Commit the completed showcase.**

```bash
git add app/dexie-showcase/page.tsx app/dexie-showcase/dexie-showcase.module.css
git commit -m "feat: explain Dexie benefits in showcase"
```

## Self-review

- Spec coverage: the three mini-apps, typed schema, live queries, transaction seed, local persistence, scoped visual treatment, benefits comparison, and no product verification stage are covered by Tasks 1–4.
- Placeholder scan: no `TBD`, `TODO`, “implement later”, or unspecified edge-case instructions remain.
- Type consistency: `Task`, `Contact`, `Note`, `db`, and `seedDexieShowcase()` are introduced in Task 1 and consumed with the same names in later tasks.
