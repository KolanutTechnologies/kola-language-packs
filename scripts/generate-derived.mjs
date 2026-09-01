/**
 * Generates every derived file from the hand-edited sources. One command,
 * no hand-syncing ever again.
 *
 * Sources (hand-edited):
 *   packs/<name>/pack.json          — metadata + pure-translation keywords
 *   packs/<name>/{glossary,placeholders,common-literals}.json
 *   packs/logical-tokens.json
 *
 * Derived (generated here, never hand-edit):
 *   packs/<name>/keywords.json      — natives + code-appended English fallback
 *   packs/index.json                — fields synced from pack.json + computed ideReady
 *   packs/by-country.json           — country → pack names
 *   packs/by-region.json            — region → pack names
 *
 * Run:            node scripts/generate-derived.mjs
 * Check mode:     node scripts/generate-derived.mjs --check   (exit 1 if stale)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKeywordsJson } from './lib/keywords-json.mjs';
import { computeIdeReadyFromDisk } from './lib/ide-ready.mjs';
import { writeJsonUtf8 } from './lib/write-json-utf8.mjs';

const checkOnly = process.argv.includes('--check');
const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

async function readJson(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

async function writeIfChanged(filePath, next, label, changes) {
  const current = await readFile(filePath, 'utf8').catch(() => undefined);
  const nextText = JSON.stringify(next, null, 2) + '\n';
  if (current === nextText) return;
  if (checkOnly) {
    changes.push(label);
    return;
  }
  await writeJsonUtf8(filePath, next);
  changes.push(`${label} (written)`);
}

async function main() {
  const registry = await readJson(join(packsRoot, 'logical-tokens.json'));
  const pkg = await readJson(join(root, 'package.json'));
  const index = await readJson(join(packsRoot, 'index.json'));
  const changes = [];

  for (const entry of index.packs) {
    const dir = join(packsRoot, entry.name);
    const pack = await readJson(join(dir, 'pack.json'));

    // keywords.json — generated published shape
    const expectedKeywords = buildKeywordsJson(pack.keywords, registry.tokens);
    await writeIfChanged(join(dir, 'keywords.json'), expectedKeywords, `${entry.name}/keywords.json`, changes);

    // index entry fields — synced from pack.json
    entry.languageCode = pack.languageCode;
    entry.locale = pack.locale;
    entry.countries = pack.countries;
    entry.regions = pack.regions;
    entry.version = pack.version ?? pkg.version;
    if (pack.displayName !== undefined) entry.displayName = pack.displayName;
    entry.targets = pack.targets;
    entry.ideReady = (await computeIdeReadyFromDisk(packsRoot, entry.name, readFile)).ideReady;
  }

  await writeIfChanged(join(packsRoot, 'index.json'), index, 'index.json', changes);

  // lookups — rebuilt from the synced index
  const byCountry = {};
  const byRegion = {};
  for (const entry of index.packs) {
    for (const c of entry.countries) (byCountry[c] ??= []).push(entry.name);
    for (const r of entry.regions) (byRegion[r] ??= []).push(entry.name);
  }
  for (const map of [byCountry, byRegion]) {
    for (const key of Object.keys(map)) map[key].sort();
  }
  await writeIfChanged(join(packsRoot, 'by-country.json'), { version: pkg.version, byCountry }, 'by-country.json', changes);
  await writeIfChanged(join(packsRoot, 'by-region.json'), { version: pkg.version, byRegion }, 'by-region.json', changes);

  if (changes.length === 0) {
    console.log('Derived files in sync.');
    return;
  }
  if (checkOnly) {
    console.error(`Stale derived files (${changes.length}) — run: npm run generate`);
    for (const c of changes) console.error(`  - ${c}`);
    process.exit(1);
  }
  console.log(`Generated ${changes.length} derived file(s):`);
  for (const c of changes) console.log(`  - ${c}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
