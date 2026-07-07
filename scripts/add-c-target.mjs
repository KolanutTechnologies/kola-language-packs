/**
 * Adds C as a transpile target (v0.4.0 roadmap item).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-c-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

/** ISO/IEC 9899:2011 §6.4.1 Keywords (C89 core + C99 + C11; asm extension) */
const C_KEYWORDS = [
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict', 'return',
  'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void',
  'volatile', 'while',
  '_Alignas', '_Alignof', '_Atomic', '_Bool', '_Complex', '_Generic', '_Imaginary', '_Noreturn',
  '_Static_assert', '_Thread_local',
  'asm',
];

const C_EMITS = {
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
  CONST: 'const',
  STRUCT: 'struct',
  ENUM: 'enum',
  STATIC: 'static',
  EXTERN: 'extern',
  VOID: 'void',
  CHAR: 'char',
  SHORT: 'short',
  INT: 'int',
  LONG: 'long',
  FLOAT: 'float',
  DOUBLE: 'double',
  VOLATILE: 'volatile',
  PRINT: 'printf',
  AUTO: 'auto',
  REGISTER: 'register',
  SIGNED: 'signed',
  UNSIGNED: 'unsigned',
  SIZEOF: 'sizeof',
  TYPEDEF: 'typedef',
  UNION: 'union',
  INLINE: 'inline',
  RESTRICT: 'restrict',
  C_BOOL: '_Bool',
  C_COMPLEX: '_Complex',
  C_IMAGINARY: '_Imaginary',
  C_ALIGNAS: '_Alignas',
  C_ALIGNOF: '_Alignof',
  C_ATOMIC: '_Atomic',
  C_GENERIC: '_Generic',
  C_NORETURN: '_Noreturn',
  C_STATIC_ASSERT: '_Static_assert',
  C_THREAD_LOCAL: '_Thread_local',
  ASM: 'asm',
};

const NEW_C_TOKENS = [
  { logical: 'AUTO', tier: 'advanced', group: 'c-storage', c: 'auto' },
  { logical: 'REGISTER', tier: 'advanced', group: 'c-storage', c: 'register' },
  { logical: 'SIGNED', tier: 'advanced', group: 'c-types', c: 'signed' },
  { logical: 'UNSIGNED', tier: 'advanced', group: 'c-types', c: 'unsigned' },
  { logical: 'SIZEOF', tier: 'advanced', group: 'c-operators', c: 'sizeof' },
  { logical: 'TYPEDEF', tier: 'advanced', group: 'c-declarations', c: 'typedef' },
  { logical: 'UNION', tier: 'advanced', group: 'c-types', c: 'union' },
  { logical: 'INLINE', tier: 'advanced', group: 'c-modifiers', c: 'inline' },
  { logical: 'RESTRICT', tier: 'advanced', group: 'c-modifiers', c: 'restrict' },
  { logical: 'C_BOOL', tier: 'advanced', group: 'c-types', c: '_Bool' },
  { logical: 'C_COMPLEX', tier: 'advanced', group: 'c-types', c: '_Complex' },
  { logical: 'C_IMAGINARY', tier: 'advanced', group: 'c-types', c: '_Imaginary' },
  { logical: 'C_ALIGNAS', tier: 'advanced', group: 'c11', c: '_Alignas' },
  { logical: 'C_ALIGNOF', tier: 'advanced', group: 'c11', c: '_Alignof' },
  { logical: 'C_ATOMIC', tier: 'advanced', group: 'c11', c: '_Atomic' },
  { logical: 'C_GENERIC', tier: 'advanced', group: 'c11', c: '_Generic' },
  { logical: 'C_NORETURN', tier: 'advanced', group: 'c11', c: '_Noreturn' },
  { logical: 'C_STATIC_ASSERT', tier: 'advanced', group: 'c11', c: '_Static_assert' },
  { logical: 'C_THREAD_LOCAL', tier: 'advanced', group: 'c11', c: '_Thread_local' },
  { logical: 'ASM', tier: 'advanced', group: 'c-extensions', c: 'asm' },
];

const NEW_KEYWORD_TO_LOGICAL = {
  auto: 'AUTO',
  register: 'REGISTER',
  signed: 'SIGNED',
  unsigned: 'UNSIGNED',
  sizeof: 'SIZEOF',
  typedef: 'TYPEDEF',
  union: 'UNION',
  inline: 'INLINE',
  restrict: 'RESTRICT',
  _Bool: 'C_BOOL',
  _Complex: 'C_COMPLEX',
  _Imaginary: 'C_IMAGINARY',
  _Alignas: 'C_ALIGNAS',
  _Alignof: 'C_ALIGNOF',
  _Atomic: 'C_ATOMIC',
  _Generic: 'C_GENERIC',
  _Noreturn: 'C_NORETURN',
  _Static_assert: 'C_STATIC_ASSERT',
  _Thread_local: 'C_THREAD_LOCAL',
  asm: 'ASM',
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

  if (registry.targets.includes('c')) {
    console.log('logical-tokens.json already includes c — skipping token registry update.');
    return registry;
  }

  registry.version = '4.5.0';
  registry.targets = [...baseTargets, 'c'];

  for (const entry of registry.tokens) {
    entry.targets.c = C_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_C_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), c: spec.c };
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

  if (official.targets.c) {
    console.log('official-target-keywords.json already includes c — skipping.');
    return;
  }

  official.version = '1.7.0';
  official.sources.c = {
    name: 'ISO/IEC 9899:2011 (C11) — Keywords',
    url: 'https://en.cppreference.com/w/c/keyword',
  };
  official.targets.c = C_KEYWORDS;

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.notes.c =
    'C11 §6.4.1: 32 C89 keywords + C99 (inline, restrict, _Bool, _Complex, _Imaginary) + C11 underscore keywords (_Alignas through _Thread_local). Includes conditionally-supported asm. C23 spellings (bool, static_assert, …) not tracked — use C++ target when needed.';

  await writeJson(path, official);
  console.log('Updated official-target-keywords.json with C keywords.');
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('c')) {
    items.enum.push('c');
    await writeJson(path, schema);
    console.log('Added c to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('c')) continue;
      pack.targets.push('c');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added c to targets in ${updated} pack(s).`);
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

  console.log('C target added. Run npm test && npm run readme:metrics next.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
