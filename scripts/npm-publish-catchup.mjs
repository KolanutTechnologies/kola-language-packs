/**
 * CI: publish to npm when latest git tag is ahead of registry latest.
 * Used when a tag exists but npm publish failed or was skipped.
 */
import { appendFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

async function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

function latestTagVersion() {
  try {
    return run('git describe --tags --abbrev=0 --match=v*').replace(/^v/, '');
  } catch {
    return null;
  }
}

function npmLatestVersion() {
  try {
    return run('npm view @kolanut/language-packs version');
  } catch {
    return null;
  }
}

const tagVersion = latestTagVersion();
if (!tagVersion) {
  console.log('Skip: no v* tags found.');
  await setOutput('publish', 'false');
  process.exit(0);
}

const npmVersion = npmLatestVersion();
console.log(`Latest tag: v${tagVersion}; npm latest: ${npmVersion ?? '(none)'}`);

if (!npmVersion || compareSemver(tagVersion, npmVersion) > 0) {
  console.log(`Catch-up publish: v${tagVersion}`);
  await setOutput('publish', 'true');
  await setOutput('version', tagVersion);
} else {
  console.log('Skip: npm is up to date with latest tag.');
  await setOutput('publish', 'false');
}
