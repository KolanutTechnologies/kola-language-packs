/**
 * Bumps package.json semver and syncs all pack metadata versions.
 *
 * Usage (repo root):
 *   node scripts/bump-version.mjs patch
 *   node scripts/bump-version.mjs minor
 *   node scripts/bump-version.mjs major
 */
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const bump = process.argv[2];

if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: node scripts/bump-version.mjs <patch|minor|major>');
  process.exit(1);
}

function nextVersion(current, kind) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) {
    throw new Error(`Unsupported version format: ${current}`);
  }
  let [major, minor, patch] = match.slice(1).map(Number);
  if (kind === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function runSyncVersions() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/sync-pack-versions.mjs'], {
      cwd: root,
      stdio: 'inherit',
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`sync-versions exited ${code}`))));
  });
}

async function main() {
  const pkgPath = join(root, 'package.json');
  const manifestPath = join(root, '.release-please-manifest.json');

  const pkg = await readJson(pkgPath);
  const current = pkg.version;
  const next = nextVersion(current, bump);

  pkg.version = next;
  await writeJson(pkgPath, pkg);

  const manifest = await readJson(manifestPath);
  manifest['.'] = next;
  await writeJson(manifestPath, manifest);

  await runSyncVersions();

  console.log(`Bumped ${current} → ${next} (${bump})`);
  console.log('Updated: package.json, .release-please-manifest.json, pack versions');
  console.log('Next: move CHANGELOG [Unreleased] into a dated section, then npm test');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
