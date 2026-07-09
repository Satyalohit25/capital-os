import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useFinance } from "@/store/finance-store";
import {
  debtFreeDate,
  formatINR,
  forecastAt,
  monthsToZero,
  simulateDebts,
} from "@/lib/finance";
import { Slider } from "@/components/ui/slider";
import { useMemo } from "react";

export const Route = createFileRoute("/forecast")({
  head: () => ({
    meta: [
      { title: "Forecast Engine — Capital OS" },
      { name: "description", content: "Project your debt trajectory under snowball vs avalanche." },
    ],
  }),
  component: Forecast;
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
    let extraLeft = extra;
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
        <div className="flex overflow-hidden rounded-lg ring-1 ring-neutral-200">
          {(["snowball", "avalanche"] as const).map((v) => (
            <button
              key={v}
              onClick={() => s.setSettings({ strategy: v })}
              className={`px-4 py-2 text-sm capitalize transition-colors ${
                strategy === v ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      }
    >
      {/* Extra payment slider */}
      <div className="mb-12 rounded-2xl bg-neutral-100 p-6 ring-1 ring-black/5">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Extra monthly payment
            </div>
            <div className="font-serif text-3xl text-neutral-900">{formatINR(extra)}</div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <div>Applied to top-priority debt under current strategy</div>
          </div>
        </div>
        <Slider
          value={[extra]}
          max={100000}
          step={1000}
          onValueChange={([v]) => s.setSettings({ extraPayment: v })}
        />
        <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
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
      <div className="mb-12 grid grid-cols-2 gap-px bg-neutral-200 md:grid-cols-5">
        {projections.map((p) => (
          <div key={p.m} className="bg-neutral-50 px-4 py-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              +{p.m}m
            </div>
            <div className="mt-1 font-serif text-lg text-neutral-900">{formatINR(p.v)}</div>
          </div>
        ))}
      </div>

      {/* Per-debt payoff table */}
      <h3 className="mb-4 font-serif text-xl">Per-debt payoff comparison</h3>
      <div className="overflow-hidden rounded-xl ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            <tr>
              <th className="px-4 py-3">Debt</th>
              <th className="px-4 py-3 text-right">Remaining</th>
              <th className="px-4 py-3 text-right">APR</th>
              <th className="px-4 py-3 text-right">Snowball</th>
              <th className="px-4 py-3 text-right">Avalanche</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-950/5 bg-white">
            {s.debts.map((d, i) => {
              const sm = snowPayoff[i].payoff;
              const am = avalPayoff[i].payoff;
              return (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{d.name}</div>
                    <div className="text-xs text-neutral-500">{d.lender}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatINR(d.remaining)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{d.apr}%</td>
                  <td className={`px-4 py-3 text-right font-serif ${strategy === "snowball" ? "text-[--color-accent]" : "text-neutral-500"}`}>
                    {sm}mo
                  </td>
                  <td className={`px-4 py-3 text-right font-serif ${strategy === "avalanche" ? "text-[--color-accent]" : "text-neutral-500"}`}>
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
  const maxMonth = Math.max(snow[snow.length - 1]?.month || 1, aval[aval.length - 1]?.month || 1, 12);
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
    <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
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
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeDasharray="3 4"
        />
        <path
          d={toPath(active === "snowball" ? snow : aval)}
          fill="none"
          stroke="#166534"
          strokeWidth={2.5}
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-neutral-400">
        <span>Today</span>
        <span>{maxMonth} months</span>
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <span className="flex items-center gap-2 text-neutral-900">
          <span className="inline-block h-0.5 w-6 bg-[--color-accent]" /> {active}
        </span>
        <span className="flex items-center gap-2 text-neutral-400">
          <span className="inline-block h-0 w-6 border-t border-dashed border-neutral-400" />{" "}
          {active === "snowball" ? "avalanche" : "snowball"}
        </span>
      </div>
    </div>
  );
}
