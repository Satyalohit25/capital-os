import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useFinance } from "@/store/finance-store";
import {
  formatINR,
  monthlyBills,
  monthlyCreditMin,
  monthlyEMI,
  monthlyIncome,
  monthlySavings,
  upcomingDues,
} from "@/lib/finance";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Monthly Planner — Capital OS" },
      { name: "description", content: "This month's cash waterfall, calendar, and payment checklist." },
    ],
  }),
  component: Planner,
});

function Planner() {
  const s = useFinance();
  const inc = monthlyIncome(s.income);
  const bills = monthlyBills(s.bills);
  const emi = monthlyEMI(s.debts);
  const cred = monthlyCreditMin(s.creditLines);
  const sav = monthlySavings(s.savings);
  const lifestyle = Math.max(0, inc - bills - emi - cred - sav);
  const remaining = inc - bills - emi - cred - sav - lifestyle;
  const rows = [
    { label: "Income", amount: inc, tone: "in" as const },
    { label: "Mandatory bills", amount: -bills, tone: "out" as const },
    { label: "Debt EMIs", amount: -emi, tone: "out" as const },
    { label: "Credit minimums", amount: -cred, tone: "out" as const },
    { label: "Savings contributions", amount: -sav, tone: "out" as const },
    { label: "Lifestyle", amount: -lifestyle, tone: "out" as const, note: "Discretionary balance" },
    { label: "Remaining cash", amount: remaining, tone: "final" as const },
  ];

  const dues = upcomingDues(s.bills, s.debts, s.creditLines);
  const month = s.settings.month;

  // Calendar
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDay = new Date(y, m - 1, 1).getDay();
  const dueByDay: Record<number, typeof dues> = {};
  for (const d of dues) (dueByDay[d.day] ||= []).push(d);

  return (
    <PageShell
      eyebrow="Phase 2 — Monthly Planner"
      title="Cash flow waterfall"
      description="Track how this month's income cascades through commitments to the cash you can actually deploy."
    >
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Waterfall */}
        <section className="lg:col-span-7">
          <div className="divide-y divide-neutral-950/5 border-t border-neutral-950/5">
            {rows.map((r) => (
              <div
                key={r.label}
                className={`flex items-baseline justify-between py-5 ${r.tone === "final" ? "border-t-2 border-neutral-900" : ""}`}
              >
                <div>
                  <div
                    className={`text-sm ${r.tone === "final" ? "font-serif text-lg text-neutral-900" : "font-medium text-neutral-700"}`}
                  >
                    {r.label}
                  </div>
                  {r.note && <div className="text-xs text-neutral-400">{r.note}</div>}
                </div>
                <div
                  className={`font-serif tabular-nums ${r.tone === "final" ? "text-3xl text-[--color-accent]" : r.tone === "in" ? "text-xl text-neutral-900" : "text-xl text-neutral-500"}`}
                >
                  {r.amount < 0 ? "−" : ""}
                  {formatINR(Math.abs(r.amount))}
                </div>
              </div>
            ))}
          </div>

          <h3 className="mb-4 mt-12 font-serif text-xl">Priority payment checklist</h3>
          <div className="space-y-3">
            {dues.slice(0, 8).map((d) => {
              const key = `${month}:${d.kind}:${d.id}`;
              const done = !!s.checklist[key];
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={done} onCheckedChange={() => s.toggleChecklist(key)} />
                    <div>
                      <div className={`text-sm ${done ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                        {d.label}
                      </div>
                      <div className="text-xs text-neutral-400">Due day {d.day} • {d.sub}</div>
                    </div>
                  </div>
                  <div className="font-serif tabular-nums text-neutral-900">
                    {formatINR(d.amount)}
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Calendar */}
        <section className="lg:col-span-5">
          <h3 className="mb-4 font-serif text-xl">Due-date calendar</h3>
          <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`b${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const items = dueByDay[day] || [];
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-md p-1.5 text-left text-[11px] ${
                      items.length ? "bg-neutral-100 ring-1 ring-black/5" : ""
                    }`}
                  >
                    <div className="text-neutral-500">{day}</div>
                    {items.length > 0 && (
                      <div className="mt-0.5 truncate text-[9px] font-medium text-[--color-accent]">
                        ● {items.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-neutral-300 p-6">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Coming next
            </div>
            <p className="text-sm text-neutral-500">
              Drag-to-reorder priority queue and voice-added expenses arrive in Phase 12
              (Automation).
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
