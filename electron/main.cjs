// Capital OS — Electron main process
const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("node:path");
const http = require("node:http");
const fs = require("node:fs");
const url = require("node:url");

const isDev = !app.isPackaged;
// Static SPA assets from vite build (DESKTOP_BUILD=1) live in dist/client/
const DIST_DIR = path.join(__dirname, "..", "dist", "client");
const INDEX_HTML = path.join(DIST_DIR, "index.html");

// Serve dist/ as a tiny SPA-fallback static server so TanStack Router
// handles deep links (e.g. /forecast) without file:// path issues.
function startStaticServer() {
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".map": "application/json",
  };
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url || "/");
      let pathname = decodeURIComponent(parsed.pathname || "/");
      if (pathname.endsWith("/")) pathname += "index.html";
      let filePath = path.join(DIST_DIR, pathname);
      if (!filePath.startsWith(DIST_DIR)) {
        res.statusCode = 403;
        return res.end("Forbidden");
      }
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          // SPA fallback
          filePath = INDEX_HTML;
        }
        fs.readFile(filePath, (readErr, data) => {
          if (readErr) {
            res.statusCode = 500;
            return res.end("Server error");
          }
          const ext = path.extname(filePath).toLowerCase();
          res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.end(data);
        });
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

// Remember window bounds across launches
const boundsFile = () => path.join(app.getPath("userData"), "window-bounds.json");
function loadBounds() {
  try {
    return JSON.parse(fs.readFileSync(boundsFile(), "utf8"));
  } catch {
    return { width: 1400, height: 900 };
  }
}
function saveBounds(win) {
  try {
    fs.writeFileSync(boundsFile(), JSON.stringify(win.getBounds()));
  } catch {}
}

let mainWindow;

async function createWindow() {
  const bounds = loadBounds();
  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#fafafa",
    title: "Capital OS",
    autoHideMenuBar: false,
    icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const baseUrl = await startStaticServer();
  mainWindow.loadURL(baseUrl);

  mainWindow.on("close", () => saveBounds(mainWindow));

  // External links open in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: "deny" };
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
}

function buildMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow?.webContents.reload(),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About Capital OS",
          click: () =>
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Capital OS",
              message: "Capital OS — Vanguard Edition",
              detail:
                "Personal Financial Operating System.\nRuns 100% offline. Your data stays on this device.\n\nStorage key: fin-os:v1",
            }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
