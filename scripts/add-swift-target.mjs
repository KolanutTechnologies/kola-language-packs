/**
 * Adds Swift as a transpile target (11th target).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-swift-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const REGISTRY_VERSION = '4.9.0';
const OFFICIAL_VERSION = '2.1.0';

/**
 * Swift reserved + contextual keywords (TSPL Lexical Structure + concurrency)
 * https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/
 */
const SWIFT_KEYWORDS = [
  'associatedtype', 'class', 'deinit', 'enum', 'extension', 'fileprivate', 'func', 'import',
  'init', 'inout', 'internal', 'let', 'open', 'operator', 'private', 'precedencegroup',
  'protocol', 'public', 'rethrows', 'static', 'struct', 'subscript', 'typealias', 'var',
  'break', 'case', 'catch', 'continue', 'default', 'defer', 'do', 'else', 'fallthrough',
  'for', 'guard', 'if', 'in', 'repeat', 'return', 'throw', 'switch', 'where', 'while',
  'Any', 'as', 'await', 'false', 'is', 'nil', 'self', 'Self', 'super', 'throws', 'true', 'try',
  '_',
  'async', 'actor',
  'associativity', 'convenience', 'didSet', 'dynamic', 'final', 'get', 'indirect', 'infix',
  'lazy', 'left', 'mutating', 'none', 'nonmutating', 'optional', 'override', 'postfix',
  'precedence', 'prefix', 'required', 'right', 'set', 'some', 'unowned', 'weak', 'willSet',
  'borrowing', 'consuming', 'distributed', 'isolated', 'macro', 'nonisolated', 'package',
];

const SWIFT_EMITS = {
  IF: 'if',
  ELSE: 'else',
  ELIF: 'else if',
  FOR: 'for',
  WHILE: 'while',
  BREAK: 'break',
  CONTINUE: 'continue',
  SWITCH: 'switch',
  MATCH: 'switch',
  CASE: 'case',
  DEFAULT: 'default',
  FALLTHROUGH: 'fallthrough',
  DO: 'do',
  RETURN: 'return',
  FUNCTION: 'func',
  ASYNC: 'async',
  AWAIT: 'await',
  TRY: 'try',
  CATCH: 'catch',
  THROW: 'throw',
  DEFER: 'defer',
  LET: 'let',
  VAR: 'var',
  CLASS: 'class',
  STRUCT: 'struct',
  ENUM: 'enum',
  INTERFACE: 'protocol',
  TYPEALIAS: 'typealias',
  THIS: 'self',
  SELF: 'self',
  SUPER: 'super',
  IMPORT: 'import',
  AS: 'as',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'nil',
  IN: 'in',
  IS: 'is',
  PRIVATE: 'private',
  PROTECTED: '',
  PUBLIC: 'public',
  INTERNAL: 'internal',
  OPEN: 'open',
  STATIC: 'static',
  FINAL: 'final',
  ABSTRACT: '',
  GET: 'get',
  SET: 'set',
  OPERATOR: 'operator',
  WHERE: 'where',
  INIT: 'init',
  LAZY: 'lazy',
  OVERRIDE: 'override',
  DYNAMIC: 'dynamic',
  INLINE: '',
  OUT: '',
  UNDERSCORE: '_',
  PRINT: 'print',
  TYPEOF: '',
  INSTANCEOF: '',
};

const NEW_SWIFT_TOKENS = [
  { logical: 'GUARD', tier: 'standard', group: 'swift-control', swift: 'guard' },
  { logical: 'REPEAT', tier: 'standard', group: 'swift-control', swift: 'repeat' },
  { logical: 'THROWS', tier: 'standard', group: 'swift-errors', swift: 'throws' },
  { logical: 'RETHROWS', tier: 'advanced', group: 'swift-errors', swift: 'rethrows' },
  { logical: 'DEINIT', tier: 'standard', group: 'swift-oop', swift: 'deinit' },
  { logical: 'SUBSCRIPT', tier: 'standard', group: 'swift-oop', swift: 'subscript' },
  { logical: 'INOUT', tier: 'standard', group: 'swift-parameters', swift: 'inout' },
  { logical: 'FILEPRIVATE', tier: 'standard', group: 'swift-visibility', swift: 'fileprivate' },
  { logical: 'ASSOCIATEDTYPE', tier: 'standard', group: 'swift-generics', swift: 'associatedtype' },
  { logical: 'PRECEDENCEGROUP', tier: 'advanced', group: 'swift-operators', swift: 'precedencegroup' },
  { logical: 'EXTENSION', tier: 'standard', group: 'swift-oop', swift: 'extension' },
  { logical: 'ACTOR', tier: 'standard', group: 'swift-concurrency', swift: 'actor' },
  { logical: 'SOME', tier: 'standard', group: 'swift-types', swift: 'some' },
  { logical: 'SWIFT_ANY', tier: 'standard', group: 'swift-types', swift: 'Any' },
  { logical: 'SELF_TYPE', tier: 'standard', group: 'swift-types', swift: 'Self' },
  { logical: 'OPTIONAL', tier: 'advanced', group: 'swift-modifiers', swift: 'optional' },
  { logical: 'MUTATING', tier: 'advanced', group: 'swift-modifiers', swift: 'mutating' },
  { logical: 'NONMUTATING', tier: 'advanced', group: 'swift-modifiers', swift: 'nonmutating' },
  { logical: 'WEAK', tier: 'advanced', group: 'swift-modifiers', swift: 'weak' },
  { logical: 'UNOWNED', tier: 'advanced', group: 'swift-modifiers', swift: 'unowned' },
  { logical: 'DIDSET', tier: 'advanced', group: 'swift-properties', swift: 'didSet' },
  { logical: 'WILLSET', tier: 'advanced', group: 'swift-properties', swift: 'willSet' },
  { logical: 'CONVENIENCE', tier: 'advanced', group: 'swift-initialization', swift: 'convenience' },
  { logical: 'REQUIRED', tier: 'advanced', group: 'swift-modifiers', swift: 'required' },
  { logical: 'INDIRECT', tier: 'advanced', group: 'swift-modifiers', swift: 'indirect' },
  { logical: 'INFIX', tier: 'advanced', group: 'swift-operators', swift: 'infix' },
  { logical: 'PREFIX', tier: 'advanced', group: 'swift-operators', swift: 'prefix' },
  { logical: 'POSTFIX', tier: 'advanced', group: 'swift-operators', swift: 'postfix' },
  { logical: 'PRECEDENCE', tier: 'advanced', group: 'swift-operators', swift: 'precedence' },
  { logical: 'ASSOCIATIVITY', tier: 'advanced', group: 'swift-operators', swift: 'associativity' },
  { logical: 'LEFT', tier: 'advanced', group: 'swift-operators', swift: 'left' },
  { logical: 'RIGHT', tier: 'advanced', group: 'swift-operators', swift: 'right' },
  { logical: 'NONE', tier: 'advanced', group: 'swift-operators', swift: 'none' },
  { logical: 'DISTRIBUTED', tier: 'advanced', group: 'swift-concurrency', swift: 'distributed' },
  { logical: 'NONISOLATED', tier: 'advanced', group: 'swift-concurrency', swift: 'nonisolated' },
  { logical: 'ISOLATED', tier: 'advanced', group: 'swift-concurrency', swift: 'isolated' },
  { logical: 'BORROWING', tier: 'advanced', group: 'swift-ownership', swift: 'borrowing' },
  { logical: 'CONSUMING', tier: 'advanced', group: 'swift-ownership', swift: 'consuming' },
  { logical: 'MACRO', tier: 'advanced', group: 'swift-macros', swift: 'macro' },
  { logical: 'SWIFT_PACKAGE', tier: 'advanced', group: 'swift-modules', swift: 'package' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_SWIFT_TOKENS.map(({ swift: kw, logical }) => [kw, logical]),
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

  if (registry.targets.includes('swift')) {
    console.log('logical-tokens.json already includes swift — skipping token registry update.');
    return registry;
  }

  registry.version = REGISTRY_VERSION;
  registry.targets = [...registry.targets, 'swift'];

  for (const entry of registry.tokens) {
    entry.targets.swift = SWIFT_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_SWIFT_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), swift: spec.swift };
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

  if (official.targets.swift) {
    console.log('official-target-keywords.json already includes swift — skipping.');
    return;
  }

  official.version = OFFICIAL_VERSION;
  official.sources.swift = {
    name: 'The Swift Programming Language — Lexical Structure',
    url: 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure/',
  };
  official.targets.swift = SWIFT_KEYWORDS;

  for (const [logical, emit] of Object.entries(SWIFT_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (SWIFT_KEYWORDS.includes(keyword)) {
        official.keywordToLogical[keyword] = logical;
      }
    } else if (emit?.includes(' ')) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.keywordToLogical.protocol = 'INTERFACE';
  official.keywordToLogical.func = 'FUNCTION';
  official.keywordToLogical.package = 'SWIFT_PACKAGE';

  official.notes.swift =
    'Swift reserved and contextual keywords from TSPL. ELSE emits else (not default). IS emits is for type checks; INSTANCEOF is empty. INTERFACE emits protocol. PRINT emits print. SWIFT_PACKAGE maps contextual package keyword.';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${SWIFT_KEYWORDS.length} Swift keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('swift')) {
    items.enum.push('swift');
    await writeJson(path, schema);
    console.log('Added swift to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('swift')) continue;
      pack.targets.push('swift');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added swift to targets in ${updated} pack(s).`);
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
  await checkGlossaryCollisions(SWIFT_KEYWORDS, 'swift');
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

  console.log(`Swift target added. NEW_SWIFT_TOKENS: ${NEW_SWIFT_TOKENS.length}. Keywords: ${SWIFT_KEYWORDS.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
