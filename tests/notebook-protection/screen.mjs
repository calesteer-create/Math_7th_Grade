import assert from 'node:assert/strict';
import { basename, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { put, sha } from './evidence.mjs';
import { settle } from './harness.mjs';

export async function entryView(page) {
  // The shell scrolls smoothly even in reduced-motion mode. Wait for its real
  // landing position, not an arbitrary timeout, and don't move the sticky header.
  await page.waitForFunction(() => {
    const e = document.querySelector('#lesson-content');
    return Math.abs(e.getBoundingClientRect().top - parseFloat(getComputedStyle(e).scrollMarginTop)) < 1;
  });
  await page.mouse.move(0, 0); await settle(page);
  // Only the visible stage column, including any real overlap. Changes solely to
  // the sidebar or to chrome *outside* this area shouldn't freeze the platform.
  const clip = await page.locator('#lesson-content').evaluate(e => {
    const r = e.getBoundingClientRect();
    const x = Math.floor(r.left), y = Math.max(0, Math.floor(r.top));
    return { x, y, width: Math.ceil(r.right) - x, height: innerHeight-y };
  });
  return page.screenshot({ clip });
}

export async function pannedViews(page, target, name, image, fractions = [0.5, 1], settled = false) {
  const shift = f => target.evaluate((root, fraction) => {
    const regions = [root, ...root.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && ['auto','scroll'].includes(getComputedStyle(e).overflowX));
    return regions.map(e => {
      const max = e.scrollWidth - e.clientWidth;
      e.scrollTo({ left: Math.round(max * fraction) * (getComputedStyle(e).direction === 'rtl' ? -1 : 1), behavior: 'instant' });
      return Math.abs(e.scrollLeft);
    });
  }, f);
  for (const f of fractions) {
    const offsets = await shift(f);
    assert.ok(offsets.length && offsets.every(n => n > 0), `Expected pannable mobile region: ${name}`);
    await settle(page);
    await image(`${name}-${f === 1 ? 'end' : 'middle'}`, target, settled);
  }
  await shift(0);
}

export async function usedFonts(page, cdp, out, actual, device) {
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const samples = {};
  for (const selector of ['.copybook-section-title', '.copybook-subject', '.copybook-toolbar', '.katex-html .mord.mathnormal']) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-student-copybook] ${selector}` });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    assert.ok(fonts.length, `No rendered font: ${selector}`);
    samples[selector] = fonts.map(f => ({ name: f.postScriptName, webfont: f.isCustomFont })).sort((a,b) => a.name.localeCompare(b.name));
  }
  // New fonts on OTHER parts of the site do not enter this allowlist. The sheet
  // pixels, actual font samples and computed styles still detect substitution here.
  const watched = new Set(['KaTeX_AMS-Regular', 'KaTeX_Main-Regular', 'KaTeX_Math-Italic',
    ...['arabic','latin'].flatMap(s => [400,600,700,800,900].map(w => `cairo-${s}-${w}-normal`))]);
  const urls = await page.evaluate(() => [...new Set(performance.getEntriesByType('resource')
    .map(e => new URL(e.name).pathname).filter(s => s.endsWith('.woff2')))].sort());
  const assets = {};
  for (const path of urls) {
    const name = basename(path).split('.')[0];
    if (watched.has(name)) assets[name] = sha(await readFile(join(out, '_next/static/media', basename(path))));
  }
  assert.equal(Object.keys(assets).length, watched.size, 'Missing baseline Cairo/KaTeX font resource');
  await put(actual, `${device}/fonts.json`, { samples, assets });
}
