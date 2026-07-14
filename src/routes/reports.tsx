import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "Reports — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <LockedModule
      phase="Phase 7"
      name="Reports"
      description="Exportable monthly and annual statements with year-over-year comparisons."
    />
  ),
});
