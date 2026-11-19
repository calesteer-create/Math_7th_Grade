import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFile, lstat, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { repo } from './harness.mjs';

// A cached out/ (or git archive HEAD) could silently test yesterday's CSS instead
// of today's working tree. Include unstaged modifications, deletions and new files
// eligible for Git. Never build in the protected checkout or copy .git/node_modules.
export async function buildCandidate(site) {
  const paths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: repo, encoding: 'utf8' });
  for (const path of new Set(paths.split('\0').filter(Boolean))) {
    const src = join(repo, path);
    const meta = await lstat(src).catch(e => { if (e.code !== 'ENOENT') throw e; });
    if (!meta) continue;
    assert.ok(meta.isFile(), `Expected an ordinary repository file: ${path}`);
    const dest = join(site, path);
    await mkdir(dirname(dest), { recursive: true }); await copyFile(src, dest);
  }
  console.log('Building a fresh static export of the current working tree…');
  const opts = { cwd: site, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: 'inherit' };
  execFileSync('npm', ['ci', '--no-fund', '--no-audit'], opts);
  execFileSync('npm', ['run', 'build'], opts);
  execFileSync('npm', ['run', 'check:export'], opts);
  return join(site, 'out');
}
