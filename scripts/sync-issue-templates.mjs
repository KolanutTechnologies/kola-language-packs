/**
 * Sync GitHub issue form dropdowns from pack index and logical tokens.
 * Keeps non-developer contribution forms current when packs or core concepts grow.
 *
 * Usage:
 *   node scripts/sync-issue-templates.mjs          # write
 *   node scripts/sync-issue-templates.mjs --check  # exit 1 if drift
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const TEMPLATE_FILES = [
  join(root, '.github', 'ISSUE_TEMPLATE', 'translation-suggestion.yml'),
  join(root, '.github', 'ISSUE_TEMPLATE', 'unnatural-phrasing.yml'),
];

const MARKERS = {
  packOptions: ['# sync:pack-options:start', '# sync:pack-options:end'],
  conceptOptions: ['# sync:concept-options:start', '# sync:concept-options:end'],
};

/** Curated order for contributor dropdown (most taught concepts first). */
const PREFERRED_CONCEPT_ORDER = [
  'IF',
  'ELSE',
  'FOR',
  'WHILE',
  'FUNCTION',
  'RETURN',
  'PRINT',
  'LET',
  'CONST',
  'VAR',
  'TRUE',
  'FALSE',
  'NULL',
  'BREAK',
  'CONTINUE',
  'SWITCH',
  'CASE',
  'DEFAULT',
  'TRY',
  'CATCH',
  'CLASS',
  'NEW',
  'THIS',
  'IMPORT',
  'EXPORT',
  'AND',
  'OR',
  'NOT',
  'ASYNC',
  'AWAIT',
];

const CONCEPT_HINTS = {
  IF: 'if / conditional',
  ELSE: 'otherwise',
  FOR: 'for loop',
  WHILE: 'while loop',
  FUNCTION: 'define a function',
  RETURN: 'return a value',
  PRINT: 'print / show output',
  LET: 'variable (let)',
  CONST: 'constant',
  VAR: 'variable (var)',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null / empty',
  BREAK: 'exit a loop',
  CONTINUE: 'skip to next loop step',
  SWITCH: 'switch / choose case',
  CASE: 'case branch',
  DEFAULT: 'default branch',
  TRY: 'try (handle errors)',
  CATCH: 'catch errors',
  CLASS: 'class (objects)',
  NEW: 'create new instance',
  THIS: 'this / current object',
  IMPORT: 'import code',
  EXPORT: 'export code',
  AND: 'logical and',
  OR: 'logical or',
  NOT: 'logical not',
  ASYNC: 'async',
  AWAIT: 'await',
  FINALLY: 'finally (errors)',
  THROW: 'throw error',
  EXTENDS: 'extends / inherits',
  END: 'end block',
};

function replaceBlock(content, [start, end], innerLines) {
  const startIdx = content.indexOf(start);
  const endIdx = content.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error(`Missing markers ${start} … ${end}`);
  }
  const before = content.slice(0, startIdx + start.length);
  const after = content.slice(endIdx);
  const body = `\n${innerLines.map((line) => `        - ${line}`).join('\n')}\n        `;
  return before + body + after;
}

function replaceTokenCount(content, count) {
  return content.replace(/full list of \d+ concepts/g, `full list of ${count} concepts`);
}

function conceptLabel(token) {
  const { logical, targets } = token;
  const hint = CONCEPT_HINTS[logical];
  if (hint) return `${logical} — ${hint}`;
  const kw =
    targets?.javascript ||
    targets?.python ||
    targets?.typescript ||
    Object.values(targets ?? {}).find(Boolean);
  return kw ? `${logical} — ${kw}` : logical;
}

function buildPackOptions(packs) {
  const sorted = [...packs].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
  );
  const lines = sorted.map((p) => `${p.displayName} (${p.name})`);
  lines.push('Other / language not listed yet');
  return lines;
}

function buildConceptOptions(tokens) {
  const byName = new Map(tokens.map((t) => [t.logical, t]));
  const seen = new Set();
  const ordered = [];

  for (const name of PREFERRED_CONCEPT_ORDER) {
    const token = byName.get(name);
    if (token) {
      ordered.push(token);
      seen.add(name);
    }
  }

  const extras = [...byName.values()]
    .filter((t) => t.tier === 'core' && !seen.has(t.logical))
    .sort((a, b) => a.logical.localeCompare(b.logical));

  for (const token of extras) {
    ordered.push(token);
  }

  const lines = ordered.map(conceptLabel);
  lines.push('Other (type the concept name below)');
  return lines;
}

async function syncFile(path, packOptions, conceptOptions, tokenCount) {
  let content = await readFile(path, 'utf8');
  content = replaceBlock(content, MARKERS.packOptions, packOptions);
  if (content.includes(MARKERS.conceptOptions[0])) {
    content = replaceBlock(content, MARKERS.conceptOptions, conceptOptions);
  }
  content = replaceTokenCount(content, tokenCount);
  await writeFile(path, content, 'utf8');
  return content;
}

async function readForCheck(path) {
  return readFile(path, 'utf8');
}

async function main() {
  const index = JSON.parse(await readFile(join(root, 'packs', 'index.json'), 'utf8'));
  const tokensFile = JSON.parse(await readFile(join(root, 'packs', 'logical-tokens.json'), 'utf8'));
  const tokenCount = tokensFile.tokens.length;

  const packOptions = buildPackOptions(index.packs);
  const conceptOptions = buildConceptOptions(tokensFile.tokens);

  if (checkOnly) {
    for (const path of TEMPLATE_FILES) {
      const before = await readForCheck(path);
      const patched = replaceTokenCount(
        replaceBlock(
          replaceBlock(before, MARKERS.packOptions, packOptions),
          MARKERS.conceptOptions,
          conceptOptions,
        ),
        tokenCount,
      );
      if (before !== patched) {
        console.error(`Issue templates out of sync: ${path}`);
        console.error('Run: npm run issue-templates:sync');
        process.exit(1);
      }
    }
    console.log('Issue templates OK.');
    return;
  }

  for (const path of TEMPLATE_FILES) {
    await syncFile(path, packOptions, conceptOptions, tokenCount);
    console.log(`Synced ${path.replace(root + '/', '')}`);
  }
  console.log(`Packs: ${packOptions.length - 1}; concept dropdown: ${conceptOptions.length - 1} (+ Other); tokens: ${tokenCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
