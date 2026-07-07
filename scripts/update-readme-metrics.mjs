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

function mustNumber(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected number for ${name}`);
  }
  return value;
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

async function main() {
  const [readme, coverageRaw, roadmapRaw, tokensRaw] = await Promise.all([
    readFile(README_PATH, 'utf8'),
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

  const metricsBlock = buildMetricsBlock({
    shippedPacks,
    plannedPacks,
    shippedTargets,
    plannedTargets,
    tokenCount,
    gapCount,
  });

  const badgesBlock = buildBadgesBlock({
    shippedPacks,
    shippedTargets,
    tokenCount,
  });

  let updated = readme;

  if (updated.includes(BADGES_START) && updated.includes(BADGES_END)) {
    const startIdx = updated.indexOf(BADGES_START);
    const endIdx = updated.indexOf(BADGES_END);
    if (startIdx > endIdx) throw new Error('badge markers out of order');
    updated =
      updated.slice(0, startIdx).trimEnd() +
      '\n\n' +
      badgesBlock +
      '\n\n' +
      updated.slice(endIdx + BADGES_END.length).trimStart();
  } else {
    throw new Error('Could not find badge markers in README');
  }

  const hasMarkers = updated.includes(START) && updated.includes(END);
  if (hasMarkers) {
    const startIdx = updated.indexOf(START);
    const endIdx = updated.indexOf(END);
    if (startIdx > endIdx) throw new Error('metrics markers out of order');
    updated = updated.slice(0, startIdx).trimEnd() + '\n\n' + metricsBlock + '\n' + updated.slice(endIdx + END.length).trimStart();
  } else {
    // First-time install: insert right after “What’s in this repo” section header block.
    const anchor = 'The data lives under [`packs/`](./packs/). The package published to npm is `@kolanut/language-packs`.';
    const i = readme.indexOf(anchor);
    if (i === -1) throw new Error('Could not find insertion anchor in README');
    const insertAt = i + anchor.length;
    updated = updated.slice(0, insertAt) + '\n\n' + metricsBlock + '\n' + updated.slice(insertAt);
  }

  await writeFile(README_PATH, updated, 'utf8');
  // eslint-disable-next-line no-console
  console.log('README metrics updated.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

