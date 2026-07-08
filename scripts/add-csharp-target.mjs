/**
 * Adds C# as a transpile target (v0.6.0 roadmap item).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-csharp-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

/** C# 12 reserved keywords + contextual keywords (Microsoft Learn) */
const CSHARP_KEYWORDS = [
  'abstract', 'add', 'alias', 'as', 'ascending', 'async', 'await', 'base', 'bool', 'break', 'by',
  'byte', 'case', 'catch', 'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default',
  'delegate', 'descending', 'do', 'double', 'else', 'enum', 'equals', 'event', 'explicit', 'extern',
  'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'from', 'get', 'global', 'goto', 'group',
  'if', 'implicit', 'in', 'int', 'interface', 'internal', 'into', 'is', 'join', 'let', 'lock', 'long',
  'nameof', 'namespace', 'new', 'null', 'object', 'on', 'operator', 'orderby', 'out', 'override',
  'params', 'partial', 'private', 'protected', 'public', 'readonly', 'ref', 'remove', 'return',
  'sbyte', 'sealed', 'select', 'set', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe',
  'ushort', 'using', 'value', 'var', 'virtual', 'void', 'volatile', 'when', 'where', 'while',
  'yield',
];

const CSHARP_EMITS = {
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
  SELECT: 'select',
  ASYNC: 'async',
  AWAIT: 'await',
  YIELD: 'yield',
  TRY: 'try',
  CATCH: 'catch',
  FINALLY: 'finally',
  THROW: 'throw',
  CONST: 'const',
  VAR: 'var',
  LET: 'let',
  CLASS: 'class',
  STRUCT: 'struct',
  INTERFACE: 'interface',
  ENUM: 'enum',
  NEW: 'new',
  THIS: 'this',
  SUPER: 'base',
  STATIC: 'static',
  FROM: 'from',
  AS: 'as',
  NAMESPACE: 'namespace',
  USING: 'using',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null',
  UNSAFE: 'unsafe',
  EXTERN: 'extern',
  IN: 'in',
  IS: 'is',
  TYPEOF: 'typeof',
  VOID: 'void',
  PRIVATE: 'private',
  PROTECTED: 'protected',
  PUBLIC: 'public',
  READONLY: 'readonly',
  ABSTRACT: 'abstract',
  GET: 'get',
  SET: 'set',
  GLOBAL: 'global',
  STRING: 'string',
  OBJECT: 'object',
  REF: 'ref',
  WHERE: 'where',
  BYTE: 'byte',
  CHAR: 'char',
  SHORT: 'short',
  INT: 'int',
  LONG: 'long',
  FLOAT: 'float',
  DOUBLE: 'double',
  VOLATILE: 'volatile',
  C_BOOL: 'bool',
  VIRTUAL: 'virtual',
  EXPLICIT: 'explicit',
  OPERATOR: 'operator',
  SIZEOF: 'sizeof',
  PRINT: 'Console.WriteLine',
};

const NEW_CSHARP_TOKENS = [
  { logical: 'DELEGATE', tier: 'standard', group: 'csharp-types', csharp: 'delegate' },
  { logical: 'EVENT', tier: 'standard', group: 'csharp-members', csharp: 'event' },
  { logical: 'LOCK', tier: 'standard', group: 'csharp-sync', csharp: 'lock' },
  { logical: 'SEALED', tier: 'standard', group: 'csharp-modifiers', csharp: 'sealed' },
  { logical: 'OVERRIDE', tier: 'standard', group: 'csharp-modifiers', csharp: 'override' },
  { logical: 'FOREACH', tier: 'standard', group: 'csharp-control', csharp: 'foreach' },
  { logical: 'PARTIAL', tier: 'advanced', group: 'csharp-modifiers', csharp: 'partial' },
  { logical: 'PARAMS', tier: 'advanced', group: 'csharp-modifiers', csharp: 'params' },
  { logical: 'INTERNAL', tier: 'standard', group: 'csharp-modifiers', csharp: 'internal' },
  { logical: 'CHECKED', tier: 'advanced', group: 'csharp-operators', csharp: 'checked' },
  { logical: 'UNCHECKED', tier: 'advanced', group: 'csharp-operators', csharp: 'unchecked' },
  { logical: 'FIXED', tier: 'advanced', group: 'csharp-unsafe', csharp: 'fixed' },
  { logical: 'STACKALLOC', tier: 'advanced', group: 'csharp-unsafe', csharp: 'stackalloc' },
  { logical: 'SBYTE', tier: 'advanced', group: 'csharp-types', csharp: 'sbyte' },
  { logical: 'UINT', tier: 'advanced', group: 'csharp-types', csharp: 'uint' },
  { logical: 'ULONG', tier: 'advanced', group: 'csharp-types', csharp: 'ulong' },
  { logical: 'USHORT', tier: 'advanced', group: 'csharp-types', csharp: 'ushort' },
  { logical: 'IMPLICIT', tier: 'advanced', group: 'csharp-modifiers', csharp: 'implicit' },
  { logical: 'OUT', tier: 'standard', group: 'csharp-modifiers', csharp: 'out' },
  { logical: 'ADD', tier: 'advanced', group: 'csharp-properties', csharp: 'add' },
  { logical: 'REMOVE', tier: 'advanced', group: 'csharp-properties', csharp: 'remove' },
  { logical: 'DYNAMIC', tier: 'advanced', group: 'csharp-types', csharp: 'dynamic' },
  { logical: 'EQUALS', tier: 'advanced', group: 'csharp-linq', csharp: 'equals' },
  { logical: 'ALIAS', tier: 'advanced', group: 'csharp-namespaces', csharp: 'alias' },
  { logical: 'NAMEOF', tier: 'advanced', group: 'csharp-operators', csharp: 'nameof' },
  { logical: 'WHEN', tier: 'advanced', group: 'csharp-control', csharp: 'when' },
  { logical: 'BY', tier: 'advanced', group: 'csharp-linq', csharp: 'by' },
  { logical: 'ASCENDING', tier: 'advanced', group: 'csharp-linq', csharp: 'ascending' },
  { logical: 'DESCENDING', tier: 'advanced', group: 'csharp-linq', csharp: 'descending' },
  { logical: 'GROUP', tier: 'advanced', group: 'csharp-linq', csharp: 'group' },
  { logical: 'INTO', tier: 'advanced', group: 'csharp-linq', csharp: 'into' },
  { logical: 'JOIN', tier: 'advanced', group: 'csharp-linq', csharp: 'join' },
  { logical: 'ON', tier: 'advanced', group: 'csharp-linq', csharp: 'on' },
  { logical: 'ORDERBY', tier: 'advanced', group: 'csharp-linq', csharp: 'orderby' },
  { logical: 'VALUE', tier: 'advanced', group: 'csharp-properties', csharp: 'value' },
  { logical: 'DECIMAL', tier: 'advanced', group: 'csharp-types', csharp: 'decimal' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_CSHARP_TOKENS.map(({ csharp, logical }) => [csharp, logical]),
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

  if (registry.targets.includes('csharp')) {
    console.log('logical-tokens.json already includes csharp — skipping token registry update.');
    return registry;
  }

  registry.version = '4.7.0';
  registry.targets = [...registry.targets, 'csharp'];

  for (const entry of registry.tokens) {
    entry.targets.csharp = CSHARP_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_CSHARP_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), csharp: spec.csharp };
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

  if (official.targets.csharp) {
    console.log('official-target-keywords.json already includes csharp — skipping.');
    return;
  }

  official.version = '1.9.0';
  official.sources.csharp = {
    name: 'C# 12 — Keywords (Microsoft Learn)',
    url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/',
  };
  official.targets.csharp = CSHARP_KEYWORDS;

  for (const [logical, emit] of Object.entries(CSHARP_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (CSHARP_KEYWORDS.includes(keyword)) {
        official.keywordToLogical[keyword] = logical;
      }
    } else if (emit?.includes(' ')) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.keywordToLogical.base = 'SUPER';

  official.notes.csharp =
    'C# 12 reserved and contextual keywords. `base` maps to logical SUPER; `bool` to C_BOOL. PRINT emits Console.WriteLine. FUNCTION has no keyword (method declarations).';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${CSHARP_KEYWORDS.length} C# keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('csharp')) {
    items.enum.push('csharp');
    await writeJson(path, schema);
    console.log('Added csharp to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('csharp')) continue;
      pack.targets.push('csharp');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added csharp to targets in ${updated} pack(s).`);
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

  console.log('C# target added. Run npm test && npm run readme:metrics next.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
