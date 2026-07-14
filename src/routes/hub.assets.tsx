import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { CollectionEditor } from "@/components/collection-editor";
import { useFinance, type Asset } from "@/store/finance-store";

export const Route = createFileRoute("/hub/assets")({
  head: () => ({ meta: [{ title: "Assets — Capital OS" }] }),
  component: Page,
});

function Page() {
  const items = useFinance((s) => s.assets);
  return (
    <PageShell
      eyebrow="Financial Hub"
      title="Assets"
      description="Cash, bank balances, vehicles, property, and other holdings."
    >
      <CollectionEditor<Asset>
        collectionKey="assets"
        items={items}
        singular="asset"
        primaryField="name"
        amountField="value"
        fields={[
          { key: "name", label: "Name" },
          {
            key: "category",
            label: "Category",
            type: "select",
            options: [
              { value: "cash", label: "Cash" },
              { value: "bank", label: "Bank" },
              { value: "vehicle", label: "Vehicle" },
              { value: "electronics", label: "Electronics" },
              { value: "property", label: "Property" },
              { value: "gold", label: "Gold" },
            ],
          },
          { key: "value", label: "Value (₹)", type: "number" },
        ]}
        makeEmpty={() => ({ name: "", category: "bank", value: 0 })}
      />
    </PageShell>
  );
}
