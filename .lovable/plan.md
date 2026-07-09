## Scope

Build **Phase 1 (Dashboard + Financial Hub)**, **Phase 2 (Monthly Planner)**, and **Phase 3 (Forecast Engine)** as fully working screens. Ship **Phases 4–15** as real routes but locked skeleton placeholders so navigation feels complete.

All data lives in `localStorage` under a single namespaced store — no backend, no auth. Currency is Indian Rupees with lakh/crore comma grouping (`en-IN`).

## Visual Direction (locked from chosen prototype)

- Palette: `neutral-50` canvas, `neutral-900` ink, single accent `#166534` (deep green), red-600 for high-priority.
- Type: **Instrument Serif** for display/numbers, **Inter** for body. Loaded via `<link>` in `__root.tsx` head.
- Layout: fixed left sidebar (256px) + generously padded main column, max-w-6xl. Serif KPI numbers. Hairline dividers (`neutral-950/5`) instead of card borders.
- Editorial calm — no gradients, no drop shadows beyond `ring-1 ring-black/5`.

## Route Architecture

```
src/routes/
  __root.tsx                 → shell: SidebarProvider + AppSidebar + <Outlet/>
  index.tsx                  → Dashboard
  hub.tsx                    → Financial Hub layout (<Outlet/>)
  hub.index.tsx              → Hub overview
  hub.income.tsx
  hub.bills.tsx
  hub.debts.tsx
  hub.credit.tsx
  hub.savings.tsx
  hub.investments.tsx
  hub.assets.tsx
  planner.tsx                → Monthly Planner
  forecast.tsx               → Forecast Engine
  debt-strategy.tsx          → LOCKED (skeleton)
  goals.tsx                  → LOCKED
  analytics.tsx              → LOCKED
  reports.tsx                → LOCKED
  advisor.tsx                → LOCKED
  history.tsx                → LOCKED
  settings.tsx               → LOCKED
```

Each route sets its own `head()` title/description. Locked routes render a shared `<LockedModule name="…" phase="Phase N" />` component (grayed skeleton bars + "Coming in Phase N" chip).

## Data Model (localStorage)

Single store `fin-os:v1` (Zustand + persist middleware) with slices:

```ts
{
  income:      IncomeSource[]     // {id, name, amount, frequency, type}
  bills:       Bill[]             // {id, name, amount, dueDay, category, autoPay}
  debts:       Debt[]             // {id, name, lender, original, remaining, emi, apr, dueDay, priority}
  creditLines: CreditLine[]       // {id, name, limit, used, statementDay, dueDay, minPayment}
  savings:     SavingsGoal[]      // {id, name, target, current, monthly, deadline}
  investments: Investment[]       // {id, name, type, invested, currentValue}
  assets:      Asset[]            // {id, name, category, value}
  settings:    { currency: 'INR', strategy: 'snowball'|'avalanche', month: string }
}
```

Seed with sample INR data on first load so the dashboard is populated immediately.

## Computed Selectors (pure functions in `src/lib/finance.ts`)

- `healthScore()` — 0-100 from DTI, savings rate, emergency-fund months.
- `availableCash()` = income − bills − minimum debt payments this month.
- `totalDebt()`, `monthlyCommitments()`, `remainingCash()`.
- `emergencyFundMonths()`.
- `nextPayment()`, `upcomingDueDates(n)`.
- `forecastDebt(months, strategy)` — projects total debt at +1/+3/+6/+12 months using snowball vs avalanche (applies free cash to highest-priority / highest-APR debt).
- `daysToZero(strategy)`.
- `formatINR(n)` → `₹ 1,42,800` using `Intl.NumberFormat('en-IN')`.

## Screens

**Dashboard (`/`)** — Header with net worth + Run Forecast button. 4 KPI row (Health Score, Available Cash, Debt Remaining, Days to Zero). Forecast strip (+1/+3/+6/+12). Two-column: Active Liabilities list with APR + progress bar + EMI on left; Upcoming Commitments + Emergency Fund card on right. Exact composition of chosen prototype.

**Financial Hub** — Overview page tiles into 7 sub-sections. Each sub-page = list + "Add" dialog (shadcn Dialog + react-hook-form + zod) + edit/delete row actions. Same editorial styling.

**Monthly Planner (`/planner`)** — Waterfall list: Income → Mandatory Payments → Debt Payments → Savings → Investments → Lifestyle → Remaining Cash. Each row draggable priority order. Simple monthly calendar (grid) marking due dates from bills+debts. Payment checklist (checkboxes persisted per month).

**Forecast Engine (`/forecast`)** — Strategy toggle (Snowball / Avalanche). SVG line chart (custom, no chart lib) of projected total debt over 24 months. Table breakdown per debt showing payoff month under each strategy. Extra-payment slider that recomputes live.

**Locked routes** — shared skeleton component with shimmer bars matching sidebar style and a "Phase N — Coming soon" chip.

## Sidebar

Adopt chosen prototype exactly: brand block "Capital OS / Vanguard Edition", grouped nav (Dashboard, Financial Hub with sub-items, Planning, then dim `opacity-30` locked bars for future modules). Active item uses `bg-neutral-100`. Collapsible via shadcn `Sidebar collapsible="icon"`.

## Files to add/change

- `src/styles.css` — add `--font-serif`, `--font-sans`, `--color-accent: #166534` tokens; keep shadcn base.
- `src/routes/__root.tsx` — replace title/description with "Capital OS — Personal Financial OS"; add Instrument Serif + Inter `<link>` tags; wrap children in `SidebarProvider` + `AppSidebar`.
- `src/components/app-sidebar.tsx` — nav from route architecture above.
- `src/components/locked-module.tsx` — skeleton placeholder.
- `src/components/ui/*` — add shadcn `sidebar`, `dialog`, `input`, `label`, `button`, `progress`, `slider`, `select`, `tabs`, `checkbox` if missing.
- `src/store/finance-store.ts` — Zustand persisted store + seed.
- `src/lib/finance.ts` — selectors + INR formatter + forecast math.
- All routes listed above.

## Out of scope (this pass)

Phases 4–15 beyond skeleton, auth/multi-user, bank integrations, notifications, mobile-specific UX, dark mode toggle. These slot in without changing the route tree.

## Verification

After build, Playwright: load `/`, screenshot dashboard, click into `/hub/debts` add-a-debt flow, screenshot; visit `/planner` and `/forecast`; visit one locked route and confirm skeleton renders.
