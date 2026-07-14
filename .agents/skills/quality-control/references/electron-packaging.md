# Electron & Packaging Quality Control Sub-Skill

This sub-skill documents build pipelines, configuration errors, and pre-flight packaging validations for Electron desktop targets.

## 1. Fatal: Invalid Processed Options
*   **Symptom**: `electron-packager` fails with `Invalid processed options` or `error: script "electron:pack:win" exited with code 1`.
*   **Cause**: `electron-packager` validates options types strictly. If the `version` field is missing from `package.json`, or passed as a raw number like `1.0` in CLI arguments instead of a string, validation fails.
*   **Remedy**:
    1.  Ensure `package.json` contains a string-typed `"version"` field (e.g. `"version": "1.0.0"`).
    2.  Ensure command-line flags passing version metrics wrap the value in quotes: `--app-version="1.0.0"`.

## 2. Vite 8 tsconfig Paths Warning
*   **Symptom**: Build prints: `The plugin "vite-tsconfig-paths" is detected. Vite now supports tsconfig paths resolution natively...`.
*   **Cause**: In Vite 8, the external `vite-tsconfig-paths` plugin is deprecated in favor of built-in paths resolution.
*   **Remedy**: Remove the plugin from plugins and set `resolve.tsconfigPaths = true` in `vite.config.ts`. If the plugin is bundled inside a third-party config library (like `@lovable.dev/vite-tanstack-config`), intercept the resolved config output in `vite.config.ts` dynamically:
    ```typescript
    export default async (env) => {
      const resolved = await baseConfig(env);
      if (resolved.plugins) {
        resolved.plugins = resolved.plugins.filter(p => p && p.name !== "vite-tsconfig-paths");
      }
      if (!resolved.resolve) resolved.resolve = {};
      resolved.resolve.tsconfigPaths = true;
      return resolved;
    };
    ```

## 3. Icon Asset Pre-flight
*   **Symptom**: Packaging command fails due to missing icons or window initialization lacks the taskbar logo.
*   **Remedy**:
    *   Verify the `build/` directory exists and contains `icon.png` (for window instance loading) and `icon.ico` (for Windows binary wrapper packaging).
    *   Create Windows ICO containers using a PNG-in-ICO wrapper, ensuring the PNG frame inside is resized to exactly `256x256`.
