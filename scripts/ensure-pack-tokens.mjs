/**
 * Adds missing logical tokens to every pack (English fallback) without
 * overwriting existing translations. Syncs keywords.json with pack.json.
 *
 * Run from repo root after adding tokens to logical-tokens.json:
 *   node scripts/ensure-pack-tokens.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { englishFallback } from './lib/english-fallback.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function main() {
  const registry = await readJson(join(packsRoot, 'logical-tokens.json'));
  const index = await readJson(join(packsRoot, 'index.json'));
  const changes = [];

  for (const entry of index.packs) {
    const packPath = join(packsRoot, entry.name, 'pack.json');
    const keywordsPath = join(packsRoot, entry.name, 'keywords.json');
    const pack = await readJson(packPath);
    let packChanged = false;

    for (const token of registry.tokens) {
      if (token.logical in pack.keywords) continue;
      const label = englishFallback(token);
      pack.keywords[token.logical] = [label];
      packChanged = true;
      changes.push(`${entry.name}: added ${token.logical} → ["${label}"]`);
    }

    if (packChanged) {
      await writeJson(packPath, pack);
      await writeJson(keywordsPath, pack.keywords);
    }
  }

  if (changes.length === 0) {
    console.log(`All packs have ${registry.tokens.length} logical token(s).`);
    return;
  }

  console.log(`Updated ${changes.length} token slot(s):`);
  for (const line of changes) console.log(`  - ${line}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
