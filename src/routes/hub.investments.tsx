import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type Investment } from "@/store/finance-store";

export const Route = createFileRoute("/hub/investments")({
  head: () => ({ meta: [{ title: "Investments — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.investments);
  return (
    <PageShell
      eyebrow="Financial Hub"
      title="Investments"
      description="SIPs, mutual funds, stocks, FDs, and metals."
    >
      <CollectionEditor<Investment>
        collectionKey="investments"
        items={items}
        singular="investment"
        primaryField="name"
        amountField="currentValue"
        fields={[
          { key: "name", label: "Name" },
          {
            key: "kind",
            label: "Kind",
            type: "select",
            options: [
              { value: "sip", label: "SIP" },
              { value: "mutual-fund", label: "Mutual fund" },
              { value: "stock", label: "Stock" },
              { value: "fd", label: "Fixed deposit" },
              { value: "rd", label: "Recurring deposit" },
              { value: "gold", label: "Gold" },
              { value: "crypto", label: "Crypto" },
            ],
          },
          { key: "invested", label: "Invested (₹)", type: "number" },
          { key: "currentValue", label: "Current value (₹)", type: "number" },
        ]}
        makeEmpty={() => ({ name: "", kind: "sip", invested: 0, currentValue: 0 })}
      />
    </PageShell>
  );
}
