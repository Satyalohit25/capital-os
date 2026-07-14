import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Desktop / offline build (DESKTOP_BUILD=1): SPA output for Electron.
// Nitro is disabled so TanStack's SPA prerender can write dist/client/index.html
// directly without conflicting output layout.
const DESKTOP = process.env.DESKTOP_BUILD === "1";

export default defineConfig({
  vite: DESKTOP ? { base: "./" } : undefined,
  nitro: DESKTOP ? false : undefined,
  tanstackStart: DESKTOP
    ? { spa: { enabled: true, maskPath: "/" } }
    : { server: { entry: "server" } },
});


