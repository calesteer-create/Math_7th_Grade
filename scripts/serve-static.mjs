// معاينة مخرجات الإنتاج تحت مسار المستودع، دون Next server أو API.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
const root = resolve("out");
const base = "/Math_7th_Grade/";
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml" };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === base.slice(0, -1)) { res.writeHead(301, { Location: base }); res.end(); return; }
    if (!url.pathname.startsWith(base)) throw new Error("not found");
    let file = resolve(root, decodeURIComponent(url.pathname.slice(base.length)));
    if (file !== root && !file.startsWith(root + sep)) throw new Error("invalid path");
    const info = await stat(file);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }); res.end(); return; }
      file = resolve(file, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" }); res.end(body);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(3000, "0.0.0.0", () => console.log("Static preview: http://localhost:3000/Math_7th_Grade/"));
