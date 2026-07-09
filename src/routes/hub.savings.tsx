import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type SavingsGoal } from "@/store/finance-store";

export const Route = createFileRoute("/hub/savings")({
  head: () => ({ meta: [{ title: "Savings — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.savings);
  return (
    <PageShell eyebrow="Financial Hub" title="Savings goals" description="Emergency fund, vacation, house — everything you're building toward.">
      <CollectionEditor<SavingsGoal>
        collectionKey="savings"
        items={items}
        singular="goal"
        primaryField="name"
        amountField="current"
        fields={[
          { key: "name", label: "Name" },
          { key: "target", label: "Target (₹)", type: "number" },
          { key: "current", label: "Current (₹)", type: "number" },
          { key: "monthly", label: "Monthly contribution (₹)", type: "number" },
        ]}
        makeEmpty={() => ({ name: "", target: 0, current: 0, monthly: 0 })}
      />
    </PageShell>
  );
}
