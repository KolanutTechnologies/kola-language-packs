/**
 * Adds Java as a transpile target (v0.3.0 roadmap item).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-java-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

/** JLS §3.9 Keywords (Java SE 21) */
const JAVA_KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', '_',
];

const JAVA_EMITS = {
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
  GOTO: 'goto',
  DO: 'do',
  RETURN: 'return',
  TRY: 'try',
  CATCH: 'catch',
  FINALLY: 'finally',
  THROW: 'throw',
  CONST: 'const',
  CLASS: 'class',
  INTERFACE: 'interface',
  ENUM: 'enum',
  EXTENDS: 'extends',
  IMPLEMENTS: 'implements',
  NEW: 'new',
  THIS: 'this',
  SUPER: 'super',
  STATIC: 'static',
  IMPORT: 'import',
  PACKAGE: 'package',
  PRIVATE: 'private',
  PROTECTED: 'protected',
  PUBLIC: 'public',
  ABSTRACT: 'abstract',
  VOID: 'void',
  INSTANCEOF: 'instanceof',
  ASSERT: 'assert',
  BOOLEAN: 'boolean',
  PRINT: 'System.out.println',
};

const NEW_JAVA_TOKENS = [
  { logical: 'BYTE', tier: 'advanced', group: 'java-types', java: 'byte' },
  { logical: 'CHAR', tier: 'advanced', group: 'java-types', java: 'char' },
  { logical: 'SHORT', tier: 'advanced', group: 'java-types', java: 'short' },
  { logical: 'INT', tier: 'advanced', group: 'java-types', java: 'int' },
  { logical: 'LONG', tier: 'advanced', group: 'java-types', java: 'long' },
  { logical: 'FLOAT', tier: 'advanced', group: 'java-types', java: 'float' },
  { logical: 'DOUBLE', tier: 'advanced', group: 'java-types', java: 'double' },
  { logical: 'FINAL', tier: 'advanced', group: 'java-modifiers', java: 'final' },
  { logical: 'NATIVE', tier: 'advanced', group: 'java-modifiers', java: 'native' },
  { logical: 'STRICTFP', tier: 'advanced', group: 'java-modifiers', java: 'strictfp' },
  { logical: 'SYNCHRONIZED', tier: 'advanced', group: 'java-modifiers', java: 'synchronized' },
  { logical: 'THROWS', tier: 'advanced', group: 'java-modifiers', java: 'throws' },
  { logical: 'TRANSIENT', tier: 'advanced', group: 'java-modifiers', java: 'transient' },
  { logical: 'VOLATILE', tier: 'advanced', group: 'java-modifiers', java: 'volatile' },
];

const NEW_KEYWORD_TO_LOGICAL = {
  byte: 'BYTE',
  char: 'CHAR',
  short: 'SHORT',
  int: 'INT',
  long: 'LONG',
  float: 'FLOAT',
  double: 'DOUBLE',
  final: 'FINAL',
  native: 'NATIVE',
  strictfp: 'STRICTFP',
  synchronized: 'SYNCHRONIZED',
  throws: 'THROWS',
  transient: 'TRANSIENT',
  volatile: 'VOLATILE',
  const: 'CONST',
};

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
  const baseTargets = [...registry.targets];

  if (registry.targets.includes('java')) {
    console.log('logical-tokens.json already includes java — skipping token registry update.');
    return registry;
  }

  registry.version = '4.3.0';
  registry.targets = [...baseTargets, 'java'];

  for (const entry of registry.tokens) {
    entry.targets.java = JAVA_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_JAVA_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), java: spec.java };
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

  if (official.targets.java) {
    console.log('official-target-keywords.json already includes java — skipping.');
    return;
  }

  official.version = '1.5.0';
  official.sources.java = {
    name: 'Java Language Specification (Java SE 21)',
    url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.9',
  };
  official.targets.java = JAVA_KEYWORDS;

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.notes.java =
    'JLS §3.9 Keywords: 50 reserved keywords (includes unused const and goto). Literal null, true, and false are §3.10.7 — not counted as keywords here.';

  await writeJson(path, official);
  console.log('Updated official-target-keywords.json with Java keywords.');
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('java')) {
    items.enum.push('java');
    await writeJson(path, schema);
    console.log('Added java to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('java')) continue;
      pack.targets.push('java');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added java to targets in ${updated} pack(s).`);
}

async function main() {
  await updateLogicalTokens();
  await updateOfficialKeywords();
  await updatePackSchema();
  await updatePackTargets();

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

  console.log('Java target added. Run npm test && npm run readme:metrics next.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
