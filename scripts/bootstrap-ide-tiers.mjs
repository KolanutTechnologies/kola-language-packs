/**
 * Write glossary.json, placeholders.json, and common-literals.json for IDE-ready packs.
 * Source: packs/ide-tier-seeds.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const seedsPath = join(root, 'packs', 'ide-tier-seeds.json');
const packsRoot = join(root, 'packs');

const tierFiles = [
  ['glossary', 'glossary.json'],
  ['placeholders', 'placeholders.json'],
  ['commonLiterals', 'common-literals.json'],
];

async function main() {
  const seeds = JSON.parse(await readFile(seedsPath, 'utf8'));

  for (const [packName, tiers] of Object.entries(seeds.packs)) {
    for (const [tierKey, fileName] of tierFiles) {
      const data = tiers[tierKey];
      if (!data) {
        console.warn(`Skip ${packName}: missing ${tierKey}`);
        continue;
      }
      const outPath = join(packsRoot, packName, fileName);
      await writeFile(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
      console.log(`Wrote ${outPath}`);
    }
  }
}

main();
