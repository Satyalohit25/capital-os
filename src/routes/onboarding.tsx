import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFinance, newId } from "@/store/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountInput } from "@/components/ui/amount-input";
import { formatINR, healthScore, availableCash, netWorth } from "@/lib/finance";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get Started — Capital OS" }] }),
  component: Onboarding,
});

function Onboarding() {
  const store = useFinance();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState(false);

  // Clear seed data on mount — user starts fresh, only their entered data accumulates
  useEffect(() => {
    useFinance.getState().clearCollections();
  }, []);

  // Step 0: Income
  const [incomeLabel, setIncomeLabel] = useState("Primary Salary");
  const [incomeAmount, setIncomeAmount] = useState(0);

  // Step 1: Key bill
  const [billLabel, setBillLabel] = useState("Rent");
  const [billAmount, setBillAmount] = useState(0);

  // Step 2: Key debt
  const [debtLabel, setDebtLabel] = useState("");
  const [debtRemaining, setDebtRemaining] = useState(0);
  const [debtEmi, setDebtEmi] = useState(0);

  // Step 3: Savings goal
  const [savingsLabel, setSavingsLabel] = useState("Emergency Fund");
  const [savingsTarget, setSavingsTarget] = useState(0);
  const [savingsMonthly, setSavingsMonthly] = useState(0);

  const skip = () => {
    // Restore seed data so user has something to explore, mark onboarded
    store.resetSeed();
    store.setSettings({ onboarded: true });
    navigate({ to: "/" });
  };

  const addIncomeAndNext = () => {
    if (incomeAmount > 0) {
      store.addItem("income", {
        id: newId(),
        name: incomeLabel || "Income",
        amount: incomeAmount,
        frequency: "monthly",
        type: "salary",
      });
    }
    setStep(1);
  };

  const addBillAndNext = () => {
    if (billAmount > 0) {
      store.addItem("bills", {
        id: newId(),
        name: billLabel || "Bill",
        amount: billAmount,
        dueDay: 1,
        category: "essential",
        autoPay: false,
      });
    }
    setStep(2);
  };

  const addDebtAndNext = () => {
    if (debtRemaining > 0) {
      store.addItem("debts", {
        id: newId(),
        name: debtLabel || "Debt",
        lender: "",
        kind: "personal-loan",
        original: debtRemaining,
        remaining: debtRemaining,
        emi: debtEmi,
        apr: 0,
        dueDay: 1,
        priority: 1,
      });
    }
    setStep(3);
  };

  const finish = () => {
    if (savingsTarget > 0) {
      store.addItem("savings", {
        id: newId(),
        name: savingsLabel || "Goal",
        target: savingsTarget,
        current: 0,
        monthly: savingsMonthly,
        isEmergency: savingsLabel.toLowerCase().includes("emergency"),
      });
    }
    // Collections already contain only user-entered data (seed was cleared on mount)
    store.setSettings({ onboarded: true });
    navigate({ to: "/" });
  };

  const summaryIncome = store.income;
  const summaryBills = store.bills;
  const summaryDebts = store.debts;
  const summaryCredit = store.creditLines;
  const summarySavings = store.savings;
  const summaryAssets = store.assets;
  const summaryInvestments = store.investments;

  const score = healthScore({
    income: summaryIncome,
    bills: summaryBills,
    debts: summaryDebts,
    creditLines: summaryCredit,
    savings: summarySavings,
  });
  const cash = availableCash(summaryIncome, summaryBills, summaryDebts, summaryCredit);
  const nw = netWorth(
    summaryAssets,
    summaryInvestments,
    summarySavings,
    summaryDebts,
    summaryCredit,
  );

  // Trigger highlight pulse on calculations update
  useEffect(() => {
    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 200);
    return () => clearTimeout(t);
  }, [score, cash, nw]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Capital OS ·{" "}
        </div>
        <div className="font-serif text-2xl italic text-neutral-900">Vanguard Edition</div>
      </div>

      {/* Step indicator */}
      <div className="mb-10 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? "bg-[--color-accent] w-12"
                : i < step
                  ? "bg-neutral-800 w-8"
                  : "bg-neutral-200 w-8"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 ring-1 ring-black/5 shadow-md shadow-neutral-100">
        {step === 0 && (
          <>
            <div>
              <h2 className="font-serif text-2xl text-neutral-900 tracking-tight">Enter your monthly income</h2>
              <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                Type your monthly take-home salary or regular income.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Income name</label>
                <Input
                  value={incomeLabel}
                  onChange={(e) => setIncomeLabel(e.target.value)}
                  placeholder="e.g. Salary"
                  className="focus-visible:ring-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Monthly amount (₹)
                </label>
                <AmountInput value={incomeAmount} onChange={setIncomeAmount} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Skip
              </button>
              <Button
                onClick={addIncomeAndNext}
                className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Next →
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="font-serif text-2xl text-neutral-900 tracking-tight">Enter your biggest bill</h2>
              <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                Type your largest monthly bill, such as rent, house payment, or utilities.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Bill name</label>
                <Input
                  value={billLabel}
                  onChange={(e) => setBillLabel(e.target.value)}
                  placeholder="e.g. Rent"
                  className="focus-visible:ring-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Monthly amount (₹)
                </label>
                <AmountInput value={billAmount} onChange={setBillAmount} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(0)}
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 px-3 transition-colors"
                >
                  Back
                </button>
                <Button
                  onClick={addBillAndNext}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="font-serif text-2xl text-neutral-900 tracking-tight">Enter your debts</h2>
              <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                Type any loans, credit cards, or other debts you are paying off.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Debt name</label>
                <Input
                  value={debtLabel}
                  onChange={(e) => setDebtLabel(e.target.value)}
                  placeholder="e.g. Car Loan"
                  className="focus-visible:ring-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Total debt left (₹)
                </label>
                <AmountInput value={debtRemaining} onChange={setDebtRemaining} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Monthly payment (₹)
                </label>
                <AmountInput value={debtEmi} onChange={setDebtEmi} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 px-3 transition-colors"
                >
                  Back
                </button>
                <Button
                  onClick={addDebtAndNext}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="font-serif text-2xl text-neutral-900 tracking-tight">Enter your savings goal</h2>
              <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                Type a target you are saving for. An emergency fund is a good start.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Goal name
                </label>
                <Input
                  value={savingsLabel}
                  onChange={(e) => setSavingsLabel(e.target.value)}
                  placeholder="e.g. Emergency Fund"
                  className="focus-visible:ring-neutral-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Target amount (₹)
                </label>
                <AmountInput value={savingsTarget} onChange={setSavingsTarget} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Monthly savings (₹)
                </label>
                <AmountInput value={savingsMonthly} onChange={setSavingsMonthly} />
              </div>

              {/* Summary preview */}
              {(incomeAmount > 0 || summaryIncome.length > 0) && (
                <div className="mt-4 rounded-xl bg-neutral-50 p-4 ring-1 ring-black/5 text-sm shadow-inner">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-center">
                    Your Snapshot
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div
                        className={`font-serif text-lg transition-all duration-300 ${
                          highlight ? "text-[--color-accent] scale-105 font-medium" : "text-neutral-900"
                        }`}
                      >
                        {score}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-neutral-400 mt-1">Health Score</div>
                    </div>
                    <div>
                      <div
                        className={`font-serif text-lg transition-all duration-300 ${
                          highlight ? "text-[--color-accent] scale-105 font-medium" : "text-neutral-900"
                        }`}
                      >
                        {formatINR(Math.max(0, cash))}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-neutral-400 mt-1">Free Cash</div>
                    </div>
                    <div>
                      <div
                        className={`font-serif text-lg transition-all duration-300 ${
                          highlight
                            ? "text-[--color-accent] scale-105 font-medium"
                            : nw >= 0
                              ? "text-neutral-900"
                              : "text-red-600"
                        }`}
                      >
                        {formatINR(nw)}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-neutral-400 mt-1">Net Worth</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Skip
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 px-3 transition-colors"
                >
                  Back
                </button>
                <Button
                  onClick={finish}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Go to Dashboard →
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
