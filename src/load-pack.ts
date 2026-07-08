import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GlossTierMap, LanguagePack, PackIndex, ResolvedGlossTier, ResolvedKeyword } from './types.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

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
  const packPath = join(getPacksRoot(), name, 'pack.json');
  const raw = await readFile(packPath, 'utf8');
  return JSON.parse(raw) as LanguagePack;
}

async function loadOptionalTier(name: string, fileName: keyof Pick<LanguagePack, 'glossary' | 'placeholders' | 'commonLiterals'>) {
  const tierPath = join(getPacksRoot(), name, tierFileName(fileName));
  try {
    const raw = await readFile(tierPath, 'utf8');
    return JSON.parse(raw) as GlossTierMap;
  } catch {
    return undefined;
  }
}

function tierFileName(tier: 'glossary' | 'placeholders' | 'commonLiterals') {
  if (tier === 'commonLiterals') return 'common-literals.json';
  return `${tier}.json`;
}

export async function loadGlossary(name: string): Promise<GlossTierMap | undefined> {
  const pack = await loadPack(name);
  return pack.glossary ?? (await loadOptionalTier(name, 'glossary'));
}

export async function loadPlaceholders(name: string): Promise<GlossTierMap | undefined> {
  const pack = await loadPack(name);
  return pack.placeholders ?? (await loadOptionalTier(name, 'placeholders'));
}

export async function loadCommonLiterals(name: string): Promise<GlossTierMap | undefined> {
  const pack = await loadPack(name);
  return pack.commonLiterals ?? (await loadOptionalTier(name, 'commonLiterals'));
}

export function resolveKeywords(pack: LanguagePack): ResolvedKeyword[] {
  return Object.entries(pack.keywords).map(([logical, value]) => ({
    logical,
    phrases: Array.isArray(value) ? value : [value],
  }));
}

export function resolveGlossTier(tier: GlossTierMap): ResolvedGlossTier[] {
  return Object.entries(tier).map(([key, value]) => ({
    key,
    phrases: Array.isArray(value) ? value : [value],
  }));
}

export function flattenKeywords(
  pack: LanguagePack,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [logical, value] of Object.entries(pack.keywords)) {
    out[logical] = Array.isArray(value) ? value : [value];
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
