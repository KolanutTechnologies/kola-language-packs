/**
 * Direct release on push to main (no Release PR).
 *
 * CI: node scripts/direct-release.mjs
 * Local preview: node scripts/direct-release.mjs --dry-run
 * End of every releasable build: node scripts/direct-release.mjs (updates package.json)
 */
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const isCI = process.env.GITHUB_ACTIONS === 'true';

function runGit(args) {
  return execSync(['git', ...args].join(' '), { cwd: root, encoding: 'utf8' }).trim();
}

function nextVersion(current, kind) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) throw new Error(`Unsupported version: ${current}`);
  let [major, minor, patch] = match.slice(1).map(Number);
  if (kind === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function parseCommitBump(subject, body = '') {
  const text = `${subject}\n${body}`;
  if (/^[\w]+!(\(|:)/.test(subject) || /BREAKING CHANGE:/i.test(text)) return 'major';
  const type = subject.match(/^(\w+)(?:\([^)]*\))?!?:/)?.[1]?.toLowerCase();
  if (type === 'feat') return 'minor';
  if (type === 'fix') return 'patch';
  return null;
}

function classifyCommitsSince(ref) {
  const raw = runGit(['log', `${ref}..HEAD`, '--format=%H%x1f%s%x1f%b%x1e']);
  if (!raw) return null;
  const entries = raw.split('\x1e').filter(Boolean);
  let bump = null;
  for (const entry of entries) {
    const [sha, subject, body] = entry.split('\x1f');
    if (!sha || !subject) continue;
    if (/^chore\(release\):/i.test(subject)) continue;
    const kind = parseCommitBump(subject, body ?? '');
    if (kind === 'major') return 'major';
    if (kind === 'minor') bump = bump === 'patch' ? 'minor' : bump ?? 'minor';
    if (kind === 'patch' && bump !== 'minor') bump = 'patch';
  }
  return bump;
}

function extractUnreleased(changelog) {
  const match = changelog.match(/## \[Unreleased\]\s*\n([\s\S]*?)(?=\n## \[|\n\[Unreleased\]:|$)/);
  if (!match) return '';
  return match[1].trim();
}

function hasReleaseNotes(unreleasedBody) {
  return /### (Added|Changed|Fixed|Removed|Deprecated|Security)\s*\n(?:- |\n)/.test(unreleasedBody);
}

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function hasChangelogSection(changelog, version) {
  return new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\]`).test(changelog);
}

function tagExists(version) {
  try {
    runGit(['rev-parse', `v${version}`]);
    return true;
  } catch {
    return false;
  }
}

async function writeReleaseBody(version) {
  const notes = spawnSync(process.execPath, ['scripts/release-notes-snippet.mjs', version], {
    cwd: root,
    encoding: 'utf8',
  });
  if (notes.status !== 0) process.exit(notes.status ?? 1);
  await writeFile(join(root, 'release-body.md'), notes.stdout, 'utf8');
}

function applyChangelogRelease(changelog, version, unreleasedBody, date) {
  const footerMatch = changelog.match(/(\n\[(?:Unreleased|\d+\.\d+\.\d+)\]:[^\n]*\n?[\s\S]*)$/);
  const footer = footerMatch ? footerMatch[1] : '';
  const beforeFooter = footerMatch ? changelog.slice(0, footerMatch.index) : changelog;

  const withoutUnreleased = beforeFooter.replace(
    /## \[Unreleased\]\s*\n[\s\S]*?(?=\n## \[)/,
    '## [Unreleased]\n\n',
  );

  const newSection = `## [${version}] - ${date}\n\n${unreleasedBody}\n\n`;
  const inserted = withoutUnreleased.replace('## [Unreleased]\n\n', `## [Unreleased]\n\n${newSection}`);

  const repo = 'KolanutTechnologies/kola-language-packs';
  let newFooter = footer
    .replace(/\[Unreleased\]:[^\n]*/, `[Unreleased]: https://github.com/${repo}/compare/v${version}...HEAD`)
    .replace(new RegExp(`\\[${version.replace(/\./g, '\\.')}\\]:[^\\n]*\\n?`), '');
  if (!newFooter.includes(`[${version}]:`)) {
    newFooter = `\n[${version}]: https://github.com/${repo}/releases/tag/v${version}${newFooter}`;
  }

  return inserted.trimEnd() + '\n' + newFooter.trimStart();
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

async function main() {
  const headSubject = runGit(['log', '-1', '--format=%s']);
  if (/^chore\(release\):/i.test(headSubject)) {
    console.log('Skip: HEAD is already a release commit.');
    await setOutput('released', 'false');
    return;
  }

  let lastTag;
  try {
    lastTag = runGit(['describe', '--tags', '--abbrev=0', '--match=v*']);
  } catch {
    console.log('No tags found — skip release.');
    await setOutput('released', 'false');
    return;
  }

  const lastTagVersion = lastTag.replace(/^v/, '');
  const changelogPath = join(root, 'CHANGELOG.md');
  const changelog = await readFile(changelogPath, 'utf8');
  const manifestPath = join(root, '.release-please-manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const pkgPath = join(root, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  const pkgVersion = pkg.version;

  // Local build already prepared this version; CI only tags and publishes.
  if (
    compareSemver(pkgVersion, lastTagVersion) > 0 &&
    hasChangelogSection(changelog, pkgVersion) &&
    !tagExists(pkgVersion)
  ) {
    console.log(`Prepared release v${pkgVersion} (package.json ahead of ${lastTag}); ready to tag.`);
    if (!dryRun) await writeReleaseBody(pkgVersion);
    await setOutput('released', 'true');
    await setOutput('version', pkgVersion);
    await setOutput('tag_only', 'true');
    return;
  }

  if (tagExists(pkgVersion) && compareSemver(pkgVersion, lastTagVersion) > 0) {
    console.log(`Skip: v${pkgVersion} tag already exists.`);
    await setOutput('released', 'false');
    return;
  }

  const bump = classifyCommitsSince(lastTag);
  if (!bump) {
    console.log(`Skip: no feat/fix commits since ${lastTag}.`);
    await setOutput('released', 'false');
    return;
  }

  const next = nextVersion(lastTagVersion, bump);
  const unreleasedBody = extractUnreleased(changelog);
  if (!hasReleaseNotes(unreleasedBody)) {
    console.log('Skip: [Unreleased] has no changelog bullets.');
    await setOutput('released', 'false');
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const newChangelog = applyChangelogRelease(changelog, next, unreleasedBody, date);

  console.log(`Release ${lastTagVersion} → ${next} (${bump}) since ${lastTag}`);

  if (dryRun) {
    console.log('Dry run: no files written.');
    await setOutput('released', 'true');
    await setOutput('version', next);
    return;
  }

  pkg.version = next;
  await writeJson(pkgPath, pkg);
  manifest['.'] = next;
  await writeJson(manifestPath, manifest);
  await writeFile(changelogPath, newChangelog, 'utf8');

  const sync = spawnSync(process.execPath, ['scripts/sync-pack-versions.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (sync.status !== 0) process.exit(sync.status ?? 1);

  const readme = spawnSync(process.execPath, ['scripts/update-readme-metrics.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (readme.status !== 0) process.exit(readme.status ?? 1);

  await writeReleaseBody(next);

  await setOutput('released', 'true');
  await setOutput('version', next);
  console.log(`Prepared v${next}; release-body.md written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
