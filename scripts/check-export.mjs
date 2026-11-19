import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
const root = resolve("out");
const base = "/Math_7th_Grade";
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]))).flat();
}
// تتحدد الصفحات المتوقعة من سجل الدروس نفسه، لا من أعداد مثبتة في السكربت.
const registry = JSON.parse(await readFile(resolve("src/content/lesson-registry.json"), "utf8"));
const unitIds = registry.units.map(unit => unit.id);
const publishedIds = registry.lessons.filter(lesson => lesson.status === "published").map(lesson => lesson.id);
const unpublishedIds = registry.lessons.filter(lesson => lesson.status !== "published").map(lesson => lesson.id);
const exists = async path => { try { await stat(resolve(root, path)); return true; } catch { return false; } };
// لا تُصدَّر صفحة اختبار وحدة إلا لبند مدرج في بنوك الوحدات المعتمدة (فارغة الآن).
const unitQuizIds = [];
const expected = [
  "index.html", "quizzes/index.html", "units/index.html", "teacher/index.html",
  ...publishedIds.flatMap(id => [`lessons/${id}/index.html`, `quizzes/lesson/${id}/index.html`]),
  ...unitIds.flatMap(id => [`units/${id}/index.html`]),
  ...unitQuizIds.map(id => `quizzes/unit/${id}/index.html`),
];
for (const path of expected) await stat(resolve(root, path));
// اختبار الوحدة لا يظهر للطالب قبل اعتماد محتواه: لا صفحة مصدّرة ولا رابط.
for (const id of unitIds.filter(id => !unitQuizIds.includes(id))) {
  if (await exists(`quizzes/unit/${id}/index.html`)) throw new Error(`Unit quiz page exported without a bank: ${id}`);
}
const quizzesIndex = await readFile(resolve(root, "quizzes/index.html"), "utf8");
if (/quizzes\/unit\//.test(quizzesIndex)) throw new Error("Quizzes index links to an unavailable unit quiz");
// الدرس غير المكتمل لا يُنشر ولا يُفهرس: لا صفحة درس ولا صفحة اختبار له في التصدير.
for (const id of unpublishedIds) {
  for (const path of [`lessons/${id}/index.html`, `quizzes/lesson/${id}/index.html`]) {
    if (await exists(path)) throw new Error(`Unpublished lesson page exported: ${path}`);
  }
}
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
console.log(`Published lesson pages: ${publishedIds.length}; unpublished lesson pages absent: ${unpublishedIds.length}.`);
