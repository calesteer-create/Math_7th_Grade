// Test-only runtime. No live URL, server, existing Chrome profile or system browser.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync, createBrotliDecompress } from 'node:zlib';
import { chromium } from 'playwright-core';

export const here = dirname(fileURLToPath(import.meta.url));
export const repo = resolve(here, '../..');
export const origin = 'http://copybook.test';
const base = '/Math_7th_Grade/';
export const lesson = origin + base + 'lessons/1/';
export const devices = {
  desktop: { viewport: { width: 1366, height: 768 }, isMobile: false, hasTouch: false },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};

export async function launch(dir) {
  assert.equal(`${process.platform}-${process.arch}`, 'linux-x64', 'Use the pinned Linux x64 test environment.');
  // Expand the locked npm distribution in a NEW private directory, never reuse /tmp/chromium.
  const bin = join(dirname(fileURLToPath(import.meta.resolve('@sparticuz/chromium'))), '../bin');
  await mkdir(dir);
  for (const name of ['al2023', 'swiftshader']) {
    execFileSync('tar', ['xf', '-', '-C', dir], { input: brotliDecompressSync(await readFile(join(bin, name + '.tar.br'))) });
  }
  const exe = join(dir, 'chromium');
  await pipeline(createReadStream(join(bin, 'chromium.br')), createBrotliDecompress(), createWriteStream(exe, { mode: 0o700 }));
  // Only fallback fonts are configured here; Cairo/KaTeX are supplied by the real exported app.
  const fallback = join(here, 'node_modules/dejavu-fonts-ttf/ttf');
  const xml = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  await writeFile(join(dir, 'fonts.conf'), `<fontconfig><dir>${xml(fallback)}</dir><cachedir>${xml(dir)}/fc-cache</cachedir></fontconfig>`);
  const browser = await chromium.launch({ executablePath: exe, headless: true,
    env: { ...process.env, HOME: dir, LD_LIBRARY_PATH: `${dir}/lib:${dir}`, FONTCONFIG_PATH: dir, FONTCONFIG_FILE: join(dir, 'fonts.conf'), TZ: 'UTC' },
    args: ['--disable-gpu', '--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb', '--disable-background-networking'],
  });
  return browser;
}

const mime = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
export async function session(browser, out, device, storage = {}) {
  const context = await browser.newContext({ ...devices[device], deviceScaleFactor: 1,
    locale: 'ar-SY', timezoneId: 'UTC', colorScheme: 'light', reducedMotion: 'reduce', serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin, localStorage: Object.entries(storage).map(([name, value]) => ({ name, value })) }] },
  });
  const errors = [];
  // Serve precisely the static export to a reserved test origin inside this context.
  // This does not replace components, CSS, fonts, scripts or responses with fixtures.
  await context.route('**/*', async route => {
    const u = new URL(route.request().url());
    try {
      assert.ok(u.origin === origin && u.pathname.startsWith(base), `Unexpected request: ${u}`);
      let path = resolve(out, '.' + decodeURIComponent(u.pathname.slice(base.length - 1)));
      assert.ok(path === out || path.startsWith(out + sep));
      if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
      await route.fulfill({ path, contentType: mime[extname(path)] || 'application/octet-stream' });
    } catch (error) { errors.push(error.message); await route.abort(); }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { page, context, errors };
}

export async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
  });
}
