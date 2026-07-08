import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const README_PATH = join(root, 'README.md');
const COVERAGE_PATH = join(root, 'packs', 'coverage-summary.json');
const ROADMAP_PATH = join(root, 'packs', 'languages-roadmap.json');
const TOKENS_PATH = join(root, 'packs', 'logical-tokens.json');

const START = '<!-- metrics:start -->';
const END = '<!-- metrics:end -->';
const BADGES_START = '<!-- badges:start -->';
const BADGES_END = '<!-- badges:end -->';
const WHATS_IN_REPO_START = '<!-- whats-in-repo:start -->';
const WHATS_IN_REPO_END = '<!-- whats-in-repo:end -->';
const SHIPPED_HEADING_START = '<!-- shipped-languages-heading:start -->';
const SHIPPED_HEADING_END = '<!-- shipped-languages-heading:end -->';
const CODE_EXAMPLE_START = '<!-- code-example-stats:start -->';
const CODE_EXAMPLE_END = '<!-- code-example-stats:end -->';

const checkOnly = process.argv.includes('--check');

function mustNumber(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected number for ${name}`);
  }
  return value;
}

function replaceMarkedSection(text, startMarker, endMarker, sectionText) {
  if (!text.includes(startMarker) || !text.includes(endMarker)) {
    throw new Error(`Could not find markers ${startMarker} / ${endMarker} in README`);
  }
  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);
  if (startIdx > endIdx) throw new Error(`Markers out of order: ${startMarker}`);
  return (
    text.slice(0, startIdx).trimEnd() +
    '\n\n' +
    sectionText +
    '\n\n' +
    text.slice(endIdx + endMarker.length).trimStart()
  );
}

function replaceMarkedInner(text, startMarker, endMarker, innerBody) {
  return replaceMarkedSection(text, startMarker, endMarker, [startMarker, innerBody, endMarker].join('\n'));
}

function buildBadgesBlock({ shippedPacks, shippedTargets, tokenCount }) {
  return [
    BADGES_START,
    '',
    '[![npm](https://img.shields.io/npm/v/%40kolanut%2Flanguage-packs)](https://www.npmjs.com/package/@kolanut/language-packs)',
    `[![African language packs](https://img.shields.io/badge/African%20language%20packs-${shippedPacks}-gold)](./packs/coverage-summary.json)`,
    `[![Programming targets](https://img.shields.io/badge/Programming%20targets-${shippedTargets}-blue)](./packs/coverage-summary.json)`,
    `[![Logical tokens](https://img.shields.io/badge/Logical%20tokens-${tokenCount}-lightgrey)](./packs/logical-tokens.json)`,
    '[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)',
    '',
    BADGES_END,
  ].join('\n');
}

function buildMetricsBlock({ shippedPacks, plannedPacks, shippedTargets, plannedTargets, tokenCount, gapCount }) {
  return [
    START,
    '',
    '## At a glance',
    '',
    '| What we cover | Shipped | Planned | Source of truth |',
    '|---|---:|---:|---|',
    `| **African language packs** | ${shippedPacks} | +${plannedPacks} | [\`packs/coverage-summary.json\`](./packs/coverage-summary.json) · [\`packs/languages-roadmap.json\`](./packs/languages-roadmap.json) |`,
    `| **Programming targets** | ${shippedTargets} | +${plannedTargets} | [\`packs/coverage-summary.json\`](./packs/coverage-summary.json) · [\`packs/languages-roadmap.json\`](./packs/languages-roadmap.json) |`,
    `| **Logical tokens** | ${tokenCount} | — | [\`packs/logical-tokens.json\`](./packs/logical-tokens.json) |`,
    `| **Keyword coverage gaps** | ${gapCount} | — | [\`packs/coverage-summary.json\`](./packs/coverage-summary.json) |`,
    '',
    END,
  ].join('\n');
}

function buildWhatsInRepoBlock({ shippedPacks, tokenCount }) {
  return [
    `- **${shippedPacks} shipped African language packs** (and a roadmap for more)`,
    `- **${tokenCount} logical tokens** that every pack maps (shared across all programming targets)`,
  ].join('\n');
}

function buildShippedLanguagesHeading({ shippedPacks }) {
  return `## Languages shipped (${shippedPacks})`;
}

function buildCodeExampleBlock({ shippedPacks, tokenCount }) {
  return [
    '```typescript',
    "import { listPackNames, loadPack, flattenKeywords } from '@kolanut/language-packs';",
    '',
    `const packs = await listPackNames(); // e.g. ${shippedPacks} packs`,
    '',
    "const yoruba = await loadPack('yoruba');",
    'const keywords = flattenKeywords(yoruba);',
    `// { IF: ['ṣé', 'if'], FOR: ['fun', 'for'], ... } — maps ${tokenCount} logical tokens`,
    '```',
  ].join('\n');
}

function applyInlineTokenCounts(text, { shippedPacks, shippedTargets, tokenCount }) {
  let updated = text;
  updated = updated.replace(
    /- \[`packs\/logical-tokens\.json`\]\(\.\/packs\/logical-tokens\.json\): the \d+-token registry \(the thing packs must fully map\)/,
    `- [\`packs/logical-tokens.json\`](./packs/logical-tokens.json): the ${tokenCount}-token registry (the thing packs must fully map)`,
  );
  updated = updated.replace(
    /\| `packs\/logical-tokens\.json` \| \*\*Read only\*\* — checklist of all \d+ concepts; do not edit for translations \|/,
    `| \`packs/logical-tokens.json\` | **Read only** — checklist of all ${tokenCount} concepts; do not edit for translations |`,
  );
  updated = updated.replace(
    /A valid contribution is a \*\*complete pack\*\* \(correct scope metadata \+ all \d+ tokens translated\), not a few word changes in isolation\./,
    `A valid contribution is a **complete pack** (correct scope metadata + all ${tokenCount} tokens translated), not a few word changes in isolation.`,
  );
  updated = updated.replace(
    /2\. \*\*Add a new pack\*\* — copy an existing pack, set all metadata \(`name`, `languageCode`, `locale`, `displayName`, `description`, …\), translate all \d+ tokens, add to `packs\/index\.json`, run `npm run registry`/,
    `2. **Add a new pack** — copy an existing pack, set all metadata (\`name\`, \`languageCode\`, \`locale\`, \`displayName\`, \`description\`, …), translate all ${tokenCount} tokens, add to \`packs/index.json\`, run \`npm run registry\``,
  );
  updated = updated.replace(
    /3\. Map every token listed in `packs\/logical-tokens\.json` \(\d+ total\)/,
    `3. Map every token listed in \`packs/logical-tokens.json\` (${tokenCount} total)`,
  );
  updated = updated.replace(
    /- \*\*Logical tokens\*\* — \*\*\d+ shipped\*\* \(20 C-only \+ 14 Java-only \+ `UNDERSCORE`; `GEN`, `LAZY` in v0\.2\.0\); stdlib tier → \*\*v2\.0\.0\*\*/,
    `- **Logical tokens** — **${tokenCount} shipped** (20 C-only + 14 Java-only + \`UNDERSCORE\`; \`GEN\`, \`LAZY\` in v0.2.0); stdlib tier → **v2.0.0**`,
  );
  updated = updated.replace(
    /- \*\*Programming targets\*\* — \*\*\d+ shipped\*\* \(C added in v0\.4\.0, Java in v0\.3\.0\); C\+\+ next → \*\*v0\.4\.0\+\*\*/,
    `- **Programming targets** — **${shippedTargets} shipped** (C added in v0.4.0, Java in v0.3.0); C++ next → **v0.4.0+**`,
  );
  updated = updated.replace(
    /These are the packs currently shipped in v0\.1\./,
    `These are the ${shippedPacks} packs currently shipped.`,
  );
  return updated;
}

export async function loadReadmeStats() {
  const [coverageRaw, roadmapRaw, tokensRaw] = await Promise.all([
    readFile(COVERAGE_PATH, 'utf8'),
    readFile(ROADMAP_PATH, 'utf8'),
    readFile(TOKENS_PATH, 'utf8'),
  ]);

  const coverage = JSON.parse(coverageRaw);
  const roadmap = JSON.parse(roadmapRaw);
  const tokens = JSON.parse(tokensRaw);

  const shippedPacks = mustNumber(coverage.africanLanguagePackCount, 'coverage.africanLanguagePackCount');
  const shippedTargets = Array.isArray(coverage.transpileTargets) ? coverage.transpileTargets.length : 0;
  const tokenCount = mustNumber(coverage.logicalTokenCount, 'coverage.logicalTokenCount');

  const plannedPacks = mustNumber(roadmap.plannedCount, 'roadmap.plannedCount');
  const plannedTargets = Array.isArray(roadmap.programmingTargets?.planned) ? roadmap.programmingTargets.planned.length : 0;

  const tokenCountFromRegistry = Array.isArray(tokens.tokens) ? tokens.tokens.length : tokenCount;
  if (tokenCountFromRegistry !== tokenCount) {
    throw new Error(`Token count mismatch: coverage=${tokenCount}, registry=${tokenCountFromRegistry}`);
  }

  const gapCount = Object.values(coverage.perTarget ?? {}).reduce(
    (sum, t) => sum + (typeof t?.gapCount === 'number' ? t.gapCount : 0),
    0,
  );

  return {
    shippedPacks,
    plannedPacks,
    shippedTargets,
    plannedTargets,
    tokenCount,
    gapCount,
  };
}

export function updateReadmeContent(readme, stats) {
  const badgesBlock = buildBadgesBlock(stats);
  const metricsBlock = buildMetricsBlock(stats);

  let updated = readme;

  updated = replaceMarkedSection(updated, BADGES_START, BADGES_END, badgesBlock);
  updated = replaceMarkedSection(updated, START, END, metricsBlock);
  updated = replaceMarkedInner(updated, WHATS_IN_REPO_START, WHATS_IN_REPO_END, buildWhatsInRepoBlock(stats));
  updated = replaceMarkedInner(
    updated,
    SHIPPED_HEADING_START,
    SHIPPED_HEADING_END,
    buildShippedLanguagesHeading(stats),
  );
  updated = replaceMarkedInner(updated, CODE_EXAMPLE_START, CODE_EXAMPLE_END, buildCodeExampleBlock(stats));
  updated = applyInlineTokenCounts(updated, stats);

  return updated;
}

async function main() {
  const [readme, stats] = await Promise.all([readFile(README_PATH, 'utf8'), loadReadmeStats()]);
  const updated = updateReadmeContent(readme, stats);

  if (updated === readme) {
    // eslint-disable-next-line no-console
    console.log('README already in sync.');
    return;
  }

  if (checkOnly) {
    // eslint-disable-next-line no-console
    console.error('README is out of sync with pack metrics. Run: npm run readme:sync');
    process.exit(1);
  }

  await writeFile(README_PATH, updated, 'utf8');
  // eslint-disable-next-line no-console
  console.log('README metrics updated.');
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
