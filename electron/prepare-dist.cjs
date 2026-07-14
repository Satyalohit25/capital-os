// Post-build step for the desktop bundle.
// TanStack SPA mode writes dist/client/_shell.html — rename it to index.html
// so our tiny Electron static server can serve it as the SPA root.
const fs = require("node:fs");
const path = require("node:path");

const CLIENT = path.join(__dirname, "..", "dist", "client");
const shell = path.join(CLIENT, "_shell.html");
const index = path.join(CLIENT, "index.html");

if (fs.existsSync(shell)) {
  fs.renameSync(shell, index);
  console.log("[desktop] renamed _shell.html → index.html");
} else if (fs.existsSync(index)) {
  console.log("[desktop] index.html already present");
} else {
  console.error("[desktop] no SPA shell found in", CLIENT);
  process.exit(1);
}
