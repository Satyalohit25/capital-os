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
      {
        name: "description",
        content: "This month's cash waterfall, calendar, and payment checklist.",
      },
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
          <div className="divide-y divide-border border-t border-border">
            {rows.map((r) => (
              <div
                key={r.label}
                className={`flex items-baseline justify-between py-5 ${r.tone === "final" ? "border-t-2 border-primary" : ""}`}
              >
                <div>
                  <div
                    className={`text-sm ${r.tone === "final" ? "font-serif text-lg text-foreground" : "font-medium text-foreground/85"}`}
                  >
                    {r.label}
                  </div>
                  {r.note && <div className="text-xs text-muted-foreground/80">{r.note}</div>}
                </div>
                <div
                  className={`font-serif tabular-nums ${r.tone === "final" ? "text-3xl text-accent" : r.tone === "in" ? "text-xl text-foreground" : "text-xl text-muted-foreground"}`}
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
              const done = !!s.checklist[key]?.paid;
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={done}
                      onCheckedChange={() =>
                        done
                          ? s.clearPaid(key)
                          : s.markPaid(key, {
                              paid: true,
                              paidDate: new Date().toISOString().slice(0, 10),
                            })
                      }
                    />
                    <div>
                      <div
                        className={`text-sm ${done ? "text-muted-foreground/80 line-through" : "text-foreground"}`}
                      >
                        {d.label}
                      </div>
                      <div className="text-xs text-muted-foreground/80">
                        Due day {d.day} • {d.sub}
                      </div>
                    </div>
                  </div>
                  <div className="font-serif tabular-nums text-foreground">
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
          <div className="rounded-xl bg-card p-4 ring-1 ring-hairline">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
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
                      items.length ? "bg-muted ring-1 ring-hairline" : ""
                    }`}
                  >
                    <div className="text-muted-foreground">{day}</div>
                    {items.length > 0 && (
                      <div className="mt-0.5 truncate text-[9px] font-medium text-accent">
                        ● {items.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-border p-6">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              Coming next
            </div>
            <p className="text-sm text-muted-foreground">
              Drag-to-reorder priority queue and voice-added expenses arrive in Phase 12
              (Automation).
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
