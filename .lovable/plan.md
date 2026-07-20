## Problem

Dark mode is broken because 90% of the UI uses hardcoded Tailwind palette classes (`bg-white`, `text-neutral-900`, `bg-neutral-50`, `ring-black/5`, `border-neutral-200`, `divide-neutral-950/5`, etc.) instead of semantic tokens. The `.dark` block in `src/styles.css` only redefines semantic vars, so these hardcoded classes stay white-on-white in dark mode. Contrast is nowhere near AA.

## Target palette (WCAG AA verified)

Dark theme:
- `--background` #0F172A · `--foreground` #F1F5F9 → 15.8:1 (AAA)
- `--card` / `--popover` #1E293B · foreground #F1F5F9 → 13.6:1 (AAA)
- `--muted` / secondary surface #334155 · `--muted-foreground` #94A3B8 → 4.6:1 (AA) · on #0F172A → 5.1:1 (AA)
- `--accent` / `--primary` #38BDF8 · `--primary-foreground` #0F172A → 9.9:1 (AAA)
- `--border` #334155, `--input` #1E293B, `--ring` #38BDF8
- Sidebar surface #0B1220 (slightly deeper than bg) with same foregrounds
- Destructive #F87171 on card → 5.4:1 (AA)

Light theme: keep existing values (already fine), only nudge `--muted-foreground` to `#475569` for 7:1 on white.

Chart palette (both themes) rebuilt around the accent family: sky, emerald, amber, violet, rose — all ≥4.5:1 on `--card`.

## Changes

### 1. `src/styles.css`
- Replace `:root` and `.dark` blocks with the palette above, expressed in `oklch()`.
- Add semantic surface tokens used repeatedly: `--surface`, `--surface-elevated`, `--hairline` (subtle border), register them in `@theme inline` as `--color-surface`, `--color-surface-elevated`, `--color-hairline`. Enables `bg-surface`, `border-hairline`, etc.
- Add `--accent-foreground` matching the accent.

### 2. Codemod hardcoded classes → semantic tokens
Sweep every file under `src/routes/` and `src/components/` and replace:

| Old | New |
|---|---|
| `bg-white`, `bg-neutral-50` (cards) | `bg-card` |
| `bg-neutral-50` (page bg) | `bg-background` |
| `bg-neutral-900` (buttons) | `bg-primary text-primary-foreground` |
| `bg-neutral-100`, `bg-neutral-200` (hover/fill) | `bg-muted` |
| `text-neutral-900` | `text-foreground` |
| `text-neutral-700` | `text-foreground/85` |
| `text-neutral-600` | `text-muted-foreground` |
| `text-neutral-500`, `text-neutral-400`, `text-neutral-300` | `text-muted-foreground` (tuned via opacity) |
| `text-white` on primary bg | `text-primary-foreground` |
| `ring-black/5`, `ring-black/10` | `ring-hairline` (or `border-border`) |
| `border-neutral-200/300`, `divide-neutral-950/5` | `border-border` / `divide-border` |
| `bg-neutral-800` hover | `hover:bg-primary/90` |
| `text-[--color-accent]` (green) | `text-accent` (now sky) |
| Focus outlines | add `focus-visible:ring-2 focus-visible:ring-ring` |

Files touched: `app-sidebar.tsx`, `collection-editor.tsx`, `page-shell.tsx`, `locked-module.tsx`, `amount-input.tsx`, and all `src/routes/*.tsx` (onboarding, index, hub.*, planner, forecast, analytics, settings, goals, history, reports, advisor, debt-strategy).

### 3. Charts (`src/routes/analytics.tsx`)
- Read stroke/fill from CSS vars via `hsl(var(--chart-N))` style, or use direct hex from the new palette so both themes look intentional.
- Give recharts `<CartesianGrid>` a `stroke="var(--color-hairline)"`, tooltip a `contentStyle` using `--card` / `--border` / `--foreground`.
- Recolor pies/bars to sky/emerald/amber/violet/rose set.

### 4. Onboarding (`src/routes/onboarding.tsx`)
- Page shell `bg-background`, card `bg-card ring-hairline`, step dots `bg-primary` / `bg-muted`, all labels `text-muted-foreground`, headings `text-foreground`.

### 5. AmountInput helper text and inputs
- Ensure `<Input>` uses `bg-input text-foreground placeholder:text-muted-foreground` — check the shadcn `input.tsx` still relies on tokens (it does by default). Fix any custom class overrides.

### 6. Sidebar footer + header
- Use `bg-sidebar text-sidebar-foreground`, active row `bg-sidebar-accent text-sidebar-accent-foreground`. Avatar fallback `bg-muted text-muted-foreground`.

### 7. Theme application
- Verify the theme toggle writes `.dark` on `<html>` (or `<body>`) via a small effect that reads `settings.theme` and handles `system` (matchMedia). If missing, add it in `__root.tsx`.

## Verification

1. Load app in dark mode, walk every route (dashboard, all hub sub-pages, planner, forecast, analytics, settings, onboarding).
2. Playwright screenshot each in dark mode; visually confirm no white-on-white patches.
3. Spot-check contrast on Text/Text-secondary/Accent-on-surface with the target hex above (already computed AA/AAA).
4. Toggle to light — confirm no regressions.

## Out of scope

Feature/logic changes, chart data changes, layout changes. Purely a theming + token migration.