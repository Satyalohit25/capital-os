import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/store/finance-store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const state = useFinance();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);

  const exportBackup = () => {
    const raw = localStorage.getItem("fin-os:v1") ?? "{}";
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capital-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exported");
  };

  const importBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed?.state) throw new Error("Not a valid backup file");
      localStorage.setItem("fin-os:v1", text);
      toast.success("Backup restored — reloading");
      setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      toast.error("Failed to import: " + (e as Error).message);
    }
  };

  return (
    <PageShell
      eyebrow="Phase 14"
      title="Settings"
      description="Preferences, backup, and data controls. Everything you enter stays on this device."
    >
      <div className="max-w-2xl space-y-10">
        <section>
          <h2 className="font-serif text-xl text-neutral-900">Preferences</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-neutral-500">Currency</div>
              <div className="mt-1 text-neutral-900">Indian Rupees (₹)</div>
            </div>
            <div>
              <div className="text-neutral-500">Debt strategy</div>
              <select
                value={state.settings.strategy}
                onChange={(e) =>
                  state.setSettings({ strategy: e.target.value as "snowball" | "avalanche" })
                }
                className="mt-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-900"
              >
                <option value="snowball">Snowball (smallest first)</option>
                <option value="avalanche">Avalanche (highest APR first)</option>
              </select>
            </div>
            <div>
              <div className="text-neutral-500">Extra payment / month</div>
              <input
                type="number"
                value={state.settings.extraPayment}
                onChange={(e) =>
                  state.setSettings({ extraPayment: Number(e.target.value) || 0 })
                }
                className="mt-1 w-40 rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-900"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-neutral-900">Backup & restore</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Your data lives locally on this device. Export a backup file you can keep somewhere
            safe, or restore from an earlier one.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={exportBackup} variant="default">
              Export backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importBackup(f);
              }}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Restore from file
            </Button>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-neutral-900">Danger zone</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Reset the app to the sample data seed. Your current data will be lost.
          </p>
          <div className="mt-4 flex gap-3">
            {!confirming ? (
              <Button variant="outline" onClick={() => setConfirming(true)}>
                Reset to sample data
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    state.resetSeed();
                    setConfirming(false);
                    toast.success("Reset to sample data");
                  }}
                >
                  Yes, reset everything
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="text-xs text-neutral-400">
          <div>Capital OS · Vanguard Edition</div>
          <div>Storage key: fin-os:v1 · Runs 100% offline</div>
        </section>
      </div>
    </PageShell>
  );
}
