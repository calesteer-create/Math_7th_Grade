import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildCandidate } from './candidate.mjs';
import { here, launch } from './harness.mjs';
import { checkReference, compare, put, sha } from './evidence.mjs';
import { exercise, blockedStorage, savedProfiles } from './notebook.mjs';

assert.equal(process.argv.length, 2, 'Usage: npm test. No URL, cached export or snapshot update option.');
assert.equal(process.versions.node, (await readFile(join(here, '.nvmrc'), 'utf8')).trim(), 'Use the pinned Node version in tests/notebook-protection/.nvmrc');
const ref = join(here, 'reference');
await checkReference(ref, join(here, 'reference.sha256'));
const run = await mkdtemp(join(tmpdir(), 'math7-copybook-'));
const actual = join(run, 'actual'), runtime = join(run, 'runtime'), site = join(run, 'site');
await mkdir(actual);
console.log(`Diagnostics: ${run}`);
try {
  const out = await buildCandidate(site);
  const source = JSON.parse(await readFile(join(site, 'src/content/lesson-1.json'), 'utf8'));
  // Protect only the notebook subtree (arrays in order), not unrelated lesson content.
  const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
  const lock = JSON.parse(await readFile(join(site, 'package-lock.json'), 'utf8')).packages;
  const browser = await launch(runtime);
  try {
    await put(actual, 'contract.json', {
      componentSha256: sha(await readFile(join(site, 'src/components/StudentNotebook.tsx'))),
      notebookDataSha256: sha(JSON.stringify(canonical(source.notebook))),
      orderedSheets: source.notebook.map(({ id, title }) => ({ id, title })),
      chromium: browser.version(), cairo: lock['node_modules/@fontsource/cairo'].version, katex: lock['node_modules/katex'].version,
    });
    for (const device of ['desktop', 'phone']) await exercise(browser, out, run, actual, device);
    await blockedStorage(browser, out, actual);
    await savedProfiles(browser, out);
  } finally { await browser.close(); }
  await compare(ref, actual);
  console.log('PASS: notebook matches the protected baseline in the tested environment.');
} catch (error) {
  console.error(`FAIL: ${error.stack}\nInspect actual evidence in ${run}. Reference files were NOT written.`);
  process.exitCode = 1;
} finally {
  await Promise.all([runtime, site].map(path => rm(path, { recursive: true, force: true })));
  if (!process.exitCode) await rm(run, { recursive: true, force: true });
}
