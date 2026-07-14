import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [{ title: "Goal Planner — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <LockedModule
      phase="Phase 5"
      name="Goal Planner"
      description="Long-term goals with target dates, milestones, and automatic contribution suggestions."
    />
  ),
});
