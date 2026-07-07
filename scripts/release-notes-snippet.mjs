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

function sectionBullets(changelog, version, heading) {
  const escaped = version.replace(/\./g, '\\.');
  let block = null;
  const dated = new RegExp(`## \\[${escaped}\\][^#]*?(### ${heading}\\s*\\n)([\\s\\S]*?)(?=\\n### |\\n## |$)`);
  const datedMatch = changelog.match(dated);
  if (datedMatch) {
    block = datedMatch[2];
  } else {
    const unreleased = new RegExp(`## \\[Unreleased\\][\\s\\S]*?(### ${heading}\\s*\\n)([\\s\\S]*?)(?=\\n### |\\n## |$)`);
    const unreleasedMatch = changelog.match(unreleased);
    if (unreleasedMatch) block = unreleasedMatch[2];
  }
  if (!block) return [];
  return block
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
