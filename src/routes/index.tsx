import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useFinance } from "@/store/finance-store";
import {
  availableCash,
  debtFreeDate,
  emergencyFundMonths,
  forecastAt,
  formatINR,
  healthScore,
  monthlyIncome,
  monthsToZero,
  netWorth,
  simulateDebts,
  totalDebt,
  upcomingDues,
} from "@/lib/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Capital OS" },
      {
        name: "description",
        content: "Your financial overview: cash, debt, forecast, and path to zero.",
      },
    ],
  }),
  beforeLoad: () => {
    if (!useFinance.getState().settings.onboarded) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  const s = useFinance();
  const inc = monthlyIncome(s.income);
  const debt = totalDebt(s.debts, s.creditLines);
  const cash = availableCash(s.income, s.bills, s.debts, s.creditLines);
  const score = healthScore(s);
  const efMonths = emergencyFundMonths(s.savings, s.bills, s.debts);
  const points = simulateDebts(s.debts, s.settings.strategy, s.settings.extraPayment);
  const days = monthsToZero(points) * 30;
  const projections = [1, 3, 6, 12].map((m) => ({ m, v: forecastAt(points, m) }));
  const dues = upcomingDues(s.bills, s.debts, s.creditLines).slice(0, 4);
  const ef = s.savings.find((g) => g.isEmergency);
  const nw = netWorth(s.assets, s.investments, s.savings, s.debts, s.creditLines);

  const progress = (d: { original: number; remaining: number }) =>
    Math.max(0, Math.min(100, ((d.original - d.remaining) / Math.max(1, d.original)) * 100));

  return (
    <PageShell
      eyebrow={new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      title="Financial Overview"
      description={`Net worth ${formatINR(nw)}. You are on pace to be debt-free by ${debtFreeDate(
        monthsToZero(points),
      )}.`}
      actions={
        <Link
          to="/forecast"
          className="flex items-center gap-2 rounded-lg bg-primary py-2 pl-2 pr-3 text-sm font-medium text-primary-foreground ring-1 ring-neutral-900"
        >
          <span className="size-4 rounded-full bg-card/20" />
          Run Forecast
        </Link>
      }
    >
      {/* KPI Row */}
      <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4">
        <Kpi
          label="Health Score"
          value={
            <span>
              {score}
              <span className="text-xl italic text-muted-foreground/60">/100</span>
            </span>
          }
        />
        <Kpi label="Available Cash" value={formatINR(cash)} />
        <Kpi label="Debt Remaining" value={formatINR(debt)} />
        <Kpi label="Days to Zero" value={days.toLocaleString("en-IN")} />
      </div>

      {/* Forecast Strip */}
      <div className="mb-16 rounded-2xl bg-muted p-6 ring-1 ring-hairline">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Forecast Projection</h3>
          <span className="text-xs italic text-muted-foreground">
            Strategy: {s.settings.strategy === "snowball" ? "Accelerated Snowball" : "Avalanche"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-muted md:grid-cols-4">
          {projections.map((p, i) => (
            <div
              key={p.m}
              className={`bg-muted py-4 ${i === 0 ? "pr-6" : i === projections.length - 1 ? "pl-6 md:text-right" : "px-6"}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                +{p.m} Month{p.m > 1 ? "s" : ""}
              </span>
              <div
                className={`mt-1 font-serif text-lg ${i === 2 ? "italic text-accent" : "text-foreground"}`}
              >
                {formatINR(p.v)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="mb-6 font-serif text-xl text-foreground">Active Liabilities</h2>
          <div className="divide-y divide-border border-t border-border">
            {s.debts.length === 0 && (
              <div className="py-8 text-sm text-muted-foreground">
                No debts recorded.{" "}
                <Link to="/hub/debts" className="underline">
                  Add one
                </Link>
              </div>
            )}
            {s.debts.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-5">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{d.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {d.lender} • {d.apr}% APR
                  </div>
                  <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-[--color-accent]"
                      style={{ width: `${progress(d)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg text-foreground">
                    {formatINR(d.remaining)}
                  </div>
                  <div
                    className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${d.priority === 1 ? "text-red-600" : "text-muted-foreground/80"}`}
                  >
                    EMI: {formatINR(d.emi)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-12 lg:col-span-5">
          <div>
            <h2 className="mb-6 font-serif text-xl text-foreground">Upcoming Commitments</h2>
            <div className="rounded-xl bg-card p-6 ring-1 ring-hairline">
              <div className="space-y-4">
                {dues.map((d) => (
                  <div key={d.id + d.kind} className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{d.label}</div>
                      <div className="text-xs capitalize text-muted-foreground">
                        {new Date().toLocaleDateString("en-IN", { month: "short" })} {d.day} •{" "}
                        {d.sub}
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums text-foreground">
                      {formatINR(d.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {ef && (
            <div>
              <h2 className="mb-4 font-serif text-xl text-foreground">Financial Reserve</h2>
              <div className="flex items-baseline gap-2">
                <div className="font-serif text-3xl text-foreground">{formatINR(ef.current)}</div>
                <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground/80">
                  Emergency Fund
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted outline outline-1 outline-neutral-950/5">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (ef.current / ef.target) * 100)}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Goal: {formatINR(ef.target)}. You are currently at {efMonths.toFixed(1)} months of
                runway.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-border p-6">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              This Month
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-serif text-2xl text-foreground">{formatINR(inc)}</div>
                <div className="text-xs text-muted-foreground">Income in</div>
              </div>
              <div className="text-right">
                <div className="font-serif text-2xl text-foreground">{formatINR(inc - cash)}</div>
                <div className="text-xs text-muted-foreground">Committed out</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
        {label}
      </span>
      <div className="font-serif text-4xl text-foreground">{value}</div>
    </div>
  );
}
