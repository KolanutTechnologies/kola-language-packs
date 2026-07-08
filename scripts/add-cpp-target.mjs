/**
 * Adds C++ as a transpile target (v0.5.0 roadmap item).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-cpp-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

/** ISO C++20/23 keywords + alternative operators (cppreference) */
const CPP_KEYWORDS = [
  'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case',
  'catch', 'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl', 'concept', 'const',
  'consteval', 'constinit', 'constexpr', 'const_cast', 'continue', 'co_await', 'co_return',
  'co_yield', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum',
  'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int',
  'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or',
  'or_eq', 'private', 'protected', 'public', 'register', 'reinterpret_cast', 'requires', 'return',
  'short', 'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch',
  'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
  'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq',
];

/** Emits for existing logical tokens on the cpp target (empty string = no C++ keyword). */
const CPP_EMITS = {
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
  THROW: 'throw',
  CONST: 'const',
  CLASS: 'class',
  STRUCT: 'struct',
  ENUM: 'enum',
  NEW: 'new',
  THIS: 'this',
  STATIC: 'static',
  EXPORT: 'export',
  NAMESPACE: 'namespace',
  USING: 'using',
  PRIVATE: 'private',
  PROTECTED: 'protected',
  PUBLIC: 'public',
  VOID: 'void',
  TRUE: 'true',
  FALSE: 'false',
  EXTERN: 'extern',
  VOLATILE: 'volatile',
  INLINE: 'inline',
  AUTO: 'auto',
  REGISTER: 'register',
  SIGNED: 'signed',
  UNSIGNED: 'unsigned',
  SHORT: 'short',
  INT: 'int',
  LONG: 'long',
  FLOAT: 'float',
  DOUBLE: 'double',
  CHAR: 'char',
  SIZEOF: 'sizeof',
  TYPEDEF: 'typedef',
  UNION: 'union',
  ASM: 'asm',
  AND: 'and',
  OR: 'or',
  NOT: 'not',
  C_BOOL: 'bool',
  C_ALIGNAS: 'alignas',
  C_ALIGNOF: 'alignof',
  C_STATIC_ASSERT: 'static_assert',
  C_THREAD_LOCAL: 'thread_local',
};

const NEW_CPP_TOKENS = [
  { logical: 'TEMPLATE', tier: 'standard', group: 'cpp-oop', cpp: 'template' },
  { logical: 'VIRTUAL', tier: 'standard', group: 'cpp-oop', cpp: 'virtual' },
  { logical: 'TYPENAME', tier: 'standard', group: 'cpp-types', cpp: 'typename' },
  { logical: 'CONSTEXPR', tier: 'advanced', group: 'cpp-modifiers', cpp: 'constexpr' },
  { logical: 'CONSTEVAL', tier: 'advanced', group: 'cpp-modifiers', cpp: 'consteval' },
  { logical: 'CONSTINIT', tier: 'advanced', group: 'cpp-modifiers', cpp: 'constinit' },
  { logical: 'NOEXCEPT', tier: 'advanced', group: 'cpp-modifiers', cpp: 'noexcept' },
  { logical: 'DECLTYPE', tier: 'advanced', group: 'cpp-types', cpp: 'decltype' },
  { logical: 'NULLPTR', tier: 'standard', group: 'cpp-literals', cpp: 'nullptr' },
  { logical: 'OPERATOR', tier: 'advanced', group: 'cpp-operators', cpp: 'operator' },
  { logical: 'FRIEND', tier: 'advanced', group: 'cpp-modifiers', cpp: 'friend' },
  { logical: 'EXPLICIT', tier: 'advanced', group: 'cpp-modifiers', cpp: 'explicit' },
  { logical: 'MUTABLE', tier: 'advanced', group: 'cpp-modifiers', cpp: 'mutable' },
  { logical: 'CONCEPT', tier: 'advanced', group: 'cpp-concepts', cpp: 'concept' },
  { logical: 'REQUIRES', tier: 'advanced', group: 'cpp-concepts', cpp: 'requires' },
  { logical: 'CO_AWAIT', tier: 'advanced', group: 'cpp-coroutines', cpp: 'co_await' },
  { logical: 'CO_RETURN', tier: 'advanced', group: 'cpp-coroutines', cpp: 'co_return' },
  { logical: 'CO_YIELD', tier: 'advanced', group: 'cpp-coroutines', cpp: 'co_yield' },
  { logical: 'CHAR8_T', tier: 'advanced', group: 'cpp-types', cpp: 'char8_t' },
  { logical: 'CHAR16_T', tier: 'advanced', group: 'cpp-types', cpp: 'char16_t' },
  { logical: 'CHAR32_T', tier: 'advanced', group: 'cpp-types', cpp: 'char32_t' },
  { logical: 'WCHAR_T', tier: 'advanced', group: 'cpp-types', cpp: 'wchar_t' },
  { logical: 'TYPEID', tier: 'advanced', group: 'cpp-types', cpp: 'typeid' },
  { logical: 'STATIC_CAST', tier: 'advanced', group: 'cpp-casts', cpp: 'static_cast' },
  { logical: 'DYNAMIC_CAST', tier: 'advanced', group: 'cpp-casts', cpp: 'dynamic_cast' },
  { logical: 'REINTERPRET_CAST', tier: 'advanced', group: 'cpp-casts', cpp: 'reinterpret_cast' },
  { logical: 'CONST_CAST', tier: 'advanced', group: 'cpp-casts', cpp: 'const_cast' },
  { logical: 'DELETE', tier: 'standard', group: 'cpp-memory', cpp: 'delete' },
  { logical: 'BITAND', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'bitand' },
  { logical: 'BITOR', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'bitor' },
  { logical: 'COMPL', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'compl' },
  { logical: 'XOR', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'xor' },
  { logical: 'XOR_EQ', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'xor_eq' },
  { logical: 'AND_EQ', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'and_eq' },
  { logical: 'OR_EQ', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'or_eq' },
  { logical: 'NOT_EQ', tier: 'advanced', group: 'cpp-alt-operators', cpp: 'not_eq' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_CPP_TOKENS.map(({ cpp, logical }) => [cpp, logical]),
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

  if (registry.targets.includes('cpp')) {
    console.log('logical-tokens.json already includes cpp — skipping token registry update.');
    return registry;
  }

  registry.version = '4.6.0';
  registry.targets = [...registry.targets, 'cpp'];

  for (const entry of registry.tokens) {
    entry.targets.cpp = CPP_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_CPP_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), cpp: spec.cpp };
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

  if (official.targets.cpp) {
    console.log('official-target-keywords.json already includes cpp — skipping.');
    return;
  }

  official.version = '1.8.0';
  official.sources.cpp = {
    name: 'ISO C++20 — Keywords (cppreference)',
    url: 'https://en.cppreference.com/w/cpp/keyword',
  };
  official.targets.cpp = CPP_KEYWORDS;

  for (const [logical, emit] of Object.entries(CPP_EMITS)) {
    if (emit) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.notes.cpp =
    'C++20 keyword set plus char8_t and coroutines (co_await, co_return, co_yield). Modern spellings (bool, alignas, static_assert, thread_local) map to shared C-family logical tokens. C-only underscore keywords (_Bool, _Alignas, …) are not tracked on this target.';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${CPP_KEYWORDS.length} C++ keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('cpp')) {
    items.enum.push('cpp');
    await writeJson(path, schema);
    console.log('Added cpp to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('cpp')) continue;
      pack.targets.push('cpp');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added cpp to targets in ${updated} pack(s).`);
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

  console.log('C++ target added. Run npm test && npm run readme:metrics next.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
