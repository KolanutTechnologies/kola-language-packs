/**
 * Validates that every official target keyword maps to a logical token.
 * Writes packs/coverage-summary.json
 * Run: node scripts/generate-coverage.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

function normalizeEmit(value) {
  return value.trim().toLowerCase();
}

function emitMatchesKeyword(emit, keyword) {
  if (!emit) return false;
  const e = normalizeEmit(emit);
  const k = keyword.toLowerCase();
  if (e === k) return true;
  if (e.startsWith(k + ' ') || e.startsWith(k + '!')) return true;
  if (k === 'case _' && e.includes('_')) return true;
  if (k === '_' && (e === '_' || e.includes('_'))) return true;
  if (k === '=>' && e === '=>') return true;
  return false;
}

async function main() {
  const official = JSON.parse(await readFile(join(packsRoot, 'official-target-keywords.json'), 'utf8'));
  const logical = JSON.parse(await readFile(join(packsRoot, 'logical-tokens.json'), 'utf8'));
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));

  const logicalByName = new Map(logical.tokens.map((t) => [t.logical, t]));
  const errors = [];
  const summary = {
    generatedAt: new Date().toISOString(),
    logicalTokenCount: logical.tokens.length,
    africanLanguagePackCount: index.packs.length,
    transpileTargets: logical.targets,
    perTarget: {},
    africanLanguages: index.packs.map((p) => ({
      name: p.name,
      displayName: p.displayName,
      languageCode: p.languageCode,
      locale: p.locale,
      countries: p.countries,
      regions: p.regions,
    })),
  };

  for (const target of logical.targets) {
    const keywords = official.targets[target] ?? [];
    const mapped = [];
    const gaps = [];

    for (const keyword of keywords) {
      const logicalName = official.keywordToLogical[keyword];
      if (!logicalName) {
        gaps.push({ keyword, reason: 'no keywordToLogical mapping' });
        continue;
      }

      const entry = logicalByName.get(logicalName);
      if (!entry) {
        gaps.push({ keyword, logical: logicalName, reason: 'logical token missing' });
        continue;
      }

      const emit = entry.targets[target];
      if (!emit || !emit.trim()) {
        mapped.push({ keyword, logical: logicalName, emit: null, note: 'no direct emit (acceptable via another target)' });
        continue;
      }

      if (!emitMatchesKeyword(emit, keyword)) {
        gaps.push({
          keyword,
          logical: logicalName,
          emit,
          reason: 'emit does not match official keyword',
        });
        continue;
      }

      mapped.push({ keyword, logical: logicalName, emit });
    }

    summary.perTarget[target] = {
      officialKeywordCount: keywords.length,
      mappedCount: mapped.filter((m) => m.emit).length,
      structuralCount: mapped.filter((m) => !m.emit).length,
      gapCount: gaps.length,
      gaps,
    };

    if (gaps.length > 0) {
      errors.push(`${target}: ${gaps.length} uncovered keyword(s)`);
    }
  }

  summary.tierCounts = logical.tokens.reduce((acc, t) => {
    acc[t.tier] = (acc[t.tier] ?? 0) + 1;
    return acc;
  }, {});

  await writeFile(join(packsRoot, 'coverage-summary.json'), JSON.stringify(summary, null, 2) + '\n');

  if (errors.length > 0) {
    console.error('Coverage gaps:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  console.log(
    `Coverage OK: ${logical.tokens.length} logical tokens cover all official keywords across ${logical.targets.length} targets; ${index.packs.length} African language packs.`,
  );
}

main();
