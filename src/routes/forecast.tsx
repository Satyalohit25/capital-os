import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useFinance } from "@/store/finance-store";
import { debtFreeDate, formatINR, forecastAt, monthsToZero, simulateDebts } from "@/lib/finance";
import { Slider } from "@/components/ui/slider";
import { useMemo } from "react";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast Engine — Capital OS" },
      { name: "description", content: "Project your debt trajectory under snowball vs avalanche." },
    ],
  }),
  component: Forecast,
});

function Forecast() {
  const s = useFinance();
  const strategy = s.settings.strategy;
  const extra = s.settings.extraPayment;

  const snow = useMemo(() => simulateDebts(s.debts, "snowball", extra), [s.debts, extra]);
  const aval = useMemo(() => simulateDebts(s.debts, "avalanche", extra), [s.debts, extra]);
  const active = strategy === "snowball" ? snow : aval;
  const totalMonths = monthsToZero(active);

  const perDebtPayoff = (strat: "snowball" | "avalanche") => {
    const state = s.debts.map((d) => ({ ...d, payoff: 0 }));
    const extraLeft = extra;
    const maxMonths = 240;
    for (let m = 1; m <= maxMonths; m++) {
      let e = extraLeft;
      for (const d of state) {
        if (d.remaining <= 0) continue;
        const interest = (d.remaining * (d.apr / 100)) / 12;
        d.remaining = Math.max(0, d.remaining - Math.max(0, d.emi - interest));
      }
      const active = state.filter((d) => d.remaining > 0);
      const sorted =
        strat === "snowball"
          ? [...active].sort((a, b) => a.remaining - b.remaining)
          : [...active].sort((a, b) => b.apr - a.apr);
      for (const d of sorted) {
        if (e <= 0) break;
        const pay = Math.min(e, d.remaining);
        d.remaining -= pay;
        e -= pay;
      }
      for (const d of state) if (d.remaining <= 0 && !d.payoff) d.payoff = m;
      if (state.every((d) => d.remaining <= 0)) break;
    }
    return state;
  };

  const snowPayoff = perDebtPayoff("snowball");
  const avalPayoff = perDebtPayoff("avalanche");
  const projections = [1, 3, 6, 12, 24].map((m) => ({ m, v: forecastAt(active, m) }));

  return (
    <PageShell
      eyebrow="Phase 3 — Forecast Engine"
      title="Path to zero"
      description={`At current pacing you clear all liabilities in ${totalMonths} months — ${debtFreeDate(totalMonths)}.`}
      actions={
        <div className="flex overflow-hidden rounded-lg ring-1 ring-border">
          {(["snowball", "avalanche"] as const).map((v) => (
            <button
              key={v}
              onClick={() => s.setSettings({ strategy: v })}
              className={`px-4 py-2 text-sm capitalize transition-colors ${
                strategy === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      }
    >
      {/* Extra payment slider */}
      <div className="mb-12 rounded-2xl bg-muted p-6 ring-1 ring-hairline">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Extra monthly payment
            </div>
            <div className="font-serif text-3xl text-foreground">{formatINR(extra)}</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Applied to top-priority debt under current strategy</div>
          </div>
        </div>
        <Slider
          value={[extra]}
          max={100000}
          step={1000}
          onValueChange={([v]) => s.setSettings({ extraPayment: v })}
        />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/80">
          <span>₹0</span>
          <span>₹1,00,000</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-12">
        <h3 className="mb-4 font-serif text-xl">Total debt over time</h3>
        <ForecastChart snow={snow} aval={aval} active={strategy} />
      </div>

      {/* Projection strip */}
      <div className="mb-12 grid grid-cols-2 gap-px bg-muted md:grid-cols-5">
        {projections.map((p) => (
          <div key={p.m} className="bg-background px-4 py-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              +{p.m}m
            </div>
            <div className="mt-1 font-serif text-lg text-foreground">{formatINR(p.v)}</div>
          </div>
        ))}
      </div>

      {/* Per-debt payoff table */}
      <h3 className="mb-4 font-serif text-xl">Per-debt payoff comparison</h3>
      <div className="overflow-hidden rounded-xl ring-1 ring-hairline">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Debt</th>
              <th className="px-4 py-3 text-right">Remaining</th>
              <th className="px-4 py-3 text-right">APR</th>
              <th className="px-4 py-3 text-right">Snowball</th>
              <th className="px-4 py-3 text-right">Avalanche</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {s.debts.map((d, i) => {
              const sm = snowPayoff[i].payoff;
              const am = avalPayoff[i].payoff;
              return (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.lender}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatINR(d.remaining)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{d.apr}%</td>
                  <td
                    className={`px-4 py-3 text-right font-serif ${strategy === "snowball" ? "text-accent" : "text-muted-foreground"}`}
                  >
                    {sm}mo
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-serif ${strategy === "avalanche" ? "text-accent" : "text-muted-foreground"}`}
                  >
                    {am}mo
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

function ForecastChart({
  snow,
  aval,
  active,
}: {
  snow: { month: number; totalRemaining: number }[];
  aval: { month: number; totalRemaining: number }[];
  active: "snowball" | "avalanche";
}) {
  const maxMonth = Math.max(
    snow[snow.length - 1]?.month || 1,
    aval[aval.length - 1]?.month || 1,
    12,
  );
  const maxVal = Math.max(snow[0]?.totalRemaining || 1, aval[0]?.totalRemaining || 1);
  const W = 800;
  const H = 240;
  const pad = { l: 8, r: 8, t: 12, b: 24 };

  const toPath = (pts: typeof snow) =>
    pts
      .map((p, i) => {
        const x = pad.l + (p.month / maxMonth) * (W - pad.l - pad.r);
        const y = pad.t + (1 - p.totalRemaining / maxVal) * (H - pad.t - pad.b);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-hairline">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-64 w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = pad.t + f * (H - pad.t - pad.b);
          return (
            <line
              key={f}
              x1={pad.l}
              x2={W - pad.r}
              y1={y}
              y2={y}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="2 4"
            />
          );
        })}
        <path
          d={toPath(active === "avalanche" ? snow : aval)}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
        <path
          d={toPath(active === "snowball" ? snow : aval)}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground/80">
        <span>Today</span>
        <span>{maxMonth} months</span>
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <span className="flex items-center gap-2 text-foreground">
          <span className="inline-block h-0.5 w-6 bg-[--color-accent]" /> {active}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground/80">
          <span className="inline-block h-0 w-6 border-t border-dashed border-muted-foreground/60" />{" "}
          {active === "snowball" ? "avalanche" : "snowball"}
        </span>
      </div>
    </div>
  );
}
