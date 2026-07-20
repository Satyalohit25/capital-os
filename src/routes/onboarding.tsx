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
  const addItem = useFinance((s) => s.addItem);
  const setSettings = useFinance((s) => s.setSettings);
  const clearCollections = useFinance((s) => s.clearCollections);
  const resetSeed = useFinance((s) => s.resetSeed);

  const income = useFinance((s) => s.income);
  const bills = useFinance((s) => s.bills);
  const debts = useFinance((s) => s.debts);
  const creditLines = useFinance((s) => s.creditLines);
  const savings = useFinance((s) => s.savings);
  const investments = useFinance((s) => s.investments);
  const assets = useFinance((s) => s.assets);

  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Clear seed data on mount — user starts fresh, only their entered data accumulates
  useEffect(() => {
    clearCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    resetSeed();
    setSettings({ onboarded: true });
    navigate({ to: "/" });
  };

  const addIncomeAndNext = () => {
    if (incomeAmount > 0) {
      addItem("income", {
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
      addItem("bills", {
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
      addItem("debts", {
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
      addItem("savings", {
        id: newId(),
        name: savingsLabel || "Goal",
        target: savingsTarget,
        current: 0,
        monthly: savingsMonthly,
        isEmergency: savingsLabel.toLowerCase().includes("emergency"),
      });
    }
    // Collections already contain only user-entered data (seed was cleared on mount)
    setSettings({ onboarded: true });
    navigate({ to: "/" });
  };

  const score = healthScore({
    income,
    bills,
    debts,
    creditLines,
    savings,
  });
  const cash = availableCash(income, bills, debts, creditLines);
  const nw = netWorth(assets, investments, savings, debts, creditLines);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          Capital OS ·{" "}
        </div>
        <div className="font-serif text-2xl italic text-foreground">Vanguard Edition</div>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 ring-1 ring-hairline">
        {step === 0 && (
          <>
            <div>
              <div className="font-serif text-2xl text-foreground">What do you earn?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your primary monthly take-home income.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Label</label>
                <Input
                  value={incomeLabel}
                  onChange={(e) => setIncomeLabel(e.target.value)}
                  placeholder="e.g. Primary Salary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly amount (₹)
                </label>
                <AmountInput value={incomeAmount} onChange={setIncomeAmount} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-sm text-muted-foreground/80 underline-offset-2 hover:underline"
              >
                Skip setup
              </button>
              <Button
                onClick={addIncomeAndNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next →
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <div className="font-serif text-2xl text-foreground">Biggest bill?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your largest recurring commitment (rent, EMI, etc.).
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Label</label>
                <Input
                  value={billLabel}
                  onChange={(e) => setBillLabel(e.target.value)}
                  placeholder="e.g. Rent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly amount (₹)
                </label>
                <AmountInput value={billAmount} onChange={setBillAmount} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-sm text-muted-foreground/80 underline-offset-2 hover:underline"
              >
                Skip setup
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  ← Back
                </Button>
                <Button
                  onClick={addBillAndNext}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
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
              <div className="font-serif text-2xl text-foreground">Any debt?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                A loan or credit balance you're paying off. Skip if none.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Label</label>
                <Input
                  value={debtLabel}
                  onChange={(e) => setDebtLabel(e.target.value)}
                  placeholder="e.g. Car Loan"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Outstanding balance (₹)
                </label>
                <AmountInput value={debtRemaining} onChange={setDebtRemaining} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly EMI (₹)
                </label>
                <AmountInput value={debtEmi} onChange={setDebtEmi} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-sm text-muted-foreground/80 underline-offset-2 hover:underline"
              >
                Skip setup
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  onClick={addDebtAndNext}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
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
              <div className="font-serif text-2xl text-foreground">Savings goal?</div>
              <p className="mt-1 text-sm text-muted-foreground">
                A target you're building towards. Emergency fund is a great start.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Goal name
                </label>
                <Input
                  value={savingsLabel}
                  onChange={(e) => setSavingsLabel(e.target.value)}
                  placeholder="e.g. Emergency Fund"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Target amount (₹)
                </label>
                <AmountInput value={savingsTarget} onChange={setSavingsTarget} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly contribution (₹)
                </label>
                <AmountInput value={savingsMonthly} onChange={setSavingsMonthly} />
              </div>

              {/* Summary preview */}
              {(incomeAmount > 0 || income.length > 0) && (
                <div className="mt-2 rounded-xl bg-background p-4 ring-1 ring-hairline text-sm">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Your snapshot
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="font-serif text-lg text-foreground">{score}</div>
                      <div className="text-xs text-muted-foreground">Health score</div>
                    </div>
                    <div>
                      <div className="font-serif text-lg text-foreground">
                        {formatINR(Math.max(0, cash))}
                      </div>
                      <div className="text-xs text-muted-foreground">Free cash</div>
                    </div>
                    <div>
                      <div
                        className={`font-serif text-lg ${nw >= 0 ? "text-foreground" : "text-red-600"}`}
                      >
                        {formatINR(nw)}
                      </div>
                      <div className="text-xs text-muted-foreground">Net worth</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={skip}
                className="text-sm text-muted-foreground/80 underline-offset-2 hover:underline"
              >
                Skip setup
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button onClick={finish} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
