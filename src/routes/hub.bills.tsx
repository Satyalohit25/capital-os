import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type Bill } from "@/store/finance-store";

export const Route = createFileRoute("/hub/bills")({
  head: () => ({ meta: [{ title: "Bills — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.bills);
  return (
    <PageShell eyebrow="Financial Hub" title="Monthly bills" description="Recurring commitments, essentials, and subscriptions.">
      <CollectionEditor<Bill>
        collectionKey="bills"
        items={items}
        singular="bill"
        primaryField="name"
        amountField="amount"
        fields={[
          { key: "name", label: "Name" },
          { key: "amount", label: "Amount (₹)", type: "number" },
          { key: "dueDay", label: "Due day (1–31)", type: "number" },
          {
            key: "category",
            label: "Category",
            type: "select",
            options: [
              { value: "essential", label: "Essential" },
              { value: "utility", label: "Utility" },
              { value: "subscription", label: "Subscription" },
              { value: "variable", label: "Variable" },
              { value: "optional", label: "Optional" },
            ],
          },
        ]}
        makeEmpty={() => ({ name: "", amount: 0, dueDay: 1, category: "essential", autoPay: false })}
      />
    </PageShell>
  );
}
