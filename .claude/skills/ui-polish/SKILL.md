---
name: ui-polish
description: "React UI polish assistant for AP Lang Practice (Tailwind + shadcn-style components). Provides consistent layout, spacing, typography, states, and accessibility patterns."
---

# UI Polish (AP Lang Practice)

You are improving the UI/UX of this React app.

## Stack (must follow)
- Tailwind CSS (v4)
- shadcn-style components in `src/components/ui/*` (Button/Card/Input/Textarea)
- Icons: `lucide-react`

Do NOT introduce another UI framework (no MUI/Mantine/Chakra) unless explicitly requested.

## Design rules (hard requirements)

### Layout
- Page container: `mx-auto max-w-5xl px-4`.
- Use vertical rhythm: `py-8` or `py-10` on main pages.
- Prefer `Card` for forms and content blocks.

### Typography
- Headings: `text-2xl font-semibold` (page title), `text-lg font-semibold` (section).
- Body: `text-sm text-slate-600` for secondary text.

### Components
- Use `Button`, `Input`, `Textarea`, `Card` from `src/components/ui`.
- Primary action: `Button` default.
- Secondary: `variant="secondary"`.
- Destructive: `variant="destructive"`.

### States
Every data-fetching page must implement:
- Loading state
- Empty state
- Error state (red alert-style box)

### Accessibility
- Inputs must have visible labels.
- Buttons must have clear names.
- Avoid color-only meaning; include text labels.

## Workflow
1) Identify the target page(s).
2) Propose a minimal change list (layout + components + states).
3) Implement changes.
4) Run `npm run build` in `web/`.
5) Keep copy in English.

## Commands you may run
- `npm run build`
- `npm run dev`
- Simple refactors across `src/pages/*` and `src/components/*`
