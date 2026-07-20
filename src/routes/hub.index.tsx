import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useFinance } from "@/store/finance-store";
import { formatINR, monthlyBills, monthlyEMI, monthlyIncome } from "@/lib/finance";

export const Route = createFileRoute("/hub/")({
  head: () => ({
    meta: [
      { title: "Financial Hub — Capital OS" },
      { name: "description", content: "Every account, debt, and asset in one workspace." },
    ],
  }),
  component: HubIndex,
});

function HubIndex() {
  const s = useFinance();

  const tiles = [
    {
      to: "/hub/income",
      label: "Income",
      value: formatINR(monthlyIncome(s.income)) + " / mo",
      count: s.income.length,
    },
    {
      to: "/hub/bills",
      label: "Bills",
      value: formatINR(monthlyBills(s.bills)) + " / mo",
      count: s.bills.length,
    },
    {
      to: "/hub/debts",
      label: "Debts",
      value: formatINR(s.debts.reduce((a, d) => a + d.remaining, 0)),
      count: s.debts.length,
    },
    {
      to: "/hub/credit",
      label: "Credit Lines",
      value: formatINR(s.creditLines.reduce((a, c) => a + c.used, 0)),
      count: s.creditLines.length,
    },
    {
      to: "/hub/savings",
      label: "Savings",
      value: formatINR(s.savings.reduce((a, g) => a + g.current, 0)),
      count: s.savings.length,
    },
    {
      to: "/hub/investments",
      label: "Investments",
      value: formatINR(s.investments.reduce((a, i) => a + i.currentValue, 0)),
      count: s.investments.length,
    },
    {
      to: "/hub/assets",
      label: "Assets",
      value: formatINR(s.assets.reduce((a, x) => a + x.value, 0)),
      count: s.assets.length,
    },
  ] as const;

  return (
    <PageShell
      eyebrow="Financial Hub"
      title="Everything you own & owe"
      description="A calm ledger of your financial surface area. Add, edit, or archive line items — they roll up into the dashboard and forecast."
    >
      <div className="grid grid-cols-1 gap-px bg-muted sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group flex flex-col justify-between bg-background p-6 transition-colors hover:bg-card"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {t.label}
              </span>
              <span className="text-[10px] text-muted-foreground/80">{t.count} items</span>
            </div>
            <div className="font-serif text-2xl text-foreground group-hover:text-accent">
              {t.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex justify-between text-xs text-muted-foreground/80">
        <span>Monthly obligation: {formatINR(monthlyBills(s.bills) + monthlyEMI(s.debts))}</span>
        <button
          onClick={() => {
            if (confirm("Reset all data to sample seed?")) s.resetSeed();
          }}
          className="uppercase tracking-widest hover:text-foreground"
        >
          Reset to sample data
        </button>
      </div>
    </PageShell>
  );
}
