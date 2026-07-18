/**
 * Sync targets and ideReady fields in packs/index.json from pack folders.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const indexPath = join(packsRoot, 'index.json');

const IDE_READY_PACKS = new Set([
  'yoruba',
  'hausa',
  'nigerian-pidgin',
  'igbo',
  'swahili',
  'zulu',
  'twi',
  'luganda',
  'edo',
]);

async function fileExists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function isIdeReady(name) {
  if (!IDE_READY_PACKS.has(name)) return false;
  for (const file of ['glossary.json', 'placeholders.json', 'common-literals.json']) {
    if (!(await fileExists(join(packsRoot, name, file)))) return false;
  }
  return true;
}

async function main() {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));

  for (const entry of index.packs) {
    const pack = JSON.parse(await readFile(join(packsRoot, entry.name, 'pack.json'), 'utf8'));
    entry.targets = pack.targets;
    entry.ideReady = await isIdeReady(entry.name);
    if (entry.displayName === undefined && pack.displayName) {
      entry.displayName = pack.displayName;
    }
  }

  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Updated ${indexPath} (${index.packs.length} packs)`);
}

main();
