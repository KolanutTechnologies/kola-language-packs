/**
 * Detect keyword-form collisions that break reverse gloss / Learn round-trips.
 *
 * Failure modes enforced in CI:
 * 1. Cross-token English stub: a form is an English emit of another logical
 *    only (not of the current one). Example: ELIF: ["else"].
 * 2. Same-pack English borrow: two logicals share a form that is English for
 *    only some of them (ELSE and ELIF both listing "else").
 *
 * Not enforced (yet): two native phrases that collide without either being
 * English for those tokens. Prefer unique natives; document exceptions in
 * packs/keyword-form-allowlist.json when needed.
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
    const forms = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
    for (const form of forms) {
      if (typeof form !== 'string' || !form.trim()) continue;
      const norm = form.trim().toLowerCase();
      if (!formToLogicals.has(norm)) formToLogicals.set(norm, []);
      const owners = formToLogicals.get(norm);
      if (!owners.includes(logical)) owners.push(logical);
    }
  }

  // Same-pack: shared form that is English for only some of the sharers
  for (const [form, logicals] of formToLogicals) {
    if (logicals.length < 2) continue;
    const engOwners = engToLogicals.get(form) ?? new Set();
    const ownEnglish = logicals.filter((l) => engOwners.has(l));
    const borrowed = logicals.filter((l) => !engOwners.has(l));
    if (ownEnglish.length === 0 || borrowed.length === 0) continue;

    const blocked = [];
    for (const a of ownEnglish) {
      for (const b of borrowed) {
        if (!isAllowlistedPair(form, a, b, allowlist, packName)) {
          blocked.push(`${b} borrows English of ${a}`);
        }
      }
    }
    if (blocked.length > 0) {
      errors.push(
        `${packName}: keyword form "${form}" is shared by ${logicals.join(', ')} ` +
          `(${blocked.join('; ')}). Do not stub one logical with another's English ` +
          `(classic: ELIF: ["else"]). Use a native phrase or this token's own English.`,
      );
    }
  }

  // Exclusive cross-token English (even if the owning token is not listing the form)
  for (const [logical, value] of Object.entries(keywords)) {
    const forms = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
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
