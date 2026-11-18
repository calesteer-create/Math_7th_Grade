import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
const root = resolve("out");
const base = "/Math_7th_Grade";
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]))).flat();
}
for (const path of ["index.html", "lessons/1/index.html", "quizzes/lesson/1/index.html", ...Array.from({length: 8}, (_, i) => `units/${i + 1}/index.html`), ...Array.from({length: 33}, (_, i) => `lessons/${i + 1}/index.html`), ...Array.from({length: 33}, (_, i) => `quizzes/lesson/${i + 1}/index.html`), ...Array.from({length: 8}, (_, i) => `quizzes/unit/${i + 1}/index.html`)]) await stat(resolve(root, path));
const all = await files(root);
let links = 0;
for (const file of all.filter(f => f.endsWith(".html"))) {
  const html = await readFile(file, "utf8");
  for (const tag of html.matchAll(/<(?:a|link|script|img|source)\b[^>]*>/g)) {
    if (/\brel="preconnect"/.test(tag[0])) continue;
    const match = tag[0].match(/(?:href|src)="([^"]+)"/);
    if (!match) continue;
    const url = match[1].replaceAll("&amp;", "&");
    if (!url.startsWith("/")) continue;
    if (!url.startsWith(base + "/") && url !== base) throw new Error(`Missing basePath: ${url} in ${file}`);
    let path = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
    let target = resolve(root, "." + path);
    if (target !== root && !target.startsWith(root + sep)) throw new Error(`Unsafe path: ${url}`);
    try { if ((await stat(target)).isDirectory()) target = resolve(target, "index.html"); await stat(target); }
    catch { throw new Error(`Missing ${url} in ${file}`); }
    links++;
  }
}
// CSS relative URLs (including KaTeX and Cairo fonts) must resolve on Pages too.
for (const file of all.filter(f => f.endsWith(".css"))) {
  const css = await readFile(file, "utf8");
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const url = match[1]; if (/^(data:|https?:|#)/.test(url)) continue;
    const target = url.startsWith(base + "/") ? resolve(root, "." + url.slice(base.length)) : resolve(dirname(file), url.split(/[?#]/)[0]);
    if (target !== root && !target.startsWith(root + sep)) throw new Error(`Unsafe CSS URL: ${url}`);
    try { await stat(target); } catch { throw new Error(`Missing CSS asset ${url} in ${file}`); }
  }
}
console.log(`Static export verified: ${all.filter(f => f.endsWith('.html')).length} HTML pages, ${links} local references and CSS assets.`);
