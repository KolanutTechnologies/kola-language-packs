/**
 * Adds PHP as a transpile target (14th target).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-php-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const REGISTRY_VERSION = '5.2.0';
const OFFICIAL_VERSION = '2.4.0';

/**
 * PHP 8.3 reserved keywords and compile-time magic constants
 * https://www.php.net/manual/en/reserved.keywords.php
 */
const PHP_KEYWORDS = [
  '__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class',
  'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif',
  'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'enum', 'eval',
  'exit', 'extends', 'final', 'finally', 'fn', 'for', 'foreach', 'function', 'global', 'goto',
  'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset',
  'list', 'match', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'readonly',
  'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use',
  'var', 'while', 'xor', 'yield', 'yield from',
  '__CLASS__', '__DIR__', '__FILE__', '__FUNCTION__', '__LINE__', '__METHOD__', '__NAMESPACE__',
  '__TRAIT__', '__PROPERTY__',
];

const PHP_EMITS = {
  IF: 'if',
  ELSE: 'else',
  ELIF: 'elseif',
  FOR: 'for',
  WHILE: 'while',
  BREAK: 'break',
  CONTINUE: 'continue',
  SWITCH: 'switch',
  MATCH: 'match',
  CASE: 'case',
  DEFAULT: 'default',
  GOTO: 'goto',
  DO: 'do',
  RETURN: 'return',
  FUNCTION: 'function',
  FOREACH: 'foreach',
  YIELD: 'yield',
  TRY: 'try',
  CATCH: 'catch',
  FINALLY: 'finally',
  THROW: 'throw',
  CONST: 'const',
  VAR: 'var',
  GLOBAL: 'global',
  CLASS: 'class',
  TRAIT: 'trait',
  INTERFACE: 'interface',
  ENUM: 'enum',
  EXTENDS: 'extends',
  IMPLEMENTS: 'implements',
  NEW: 'new',
  STATIC: 'static',
  AS: 'as',
  NAMESPACE: 'namespace',
  USE: 'use',
  REQUIRE: 'require',
  AND: 'and',
  OR: 'or',
  XOR: 'xor',
  IS: '',
  INSTANCEOF: 'instanceof',
  DECLARE: 'declare',
  PUBLIC: 'public',
  PROTECTED: 'protected',
  PRIVATE: 'private',
  READONLY: 'readonly',
  ABSTRACT: 'abstract',
  FINAL: 'final',
  PRINT: 'print',
};

/** PHP-only logical tokens not already in logical-tokens.json */
const NEW_PHP_TOKENS = [
  { logical: 'PHP_HALT_COMPILER', tier: 'advanced', group: 'php-control', php: '__halt_compiler' },
  { logical: 'PHP_ARRAY', tier: 'standard', group: 'php-types', php: 'array' },
  { logical: 'PHP_CALLABLE', tier: 'standard', group: 'php-types', php: 'callable' },
  { logical: 'PHP_CLONE', tier: 'standard', group: 'php-oop', php: 'clone' },
  { logical: 'PHP_DIE', tier: 'standard', group: 'php-output', php: 'die' },
  { logical: 'PHP_ECHO', tier: 'core', group: 'php-output', php: 'echo' },
  { logical: 'PHP_EMPTY', tier: 'standard', group: 'php-operators', php: 'empty' },
  { logical: 'PHP_ENDDECLARE', tier: 'advanced', group: 'php-control', php: 'enddeclare' },
  { logical: 'PHP_ENDFOR', tier: 'advanced', group: 'php-control', php: 'endfor' },
  { logical: 'PHP_ENDFOREACH', tier: 'advanced', group: 'php-control', php: 'endforeach' },
  { logical: 'PHP_ENDIF', tier: 'advanced', group: 'php-control', php: 'endif' },
  { logical: 'PHP_ENDSWITCH', tier: 'advanced', group: 'php-control', php: 'endswitch' },
  { logical: 'PHP_ENDWHILE', tier: 'advanced', group: 'php-control', php: 'endwhile' },
  { logical: 'PHP_EVAL', tier: 'advanced', group: 'php-control', php: 'eval' },
  { logical: 'PHP_EXIT', tier: 'standard', group: 'php-control', php: 'exit' },
  { logical: 'PHP_FN', tier: 'standard', group: 'php-functions', php: 'fn' },
  { logical: 'PHP_INCLUDE', tier: 'standard', group: 'php-modules', php: 'include' },
  { logical: 'PHP_INCLUDE_ONCE', tier: 'standard', group: 'php-modules', php: 'include_once' },
  { logical: 'PHP_INSTEADOF', tier: 'advanced', group: 'php-traits', php: 'insteadof' },
  { logical: 'PHP_ISSET', tier: 'standard', group: 'php-operators', php: 'isset' },
  { logical: 'PHP_LIST', tier: 'standard', group: 'php-operators', php: 'list' },
  { logical: 'PHP_REQUIRE_ONCE', tier: 'standard', group: 'php-modules', php: 'require_once' },
  { logical: 'PHP_UNSET', tier: 'standard', group: 'php-operators', php: 'unset' },
  { logical: 'PHP_YIELD_FROM', tier: 'standard', group: 'php-generators', php: 'yield from' },
  { logical: 'PHP_CLASS_MAGIC', tier: 'advanced', group: 'php-magic', php: '__CLASS__' },
  { logical: 'PHP_DIR_MAGIC', tier: 'advanced', group: 'php-magic', php: '__DIR__' },
  { logical: 'PHP_FILE_MAGIC', tier: 'advanced', group: 'php-magic', php: '__FILE__' },
  { logical: 'PHP_FUNCTION_MAGIC', tier: 'advanced', group: 'php-magic', php: '__FUNCTION__' },
  { logical: 'PHP_LINE_MAGIC', tier: 'advanced', group: 'php-magic', php: '__LINE__' },
  { logical: 'PHP_METHOD_MAGIC', tier: 'advanced', group: 'php-magic', php: '__METHOD__' },
  { logical: 'PHP_NAMESPACE_MAGIC', tier: 'advanced', group: 'php-magic', php: '__NAMESPACE__' },
  { logical: 'PHP_TRAIT_MAGIC', tier: 'advanced', group: 'php-magic', php: '__TRAIT__' },
  { logical: 'PHP_PROPERTY_MAGIC', tier: 'advanced', group: 'php-magic', php: '__PROPERTY__' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_PHP_TOKENS.map(({ php: kw, logical }) => [kw, logical]),
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

  if (registry.targets.includes('php')) {
    console.log('logical-tokens.json already includes php — skipping token registry update.');
    return registry;
  }

  registry.version = REGISTRY_VERSION;
  registry.targets = [...registry.targets, 'php'];

  for (const entry of registry.tokens) {
    entry.targets.php = PHP_EMITS[entry.logical] ?? '';
  }

  const existingLogicals = new Set(registry.tokens.map((t) => t.logical));
  for (const spec of NEW_PHP_TOKENS) {
    if (existingLogicals.has(spec.logical)) continue;
    const targets = { ...emptyTargetsFor(registry.targets), php: spec.php };
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

  if (official.targets.php) {
    console.log('official-target-keywords.json already includes php — skipping.');
    return;
  }

  official.version = OFFICIAL_VERSION;
  official.sources.php = {
    name: 'PHP 8.3 — Reserved keywords',
    url: 'https://www.php.net/manual/en/reserved.keywords.php',
  };
  official.targets.php = PHP_KEYWORDS;

  for (const [logical, emit] of Object.entries(PHP_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (PHP_KEYWORDS.includes(keyword)) {
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
  official.keywordToLogical.require = 'REQUIRE';

  official.notes.php =
    'PHP 8.3 reserved keywords and compile-time magic constants. ELSE emits else (not default). IS is empty; INSTANCEOF emits instanceof. PRINT emits print. ECHO maps to PHP_ECHO.';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${PHP_KEYWORDS.length} PHP keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('php')) {
    items.enum.push('php');
    await writeJson(path, schema);
    console.log('Added php to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('php')) continue;
      pack.targets.push('php');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added php to targets in ${updated} pack(s).`);
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
  await checkGlossaryCollisions(PHP_KEYWORDS, 'php');
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

  console.log(`PHP target added. NEW_PHP_TOKENS: ${NEW_PHP_TOKENS.length}. Keywords: ${PHP_KEYWORDS.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
