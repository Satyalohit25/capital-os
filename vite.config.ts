import { defineConfig as lovableDefineConfig } from "@lovable.dev/vite-tanstack-config";

// Desktop / offline build (DESKTOP_BUILD=1): SPA output for Electron.
// Nitro is disabled so TanStack's SPA prerender can write dist/client/index.html
// directly without conflicting output layout.
const DESKTOP = process.env.DESKTOP_BUILD === "1";

const baseConfig = lovableDefineConfig({
  vite: DESKTOP ? { base: "./" } : undefined,
  nitro: DESKTOP ? false : undefined,
  tanstackStart: DESKTOP
    ? { spa: { enabled: true, maskPath: "/" } }
    : { server: { entry: "server" } },
});

export default async (env: any) => {
  const resolved = await (typeof baseConfig === "function" ? baseConfig(env) : baseConfig);

  // Filter out the vite-tsconfig-paths plugin if it exists to avoid warnings
  if (resolved.plugins) {
    resolved.plugins = resolved.plugins.filter((plugin: any) => {
      if (!plugin) return true;
      const name = typeof plugin === "object" && "name" in plugin ? plugin.name : "";
      return name !== "vite-tsconfig-paths";
    });
  }

  // Set the native tsconfig paths resolution option in Vite 8
  if (!resolved.resolve) resolved.resolve = {};
  resolved.resolve.tsconfigPaths = true;

  return resolved;
};
