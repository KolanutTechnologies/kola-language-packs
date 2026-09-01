/**
 * Source-vs-published keyword shapes.
 *
 * SOURCE OF TRUTH (packs/<name>/pack.json): pure translations only. English
 * fallback labels must NOT appear alongside native phrases (enforced by
 * validate.mjs). An untranslated token may be a bare English stub, e.g.
 * ["if"] — presence of zero native phrases marks it untranslated.
 *
 * PUBLISHED SHAPE (packs/<name>/keywords.json): GENERATED, never hand-edited.
 * Native phrases first, then the code-derived English fallback label, so
 * existing consumers keep their fallback contract without the source carrying
 * duplicate data.
 */

import { englishFallback } from './english-fallback.mjs';

const eqLower = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Phrases of a keyword value in native order (handles confident form). */
export function keywordRawPhrases(value) {
  return rawPhrases(value);
}

function rawPhrases(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && 'phrases' in value) {
    return rawPhrases(value.phrases);
  }
  return [];
}

/** English strings owned by this token: its per-target emits + fallback label. */
export function englishFormsOf(tokenEntry) {
  const forms = new Set([tokenEntry.logical.toLowerCase()]);
  for (const emit of Object.values(tokenEntry.targets ?? {})) {
    if (emit && emit.trim()) forms.add(emit.trim().toLowerCase());
  }
  forms.add(englishFallback(tokenEntry).toLowerCase());
  return forms;
}

/**
 * Native-only phrases for a keyword value. Returns null when the value has no
 * native phrases at all (pure English stub — left untouched by design).
 */
export function nativePhrases(value, tokenEntry) {
  const english = englishFormsOf(tokenEntry);
  const natives = [];
  for (const phrase of rawPhrases(value)) {
    if (typeof phrase === 'string' && ![...english].some((e) => eqLower(phrase, e))) {
      if (!natives.some((n) => eqLower(n, phrase))) natives.push(phrase);
    }
  }
  return natives.length > 0 ? natives : null;
}

/**
 * Deterministic published shape for one pack's keywords.
 * @param {Record<string, string | string[] | {phrases, confidence?}>} packKeywords
 * @param {Array<{logical: string, targets?: Record<string,string>}>} registryTokens
 */
export function buildKeywordsJson(packKeywords, registryTokens) {
  const byLogical = new Map(registryTokens.map((t) => [t.logical, t]));
  const out = {};
  for (const [logical, value] of Object.entries(packKeywords)) {
    const entry = byLogical.get(logical) ?? { logical };
    if (value && typeof value === 'object' && !Array.isArray(value) && value.confidence === 'draft') {
      out[logical] = [englishFallback(entry)];
      continue;
    }
    const natives = nativePhrases(value, entry);
    if (natives === null) {
      out[logical] = rawPhrases(value);
      continue;
    }
    const label = englishFallback(entry);
    out[logical] = natives.some((n) => eqLower(n, label)) ? [...natives] : [...natives, label];
  }
  return out;
}
