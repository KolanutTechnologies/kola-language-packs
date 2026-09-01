/**
 * Per-pack secondary-alias ambiguity export for coverage-summary.json.
 * Wraps findKeywordFormCollisions — single shape for validate logs and CI artifacts.
 */

import { findKeywordFormCollisions } from './keyword-form-collision.mjs';

/**
 * @param {string} packName
 * @param {Record<string, string | string[] | {phrases: string | string[]}>} packKeywords
 * @param {{ tokens: Array<{ logical: string, targets?: Record<string, string> }> }} registry
 * @param {import('./keyword-form-collision.mjs').HomographAllow[]} [allowlist]
 */
export function exportPackKeywordAmbiguities(packName, packKeywords, registry, allowlist = []) {
  const { ambiguities } = findKeywordFormCollisions(packName, packKeywords, registry, allowlist);
  const ambiguousForms = ambiguities.map(({ form, logical, alsoOn, primaryOwner }) => ({
    form,
    logical,
    alsoOn,
    ...(primaryOwner ? { primaryOwner } : {}),
  }));
  return {
    secondaryAliasAmbiguities: ambiguousForms.length,
    sharedAliasForms: new Set(ambiguousForms.map((a) => a.form.toLowerCase())).size,
    ambiguousForms,
  };
}
