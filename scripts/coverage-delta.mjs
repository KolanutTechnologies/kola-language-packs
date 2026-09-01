/**
 * Coverage delta reporter (plan item 1.5).
 *
 * Compares current per-pack translation coverage against a git ref's
 * coverage-summary.json and prints a monotonic-progress table.
 *
 * Usage:
 *   node scripts/coverage-delta.mjs [baseRef]     (default: HEAD)
 *
 * In CI (pull_request): GITHUB_BASE_REF is used automatically and the table
 * is appended to $GITHUB_STEP_SUMMARY. Informational only — never fails.
 */
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePackCoverage } from './lib/pack-coverage.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

const baseRef =
  process.argv[2] || process.env.GITHUB_BASE_REF || 'HEAD';

function loadBaseCoverage(ref) {
  try {
    const raw = execFileSync('git', ['show', `${ref}:packs/coverage-summary.json`], {
      cwd: root,
      encoding: 'utf8',
    });
    return JSON.parse(raw).packCoverage ?? {};
  } catch {
    return null;
  }
}

function fmt(n) {
  return `${n}%`;
}

async function main() {
  const registry = JSON.parse(await readFile(join(packsRoot, 'logical-tokens.json'), 'utf8'));
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));

  const current = {};
  for (const p of index.packs) {
    const pack = JSON.parse(await readFile(join(packsRoot, p.name, 'pack.json'), 'utf8'));
    current[p.name] = computePackCoverage(pack.keywords, registry);
  }

  const base = loadBaseCoverage(baseRef);
  const lines = [];
  let improved = 0;
  let regressed = 0;

  for (const [name, now] of Object.entries(current)) {
    const before = base?.[name];
    if (!before) {
      lines.push(`| ${name} | — | ${fmt(now.fullPct)} | new pack (${now.translatedFull}/${now.totalFull}) |`);
      continue;
    }
    const dTokens = now.translatedFull - before.translatedFull;
    if (now.fullPct === before.fullPct && dTokens === 0) continue;
    if (dTokens > 0) improved += 1;
    if (dTokens < 0) regressed += 1;
    const arrow = dTokens > 0 ? '↑' : dTokens < 0 ? '↓' : '→';
    lines.push(
      `| ${name} | ${fmt(before.fullPct)} | ${fmt(now.fullPct)} ${arrow} | ${dTokens >= 0 ? '+' : ''}${dTokens} token(s) |`,
    );
  }

  const header = [
    '| Pack | Before | After | Change |',
    '|------|-------:|------:|--------|',
  ];
  const summaryLine = base
    ? `Coverage delta vs ${baseRef}: ${improved} pack(s) improved, ${regressed} regressed, ` +
      `${Object.keys(current).length - improved - regressed} unchanged/new.`
    : `No baseline found at ${baseRef} — showing nothing to compare.`;

  const table = [summaryLine, '', ...header, ...lines].join('\n');
  console.log(table);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('node:fs/promises');
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, table + '\n', 'utf8');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
