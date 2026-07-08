/**
 * Adds Dart as a transpile target (12th target).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-dart-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const REGISTRY_VERSION = '5.0.0';
const OFFICIAL_VERSION = '2.2.0';

/**
 * Dart reserved keywords (Dart 3.12 language keywords page)
 * https://dart.dev/language/keywords
 */
const DART_KEYWORDS = [
  'abstract', 'as', 'assert', 'async', 'await', 'base', 'break', 'case', 'catch', 'class',
  'const', 'continue', 'covariant', 'default', 'deferred', 'do', 'dynamic', 'else', 'enum',
  'export', 'extends', 'extension', 'external', 'factory', 'false', 'final', 'finally', 'for',
  'Function', 'get', 'hide', 'if', 'implements', 'import', 'in', 'interface', 'is', 'late',
  'library', 'mixin', 'new', 'null', 'of', 'on', 'operator', 'part', 'required', 'rethrow',
  'return', 'sealed', 'set', 'show', 'static', 'super', 'switch', 'sync', 'this', 'throw',
  'true', 'try', 'type', 'typedef', 'var', 'void', 'when', 'with', 'while', 'yield',
];

const DART_EMITS = {
  IF: 'if',
  ELSE: 'else',
  ELIF: 'else if',
  FOR: 'for',
  WHILE: 'while',
  BREAK: 'break',
  CONTINUE: 'continue',
  SWITCH: 'switch',
  CASE: 'case',
  DEFAULT: 'default',
  DO: 'do',
  RETURN: 'return',
  ASYNC: 'async',
  AWAIT: 'await',
  YIELD: 'yield',
  TRY: 'try',
  CATCH: 'catch',
  FINALLY: 'finally',
  THROW: 'throw',
  CONST: 'const',
  VAR: 'var',
  CLASS: 'class',
  ENUM: 'enum',
  EXTENDS: 'extends',
  IMPLEMENTS: 'implements',
  NEW: 'new',
  THIS: 'this',
  SUPER: 'super',
  STATIC: 'static',
  IMPORT: 'import',
  EXPORT: 'export',
  AS: 'as',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null',
  IN: 'in',
  IS: 'is',
  VOID: 'void',
  ABSTRACT: 'abstract',
  GET: 'get',
  SET: 'set',
  OPERATOR: 'operator',
  ASSERT: 'assert',
  WITH: 'with',
  SEALED: 'sealed',
  EXTERN: 'external',
  DYNAMIC: 'dynamic',
  INTERFACE: 'interface',
  TYPE: 'type',
  ON: 'on',
  OF: 'of',
  WHEN: 'when',
  FINAL: 'final',
  EXTENSION: 'extension',
  OVERRIDE: '',
  OPEN: '',
  PRINT: 'print',
  FUNCTION: '',
  TYPEOF: '',
  INSTANCEOF: '',
};

/** Dart-only logical tokens not already in logical-tokens.json */
const NEW_DART_TOKENS = [
  { logical: 'MIXIN', tier: 'standard', group: 'dart-oop', dart: 'mixin' },
  { logical: 'DEFERRED', tier: 'advanced', group: 'dart-libraries', dart: 'deferred' },
  { logical: 'COVARIANT', tier: 'advanced', group: 'dart-types', dart: 'covariant' },
  { logical: 'FACTORY', tier: 'standard', group: 'dart-constructors', dart: 'factory' },
  { logical: 'LATE', tier: 'standard', group: 'dart-variables', dart: 'late' },
  { logical: 'LIBRARY', tier: 'standard', group: 'dart-libraries', dart: 'library' },
  { logical: 'PART', tier: 'standard', group: 'dart-libraries', dart: 'part' },
  { logical: 'REQUIRED', tier: 'standard', group: 'dart-parameters', dart: 'required' },
  { logical: 'RETHROW', tier: 'standard', group: 'dart-errors', dart: 'rethrow' },
  { logical: 'SHOW', tier: 'standard', group: 'dart-libraries', dart: 'show' },
  { logical: 'HIDE', tier: 'standard', group: 'dart-libraries', dart: 'hide' },
  { logical: 'SYNC', tier: 'standard', group: 'dart-async', dart: 'sync' },
  { logical: 'TYPEDEF', tier: 'standard', group: 'dart-types', dart: 'typedef' },
  { logical: 'BASE', tier: 'standard', group: 'dart-modifiers', dart: 'base' },
  { logical: 'FUNCTION_TYPE', tier: 'standard', group: 'dart-types', dart: 'Function' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_DART_TOKENS.map(({ dart: kw, logical }) => [kw, logical]),
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

  if (registry.targets.includes('dart')) {
    console.log('logical-tokens.json already includes dart — skipping token registry update.');
    return registry;
  }

  registry.version = REGISTRY_VERSION;
  registry.targets = [...registry.targets, 'dart'];

  for (const entry of registry.tokens) {
    entry.targets.dart = DART_EMITS[entry.logical] ?? '';
  }

  const existingLogicals = new Set(registry.tokens.map((t) => t.logical));
  for (const spec of NEW_DART_TOKENS) {
    if (existingLogicals.has(spec.logical)) continue;
    const targets = { ...emptyTargetsFor(registry.targets), dart: spec.dart };
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

  if (official.targets.dart) {
    console.log('official-target-keywords.json already includes dart — skipping.');
    return;
  }

  official.version = OFFICIAL_VERSION;
  official.sources.dart = {
    name: 'Dart 3.12 — Language keywords',
    url: 'https://dart.dev/language/keywords',
  };
  official.targets.dart = DART_KEYWORDS;

  for (const [logical, emit] of Object.entries(DART_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (DART_KEYWORDS.includes(keyword)) {
        official.keywordToLogical[keyword] = logical;
      }
    } else if (emit?.includes(' ')) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.keywordToLogical.Function = 'FUNCTION_TYPE';
  official.keywordToLogical.external = 'EXTERN';

  official.notes.dart =
    'Dart 3.12 reserved keywords. ELSE emits else (not default). IS emits is; INSTANCEOF is empty. FUNCTION has no keyword; Function type maps to FUNCTION_TYPE. PRINT emits print. EXTERN emits external.';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${DART_KEYWORDS.length} Dart keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('dart')) {
    items.enum.push('dart');
    await writeJson(path, schema);
    console.log('Added dart to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('dart')) continue;
      pack.targets.push('dart');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added dart to targets in ${updated} pack(s).`);
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
  await checkGlossaryCollisions(DART_KEYWORDS, 'dart');
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

  console.log(`Dart target added. NEW_DART_TOKENS: ${NEW_DART_TOKENS.length}. Keywords: ${DART_KEYWORDS.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
