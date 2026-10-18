// Serves storybook-static/ for the visual regression tests. No dependency: the
// build is plain files, and the Marko Storybook sits under /marko/.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(import.meta.dirname, "..", "storybook-static");
const port = Number(process.env.VRT_PORT ?? 6100);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  let file = normalize(join(root, decodeURIComponent(pathname)));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`storybook-static on http://localhost:${port}`));
