import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/store/finance-store";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sun, Moon, Monitor } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — Capital OS" }, { name: "robots", content: "noindex" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const state = useFinance();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
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

  const handleAvatarFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      state.setSettings({ avatarUrl: dataUrl });
      toast.success("Avatar updated");
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageShell
      eyebrow="Settings"
      title="Settings"
      description="Preferences, backup, and data controls. Everything you enter stays on this device."
    >
      <div className="max-w-2xl space-y-10">
        {/* Profile */}
        <section>
          <h2 className="font-serif text-xl text-foreground">Profile</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">
                Display name
              </label>
              <input
                type="text"
                value={state.settings.profileName}
                onChange={(e) => state.setSettings({ profileName: e.target.value })}
                className="mt-1 block w-full max-w-xs rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Avatar</label>
              <div className="mt-2 flex items-center gap-4">
                {state.settings.avatarUrl ? (
                  <img
                    src={state.settings.avatarUrl}
                    alt="Avatar"
                    className="size-12 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                    {state.settings.profileName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAvatarFile(f);
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={() => avatarRef.current?.click()}>
                    Upload photo
                  </Button>
                  {state.settings.avatarUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => state.setSettings({ avatarUrl: undefined })}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="font-serif text-xl text-foreground">Preferences</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Currency</div>
              <div className="mt-1 text-foreground">Indian Rupees (₹)</div>
            </div>
            <div>
              <div className="text-muted-foreground">Debt strategy</div>
              <select
                value={state.settings.strategy}
                onChange={(e) =>
                  state.setSettings({ strategy: e.target.value as "snowball" | "avalanche" })
                }
                className="mt-1 rounded-md border border-border bg-card px-2 py-1 text-foreground"
              >
                <option value="snowball">Snowball (smallest first)</option>
                <option value="avalanche">Avalanche (highest APR first)</option>
              </select>
            </div>
            <div>
              <div className="text-muted-foreground">Extra payment / month</div>
              <input
                type="number"
                value={state.settings.extraPayment}
                onChange={(e) => state.setSettings({ extraPayment: Number(e.target.value) || 0 })}
                className="mt-1 w-40 rounded-md border border-border bg-card px-2 py-1 text-foreground"
              />
            </div>
            <div>
              <div className="text-muted-foreground">Theme</div>
              <ToggleGroup
                type="single"
                value={state.settings.theme}
                onValueChange={(v) =>
                  v && state.setSettings({ theme: v as "light" | "dark" | "system" })
                }
                className="mt-1 justify-start"
              >
                <ToggleGroupItem value="light" aria-label="Light" title="Light">
                  <Sun className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System" title="System">
                  <Monitor className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark" title="Dark">
                  <Moon className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Backup &amp; restore</h2>
          <p className="mt-2 text-sm text-muted-foreground">
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
          <h2 className="font-serif text-xl text-foreground">Danger zone</h2>
          <p className="mt-2 text-sm text-muted-foreground">
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

        <section className="text-xs text-muted-foreground/80">
          <div>Capital OS · Vanguard Edition</div>
          <div>Storage key: fin-os:v1 · Runs 100% offline</div>
        </section>
      </div>
    </PageShell>
  );
}
