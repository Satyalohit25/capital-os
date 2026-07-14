import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/debt-strategy")({
  head: () => ({
    meta: [{ title: "Debt Strategy — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <LockedModule
      phase="Phase 4"
      name="Debt Strategy"
      description="Snowball vs Avalanche side-by-side, custom overpayment scheduling, and interest-saved simulations. Groundwork already lives inside the Forecast Engine."
    />
  ),
});
