import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LanguagePack, PackIndex, ResolvedKeyword } from './types.js';

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

export function resolveKeywords(pack: LanguagePack): ResolvedKeyword[] {
  return Object.entries(pack.keywords).map(([logical, value]) => ({
    logical,
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
