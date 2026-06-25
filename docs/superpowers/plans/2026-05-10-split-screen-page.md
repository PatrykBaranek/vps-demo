# Split‑Screen Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB‑SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task‑by‑task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a split‑screen landing page that displays the Dither visual on the left and title/description plus session or sign‑in controls on the right, matching the design spec.

**Architecture:** The page composes existing `Navbar`, `Dither`, and `SignInButton` components within a new `SplitScreen` layout component that uses Tailwind CSS flex utilities for responsive behavior. The layout is responsive: side‑by‑side on wide screens, stacked vertically on narrow screens.

**Tech Stack:** Next.js (React), TypeScript, Tailwind CSS, React Testing Library, Jest.
---

### Task 1: Create `components/SplitScreen.tsx`

**Files:**
- Create: `components/SplitScreen.tsx`
- Modify: `app/page.tsx` (to import and use the new component)
- Test: `__tests__/components/SplitScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import SplitScreen from "@/components/SplitScreen";

test("renders split‑screen layout with Dither on the left and title on the right", () => {
  render(<SplitScreen />);
  // Left column should contain the Dither canvas element (identified by role="region" with aria‑label)
  const ditherRegion = screen.getByRole("region", { name: /dither canvas/i });
  expect(ditherRegion).toBeInTheDocument();

  // Right column should contain the heading text
  const heading = screen.getByRole("heading", { name: /cache components showcase/i });
  expect(heading).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Command:
```bash
npm test __tests__/components/SplitScreen.test.tsx -- -t "renders split-screen layout"
```
Expected output: test fails because `SplitScreen` does not exist.

- [ ] **Step 3: Implement `SplitScreen` component**

```tsx
"use client";

import Dither from "@/components/Dither";
import { SignInButton } from "@/components/SignInButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

export default function SplitScreen() {
  return (
    <section className="flex flex-col md:flex-row glass p-6 gap-6" data-testid="split-screen">
      {/* Left column – Dither visual */}
      <div
        className="w-full md:w-1/2 h-96 relative"
        role="region"
        aria-label="Dither canvas"
      >
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          enableMouseInteraction={false}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      {/* Right column – content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-start space-y-4">
        <h1 className="text-3xl font-bold">Cache Components showcase</h1>
        <Suspense fallback={<div className="spin-in">Loading…</div>}> 
          <SessionSection />
        </Suspense>
      </div>
    </section>
  );
}

async function SessionSection() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return (
      <div className="w-full h-full bg-black rounded-3xl p-4">
        <code className="text-left block overflow-x-auto">
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </code>
      </div>
    );
  }

  return <SignInButton />;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Command:
```bash
npm test __tests__/components/SplitScreen.test.tsx -- -t "renders split-screen layout"
```
Expected output: test passes.

- [ ] **Step 5: Commit the changes**

```bash
git add components/SplitScreen.tsx __tests__/components/SplitScreen.test.tsx app/page.tsx
git commit -m "feat: add split‑screen landing page component"
```

---

### Task 2: Update `app/page.tsx` to use `SplitScreen`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("home page renders split‑screen component", async () => {
  render(await Home());
  const split = await screen.findByTestId("split-screen");
  expect(split).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails** (because `Home` still returns old layout).

Command:
```bash
npm test __tests__/app/page.test.tsx -- -t "home page renders split-screen component"
```
Expected: test fails (missing `data-testid="split-screen"`).

- [ ] **Step 3: Modify `app/page.tsx`**

Replace the existing `<section>` contents with the new `SplitScreen` component.

```tsx
import SplitScreen from "@/components/SplitScreen";

export default async function Home() {
  return <SplitScreen />;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Command:
```bash
npm test __tests__/app/page.test.tsx -- -t "home page renders split-screen component"
```
Expected: test passes.

- [ ] **Step 5: Commit the changes**

```bash
git add app/page.tsx __tests__/app/page.test.tsx
git commit -m "refactor: home page now uses SplitScreen component"
```

---

### Task 3: Add Tailwind utility for responsive glass background (if not already present)

**Files:**
- Modify: `app/globals.css` (ensure the `glass` class is defined; if missing, add it).

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from "@testing-library/react";
import SplitScreen from "@/components/SplitScreen";

test("glass class applies backdrop‑blur", () => {
  const { container } = render(<SplitScreen />);
  const section = container.querySelector("section");
  expect(section).toHaveClass("glass");
});
```

- [ ] **Step 2: Run test to verify it fails** (if `glass` class is undefined).

- [ ] **Step 3: Add CSS rule**

```css
/* globals.css */
.glass {
  @apply bg-white/30 backdrop-blur-md rounded-lg border border-white/20;
}
```

- [ ] **Step 4: Run the test to verify it passes**

- [ ] **Step 5: Commit the change**

```bash
git add app/globals.css __tests__/components/SplitScreen.test.tsx
git commit -m "style: add glass utility for split‑screen layout"
```

---

### Task 4: Verify responsive behavior manually (no automated test required)

**Files:** None (manual check).

- [ ] **Step 1: Run the dev server**
```bash
npm run dev
```
Open `http://localhost:3000` and resize the browser to ensure the two columns stack vertically below 768 px width.

- [ ] **Step 2: Take a screenshot (optional) and attach to the spec**

- [ ] **Step 3: Commit any final styling tweaks** (if needed).

---

### Task 5: Push the feature branch and open a PR

**Files:** All changed files are already committed.

- [ ] **Step 1: Create a new branch**
```bash
git checkout -b feat/split-screen-landing
```
- [ ] **Step 2: Push the branch**
```bash
git push -u origin feat/split-screen-landing
```
- [ ] **Step 3: Create a PR via GitHub CLI**
```bash
gh pr create --title "feat: split‑screen landing page" --body "Implements the split‑screen design from the spec, adds SplitScreen component, updates home page, and includes tests."
```
- [ ] **Step 4: Mark the plan as completed** (this is the final step).

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-10-split-screen-page.md`.**

Two execution options:

1. **Subagent‑Driven (recommended)** – I dispatch a fresh subagent per task, review between tasks, and iterate quickly.
2. **Inline Execution** – I execute the tasks in this session using the executing‑plans skill, batching where appropriate.

Which approach would you like to use?