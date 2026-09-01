/**
 * Sync targets and ideReady fields in packs/index.json from pack folders.
 *
 * ideReady is computed from IDE tier files via scripts/lib/ide-ready.mjs —
 * the single source of truth shared with validate.mjs.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeIdeReadyFromDisk } from './lib/ide-ready.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const indexPath = join(packsRoot, 'index.json');

async function main() {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));

  for (const entry of index.packs) {
    const pack = JSON.parse(await readFile(join(packsRoot, entry.name, 'pack.json'), 'utf8'));
    entry.targets = pack.targets;
    entry.ideReady = (await computeIdeReadyFromDisk(packsRoot, entry.name, readFile)).ideReady;
    if (entry.displayName === undefined && pack.displayName) {
      entry.displayName = pack.displayName;
    }
  }

  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Updated ${indexPath} (${index.packs.length} packs)`);
}

main();
