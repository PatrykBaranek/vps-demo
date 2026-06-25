---
name: split-screen-page-design
description: Design spec for a split‑screen full‑page layout in Figma, mirroring the app's existing design system.
type: project
---

# Split‑Screen Page Design Spec

**Date:** 2026‑05‑10

## Goal
Create a full‑page screen in Figma that matches the existing design system and will be used as the main landing page of the VPS demo app. The layout should showcase the interactive Dither visual on the left and provide title, description, and session/sign‑in controls on the right.

## Layout Overview
```
+-----------------------------------------------------------+
| Header (Navbar)                                          |
+-----------------------------------------------------------+
|                                                            |
|  +-------------------+   +------------------------------+  |
|  | Dither Canvas    |   | Title & Description          |  |
|  | (full height)    |   |   • "Cache Components showcase" |
|  |                 |   |   • Brief explanatory text   |  |
|  |                 |   |   • Session or Sign‑In block  |  |
|  +-------------------+   +------------------------------+  |
|                                                            |
+-----------------------------------------------------------+
```
* **Header** – Reuse the existing `Navbar` component.
* **Left column** – A `Frame` containing the Dither canvas (≈600 px high, full width of the column). Use the existing `Dither` component style.
* **Right column** – A vertical auto‑layout frame with:
  * Heading (`h1`) styled with the design system’s primary heading text style.
  * Optional description text.
  * Session block: if a user session exists, show a code‑styled JSON preview (as in `app/page.tsx`); otherwise show the `SignInButton`.
* **Responsive behavior** – On screens < 768 px the two columns stack vertically, preserving the order (canvas above, content below).

## Components & Tokens
| Component | Source | Design‑system token usage |
|-----------|--------|---------------------------|
| `Navbar` | `components/Navbar.tsx` | Uses existing navigation component instances.
| `Button` | `components/ui/button.tsx` | Primary button variant for any CTA (e.g., "Explore"), using `buttonVariants` default.
| `Dither` | `components/Dither.jsx` | Wrap in a `Frame` with a fixed height; no extra tokens needed.
| Text styles | Imported from the shared library – use the **Heading 1** style for the title and **Body** style for description.
| Colors / spacing | Bind to the design‑system variables (e.g., `color-primary`, `spacing-md`).

## Figma Implementation Steps
1. **Create a new page** named `Split‑Screen Landing`.
2. **Import the design‑system library** (if not already linked).
3. **Create the wrapper frame** (auto‑layout, vertical) sized to 1440 px width.
4. **Add the Navbar** by dragging the `Navbar` component instance from the library.
5. **Create a two‑column auto‑layout frame** inside the wrapper:
   * Set `direction: HORIZONTAL`, `spacing: var(--spacing-md)`.
   * Add a placeholder frame for the Dither canvas (size 720 × 600 px) and set its fill to the library’s background variable.
   * Add a vertical auto‑layout frame for the right column.
6. **Populate the right column**:
   * Insert a `Text` node for the heading, apply the Heading 1 style, and set its characters to `Cache Components showcase`.
   * Insert a `Text` node for the description (optional).
   * Insert a component instance of `SessionBlock` (or `SignInButton`) depending on the session state.
7. **Responsive prototype** – Add constraints so that on narrow widths the columns stack (`layoutGrow: 1` on each column).
8. **Validate** – Take a screenshot of the completed frame and compare against the running web page.
9. **Commit** – Save the Figma file URL in the repository’s README for future reference.

## Acceptance Criteria
- The page matches the split‑screen mockup exactly in component placement, spacing, and typography.
- All colors, spacing, and radii use design‑system variables, not hard‑coded values.
- The layout stacks vertically on small viewports.
- The `Navbar`, `Button`, and `Session/SignIn` components are linked to the library so future design‑system updates propagate automatically.
- A screenshot of the final frame is attached to the spec (or referenced).

---
*End of spec.*
