import { createFileRoute } from "@tanstack/react-router";
import { LockedModule } from "@/components/locked-module";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [{ title: "AI Advisor — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <LockedModule
      phase="Phase 8"
      name="AI Financial Advisor"
      description="A private advisor that reads your ledger and answers 'what if I paid ₹5,000 more toward my car loan?' in plain English."
    />
  ),
});
