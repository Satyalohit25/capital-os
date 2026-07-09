import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type CreditLine } from "@/store/finance-store";

export const Route = createFileRoute("/hub/credit")({
  head: () => ({ meta: [{ title: "Credit Lines — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.creditLines);
  return (
    <PageShell eyebrow="Financial Hub" title="Credit lines" description="Cards, overdrafts, and personal lines with utilization and due dates.">
      <CollectionEditor<CreditLine>
        collectionKey="creditLines"
        items={items}
        singular="credit line"
        primaryField="name"
        amountField="used"
        fields={[
          { key: "name", label: "Name" },
          {
            key: "kind",
            label: "Kind",
            type: "select",
            options: [
              { value: "credit-card", label: "Credit card" },
              { value: "overdraft", label: "Overdraft" },
              { value: "line-of-credit", label: "Line of credit" },
            ],
          },
          { key: "limit", label: "Limit (₹)", type: "number" },
          { key: "used", label: "Used (₹)", type: "number" },
          { key: "minPayment", label: "Min payment (₹)", type: "number" },
          { key: "statementDay", label: "Statement day", type: "number" },
          { key: "dueDay", label: "Due day", type: "number" },
        ]}
        makeEmpty={() => ({
          name: "",
          kind: "credit-card",
          limit: 0,
          used: 0,
          minPayment: 0,
          statementDay: 1,
          dueDay: 20,
        })}
      />
    </PageShell>
  );
}
