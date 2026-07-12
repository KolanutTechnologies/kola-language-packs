/**
 * Detect keyword-form collisions that break reverse gloss / Learn round-trips.
 *
 * Failure modes enforced in CI:
 * 1. Cross-token English stub: a form is an English emit of another logical
 *    only (not of the current one). Example: ELIF: ["else"].
 * 2. Same-pack shared form: two logicals list the same phrase (case-insensitive),
 *    unless every sharer emits that phrase in English (NULL+NIL "null") or the
 *    pair is allowlisted. Covers primary steals (Swahili IF "ikiwa" on CASE)
 *    and alias↔alias collisions.
 * 3. Duplicate forms inside one logical (noise / ambiguous lists).
 */

import { buildEnglishEmitToLogicals } from './english-fallback.mjs';

/**
 * @typedef {{ pack: string, form: string, logicals: string[], note?: string }} HomographAllow
 */

/**
 * @param {string} form
 * @param {string} logicalA
 * @param {string} logicalB
 * @param {HomographAllow[]} allowlist
 * @param {string} packName
 */
function isAllowlistedPair(form, logicalA, logicalB, allowlist, packName) {
  const norm = form.toLowerCase();
  for (const entry of allowlist) {
    if (entry.pack !== packName) continue;
    if (entry.form.toLowerCase() !== norm) continue;
    const set = new Set(entry.logicals);
    if (set.has(logicalA) && set.has(logicalB)) return true;
  }
  return false;
}

/**
 * @param {string} form
 * @param {string[]} logicals
 * @param {HomographAllow[]} allowlist
 * @param {string} packName
 */
function isAllowlistedGroup(form, logicals, allowlist, packName) {
  const norm = form.toLowerCase();
  for (const entry of allowlist) {
    if (entry.pack !== packName) continue;
    if (entry.form.toLowerCase() !== norm) continue;
    if (logicals.every((l) => entry.logicals.includes(l))) return true;
  }
  return false;
}

/**
 * @param {string} form
 * @param {string} logical
 * @param {HomographAllow[]} allowlist
 * @param {string} packName
 */
function isAllowlistedLogical(form, logical, allowlist, packName) {
  const norm = form.toLowerCase();
  for (const entry of allowlist) {
    if (entry.pack !== packName) continue;
    if (entry.form.toLowerCase() !== norm) continue;
    if (entry.logicals.includes(logical)) return true;
  }
  return false;
}

/**
 * @param {string | string[]} value
 * @returns {string[]}
 */
function formsOf(value) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return [value];
  return [];
}

/**
 * @param {string} packName
 * @param {Record<string, string | string[]>} keywords
 * @param {{ tokens: Array<{ logical: string, targets?: Record<string, string> }> }} registry
 * @param {HomographAllow[]} [allowlist]
 * @returns {string[]} error messages
 */
export function findKeywordFormCollisions(packName, keywords, registry, allowlist = []) {
  const errors = [];
  const engToLogicals = buildEnglishEmitToLogicals(registry);

  /** @type {Map<string, string[]>} */
  const formToLogicals = new Map();

  for (const [logical, value] of Object.entries(keywords)) {
    const forms = formsOf(value);
    const seenInLogical = new Set();
    for (const form of forms) {
      if (typeof form !== 'string' || !form.trim()) continue;
      const norm = form.trim().toLowerCase();
      if (seenInLogical.has(norm)) {
        errors.push(
          `${packName}: ${logical} lists duplicate form "${form}" (case-insensitive). Remove the duplicate.`,
        );
        continue;
      }
      seenInLogical.add(norm);
      if (!formToLogicals.has(norm)) formToLogicals.set(norm, []);
      const owners = formToLogicals.get(norm);
      if (!owners.includes(logical)) owners.push(logical);
    }
  }

  // Same-pack: any shared form that is not shared English for all owners
  for (const [form, logicals] of formToLogicals) {
    if (logicals.length < 2) continue;
    const engOwners = engToLogicals.get(form) ?? new Set();
    const allShareEnglish = logicals.every((l) => engOwners.has(l));
    if (allShareEnglish) continue;
    if (isAllowlistedGroup(form, logicals, allowlist, packName)) continue;

    // Also accept pairwise allowlist covering every pair
    let allPairsOk = true;
    for (let i = 0; i < logicals.length && allPairsOk; i++) {
      for (let j = i + 1; j < logicals.length; j++) {
        if (!isAllowlistedPair(form, logicals[i], logicals[j], allowlist, packName)) {
          allPairsOk = false;
          break;
        }
      }
    }
    if (allPairsOk) continue;

    const primaryOwners = logicals.filter((l) => {
      const forms = formsOf(keywords[l]);
      return forms[0] && String(forms[0]).trim().toLowerCase() === form;
    });
    const hint =
      primaryOwners.length > 0
        ? ` Primary owner(s): ${primaryOwners.join(', ')}.`
        : '';

    errors.push(
      `${packName}: keyword form "${form}" is shared by ${logicals.join(', ')}. ` +
        `Reverse gloss maps cannot uniquely resolve this phrase (classic: Swahili IF "ikiwa" also on CASE → if↔case).` +
        `${hint} Keep the form on one logical only, or document a linguistic homograph in packs/keyword-form-allowlist.json.`,
    );
  }

  // Exclusive cross-token English (even if the owning token is not listing the form)
  for (const [logical, value] of Object.entries(keywords)) {
    const forms = formsOf(value);
    for (const form of forms) {
      if (typeof form !== 'string' || !form.trim()) continue;
      const norm = form.trim().toLowerCase();
      const owners = engToLogicals.get(norm);
      if (!owners || owners.has(logical)) continue;
      const others = [...owners];
      if (isAllowlistedLogical(norm, logical, allowlist, packName)) continue;
      errors.push(
        `${packName}: ${logical} uses "${form}", which is English for ${others.join('|')} only ` +
          `(not for ${logical}). Do not stub one logical token with another token's English keyword ` +
          `(classic bug: ELIF: ["else"]). Prefer a native phrase, or this token's own English ` +
          `(e.g. ELIF → "elif" / "else if" / "elsif" / "elseif").`,
      );
    }
  }

  return errors;
}
