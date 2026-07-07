/**
 * Syncs npm package version from package.json into all pack metadata files.
 *
 * Run from repo root:
 *   npm run sync-versions          — write updates
 *   npm run sync-versions -- --check — exit 1 if anything is out of sync (CI)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const checkOnly = process.argv.includes('--check');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function main() {
  const pkg = await readJson(join(root, 'package.json'));
  const version = pkg.version;
  if (!version) {
    console.error('package.json is missing version');
    process.exit(1);
  }

  const changes = [];

  const indexPath = join(packsRoot, 'index.json');
  const index = await readJson(indexPath);
  for (const entry of index.packs) {
    if (entry.version !== version) {
      changes.push(`index.json → ${entry.name}: ${entry.version ?? '(missing)'} → ${version}`);
      entry.version = version;
    }
  }
  if (!checkOnly && changes.some((c) => c.startsWith('index.json'))) {
    await writeJson(indexPath, index);
  }

  for (const entry of index.packs) {
    const packPath = join(packsRoot, entry.name, 'pack.json');
    const pack = await readJson(packPath);
    if (pack.version !== version) {
      changes.push(`packs/${entry.name}/pack.json: ${pack.version ?? '(missing)'} → ${version}`);
      if (!checkOnly) {
        pack.version = version;
        await writeJson(packPath, pack);
      }
    }
  }

  const rootJsonFiles = [
    'languages-roadmap.json',
    'language-registry.json',
    'by-country.json',
    'by-region.json',
  ];

  for (const file of rootJsonFiles) {
    const path = join(packsRoot, file);
    const data = await readJson(path);
    if (data.version !== version) {
      changes.push(`packs/${file}: ${data.version ?? '(missing)'} → ${version}`);
      if (!checkOnly) {
        data.version = version;
        await writeJson(path, data);
      }
    }
  }

  if (changes.length === 0) {
    console.log(`All pack versions match package.json (${version}).`);
    return;
  }

  if (checkOnly) {
    console.error(`Version drift detected (expected ${version}):`);
    for (const change of changes) console.error(`  - ${change}`);
    process.exit(1);
  }

  console.log(`Synced pack versions to ${version}:`);
  for (const change of changes) console.log(`  - ${change}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
