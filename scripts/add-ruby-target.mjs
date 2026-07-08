/**
 * Adds Ruby as a transpile target (13th target).
 * Updates logical-tokens.json, official-target-keywords.json, pack.schema.json,
 * all pack targets, index.json, and runs ensure-pack-tokens + coverage.
 *
 * Run once from repo root: node scripts/add-ruby-target.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');
const REGISTRY_VERSION = '5.1.0';
const OFFICIAL_VERSION = '2.3.0';

/**
 * Ruby reserved keywords (Ruby 3.2 keywords.rdoc)
 * https://docs.ruby-lang.org/en/3.2/keywords_rdoc.html
 */
const RUBY_KEYWORDS = [
  '__ENCODING__', '__LINE__', '__FILE__', 'BEGIN', 'END',
  'alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'defined?', 'do', 'else', 'elsif',
  'end', 'ensure', 'false', 'for', 'if', 'in', 'module', 'next', 'nil', 'not', 'or', 'redo',
  'rescue', 'retry', 'return', 'self', 'super', 'then', 'true', 'undef', 'unless', 'until',
  'when', 'while', 'yield',
];

const RUBY_EMITS = {
  IF: 'if',
  ELSE: 'else',
  ELIF: 'elsif',
  FOR: 'for',
  WHILE: 'while',
  BREAK: 'break',
  CONTINUE: '',
  SWITCH: 'case',
  MATCH: 'case',
  CASE: 'case',
  DEFAULT: '',
  DO: 'do',
  RETURN: 'return',
  FUNCTION: 'def',
  TRY: 'begin',
  CATCH: 'rescue',
  FINALLY: 'ensure',
  THROW: '',
  CLASS: 'class',
  THIS: 'self',
  SELF: 'self',
  SUPER: 'super',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'nil',
  IN: 'in',
  AND: 'and',
  OR: 'or',
  NOT: 'not',
  WHEN: 'when',
  YIELD: 'yield',
  PRINT: 'puts',
  IS: '',
  INSTANCEOF: '',
  TYPEOF: '',
};

const NEW_RUBY_TOKENS = [
  { logical: 'RUBY_ENCODING', tier: 'advanced', group: 'ruby-magic', ruby: '__ENCODING__' },
  { logical: 'RUBY_LINE', tier: 'advanced', group: 'ruby-magic', ruby: '__LINE__' },
  { logical: 'RUBY_FILE', tier: 'advanced', group: 'ruby-magic', ruby: '__FILE__' },
  { logical: 'RUBY_BEGIN', tier: 'advanced', group: 'ruby-magic', ruby: 'BEGIN' },
  { logical: 'RUBY_END', tier: 'advanced', group: 'ruby-magic', ruby: 'END' },
  { logical: 'MODULE', tier: 'standard', group: 'ruby-modules', ruby: 'module' },
  { logical: 'END', tier: 'core', group: 'ruby-blocks', ruby: 'end' },
  { logical: 'RESCUE', tier: 'core', group: 'ruby-errors', ruby: 'rescue' },
  { logical: 'ENSURE', tier: 'core', group: 'ruby-errors', ruby: 'ensure' },
  { logical: 'UNTIL', tier: 'standard', group: 'ruby-control', ruby: 'until' },
  { logical: 'UNLESS', tier: 'standard', group: 'ruby-control', ruby: 'unless' },
  { logical: 'ALIAS', tier: 'advanced', group: 'ruby-declarations', ruby: 'alias' },
  { logical: 'UNDEF', tier: 'advanced', group: 'ruby-declarations', ruby: 'undef' },
  { logical: 'NEXT', tier: 'standard', group: 'ruby-control', ruby: 'next' },
  { logical: 'REDO', tier: 'advanced', group: 'ruby-control', ruby: 'redo' },
  { logical: 'RETRY', tier: 'advanced', group: 'ruby-control', ruby: 'retry' },
  { logical: 'THEN', tier: 'standard', group: 'ruby-control', ruby: 'then' },
  { logical: 'DEFINED', tier: 'advanced', group: 'ruby-operators', ruby: 'defined?' },
];

const NEW_KEYWORD_TO_LOGICAL = Object.fromEntries(
  NEW_RUBY_TOKENS.map(({ ruby: kw, logical }) => [kw, logical]),
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

  if (registry.targets.includes('ruby')) {
    console.log('logical-tokens.json already includes ruby — skipping token registry update.');
    return registry;
  }

  registry.version = REGISTRY_VERSION;
  registry.targets = [...registry.targets, 'ruby'];

  for (const entry of registry.tokens) {
    entry.targets.ruby = RUBY_EMITS[entry.logical] ?? '';
  }

  for (const spec of NEW_RUBY_TOKENS) {
    const targets = { ...emptyTargetsFor(registry.targets), ruby: spec.ruby };
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

  if (official.targets.ruby) {
    console.log('official-target-keywords.json already includes ruby — skipping.');
    return;
  }

  official.version = OFFICIAL_VERSION;
  official.sources.ruby = {
    name: 'Ruby 3.2 — Keywords',
    url: 'https://docs.ruby-lang.org/en/3.2/keywords_rdoc.html',
  };
  official.targets.ruby = RUBY_KEYWORDS;

  for (const [logical, emit] of Object.entries(RUBY_EMITS)) {
    if (emit && !emit.includes(' ')) {
      const keyword = emit.split(/[.!(]/)[0];
      if (RUBY_KEYWORDS.includes(keyword)) {
        official.keywordToLogical[keyword] = logical;
      }
    } else if (emit?.includes(' ')) {
      official.keywordToLogical[emit] = logical;
    }
  }

  for (const [keyword, logical] of Object.entries(NEW_KEYWORD_TO_LOGICAL)) {
    official.keywordToLogical[keyword] = logical;
  }

  official.keywordToLogical.def = 'FUNCTION';
  official.keywordToLogical.begin = 'TRY';

  official.notes.ruby =
    'Ruby 3.2 reserved keywords including magic constants. ELSE emits else; elsif maps to ELIF. TRY/CATCH/FINALLY emit begin/rescue/ensure. FUNCTION emits def. PRINT emits puts (not a keyword). IS and INSTANCEOF are empty.';

  await writeJson(path, official);
  console.log(`Updated official-target-keywords.json with ${RUBY_KEYWORDS.length} Ruby keywords.`);
}

async function updatePackSchema() {
  const path = join(root, 'pack.schema.json');
  const schema = await readJson(path);
  const items = schema.properties.targets.items;
  if (!items.enum.includes('ruby')) {
    items.enum.push('ruby');
    await writeJson(path, schema);
    console.log('Added ruby to pack.schema.json targets enum.');
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
      if (!Array.isArray(pack.targets) || pack.targets.includes('ruby')) continue;
      pack.targets.push('ruby');
      await writeJson(packPath, pack);
      updated += 1;
    } catch {
      // not a pack folder
    }
  }

  console.log(`Added ruby to targets in ${updated} pack(s).`);
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
  await checkGlossaryCollisions(RUBY_KEYWORDS, 'ruby');
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

  console.log(`Ruby target added. NEW_RUBY_TOKENS: ${NEW_RUBY_TOKENS.length}. Keywords: ${RUBY_KEYWORDS.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
