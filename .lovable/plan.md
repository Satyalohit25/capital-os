## Fix onboarding crash + polish

**Root cause (confirmed):** `src/routes/onboarding.tsx` does `const store = useFinance()` — subscribing to the whole store — then calls `store.clearCollections()` inside a `useEffect` whose dep array includes `store`. Every store change re-runs the effect, which mutates the store again → `Maximum update depth exceeded`. That crash bubbles to the root error boundary and renders the "This page didn't load" screen (screenshot 1).

### Changes

1. **`src/routes/onboarding.tsx`** — stop subscribing to the whole store:
   - Replace `const store = useFinance()` with selective hooks for the actions actually used (`addItem`, `setSettings`, `clearCollections`, `resetSeed`) via `useFinance((s) => s.addItem)` etc., or read once from `useFinance.getState()`.
   - Change the mount effect to `useEffect(() => { clearCollections(); }, [])` with a stable action reference (zustand actions are stable), eliminating the loop.
   - Replace the `useFinance.getState()` calls inside the render body (for the snapshot) with proper selector hooks so the snapshot rail actually re-renders as the user types.

2. **No other files touched.** This is the minimum change to restore the app; broader Vanguard Polish items (dark mode audit, dialogs, paid confirmations) continue as planned in `.lovable/plan.md` in a follow-up turn.

### Verification

- Reload `/onboarding` in the preview — the wizard renders instead of the error card.
- Type an income amount and confirm the snapshot numbers update live.
- Click "Skip setup" → lands on `/` with seed data.

Ask before I proceed: want me to also unlock the remaining Vanguard Polish items (dialog-based entry, paid confirmations, dark-mode token sweep) in this same turn, or ship the crash fix alone first?