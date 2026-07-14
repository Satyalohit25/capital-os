# Ship Capital OS as an Offline Windows Desktop App

Your app already stores everything in `localStorage` under `fin-os:v1`, so it's a natural fit for a fully offline desktop build. We'll wrap the existing Vite build in Electron and produce a Windows executable you can double-click on your laptop — no server, no internet required.

## What you get

- A `Capital OS.exe` (portable folder) that runs on Windows 10/11
- 100% offline: data lives in the app's local storage on your machine
- Same UI, same routes, same Editorial design — nothing visual changes
- Optional native window chrome (custom title bar, app icon, min/max/close)
- Auto-persistence: your finance data survives restarts (already does, just inside Electron now)
- Scope for AI either have a api key or a offline model (local processing).
- Install the required fonts and requirments by mentioning them in installer with user's access.

## Plan

### 1. Vite tweak (required for Electron)

Set `base: './'` in `vite.config.ts` so built assets load under `file://`. Without this the window is blank white.

### 2. Electron shell

Add two files under `electron/`:

- `electron/main.cjs` — creates a `BrowserWindow` (1400×900, min 1100×720), loads `dist/index.html`, sets `contextIsolation: true`, `nodeIntegration: false`, disables the default menu bar for a cleaner look, and adds an app icon.
- `electron/preload.cjs` — empty for now, reserved for future native features (file export, notifications).

Set `"main": "electron/main.cjs"` in `package.json`.

### 3. Font handling for offline

`Instrument Serif` and `Inter` are currently loaded from Google Fonts in `__root.tsx`. Offline that fails and the editorial typography breaks. Fix by:

- Downloading the two font families as `.woff2` into `src/assets/fonts/`
- Declaring them via `@font-face` at the top of `src/styles.css`
- Removing the Google Fonts `<link>` tags from `__root.tsx`

### 4. Windows icon

Generate a `build/icon.ico` (256×256, multi-size) from a simple mark — I'll create a minimal editorial "C" wordmark unless you have art you want to use.

### 5. Packaging

Use `@electron/packager` (electron-builder needs binaries this environment can't provide). Command produces `electron-release/Capital OS-win32-x64/` containing `Capital OS.exe` + all runtime files. We zip it to `Capital-OS-windows.zip` for download.

### 6. Data safety extras (offline "bells and whistles")

Small, high-value additions that make it feel like a real desktop app:

- **Backup / Restore** buttons on the Settings page — export the full `fin-os:v1` store to a `.json` file on disk and re-import it. Protects you if you reinstall Windows or move laptops.
- **App menu → About / Reset seed / Quit** wired to the existing store actions.
- **Remember window size & position** across launches (Electron `BrowserWindow` state persisted to a small file in userData).

### 7. Verification

- Run `vite build` and confirm assets are relative-pathed
- Launch the packaged `.exe` inside the sandbox via Wine? No — cross-run isn't reliable. Instead we sanity-check by running the Electron main against the built `dist/` on Linux headless and confirming it boots (proves the shell + build agree). You then run the produced Windows folder on your laptop.

## Technical details

- Runtime: Electron (latest stable), CommonJS main process (`.cjs` because `package.json` is `type: "module"`)
- Packager: `@electron/packager` with `--platform=win32 --arch=x64`
- Bundle excludes `src/`, `public/`, `node_modules` dev deps
- No code signing (unsigned `.exe` — Windows SmartScreen will show a "More info → Run anyway" prompt the first time; signing requires a paid cert, out of scope)
- Output artifact: `/mnt/documents/Capital-OS-windows.zip` (downloadable)
- Approx size: ~180–220 MB (Electron runtime; standard for this approach)

## Out of scope

- Auto-updater (would need a hosted update server)
- Code signing / notarization
- MSI/EXE installer (portable folder only — electron-builder needed for installers, incompatible with sandbox)
- macOS/Linux builds (can add later with the same tooling if you want them)

## Files to create / edit

- edit `vite.config.ts` — add `base: './'`
- edit `src/routes/__root.tsx` — remove Google Fonts links
- edit `src/styles.css` — add `@font-face` for local fonts
- edit `src/routes/settings.tsx` — add Backup / Restore
- edit `package.json` — add `main`, add electron devDeps
- create `electron/main.cjs`
- create `electron/preload.cjs`
- create `build/icon.ico`
- create `src/assets/fonts/*.woff2` (4 files: Inter regular+medium, Instrument Serif regular+italic)

Ready to build when you approve.
