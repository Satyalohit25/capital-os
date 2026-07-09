import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Capital OS" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <LockedModule
      phase="Phase 9"
      name="History"
      description="Every completed month archived — with the actual vs forecast delta preserved for later analysis."
    />
  ),
});
