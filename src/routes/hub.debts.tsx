import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type Debt } from "@/store/finance-store";

export const Route = createFileRoute("/hub/debts")({
  head: () => ({ meta: [{ title: "Debts — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.debts);
  return (
    <PageShell
      eyebrow="Financial Hub"
      title="Debt registry"
      description="Every liability with its principal, EMI, APR, and priority."
    >
      <CollectionEditor<Debt>
        collectionKey="debts"
        items={items}
        singular="debt"
        primaryField="name"
        amountField="remaining"
        fields={[
          { key: "name", label: "Name" },
          { key: "lender", label: "Lender" },
          {
            key: "kind",
            label: "Kind",
            type: "select",
            options: [
              { value: "bank-loan", label: "Bank loan" },
              { value: "personal-loan", label: "Personal loan" },
              { value: "family", label: "Family" },
              { value: "friend", label: "Friend" },
              { value: "emi", label: "EMI" },
              { value: "bnpl", label: "BNPL" },
              { value: "owed-to-me", label: "Owed to me" },
            ],
          },
          { key: "original", label: "Original (₹)", type: "number" },
          { key: "remaining", label: "Remaining (₹)", type: "number" },
          { key: "emi", label: "Monthly EMI (₹)", type: "number" },
          { key: "apr", label: "APR (%)", type: "number" },
          { key: "dueDay", label: "Due day", type: "number" },
          { key: "priority", label: "Priority (1=high)", type: "number" },
        ]}
        makeEmpty={() => ({
          name: "",
          lender: "",
          kind: "bank-loan",
          original: 0,
          remaining: 0,
          emi: 0,
          apr: 0,
          dueDay: 1,
          priority: 3,
        })}
        markPaidKey={(item) => `debt:${item.id}`}
        defaultPaidAmount={(item) => item.emi}
      />
    </PageShell>
  );
}
