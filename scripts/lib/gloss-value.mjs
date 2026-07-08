/** Shared helpers for glossary / placeholder / commonLiterals validation. */

export function phrasesOf(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value;
  return null;
}

export function isValidGlossValue(value) {
  const phrases = phrasesOf(value);
  return phrases !== null && phrases.length > 0 && phrases.every((p) => typeof p === 'string' && p.trim().length > 0);
}

export function hasEnglishFallback(key, value) {
  const phrases = phrasesOf(value);
  if (!phrases) return false;
  const keyNorm = key.toLowerCase();
  return phrases.some((phrase) => phrase.toLowerCase() === keyNorm || phrase === key);
}

export function collectKeywordCanonicals(registry) {
  const set = new Set();
  for (const token of registry.tokens) {
    for (const kw of Object.values(token.targets ?? {})) {
      if (!kw) continue;
      const normalized = kw.toLowerCase();
      set.add(normalized);
      for (const part of normalized.split(/\s+/)) {
        if (part) set.add(part);
      }
    }
  }
  return set;
}

export const GLOSSARY_KEY = /^[a-z][a-z0-9_]*$/;
export const PLACEHOLDER_KEY = /^[a-z][a-z0-9_]*$/;
