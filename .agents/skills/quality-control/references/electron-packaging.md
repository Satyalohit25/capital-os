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

## 4. Debugging Headless/Renderer Crashes
*   **Symptom**: The Electron app launches but shows a blank screen or a routing fallback/error page (e.g., "Something went wrong on our end / This page didn't load") without printing any errors to the Node main terminal process.
*   **Cause**: Electron does not route Chromium renderer console logs (errors, warnings, stack traces) to the parent Node.js CLI process by default, masking React runtime errors or route failures.
*   **Remedy**:
    1.  Attach a console listener to the `webContents` of the `BrowserWindow` instance inside a test or wrapper script:
        ```javascript
        mainWindow.webContents.on("console-message", (event, level, message, line, sourceId) => {
          const levels = ["DEBUG", "INFO", "WARN", "ERROR"];
          console.log(`[RENDERER ${levels[level] || level}] ${message} (${path.basename(sourceId)}:${line})`);
        });
        ```
    2.  Execute the script using the local Electron executable (e.g., `.\node_modules\.bin\electron diagnostic-runner.cjs`) to capture the full Chromium runtime console in the terminal.

## 5. Infinite Rendering Loops in Zustand/React Hooks
*   **Symptom**: Component mounts and crashes with React Error #185 (`Maximum update depth exceeded`) or fails hydration (Error #418).
*   **Cause**: Calling a store mutation action (e.g., `store.clearCollections()`) inside a `useEffect` with the entire store object (`[store]`) as a dependency. Mutating Zustand state creates a new store state reference, which triggers the hook to return a new object, re-running the `useEffect` infinitely.
*   **Remedy**:
    1.  Perform initial store mutations non-reactively using the store's static getter:
        ```typescript
        useEffect(() => {
          useFinance.getState().clearCollections();
        }, []); // Empty dependency array ensures it runs exactly once on mount
        ```
    2.  Ensure that values rendered in the component select reactive sub-properties (e.g., `const summaryIncome = store.income;`) rather than using non-reactive state queries (`useFinance.getState().income`) inside the component body, which would bypass React's reactive updates.
