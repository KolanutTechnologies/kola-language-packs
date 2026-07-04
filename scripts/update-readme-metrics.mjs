import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const README_PATH = join(root, 'README.md');
const COVERAGE_PATH = join(root, 'packs', 'coverage-summary.json');
const ROADMAP_PATH = join(root, 'packs', 'languages-roadmap.json');
const TOKENS_PATH = join(root, 'packs', 'logical-tokens.json');
const BADGES_DIR = join(root, 'badges');

const START = '<!-- metrics:start -->';
const END = '<!-- metrics:end -->';

function mustNumber(value, name) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Expected number for ${name}`);
  }
  return value;
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

function badge({ label, message, color }) {
  return {
    schemaVersion: 1,
    label,
    message,
    color,
  };
}

async function writeBadges({ shippedPacks, shippedTargets, plannedPacks, plannedTargets, tokenCount, gapCount }) {
  await mkdir(BADGES_DIR, { recursive: true });

  const badges = {
    'packs.json': badge({
      label: 'packs',
      message: `${shippedPacks} shipped (+${plannedPacks})`,
      color: '#2563eb',
    }),
    'targets.json': badge({
      label: 'targets',
      message: `${shippedTargets} shipped (+${plannedTargets})`,
      color: '#7c3aed',
    }),
    'tokens.json': badge({
      label: 'logical tokens',
      message: `${tokenCount}`,
      color: '#0ea5e9',
    }),
    'coverage.json': badge({
      label: 'coverage',
      message: gapCount === 0 ? '0 gaps' : `${gapCount} gap(s)`,
      color: gapCount === 0 ? '#16a34a' : '#dc2626',
    }),
  };

  await Promise.all(
    Object.entries(badges).map(([name, json]) =>
      writeFile(join(BADGES_DIR, name), JSON.stringify(json, null, 2) + '\n', 'utf8'),
    ),
  );
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

  const block = buildMetricsBlock({
    shippedPacks,
    plannedPacks,
    shippedTargets,
    plannedTargets,
    tokenCount,
    gapCount,
  });

  await writeBadges({
    shippedPacks,
    plannedPacks,
    shippedTargets,
    plannedTargets,
    tokenCount,
    gapCount,
  });

  const hasMarkers = readme.includes(START) && readme.includes(END);
  let updated;
  if (hasMarkers) {
    const startIdx = readme.indexOf(START);
    const endIdx = readme.indexOf(END);
    if (startIdx > endIdx) throw new Error('metrics markers out of order');
    updated = readme.slice(0, startIdx).trimEnd() + '\n\n' + block + '\n' + readme.slice(endIdx + END.length).trimStart();
  } else {
    // First-time install: insert right after “What’s in this repo” section header block.
    const anchor = 'The data lives under [`packs/`](./packs/). The package published to npm is `@kolanut/language-packs`.';
    const i = readme.indexOf(anchor);
    if (i === -1) throw new Error('Could not find insertion anchor in README');
    const insertAt = i + anchor.length;
    updated = readme.slice(0, insertAt) + '\n\n' + block + '\n' + readme.slice(insertAt);
  }

  await writeFile(README_PATH, updated, 'utf8');
  // eslint-disable-next-line no-console
  console.log('README metrics updated (and badges written).');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

