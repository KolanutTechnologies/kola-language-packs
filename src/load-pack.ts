import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CoverageSummary,
  GlossTierMap,
  KeywordConfidence,
  KeywordValue,
  LanguagePack,
  PackIndex,
  PublishedKeywordMap,
  ResolvedGlossTier,
  ResolvedKeyword,
} from './types.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const PACK_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function assertValidPackName(name: string): void {
  if (!PACK_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid pack name: "${name}"`);
  }
}

/** Normalize string | string[] | { phrases, confidence? } to phrase list + optional confidence. */
export function keywordParts(value: KeywordValue): { phrases: string[]; confidence?: KeywordConfidence } {
  if (typeof value === 'string') {
    return { phrases: [value] };
  }
  if (Array.isArray(value)) {
    return { phrases: [...value] };
  }
  const phrases =
    typeof value.phrases === 'string' ? [value.phrases] : [...value.phrases];
  return { phrases, confidence: value.confidence };
}

export function getPacksRoot(): string {
  return join(rootDir, 'packs');
}

export async function listPackNames(): Promise<string[]> {
  const indexPath = join(getPacksRoot(), 'index.json');
  const raw = await readFile(indexPath, 'utf8');
  const index = JSON.parse(raw) as PackIndex;
  return index.packs.map((pack) => pack.name);
}

export async function loadPack(name: string): Promise<LanguagePack> {
  assertValidPackName(name);
  const packPath = join(getPacksRoot(), name, 'pack.json');
  const raw = await readFile(packPath, 'utf8');
  return JSON.parse(raw) as LanguagePack;
}

type GlossTierName = 'glossary' | 'placeholders' | 'commonLiterals';

function tierFileName(tier: GlossTierName) {
  if (tier === 'commonLiterals') return 'common-literals.json';
  return `${tier}.json`;
}

async function loadOptionalTier(name: string, tier: GlossTierName): Promise<GlossTierMap | undefined> {
  assertValidPackName(name);
  const tierPath = join(getPacksRoot(), name, tierFileName(tier));
  try {
    const raw = await readFile(tierPath, 'utf8');
    return JSON.parse(raw) as GlossTierMap;
  } catch {
    return undefined;
  }
}

export async function loadGlossary(name: string): Promise<GlossTierMap | undefined> {
  return loadOptionalTier(name, 'glossary');
}

export async function loadPlaceholders(name: string): Promise<GlossTierMap | undefined> {
  return loadOptionalTier(name, 'placeholders');
}

export async function loadCommonLiterals(name: string): Promise<GlossTierMap | undefined> {
  return loadOptionalTier(name, 'commonLiterals');
}

/** Generated runtime map: native phrases plus code-derived English fallbacks. */
export async function loadPublishedKeywords(name: string): Promise<PublishedKeywordMap> {
  assertValidPackName(name);
  const keywordsPath = join(getPacksRoot(), name, 'keywords.json');
  const raw = await readFile(keywordsPath, 'utf8');
  return JSON.parse(raw) as PublishedKeywordMap;
}

/** Latest coverage report including per-pack ambiguousForms for reverse gloss. */
export async function loadCoverageSummary(): Promise<CoverageSummary> {
  const summaryPath = join(getPacksRoot(), 'coverage-summary.json');
  const raw = await readFile(summaryPath, 'utf8');
  return JSON.parse(raw) as CoverageSummary;
}

export function resolveKeywords(pack: LanguagePack): ResolvedKeyword[] {
  return Object.entries(pack.keywords).map(([logical, value]) => {
    const { phrases, confidence } = keywordParts(value);
    return { logical, phrases, ...(confidence ? { confidence } : {}) };
  });
}

export function resolveGlossTier(tier: GlossTierMap): ResolvedGlossTier[] {
  return Object.entries(tier).map(([key, value]) => ({
    key,
    phrases: Array.isArray(value) ? value : [value],
  }));
}

/** Author/source view from `pack.json` (pure translations; no generated English fallbacks). */
export function flattenKeywords(
  pack: LanguagePack,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [logical, value] of Object.entries(pack.keywords)) {
    out[logical] = keywordParts(value).phrases;
  }
  return out;
}

export function flattenGlossTier(tier: GlossTierMap): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(tier)) {
    out[key] = Array.isArray(value) ? value : [value];
  }
  return out;
}
