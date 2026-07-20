import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { useFinance } from "@/store/finance-store";
import {
  formatINR,
  formatINRCompact,
  monthlyIncome,
  monthlyBills,
  monthlyEMI,
  monthlySavings,
  totalDebt,
  totalAssetsValue,
} from "@/lib/finance";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Capital OS" },
      {
        name: "description",
        content: "Cash-flow breakdown, debt vs assets, and monthly outflow analytics.",
      },
    ],
  }),
  component: Analytics,
});

// Theme-aware chart palette — reads live CSS vars so dark/light both look intentional.
const cssVar = (name: string) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined
    : undefined;
const C = {
  sky: "var(--chart-1)",
  emerald: "var(--chart-2)",
  amber: "var(--chart-3)",
  violet: "var(--chart-4)",
  rose: "var(--chart-5)",
  muted: "var(--muted)",
  grid: "var(--hairline)",
  axis: "var(--muted-foreground)",
};
const PIE_COLORS = [C.sky, C.emerald, C.amber, C.violet, C.rose, "var(--muted-foreground)"];
void cssVar;

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
  fontSize: 12,
};
const tooltipLabelStyle = { color: "var(--popover-foreground)" };
const legendStyle = { color: "var(--muted-foreground)", fontSize: 12 };

function Analytics() {
  const {
    income,
    bills,
    debts,
    creditLines,
    savings,
    investments,
    assets,
  } = useFinance();

  const mIncome = monthlyIncome(income);
  const mBills = monthlyBills(bills);
  const mEmi = monthlyEMI(debts);
  const mSave = monthlySavings(savings);
  const free = Math.max(0, mIncome - mBills - mEmi - mSave);

  const cashflowData = [
    { name: "Bills", value: mBills },
    { name: "EMIs", value: mEmi },
    { name: "Savings", value: mSave },
    { name: "Free Cash", value: free },
  ].filter((d) => d.value > 0);

  const billsByCategory = Object.entries(
    bills.reduce<Record<string, number>>((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + b.amount;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const debtVsAssets = [
    {
      name: "Position",
      Assets: assets.reduce((s, a) => s + a.value, 0),
      Investments: investments.reduce((s, i) => s + i.currentValue, 0),
      Savings: savings.reduce((s, g) => s + g.current, 0),
      Debt: -totalDebt(debts, creditLines),
    },
  ];

  const debtList = debts
    .map((d) => ({ name: d.name, Remaining: d.remaining, EMI: d.emi * 12 }))
    .sort((a, b) => b.Remaining - a.Remaining);

  const savingsProgress = savings.map((g) => ({
    name: g.name,
    Current: g.current,
    Remaining: Math.max(0, g.target - g.current),
  }));

  const netWorth = totalAssetsValue(assets, investments, savings) - totalDebt(debts, creditLines);
  const savingsRate = mIncome > 0 ? (mSave / mIncome) * 100 : 0;

  return (
    <PageShell
      eyebrow="Analytics"
      title="Money, at a glance"
      description="How your cash flows, what you own vs. owe, and where each rupee goes."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Net worth" value={formatINRCompact(netWorth)} />
        <Stat label="Monthly income" value={formatINRCompact(mIncome)} />
        <Stat label="Savings rate" value={`${savingsRate.toFixed(1)}%`} />
        <Stat label="Free cash / mo" value={formatINRCompact(free)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Monthly cash flow">
          {cashflowData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={cashflowData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {cashflowData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Legend wrapperStyle={legendStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Bills by category">
          {billsByCategory.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={billsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickFormatter={(v) => formatINRCompact(v)} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Debt vs. assets">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={debtVsAssets} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis tickFormatter={(v) => formatINRCompact(v)} fontSize={11} stroke="var(--muted-foreground)" />
              <Tooltip formatter={(v: number) => formatINR(Math.abs(v))} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="Assets" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="Investments" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="Savings" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="Debt" stackId="a" fill="var(--chart-5)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Savings goals progress">
          {savingsProgress.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={savingsProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis type="number" tickFormatter={(v) => formatINRCompact(v)} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" width={110} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="Current" stackId="a" fill="var(--chart-1)" />
                <Bar dataKey="Remaining" stackId="a" fill="var(--muted)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Debt breakdown" className="lg:col-span-2">
          {debtList.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={debtList}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis tickFormatter={(v) => formatINRCompact(v)} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="Remaining" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="EMI" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-hairline">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-serif text-2xl text-foreground">{value}</div>
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-card p-5 ring-1 ring-hairline ${className}`}>
      <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
      Add data to see this chart.
    </div>
  );
}
