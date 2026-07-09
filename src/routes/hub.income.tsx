import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type IncomeSource } from "@/store/finance-store";

export const Route = createFileRoute("/hub/income")({
  head: () => ({ meta: [{ title: "Income — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.income);
  return (
    <PageShell eyebrow="Financial Hub" title="Income sources" description="Salary, side gigs, bonuses, and expected income.">
      <CollectionEditor<IncomeSource>
        collectionKey="income"
        items={items}
        singular="income source"
        primaryField="name"
        amountField="amount"
        fields={[
          { key: "name", label: "Name" },
          { key: "amount", label: "Amount (₹)", type: "number" },
          {
            key: "frequency",
            label: "Frequency",
            type: "select",
            options: [
              { value: "monthly", label: "Monthly" },
              { value: "weekly", label: "Weekly" },
              { value: "yearly", label: "Yearly" },
              { value: "one-time", label: "One-time" },
            ],
          },
          {
            key: "type",
            label: "Type",
            type: "select",
            options: [
              { value: "salary", label: "Salary" },
              { value: "side", label: "Side income" },
              { value: "bonus", label: "Bonus" },
              { value: "variable", label: "Variable" },
              { value: "expected", label: "Expected" },
            ],
          },
        ]}
        makeEmpty={() => ({ name: "", amount: 0, frequency: "monthly", type: "salary" })}
      />
    </PageShell>
  );
}
