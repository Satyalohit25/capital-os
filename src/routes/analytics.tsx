import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [{ title: "Analytics — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <LockedModule
      phase="Phase 6"
      name="Analytics"
      description="Spending ratios, savings rate trend, credit utilization, and forecast accuracy over time."
    />
  ),
});
