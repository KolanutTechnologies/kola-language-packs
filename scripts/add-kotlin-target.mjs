/**
 * Adds Kotlin as a transpile target (10th target).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-kotlin-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

/**
 * Kotlin hard + soft + modifier keywords + special identifiers
 * (kotlinlang.org/docs/keywords.html / keyword-reference.html)
 */
const KOTLIN_KEYWORDS = [
  // Hard keywords
  'as', 'as?', 'break', 'class', 'continue', 'do', 'else', 'false', 'for', 'fun', 'if', 'in', '!in',
  'interface', 'is', '!is', 'null', 'object', 'package', 'return', 'super', 'this', 'throw', 'true',
  'try', 'typealias', 'typeof', 'val', 'var', 'when', 'while',
  // Soft keywords
  'by', 'catch', 'constructor', 'delegate', 'dynamic', 'field', 'file', 'finally', 'get', 'import',
  'init', 'param', 'property', 'receiver', 'set', 'setparam', 'value', 'where',
  // Modifier keywords
  'abstract', 'actual', 'annotation', 'companion', 'const', 'crossinline', 'data', 'enum', 'expect',
  'external', 'final', 'infix', 'inline', 'inner', 'internal', 'lateinit', 'noinline', 'open',
  'operator', 'out', 'override', 'private', 'protected', 'public', 'reified', 'sealed', 'suspend',
  'tailrec', 'vararg',
  // Special identifiers
  'it', '_',
];

/** Emits for existing logical tokens on the kotlin target (empty string = no Kotlin keyword). */
const KOTLIN_EMITS = {
  IF: 'if',
  ELSE: 'else',
  ELIF: 'else if',
  FOR: 'for',
  WHILE: 'while',
  BREAK: 'break',
  CONTINUE: 'continue',
  SWITCH: 'when',
  MATCH: 'when',
  DEFAULT: '',
  DO: 'do',
  RETURN: 'return',
  FUNCTION: 'fun',
  TRY: 'try',
  CATCH: 'catch',
  FINALLY: 'finally',
  THROW: 'throw',
  CONST: 'const',
  VAR: 'var',
  CLASS: 'class',
  INTERFACE: 'interface',
  ENUM: 'enum',
  OBJECT: 'object',
  THIS: 'this',
  SELF: 'this',
  SUPER: 'super',
  IMPORT: 'import',
  PACKAGE: 'package',
  AS: 'as',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null',
  IN: 'in',
  IS: 'is',
  PRIVATE: 'private',
  PROTECTED: 'protected',
  PUBLIC: 'public',
  ABSTRACT: 'abstract',
  GET: 'get',
  SET: 'set',
  PRINT: 'println',
  TYPEOF: 'typeof',
  IS: 'is',
  WHEN: 'when',
  WHERE: 'where',
  BY: 'by',
  VALUE: 'value',
  CONSTRUCTOR: 'constructor',
  UNDERSCORE: '_',
  DELEGATE: 'delegate',
  DYNAMIC: 'dynamic',
  INTERNAL: 'internal',
  INLINE: 'inline',
  OUT: 'out',
  OVERRIDE: 'override',
  SEALED: 'sealed',
  OPERATOR: 'operator',
  FINAL: 'final',
  EXTERN: 'external',
};

/** Kotlin-only logical tokens not already in logical-tokens.json (DELEGATE, DYNAMIC excluded). */
const NEW_KOTLIN_TOKENS = [
  { logical: 'VAL', tier: 'core', group: 'kotlin-bindings', kotlin: 'val' },
  { logical: 'SUSPEND', tier: 'standard', group: 'kotlin-coroutines', kotlin: 'suspend' },
  { logical: 'TYPEALIAS', tier: 'standard', group: 'kotlin-types', kotlin: 'typealias' },
  { logical: 'COMPANION', tier: 'standard', group: 'kotlin-oop', kotlin: 'companion' },
  { logical: 'DATA', tier: 'standard', group: 'kotlin-oop', kotlin: 'data' },
  { logical: 'LATEINIT', tier: 'advanced', group: 'kotlin-properties', kotlin: 'lateinit' },
  { logical: 'REIFIED', tier: 'advanced', group: 'kotlin-generics', kotlin: 'reified' },
  { logical: 'TAILREC', tier: 'advanced', group: 'kotlin-functions', kotlin: 'tailrec' },
  { logical: 'INFIX', tier: 'advanced', group: 'kotlin-functions', kotlin: 'infix' },
  { logical: 'CROSSINLINE', tier: 'advanced', group: 'kotlin-functions', kotlin: 'crossinline' },
  { logical: 'NOINLINE', tier: 'advanced', group: 'kotlin-functions', kotlin: 'noinline' },
  { logical: 'ACTUAL', tier: 'advanced', group: 'kotlin-multiplatform', kotlin: 'actual' },
  { logical: 'EXPECT', tier: 'advanced', group: 'kotlin-multiplatform', kotlin: 'expect' },
  { logical: 'ANNOTATION', tier: 'standard', group: 'kotlin-declarations', kotlin: 'annotation' },
  { logical: 'VARARG', tier: 'standard', group: 'kotlin-parameters', kotlin: 'vararg' },
  { logical: 'INIT', tier: 'standard', group: 'kotlin-initialization', kotlin: 'init' },
  { logical: 'OPEN', tier: 'standard', group: 'kotlin-modifiers', kotlin: 'open' },
  { logical: 'INNER', tier: 'standard', group: 'kotlin-modifiers', kotlin: 'inner' },
  { logical: 'FIELD', tier: 'advanced', group: 'kotlin-properties', kotlin: 'field' },
  { logical: 'RECEIVER', tier: 'advanced', group: 'kotlin-annotations', kotlin: 'receiver' },
  { logical: 'SETPARAM', tier: 'advanced', group: 'kotlin-annotations', kotlin: 'setparam' },
  { logical: 'PARAM', tier: 'advanced', group: 'kotlin-annotations', kotlin: 'param' },
  { logical: 'FILE', tier: 'advanced', group: 'kotlin-annotations', kotlin: 'file' },
  { logical: 'AS_SAFE', tier: 'standard', group: 'kotlin-operators', kotlin: 'as?' },
  { logical: 'NOT_IN', tier: 'standard', group: 'kotlin-operators', kotlin: '!in' },
  { logical: 'NOT_IS', tier: 'standard', group: 'kotlin-operators', kotlin: '!is' },
  { logical: 'PROPERTY', tier: 'advanced', group: 'kotlin-annotations', kotlin: 'property' },
  { logical: 'IT', tier: 'standard', group: 'kotlin-lambdas', kotlin: 'it' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_KOTLIN_TOKENS.map(({ kotlin, logical }) => [kotlin, logical]),
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

async function updateLogicalTokens() {
  const path = join(packsRoot, 'logical-tokens.json');
  const registry = await readJson(path);

  if (registry.targets.includes('kotlin')) {
    console.log('logical-tokens.json already includes kotlin — skipping token registry update.');
    return registry;
  }

  registry.version = '4.8.0';
  registry.targets = [...registry.targets, 'kotlin'];

  for (const entry of registry.tokens) {
    entry.targets.kotlin = KOTLIN_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_KOTLIN_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), kotlin: spec.kotlin };
    registry.tokens.push({
      logical: spec.logical,
      tier: spec.tier,
      group: spec.group,
      targets,
    });
  }

  await writeJson(path, registry);
  console.log(`Updated logical-tokens.json — ${registry.tokens.length} token(s), ${registry.targets.length} target(s).`);
  return registry;
}

async function updateOfficialKeywords() {
  const path = join(packsRoot, 'official-target-keywords.json');
  const official = await readJson(path);

  if (official.targets.kotlin) {
    console.log('official-target-keywords.json already includes kotlin — skipping.');
    return;
  }

  official.version = '2.0.0';
  official.sources.kotlin = {
    name: 'Kotlin — Keywords and operators',
    url: 'https://kotlinlang.org/docs/keywords.html',
  };
  official.targets.kotlin = KOTLIN_KEYWORDS;

  for (const [logical, emit] of Object.entries(KOTLIN_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (KOTLIN_KEYWORDS.includes(keyword)) {
        official.keywordToLogical[keyword] = logical;
      }
    } else if (emit?.includes(' ')) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.keywordToLogical.fun = 'FUNCTION';

  official.notes.kotlin =
    'Kotlin hard, soft, and modifier keywords plus special identifiers it and _. FUNCTION emits fun; OBJECT is the singleton keyword. PRINT emits println (not a keyword). SWITCH and MATCH emit when. IS emits is (type check). EXTERN emits external.';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${KOTLIN_KEYWORDS.length} Kotlin keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('kotlin')) {
    items.enum.push('kotlin');
    await writeJson(path, schema);
    console.log('Added kotlin to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('kotlin')) continue;
      pack.targets.push('kotlin');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added kotlin to targets in ${updated} pack(s).`);
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

  console.log(`Kotlin target added. NEW_KOTLIN_TOKENS: ${NEW_KOTLIN_TOKENS.length}. Run npm test && npm run readme:metrics next.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
