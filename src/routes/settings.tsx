import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Capital OS" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <LockedModule
      phase="Phase 14"
      name="Settings"
      description="Currency, financial year, salary cycle, notification cadence, PIN lock, and backup/restore."
    />
  ),
});
