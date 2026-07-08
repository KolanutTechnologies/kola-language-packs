import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const README_PATH = join(root, 'README.md');
const COVERAGE_PATH = join(root, 'packs', 'coverage-summary.json');
const ROADMAP_PATH = join(root, 'packs', 'languages-roadmap.json');
const TOKENS_PATH = join(root, 'packs', 'logical-tokens.json');
const OFFICIAL_PATH = join(root, 'packs', 'official-target-keywords.json');

const MARKERS = {
  badges: ['<!-- badges:start -->', '<!-- badges:end -->'],
  metrics: ['<!-- metrics:start -->', '<!-- metrics:end -->'],
  whatsInRepo: ['<!-- whats-in-repo:start -->', '<!-- whats-in-repo:end -->'],
  introTargets: ['<!-- intro-targets:start -->', '<!-- intro-targets:end -->'],
  coverageTable: ['<!-- coverage-table:start -->', '<!-- coverage-table:end -->'],
  coverageFootnote: ['<!-- coverage-footnote:start -->', '<!-- coverage-footnote:end -->'],
  specSourcesTable: ['<!-- spec-sources-table:start -->', '<!-- spec-sources-table:end -->'],
  shippedHeading: ['<!-- shipped-languages-heading:start -->', '<!-- shipped-languages-heading:end -->'],
  shippedList: ['<!-- shipped-languages-list:start -->', '<!-- shipped-languages-list:end -->'],
  codeExample: ['<!-- code-example-stats:start -->', '<!-- code-example-stats:end -->'],
  roadmapBullets: ['<!-- roadmap-bullets:start -->', '<!-- roadmap-bullets:end -->'],
  upcomingPacks: ['<!-- upcoming-packs:start -->', '<!-- upcoming-packs:end -->'],
  faqTargetCount: ['<!-- faq-target-count:start -->', '<!-- faq-target-count:end -->'],
};

const TARGET_LABELS = {
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  kotlin: 'Kotlin',
  swift: 'Swift',
  dart: 'Dart',
  ruby: 'Ruby',
  php: 'PHP',
  r: 'R',
  clojure: 'Clojure',
  lua: 'Lua',
  sql: 'SQL',
  scala: 'Scala',
  elixir: 'Elixir',
};

const REGION_SECTION_ORDER = [
  'West Africa',
  'East Africa',
  'Central Africa',
  'Horn of Africa',
  'North / East Africa',
  'Southern Africa',
  'Indian Ocean',
];

const REGION_TO_SECTION = {
  'West Africa': 'West Africa',
  'East Africa': 'East Africa',
  'Central Africa': 'Central Africa',
  'Horn of Africa': 'Horn of Africa',
  'North Africa': 'North / East Africa',
  'Southern Africa': 'Southern Africa',
  'Indian Ocean': 'Indian Ocean',
};

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

function formatOxfordList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function primaryCountryFromLocale(locale) {
  const part = locale.split('-')[1];
  return part ? part.toUpperCase() : 'UN';
}

function countryToTwemojiSvg(country) {
  const upper = country.toUpperCase();
  if (upper.length !== 2) {
    return 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg';
  }
  const cp1 = 0x1f1e6 + upper.charCodeAt(0) - 65;
  const cp2 = 0x1f1e6 + upper.charCodeAt(1) - 65;
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp1.toString(16)}-${cp2.toString(16)}.svg`;
}

function buildBadgesBlock({ shippedPacks, shippedTargets, tokenCount }) {
  const [start, end] = MARKERS.badges;
  return [
    start,
    '',
    '[![npm](https://img.shields.io/npm/v/%40kolanut%2Flanguage-packs)](https://www.npmjs.com/package/@kolanut/language-packs)',
    `[![African language packs](https://img.shields.io/badge/African%20language%20packs-${shippedPacks}-gold)](./packs/coverage-summary.json)`,
    `[![Programming targets](https://img.shields.io/badge/Programming%20targets-${shippedTargets}-blue)](./packs/coverage-summary.json)`,
    `[![Logical tokens](https://img.shields.io/badge/Logical%20tokens-${tokenCount}-lightgrey)](./packs/logical-tokens.json)`,
    '[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)',
    '',
    end,
  ].join('\n');
}

function buildMetricsBlock({ shippedPacks, plannedPacks, shippedTargets, plannedTargets, tokenCount, gapCount }) {
  const [start, end] = MARKERS.metrics;
  return [
    start,
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
    end,
  ].join('\n');
}

function buildWhatsInRepoBlock({ shippedPacks, tokenCount }) {
  return [
    `- **${shippedPacks} shipped African language packs** (and a roadmap for more)`,
    `- **${tokenCount} logical tokens** that every pack maps (shared across all programming targets)`,
  ].join('\n');
}

function buildIntroTargetsBlock({ targetIds }) {
  const labels = targetIds.map((id) => TARGET_LABELS[id] ?? id);
  return `Language packs for African-language programming: a consistent set of **logical programming concepts**, mapped to **native-language phrases**, with enough structure for tools to transpile to **${formatOxfordList(labels)}**.`;
}

function buildCoverageTable({ targetIds, perTarget }) {
  const lines = [
    '| Target | Spec keywords | Mapped | Gaps | Score |',
    '|--------|-------------:|-------:|-----:|------:|',
  ];

  for (const id of targetIds) {
    const row = perTarget[id];
    if (!row) throw new Error(`Missing coverage row for target: ${id}`);
    const label = TARGET_LABELS[id] ?? id;
    const specCol =
      id === 'typescript' ? `${row.officialKeywordCount} tracked†` : String(row.officialKeywordCount);
    const mapped = row.mappedCount + row.structuralCount;
    const score = row.gapCount === 0 ? '100%' : '—';
    lines.push(`| ${label} | ${specCol} | ${mapped} | ${row.gapCount} | ${score} |`);
  }

  return lines.join('\n');
}

function buildCoverageFootnote({ hasTypeScript }) {
  if (!hasTypeScript) return '';
  return '†TypeScript has no single official keyword count in the Handbook; the tracked count is our reserved/modifier + type-keyword set for coverage (see notes in `official-target-keywords.json`).';
}

function buildSpecSourcesTable({ targetIds, perTarget, sources }) {
  const lines = [
    '| Target | Spec keywords | Spec source |',
    '|--------|-------------:|------------|',
  ];

  for (const id of targetIds) {
    const row = perTarget[id];
    const source = sources[id];
    if (!row || !source) throw new Error(`Missing spec source for target: ${id}`);
    const label = TARGET_LABELS[id] ?? id;
    const specCol =
      id === 'typescript' ? `${row.officialKeywordCount} tracked†` : String(row.officialKeywordCount);
    lines.push(`| ${label} | ${specCol} | [${source.name}](${source.url}) |`);
  }

  return lines.join('\n');
}

function buildShippedLanguagesHeading({ shippedPacks }) {
  return `## Languages shipped (${shippedPacks})`;
}

function buildShippedLanguagesList({ africanLanguages }) {
  const bySection = new Map();
  for (const section of REGION_SECTION_ORDER) {
    bySection.set(section, []);
  }

  for (const pack of africanLanguages) {
    const region = pack.regions?.[0] ?? 'West Africa';
    const section = REGION_TO_SECTION[region] ?? region;
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section).push(pack);
  }

  const lines = [];
  for (const section of REGION_SECTION_ORDER) {
    const packs = bySection.get(section) ?? [];
    if (packs.length === 0) continue;
    packs.sort((a, b) => (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name));
    lines.push(`**${section}**`);
    for (const pack of packs) {
      const country = primaryCountryFromLocale(pack.locale);
      const flagUrl = countryToTwemojiSvg(country);
      const title = pack.displayName ?? pack.name;
      lines.push(
        `- <img alt="${country}" src="${flagUrl}" width="16" height="16" /> ${title} (\`${pack.locale}\`)`,
      );
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
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

function buildRoadmapBullets({ plannedPacks, plannedTargets, tokenCount, shippedTargets, plannedTargetNames }) {
  const plannedTargetsText =
    plannedTargetNames.length > 0
      ? plannedTargetNames.map((t) => TARGET_LABELS[t] ?? t).join(', ')
      : 'none listed';
  return [
    `- **Planned African languages** (by region + priority) — ${plannedPacks} more packs on the list`,
    `- **Planned programming targets** — ${plannedTargetsText} (see [\`packs/ROADMAP.md\`](./packs/ROADMAP.md))`,
    `- **Logical tokens** — **${tokenCount} shipped**; stdlib / builtins tier → **2.0.0** (design-first; not required for beginner keyword transpilation)`,
    `- **Programming targets** — **${shippedTargets} shipped** with 0 keyword coverage gaps (see table above)`,
  ].join('\n');
}

function buildUpcomingPacks({ roadmapPlanned, shippedNames }) {
  const shipped = new Set(shippedNames);
  const upcoming = roadmapPlanned.filter((entry) => !shipped.has(entry.name));
  if (upcoming.length === 0) {
    return '_No high-priority upcoming packs listed — see the full roadmap JSON._';
  }

  const high = upcoming.filter((entry) => entry.priority === 'high').slice(0, 6);
  const lines = high.map((entry) => {
    const region = entry.regions?.[0] ?? 'Africa';
    const title = entry.name.replace(/-/g, ' ');
    return `- ${region}: ${title} (\`${entry.locale}\`)`;
  });

  if (lines.length === 0) {
    return '_See [`packs/languages-roadmap.json`](./packs/languages-roadmap.json) for the full planned list._';
  }

  return lines.join('\n');
}

function buildFaqTargetCount({ shippedTargets }) {
  return `It's exhaustive for **this project's current scope**: a shared registry of **logical concepts** needed to map official reserved keywords across **${shippedTargets} programming targets** (plus a small set of "structural" concepts).`;
}

function applyInlineTokenCounts(text, { shippedPacks, tokenCount }) {
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
    /These are the \d+ packs currently shipped\./,
    `These are the ${shippedPacks} packs currently shipped.`,
  );
  return updated;
}

export async function loadReadmeStats() {
  const [coverageRaw, roadmapRaw, tokensRaw, officialRaw] = await Promise.all([
    readFile(COVERAGE_PATH, 'utf8'),
    readFile(ROADMAP_PATH, 'utf8'),
    readFile(TOKENS_PATH, 'utf8'),
    readFile(OFFICIAL_PATH, 'utf8'),
  ]);

  const coverage = JSON.parse(coverageRaw);
  const roadmap = JSON.parse(roadmapRaw);
  const tokens = JSON.parse(tokensRaw);
  const official = JSON.parse(officialRaw);

  const shippedPacks = mustNumber(coverage.africanLanguagePackCount, 'coverage.africanLanguagePackCount');
  const targetIds = Array.isArray(coverage.transpileTargets) ? coverage.transpileTargets : [];
  const shippedTargets = targetIds.length;
  const tokenCount = mustNumber(coverage.logicalTokenCount, 'coverage.logicalTokenCount');

  const plannedPacks = mustNumber(roadmap.plannedCount, 'roadmap.plannedCount');
  const plannedTargets = Array.isArray(roadmap.programmingTargets?.planned)
    ? roadmap.programmingTargets.planned.length
    : 0;
  const plannedTargetNames = roadmap.programmingTargets?.planned ?? [];

  const tokenCountFromRegistry = Array.isArray(tokens.tokens) ? tokens.tokens.length : tokenCount;
  if (tokenCountFromRegistry !== tokenCount) {
    throw new Error(`Token count mismatch: coverage=${tokenCount}, registry=${tokenCountFromRegistry}`);
  }

  const gapCount = Object.values(coverage.perTarget ?? {}).reduce(
    (sum, t) => sum + (typeof t?.gapCount === 'number' ? t.gapCount : 0),
    0,
  );

  const shippedNames = (coverage.africanLanguages ?? []).map((p) => p.name);

  return {
    shippedPacks,
    plannedPacks,
    shippedTargets,
    plannedTargets,
    plannedTargetNames,
    tokenCount,
    gapCount,
    targetIds,
    perTarget: coverage.perTarget ?? {},
    sources: official.sources ?? {},
    africanLanguages: coverage.africanLanguages ?? [],
    roadmapPlanned: roadmap.planned ?? [],
    shippedNames,
  };
}

export function updateReadmeContent(readme, stats) {
  let updated = readme;

  updated = replaceMarkedSection(
    updated,
    ...MARKERS.badges,
    buildBadgesBlock(stats),
  );
  updated = replaceMarkedSection(
    updated,
    ...MARKERS.metrics,
    buildMetricsBlock(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.whatsInRepo,
    buildWhatsInRepoBlock(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.introTargets,
    buildIntroTargetsBlock(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.coverageTable,
    buildCoverageTable(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.coverageFootnote,
    buildCoverageFootnote({ hasTypeScript: stats.targetIds.includes('typescript') }),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.specSourcesTable,
    buildSpecSourcesTable(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.shippedHeading,
    buildShippedLanguagesHeading(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.shippedList,
    buildShippedLanguagesList(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.codeExample,
    buildCodeExampleBlock(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.roadmapBullets,
    buildRoadmapBullets(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.upcomingPacks,
    buildUpcomingPacks(stats),
  );
  updated = replaceMarkedInner(
    updated,
    ...MARKERS.faqTargetCount,
    buildFaqTargetCount(stats),
  );

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
