/**
 * Deterministic per-pack translation coverage (plan item 1.5).
 *
 * A token counts as translated iff its keyword value has at least one native
 * phrase (nativePhrases() returns null for pure English stubs). Presence of
 * the key alone is NOT enough — stubs are tracked as untranslated.
 *
 * Denominators are frozen per logical-tokens.json release:
 * - coreTotal  = tokens in required[] OR tier "core"
 * - fullTotal  = all tokens NOT tier "draft" (drafts join the denominator
 *   only at promotion, so promotion never breaks builds)
 *
 * pct = floor(translated / total * 1000) / 10  — one stated rounding rule.
 */

import { nativePhrases } from './keywords-json.mjs';

export function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.floor((numerator / denominator) * 1000) / 10;
}

/**
 * @param {Record<string, string | string[] | {phrases: string | string[]}>} packKeywords
 * @param {{ required?: string[], tokens: Array<{logical: string, tier?: string}> }} registry
 */
export function computePackCoverage(packKeywords, registry) {
  const byLogical = new Map(registry.tokens.map((t) => [t.logical, t]));
  const required = new Set(registry.required ?? []);

  let translatedFull = 0;
  let totalFull = 0;
  let translatedCore = 0;
  let coreTotal = 0;
  const untranslatedCore = [];
  const untranslated = [];

  for (const token of registry.tokens) {
    if (token.tier === 'draft') continue; // not yet in any denominator
    totalFull += 1;
    const isCore = token.tier === 'core' || required.has(token.logical);
    if (isCore) coreTotal += 1;

    const value = packKeywords[token.logical];
    const entry = byLogical.get(token.logical) ?? token;
    const hasNative = value !== undefined && nativePhrases(value, entry) !== null;

    if (hasNative) {
      translatedFull += 1;
      if (isCore) translatedCore += 1;
    } else {
      untranslated.push(token.logical);
      if (isCore) untranslatedCore.push(token.logical);
    }
  }

  return {
    translatedFull,
    totalFull,
    fullPct: pct(translatedFull, totalFull),
    translatedCore,
    coreTotal,
    corePct: pct(translatedCore, coreTotal),
    untranslatedCore,
    untranslatedCount: untranslated.length,
  };
}
