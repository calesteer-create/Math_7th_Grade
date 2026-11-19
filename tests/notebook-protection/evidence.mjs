import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { PNG } from 'pngjs';
import { settle } from './harness.mjs';

export const sha = data => createHash('sha256').update(data).digest('hex');
export async function put(dir, file, value) {
  const path = join(dir, file);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, file.endsWith('.json') ? JSON.stringify(value, null, 2) + '\n' : value);
}

// Document-space clip at normal viewport width. No CSS injection, masking the header,
// enlarging the viewport or stitching individual controls into a synthetic notebook.
export async function elementImage(page, cdp, locator) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.mouse.move(0, 0);
  await settle(page);
  const rect = await locator.evaluate(e => {
    const r = e.getBoundingClientRect();
    const x = Math.floor(r.left + scrollX), y = Math.floor(r.top + scrollY);
    return { x, y, width: Math.ceil(r.right + scrollX) - x, height: Math.ceil(r.bottom + scrollY) - y, scale: 1 };
  });
  assert.ok(rect.width > 0 && rect.height > 0, 'Empty visual target');
  const image = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: rect });
  return Buffer.from(image.data, 'base64');
}

// Zoom dialogs finish backdrop/icon rasterization a few hundred ms after a pan.
// Wait for two identical raster frames before accepting one. This is a
// rendering-settle check, not a pixel tolerance. Used only for panned dialog
// captures, whose reference state is the settled frame.
export async function stableElementImage(page, cdp, locator) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.mouse.move(0, 0);
  await settle(page);
  const rect = await locator.evaluate(e => {
    const r = e.getBoundingClientRect();
    const x = Math.floor(r.left + scrollX), y = Math.floor(r.top + scrollY);
    return { x, y, width: Math.ceil(r.right + scrollX) - x, height: Math.ceil(r.bottom + scrollY) - y, scale: 1 };
  });
  assert.ok(rect.width > 0 && rect.height > 0, 'Empty visual target');
  let previous;
  for (let attempt = 0; attempt < 8; attempt++) {
    await settle(page);
    const image = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: rect });
    const bytes = Buffer.from(image.data, 'base64');
    if (previous && bytes.equals(previous)) return bytes;
    previous = bytes;
    await page.waitForTimeout(250);
  }
  assert.fail('Dialog screenshot did not stabilize after repeated raster frames');
}


// A readable geometry/type witness in addition to actual pixels. Do not import
// renderers, figure coordinates, stage lists or storage helpers from the application.
export async function sheetLayout(sheet) {
  return sheet.evaluate(el => {
    const parent = el.getBoundingClientRect();
    const boxes = [...el.querySelectorAll('h3,h4,.copybook-writing-task,.lesson-prose,.formula-surface,.example-result,[data-book-figure],textarea')];
    const round = x => Math.round(x * 100) / 100;
    return boxes.map(n => {
      const r = n.getBoundingClientRect(), s = getComputedStyle(n);
      // Actual text slices laid out by the browser. Group their extents at each
      // baseline band, including inline equations, excluding hidden MathML.
      const bands = new Map(), walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode;
        if (!t.textContent.trim() || t.parentElement.closest('textarea,.katex-mathml,title,desc')) continue;
        const range = document.createRange(); range.selectNodeContents(t);
        for (const line of range.getClientRects()) {
          if (!line.width || !line.height) continue;
          const y = round(line.top-r.top), prev = bands.get(y) || [Infinity,-Infinity];
          bands.set(y, [Math.min(prev[0],round(line.left-r.left)),Math.max(prev[1],round(line.right-r.left))]);
        }
      }
      return { element: n.tagName, text: (n.innerText || '').trim().slice(0, 50),
        box: [r.x-parent.x, r.y-parent.y, r.width, r.height].map(round),
        textBands: [...bands].sort(([a],[b]) => a-b).map(([y, [left,right]]) => `${y}: ${left}..${right}`),
        font: [s.fontFamily, s.fontSize, s.fontWeight, s.lineHeight], color: s.color, padding: s.padding };
    });
  });
}

async function files(dir) {
  const names = await readdir(dir, { recursive: true, withFileTypes: true });
  return names.filter(e => e.isFile()).map(e => join(e.parentPath, e.name).slice(dir.length + 1)).sort();
}

export async function checkReference(dir, manifest) {
  const entries = (await readFile(manifest, 'utf8')).trimEnd().split('\n').map(line => {
    const row = /^([a-f0-9]{64})  (.+)$/.exec(line);
    assert.ok(row, 'Invalid notebook reference manifest');
    return { name: row[2], hash: row[1] };
  });
  assert.deepEqual(entries.map(e => e.name).sort(), await files(dir), 'Missing or unexpected reference files');
  for (const { name, hash } of entries) assert.equal(sha(await readFile(join(dir,name))), hash, `Reference integrity: ${name}`);
}

// No record/update mode. Even an absent reference is an error. Only the separately
// created temporary actual/ directory was written by the measurement code.
export async function compare(reference, actual) {
  const expected = await files(reference), observed = await files(actual);
  const failures = [];
  for (const name of new Set([...expected, ...observed])) {
    if (!expected.includes(name)) { failures.push(`Missing reference: ${name}`); continue; }
    if (!observed.includes(name)) { failures.push(`Missing observation: ${name}`); continue; }
    const [want, got] = await Promise.all([readFile(join(reference, name)), readFile(join(actual, name))]);
    if (want.equals(got)) continue;
    if (name.endsWith('.png')) {
      const a = PNG.sync.read(want), b = PNG.sync.read(got);
      if (a.width !== b.width || a.height !== b.height) { failures.push(`${name}: ${a.width}×${a.height} → ${b.width}×${b.height}`); continue; }
      let pixels = 0;
      for (let i = 0; i < a.data.length; i += 4) if (a.data.readUInt32BE(i) !== b.data.readUInt32BE(i)) pixels++;
      if (pixels) failures.push(`${name}: ${pixels} changed pixels (allowed: 0)`);
    } else {
      const a = want.toString().split('\n'), b = got.toString().split('\n');
      let i = 0; while (i < a.length && a[i] === b[i]) i++;
      failures.push(`${name}:${i+1}\n    expected: ${a[i]?.slice(0, 140)}\n    observed: ${b[i]?.slice(0, 140)}`);
    }
  }
  assert.ok(expected.length && !failures.length, `Notebook reference mismatch:\n${failures.join('\n')}`);
  console.log(`PASS: ${expected.length} reference artifacts; no pixel or contract differences.`);
}
