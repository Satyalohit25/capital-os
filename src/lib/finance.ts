import type {
  Bill,
  CreditLine,
  Debt,
  IncomeSource,
  Investment,
  SavingsGoal,
  Strategy,
} from "@/store/finance-store";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 1,
  notation: "compact",
});

export const formatINR = (n: number) => inr.format(Math.round(n || 0));
export const formatINRCompact = (n: number) => inrCompact.format(Math.round(n || 0));

export const monthlyIncome = (income: IncomeSource[]) =>
  income.reduce((sum, i) => {
    if (i.frequency === "monthly") return sum + i.amount;
    if (i.frequency === "weekly") return sum + i.amount * 4.33;
    if (i.frequency === "yearly") return sum + i.amount / 12;
    return sum;
  }, 0);

export const monthlyBills = (bills: Bill[]) => bills.reduce((s, b) => s + b.amount, 0);
export const monthlyEMI = (debts: Debt[]) => debts.reduce((s, d) => s + d.emi, 0);
export const monthlyCreditMin = (cls: CreditLine[]) => cls.reduce((s, c) => s + c.minPayment, 0);
export const monthlySavings = (gs: SavingsGoal[]) => gs.reduce((s, g) => s + g.monthly, 0);

export const totalDebt = (debts: Debt[], cls: CreditLine[]) =>
  debts.reduce((s, d) => s + d.remaining, 0) + cls.reduce((s, c) => s + c.used, 0);

export const totalAssetsValue = (
  assets: { value: number }[],
  investments: Investment[],
  savings: SavingsGoal[],
) =>
  assets.reduce((s, a) => s + a.value, 0) +
  investments.reduce((s, i) => s + i.currentValue, 0) +
  savings.reduce((s, g) => s + g.current, 0);

export const netWorth = (
  assets: { value: number }[],
  investments: Investment[],
  savings: SavingsGoal[],
  debts: Debt[],
  cls: CreditLine[],
) => totalAssetsValue(assets, investments, savings) - totalDebt(debts, cls);

export const emergencyFundMonths = (savings: SavingsGoal[], bills: Bill[], debts: Debt[]) => {
  const monthlyBurn = monthlyBills(bills) + monthlyEMI(debts);
  const ef = savings.find((s) => s.isEmergency)?.current ?? 0;
  if (!monthlyBurn) return 0;
  return ef / monthlyBurn;
};

export function healthScore(args: {
  income: IncomeSource[];
  bills: Bill[];
  debts: Debt[];
  creditLines: CreditLine[];
  savings: SavingsGoal[];
}) {
  const inc = monthlyIncome(args.income) || 1;
  const emi = monthlyEMI(args.debts);
  const dti = emi / inc; // lower is better
  const sav = monthlySavings(args.savings) / inc; // higher is better
  const efMonths = emergencyFundMonths(args.savings, args.bills, args.debts);
  const util =
    args.creditLines.reduce((s, c) => s + c.used, 0) /
    Math.max(
      1,
      args.creditLines.reduce((s, c) => s + c.limit, 0),
    );

  const dtiScore = Math.max(0, 1 - dti / 0.4) * 30;
  const savScore = Math.min(1, sav / 0.2) * 25;
  const efScore = Math.min(1, efMonths / 6) * 30;
  const utilScore = Math.max(0, 1 - util / 0.5) * 15;
  return Math.round(dtiScore + savScore + efScore + utilScore);
}

export const availableCash = (
  income: IncomeSource[],
  bills: Bill[],
  debts: Debt[],
  cls: CreditLine[],
) => monthlyIncome(income) - monthlyBills(bills) - monthlyEMI(debts) - monthlyCreditMin(cls);

// Sort debts by chosen strategy — snowball = smallest remaining first, avalanche = highest APR first
const sortForStrategy = (debts: Debt[], strategy: Strategy) =>
  [...debts].sort((a, b) => (strategy === "snowball" ? a.remaining - b.remaining : b.apr - a.apr));

interface ForecastPoint {
  month: number;
  totalRemaining: number;
}

export function simulateDebts(
  debts: Debt[],
  strategy: Strategy,
  extraPerMonth: number,
  maxMonths = 240,
): ForecastPoint[] {
  const state = debts.map((d) => ({ ...d }));
  const points: ForecastPoint[] = [
    { month: 0, totalRemaining: state.reduce((s, d) => s + d.remaining, 0) },
  ];
  for (let m = 1; m <= maxMonths; m++) {
    let extra = extraPerMonth;
    // Base EMI applied against interest first
    for (const d of state) {
      if (d.remaining <= 0) continue;
      const interest = (d.remaining * (d.apr / 100)) / 12;
      const principal = Math.max(0, d.emi - interest);
      d.remaining = Math.max(0, d.remaining - principal);
    }
    // Extra to top priority
    const sorted = sortForStrategy(
      state.filter((d) => d.remaining > 0),
      strategy,
    );
    for (const d of sorted) {
      if (extra <= 0) break;
      const pay = Math.min(extra, d.remaining);
      d.remaining -= pay;
      extra -= pay;
    }
    const total = state.reduce((s, d) => s + d.remaining, 0);
    points.push({ month: m, totalRemaining: total });
    if (total <= 0) break;
  }
  return points;
}

export function forecastAt(points: ForecastPoint[], month: number) {
  if (!points.length) return 0;
  const last = points[points.length - 1];
  if (month >= last.month) return last.totalRemaining;
  const p = points.find((p) => p.month === month);
  return p ? p.totalRemaining : 0;
}

export function monthsToZero(points: ForecastPoint[]) {
  const zero = points.find((p) => p.totalRemaining <= 0);
  return zero ? zero.month : points.length ? points[points.length - 1].month : 0;
}

export function debtFreeDate(monthsAhead: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export interface DueItem {
  id: string;
  label: string;
  sub: string;
  amount: number;
  day: number;
  kind: "bill" | "debt" | "credit";
}

export function upcomingDues(bills: Bill[], debts: Debt[], cls: CreditLine[]): DueItem[] {
  const items: DueItem[] = [
    ...bills.map<DueItem>((b) => ({
      id: b.id,
      label: b.name,
      sub: b.category,
      amount: b.amount,
      day: b.dueDay,
      kind: "bill",
    })),
    ...debts.map<DueItem>((d) => ({
      id: d.id,
      label: d.name,
      sub: `${d.lender} • EMI`,
      amount: d.emi,
      day: d.dueDay,
      kind: "debt",
    })),
    ...cls.map<DueItem>((c) => ({
      id: c.id,
      label: c.name,
      sub: `Credit card min`,
      amount: c.minPayment,
      day: c.dueDay,
      kind: "credit",
    })),
  ];
  const today = new Date().getDate();
  return items.sort((a, b) => {
    const da = a.day >= today ? a.day - today : a.day + 31 - today;
    const db = b.day >= today ? b.day - today : b.day + 31 - today;
    return da - db;
  });
}
