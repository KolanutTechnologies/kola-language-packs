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

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

const TARGETS = ['javascript', 'python', 'typescript', 'go', 'rust'];

const FALLBACK_LABEL = {
  LAMBDA: 'lambda',
  MATCH: 'match',
  CASE: 'case',
  DEFAULT: 'default',
  THROW: 'throw',
  PRINT: 'print',
  IMPORT: 'import',
  EXPORT: 'export',
  AND: 'and',
  OR: 'or',
  NOT: 'not',
  DEL: 'del',
  TYPEOF: 'typeof',
  VOID: 'void',
  INSTANCEOF: 'instanceof',
  DEBUGGER: 'debugger',
  ASSERTS: 'asserts',
  NAMESPACE: 'namespace',
  INFER: 'infer',
  KEYOF: 'keyof',
  UNIQUE: 'unique',
  SATISFIES: 'satisfies',
  GEN: 'gen',
  LAZY: 'lazy',
};

function englishFallback(entry) {
  if (FALLBACK_LABEL[entry.logical]) {
    return FALLBACK_LABEL[entry.logical];
  }
  for (const target of TARGETS) {
    const value = entry.targets[target];
    if (typeof value === 'string' && value.trim()) {
      return value.split(/[.!()\s]/)[0].toLowerCase();
    }
  }
  return entry.logical.toLowerCase();
}

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
