
# Capital OS — Vanguard Polish Plan

Scope: eight coordinated UX upgrades. Onboarding already exists; it will be reworked to match the new brief. All work is frontend + store; no schema changes.

---

## 1. Header brand: "Vanguard" centered at the top

- Remove the "Capital OS · Vanguard Edition" block from the sidebar header.
- In `src/routes/__root.tsx`, replace the current top bar (which only holds `SidebarTrigger`) with a 3-column header:
  - Left: `SidebarTrigger` + breadcrumb of current route
  - Center: wordmark — small uppercase "CAPITAL OS" eyebrow above a serif italic "Vanguard"
  - Right: theme toggle (sun/moon) + a compact profile chip (avatar + first name) that links to `/settings`
- Header becomes `sticky top-0 z-40` with a subtle bottom hairline and backdrop blur so it survives scroll.

## 2. Profile block at the bottom of the sidebar

- Add a `SidebarFooter` in `src/components/app-sidebar.tsx` containing:
  - Circular avatar (40px). Falls back to initials on a neutral tile if `settings.avatarUrl` is empty.
  - Two lines: `settings.profileName` + a muted "View profile" caption; entire block is a `Link` to `/settings`.
  - Collapses to just the avatar when the sidebar is in `icon` mode.
- Avatar upload lives in Settings (see §3): file → `FileReader` → data URL → `setSettings({ avatarUrl })`. Cheap, offline-safe, persisted by the existing zustand store.

## 3. Settings page redesign

Reorganize `src/routes/settings.tsx` into tabbed sections (shadcn `Tabs`):

1. **Profile** — name, avatar upload (drag/drop + click), preferred display name.
2. **Appearance** — theme radio (Light / Dark / System), density (comfortable / compact), number-format preview.
3. **Strategy** — snowball vs avalanche toggle, extra-payment slider + numeric input, month selector.
4. **Data** — Backup (export JSON), Restore (import JSON with confirm dialog), Reset to sample, Clear all (destructive, requires typing "DELETE").
5. **About** — app version, storage size used, offline-mode note.

Each destructive action goes through a shadcn `AlertDialog`.

## 4. Onboarding rework — questions → live snapshot → skip anytime

Rebuild `src/routes/onboarding.tsx` as a 6-step guided wizard, each step a single focused card with a large amount input and inline validation. Steps:

1. Name + optional avatar (writes to `settings`).
2. Monthly income (supports multiple sources with "+ add another").
3. Fixed bills (rent, EMIs, utilities — repeatable rows in a modal).
4. Debts (name, balance, EMI, APR — optional).
5. Savings goals (target + monthly).
6. Preferences: currency locked to INR, strategy pick (snowball / avalanche), theme.

Persistent UI:
- Progress bar + step dots at the top.
- **Live snapshot rail** on the right (desktop) / collapsible sheet (mobile) showing Health Score, Free Cash, Net Worth updating as the user types — same components used on the dashboard so they see the payoff immediately.
- **Skip setup** button always visible in the top-right; skipping seeds sample data and jumps to dashboard (current behavior, kept).
- **Finish early** button appears from step 2 onward — writes whatever is filled, marks `onboarded: true`, routes to `/`.
- Route guard in `__root.tsx`: if `!settings.onboarded` and path is not `/onboarding`, redirect to `/onboarding` on first load only.

## 5. Dark & Light mode

- Extend `src/styles.css` with a full dark palette under `.dark { … }` using the same token names (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--ring`, brand accents). Register in `@theme inline` (already the pattern).
- Add `@custom-variant dark (&:where(.dark, .dark *));`.
- Add `src/lib/theme.ts`: reads `settings.theme`, applies `.dark` class to `<html>`, listens to `prefers-color-scheme` when set to "system".
- Header + Settings expose the toggle. Charts, cards, sidebar, and the onboarding surfaces all consume tokens so they invert cleanly.
- Audit hardcoded `bg-neutral-*` / `text-neutral-*` in existing routes and swap for semantic tokens (`bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `ring-border`). This is the largest single edit — one pass per route file.

## 6. Charts & analytics review

Audit `src/routes/analytics.tsx`, `reports.tsx`, `forecast.tsx`, and dashboard visualizations. For each chart:

- Wrap in a `ChartContainer` (shadcn recharts wrapper) so colors come from tokens and adapt to theme.
- Use INR compact formatting on axes (`₹1.4L`, `₹12K`) via `Intl.NumberFormat('en-IN', { notation: 'compact' })`.
- Fix any empty-state — when a user finishes onboarding with sparse data, charts must show a friendly "add more entries to see this trend" panel instead of an empty grid.
- Add tooltips with full `formatINR` values.
- Cash-flow forecast: verify EMI drawdown math against `debts[].remaining` and honor `settings.extraPayment` + `strategy`. Add a legend for principal vs interest.
- Debt-payoff timeline: show months-to-zero per debt under the current strategy; highlight the "focus" debt.

## 7. Number input UX — commas, words, modals

- New shared `AmountField` component (upgrade of `AmountInput`):
  - Formats `1,45,000` (Indian grouping) as the user types.
  - Shows a muted subtitle beneath: "one lakh forty-five thousand" (via a tiny `numberToIndianWords` helper in `src/lib/finance.ts`).
  - Increment chips: +1k / +10k / +1L.
  - Keyboard: arrow-up/down steps by 1000, shift-arrow by 10000.
- Every "add item" flow (bills, debts, savings, income, credit, investments, assets) opens a shadcn `Dialog` on desktop and a `Sheet` (bottom-anchored) on mobile — powered by a single `EntityDialog` wrapper. Forms use `react-hook-form` + zod for validation and inline errors.
- `CollectionEditor` gains a "+ Add" button that triggers this dialog instead of the current inline row editing; existing rows get an "Edit" affordance that opens the same dialog pre-filled.

## 8. Responsive layout pass

Header, sidebar, dashboard grids, hub, planner, analytics, settings — all pass the responsive rule (grid + `min-w-0` + `shrink-0`, promote to flex at `sm:`). Specific fixes:

- Sidebar collapses to `icon` mode by default under `md`.
- Dashboard KPI row: `grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4`.
- Onboarding snapshot rail becomes a bottom sheet under `md`.
- Charts use `ResponsiveContainer` at 100% width with a min-height so they don't collapse.

## 9. Paid confirmation for bills & debts

Store already supports `PaymentRecord { paid, paidDate, paidAmount }`. Wire the UI:

- Replace the current mark-paid checkbox (Planner + Hub views) with a **Confirm Payment** dialog:
  - Fields: date paid (shadcn Datepicker, defaults to today), amount paid (defaults to bill amount or debt EMI), optional note.
  - On confirm → `markPaid(key, { paid: true, paidDate, paidAmount })`. For debts: also decrement `debts[id].remaining` by `paidAmount` via `updateItem`.
- Row shows a paid pill: `✓ Paid ₹14,200 on 12 Jul` with an "Undo" link that opens the dialog again or calls `clearPaid`.
- Planner month view surfaces a **Payments log** panel: reverse-chronological list of confirmations for the current month, exportable as CSV.
- Dashboard "Due this month" card counts remaining unpaid using the same keys, so confirmations move the needle immediately.

---

## Technical details

- No new dependencies except `react-hook-form` + `zod` (already common in shadcn projects; add via `bun add` in build mode). Datepicker is the standard shadcn/Calendar+Popover shown in `<shadcn-datepicker>`.
- Storage stays in the existing zustand `persist` store; bump `version` to 3 with a no-op migrate to avoid clobbering existing users, since only additive fields (`avatarUrl` etc.) change.
- Route guard uses `beforeLoad` in `__root.tsx` — pure client redirect, no server function.
- All theming via tokens; no `text-white`/`bg-black` in components.
- Electron shell needs no changes — the dark class toggles inside the same renderer.

## Suggested build order

1. Theming foundation (tokens + `.dark` + toggle) so every later screen is built theme-correct.
2. Header + sidebar footer profile.
3. `AmountField` + `EntityDialog` primitives.
4. `CollectionEditor` migration to dialogs.
5. Onboarding rework with live snapshot.
6. Settings tabs.
7. Paid-confirmation dialog + payments log.
8. Charts/analytics audit and responsive sweep.

Each step is independently shippable and leaves the app in a working state.
