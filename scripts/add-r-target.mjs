/**
 * Adds R as a transpile target (15th target).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-r-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const REGISTRY_VERSION = '5.3.0';
const OFFICIAL_VERSION = '2.5.0';

/**
 * R reserved words (R Language Definition §10.3.3)
 * https://cran.r-project.org/doc/manuals/r-release/R-lang.html#Reserved-words
 */
const R_KEYWORDS = [
  'if', 'else', 'repeat', 'while', 'function', 'for', 'in', 'next', 'break',
  'TRUE', 'FALSE', 'NULL', 'Inf', 'NaN', 'NA',
  'NA_integer_', 'NA_real_', 'NA_complex_', 'NA_character_',
  '...', '..1', '..2', '..3', '..4', '..5', '..6', '..7', '..8', '..9',
];

const R_EMITS = {
  IF: 'if',
  ELSE: 'else',
  REPEAT: 'repeat',
  WHILE: 'while',
  FUNCTION: 'function',
  FOR: 'for',
  IN: 'in',
  NEXT: 'next',
  BREAK: 'break',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NULL: 'NULL',
  IS: '',
  INSTANCEOF: '',
  PRINT: 'print',
};

/** R-only logical tokens not already in logical-tokens.json */
const NEW_R_TOKENS = [
  { logical: 'R_INF', tier: 'standard', group: 'r-constants', r: 'Inf' },
  { logical: 'R_NAN', tier: 'standard', group: 'r-constants', r: 'NaN' },
  { logical: 'R_NA', tier: 'standard', group: 'r-constants', r: 'NA' },
  { logical: 'R_NA_INTEGER', tier: 'advanced', group: 'r-constants', r: 'NA_integer_' },
  { logical: 'R_NA_REAL', tier: 'advanced', group: 'r-constants', r: 'NA_real_' },
  { logical: 'R_NA_COMPLEX', tier: 'advanced', group: 'r-constants', r: 'NA_complex_' },
  { logical: 'R_NA_CHARACTER', tier: 'advanced', group: 'r-constants', r: 'NA_character_' },
  { logical: 'R_DOTS', tier: 'standard', group: 'r-special', r: '...' },
  { logical: 'R_DOT1', tier: 'advanced', group: 'r-special', r: '..1' },
  { logical: 'R_DOT2', tier: 'advanced', group: 'r-special', r: '..2' },
  { logical: 'R_DOT3', tier: 'advanced', group: 'r-special', r: '..3' },
  { logical: 'R_DOT4', tier: 'advanced', group: 'r-special', r: '..4' },
  { logical: 'R_DOT5', tier: 'advanced', group: 'r-special', r: '..5' },
  { logical: 'R_DOT6', tier: 'advanced', group: 'r-special', r: '..6' },
  { logical: 'R_DOT7', tier: 'advanced', group: 'r-special', r: '..7' },
  { logical: 'R_DOT8', tier: 'advanced', group: 'r-special', r: '..8' },
  { logical: 'R_DOT9', tier: 'advanced', group: 'r-special', r: '..9' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_R_TOKENS.map(({ r: kw, logical }) => [kw, logical]),
);

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function emptyTargetsFor(baseTargets) {
  const empty = {};
  for (const target of baseTargets) {
    empty[target] = '';
  }
  return empty;
}

async function checkGlossaryCollisions(keywords, targetName) {
  const seeds = await readJson(join(packsRoot, 'ide-tier-seeds.json'));
  const glossaryKeys = new Set(seeds.glossaryKeys.map((k) => k.toLowerCase()));
  const collisions = keywords.filter((kw) => glossaryKeys.has(kw.toLowerCase()));
  if (collisions.length > 0) {
    console.warn(
      `WARNING: ${targetName} keyword(s) collide with IDE glossary keys (parent should fix): ${collisions.join(', ')}`,
    );
  } else {
    console.log(`No IDE glossary key collisions for ${targetName}.`);
  }
  return collisions;
}

async function updateLogicalTokens() {
  const path = join(packsRoot, 'logical-tokens.json');
  const registry = await readJson(path);

  if (registry.targets.includes('r')) {
    console.log('logical-tokens.json already includes r — skipping token registry update.');
    return registry;
  }

  registry.version = REGISTRY_VERSION;
  registry.targets = [...registry.targets, 'r'];

  for (const entry of registry.tokens) {
    entry.targets.r = R_EMITS[entry.logical] ?? '';
  }

  const existingLogicals = new Set(registry.tokens.map((t) => t.logical));
  for (const spec of NEW_R_TOKENS) {
    if (existingLogicals.has(spec.logical)) continue;
    const targets = { ...emptyTargetsFor(registry.targets), r: spec.r };
    registry.tokens.push({
      logical: spec.logical,
      tier: spec.tier,
      group: spec.group,
      targets,
    });
    existingLogicals.add(spec.logical);
  }

  await writeJson(path, registry);
  console.log(`Updated logical-tokens.json — ${registry.tokens.length} token(s), ${registry.targets.length} target(s).`);
  return registry;
}

async function updateOfficialKeywords() {
  const path = join(packsRoot, 'official-target-keywords.json');
  const official = await readJson(path);

  if (official.targets.r) {
    console.log('official-target-keywords.json already includes r — skipping.');
    return;
  }

  official.version = OFFICIAL_VERSION;
  official.sources.r = {
    name: 'R Language Definition — Reserved words',
    url: 'https://cran.r-project.org/doc/manuals/r-release/R-lang.html#Reserved-words',
  };
  official.targets.r = R_KEYWORDS;

  for (const [logical, emit] of Object.entries(R_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (R_KEYWORDS.includes(keyword)) {
        official.keywordToLogical[keyword] = logical;
      }
    } else if (emit?.includes(' ')) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.keywordToLogical.function = 'FUNCTION';

  official.notes.r =
    'R reserved words per Language Definition §10.3.3. ELSE emits else (not default). IS and INSTANCEOF are empty. PRINT emits print (builtin, not reserved).';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${R_KEYWORDS.length} R keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('r')) {
    items.enum.push('r');
    await writeJson(path, schema);
    console.log('Added r to pack.schema.json targets enum.');
  }
}

async function updatePackTargets() {
  const dirs = await readdir(packsRoot, { withFileTypes: true });
  let updated = 0;

  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    const packPath = join(packsRoot, dirent.name, 'pack.json');
    try {
      const pack = await readJson(packPath);
      if (!Array.isArray(pack.targets) || pack.targets.includes('r')) continue;
      pack.targets.push('r');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added r to targets in ${updated} pack(s).`);
}

async function updateIndexTargets() {
  const indexPath = join(packsRoot, 'index.json');
  const index = await readJson(indexPath);
  let updated = 0;

  for (const entry of index.packs) {
    const pack = await readJson(join(packsRoot, entry.name, 'pack.json'));
    if (JSON.stringify(entry.targets) !== JSON.stringify(pack.targets)) {
      entry.targets = [...pack.targets];
      updated += 1;
    }
  }

  if (updated > 0) {
    await writeJson(indexPath, index);
    console.log(`Synced targets in index.json for ${updated} pack(s).`);
  }
}

async function main() {
  await checkGlossaryCollisions(R_KEYWORDS, 'r');
  await updateLogicalTokens();
  await updateOfficialKeywords();
  await updatePackSchema();
  await updatePackTargets();
  await updateIndexTargets();

  const ensure = spawnSync(process.execPath, [join(root, 'scripts', 'ensure-pack-tokens.mjs')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (ensure.status !== 0) process.exit(ensure.status ?? 1);

  const coverage = spawnSync(process.execPath, [join(root, 'scripts', 'generate-coverage.mjs')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (coverage.status !== 0) process.exit(coverage.status ?? 1);

  console.log(`R target added. NEW_R_TOKENS: ${NEW_R_TOKENS.length}. Keywords: ${R_KEYWORDS.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
