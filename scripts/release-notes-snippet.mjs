/**
 * Prints the stats line and full GitHub release notes skeleton for copy-paste.
 * Run after npm test / generate-coverage: node scripts/release-notes-snippet.mjs [version]
 *
 * Version defaults to package.json. Pass explicit semver to preview a future release.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function gapCount(coverage) {
  return Object.values(coverage.perTarget ?? {}).reduce(
    (sum, t) => sum + (typeof t?.gapCount === 'number' ? t.gapCount : 0),
    0,
  );
}

function extractVersionBody(changelog, version) {
  if (version === 'Unreleased') {
    const match = changelog.match(/## \[Unreleased\]\s*\n([\s\S]*?)(?=\n## \[|$)/);
    return match ? match[1] : '';
  }
  const escaped = version.replace(/\./g, '\\.');
  const match = changelog.match(new RegExp(`## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=\\n## \\[|$)`));
  return match ? match[1] : '';
}

function sectionBullets(changelog, version, heading) {
  let body = extractVersionBody(changelog, version);
  if (!body.trim() && version !== 'Unreleased') {
    body = extractVersionBody(changelog, 'Unreleased');
  }
  const headingMatch = body.match(new RegExp(`### ${heading}\\s*\\n([\\s\\S]*?)(?=\\n### |$)`));
  if (!headingMatch) return [];
  return headingMatch[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2));
}

async function main() {
  const pkg = await readJson(join(root, 'package.json'));
  const coverage = await readJson(join(root, 'packs', 'coverage-summary.json'));
  const changelog = await readFile(join(root, 'CHANGELOG.md'), 'utf8');

  const version = process.argv[2] ?? pkg.version;
  const tokens = coverage.logicalTokenCount;
  const packs = coverage.africanLanguagePackCount;
  const targets = coverage.transpileTargets?.length ?? 0;
  const gaps = gapCount(coverage);

  const stats = `${tokens} logical tokens · ${packs} African language packs · ${targets} programming targets · ${gaps} keyword gaps`;

  const added = sectionBullets(changelog, version, 'Added');
  const changed = sectionBullets(changelog, version, 'Changed');
  const fixed = sectionBullets(changelog, version, 'Fixed');

  const fmt = (items) => (items.length ? items.map((b) => `- ${b}`).join('\n') : '- _(none)_');

  console.log(
    [
      `## @kolanut/language-packs v${version}`,
      '',
      stats,
      '',
      '### Added',
      fmt(added),
      '',
      '### Changed',
      fmt(changed),
      '',
      '### Fixed',
      fmt(fixed),
      '',
      `**Install:** \`npm install @kolanut/language-packs@${version}\``,
    ].join('\n'),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
