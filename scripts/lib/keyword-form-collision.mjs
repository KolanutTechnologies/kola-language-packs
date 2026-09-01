/**
 * Keyword-form collision policy (plan item 1.4).
 *
 * Tiered rules — strict where uniqueness matters, free where language allows:
 *
 * HARD ERRORS (break reverse-gloss resolution or autocomplete):
 * 1. Duplicate form inside one logical (noise).
 * 2. Cross-token English stub: a form is an English emit of another logical
 *    only (not of the current one). Example: ELIF: ["else"].
 * 3. Shared PRIMARY alias: the first phrase of two or more logicals is the
 *    same word. Primaries drive autocomplete ranking and default reverse
 *    lookup, so they must be unique per pack.
 *
 * ALLOWED (recorded as ambiguities, never fatal):
 * 4. Secondary-alias sharing: a non-primary phrase of logical A also appears
 *    on logical B (with at most one primary owner). Natural languages have
 *    homographs; translation quality is never sacrificed to satisfy a linter.
 *    Every occurrence is returned so consumers can publish `ambiguousTo` data
 *    and maintainers can track an ambiguity-rate metric per pack.
 *
 * Exemptions from rule 3/4 detection:
 * - Forms every sharer emits as its own English keyword (NULL+NIL "null").
 * - Forms documented in packs/keyword-form-allowlist.json (genuine linguistic
 *   homographs reviewed by native speakers).
 */

import { buildEnglishEmitToLogicals } from './english-fallback.mjs';
import { keywordRawPhrases } from './keywords-json.mjs';

/**
 * @typedef {{ pack: string, form: string, logicals: string[], note?: string }} HomographAllow
 * @typedef {{ form: string, logical: string, alsoOn: string[], primaryOwner?: string }} FormAmbiguity
 */

function norm(s) {
  return String(s).trim().toLowerCase();
}

/** @returns {string[]} */
function formsOf(value) {
  return keywordRawPhrases(value).map(String);
}

function isAllowlistedGroup(form, logicals, allowlist, packName) {
  const n = norm(form);
  for (const entry of allowlist) {
    if (entry.pack !== packName) continue;
    if (norm(entry.form) !== n) continue;
    if (logicals.every((l) => entry.logicals.includes(l))) return true;
  }
  return false;
}

function isAllowlistedLogical(form, logical, allowlist, packName) {
  const n = norm(form);
  for (const entry of allowlist) {
    if (entry.pack !== packName) continue;
    if (norm(entry.form) !== n) continue;
    if (entry.logicals.includes(logical)) return true;
  }
  return false;
}

/**
 * @param {string} packName
 * @param {Record<string, string | string[] | {phrases: string | string[]}>} keywords
 * @param {{ tokens: Array<{ logical: string, targets?: Record<string, string> }> }} registry
 * @param {HomographAllow[]} [allowlist]
 * @returns {{ errors: string[], ambiguities: FormAmbiguity[] }}
 */
export function findKeywordFormCollisions(packName, keywords, registry, allowlist = []) {
  const errors = [];
  const ambiguities = [];
  const engToLogicals = buildEnglishEmitToLogicals(registry);

  /** form -> logicals listing it anywhere */
  const formToLogicals = new Map();
  /** form -> logicals whose PRIMARY (first phrase) it is */
  const formToPrimaries = new Map();

  for (const [logical, value] of Object.entries(keywords)) {
    const forms = formsOf(value);
    const seenInLogical = new Set();
    forms.forEach((form, index) => {
      if (typeof form !== 'string' || !form.trim()) return;
      const n = norm(form);
      if (seenInLogical.has(n)) {
        errors.push(
          `${packName}: ${logical} lists duplicate form "${form}" (case-insensitive). Remove the duplicate.`,
        );
        return;
      }
      seenInLogical.add(n);
      if (!formToLogicals.has(n)) formToLogicals.set(n, []);
      const owners = formToLogicals.get(n);
      if (!owners.includes(logical)) owners.push(logical);
      if (index === 0) {
        if (!formToPrimaries.has(n)) formToPrimaries.set(n, []);
        formToPrimaries.get(n).push(logical);
      }
    });
  }

  // Rule 3 / rule 4: shared forms across logicals
  for (const [form, logicals] of formToLogicals) {
    if (logicals.length < 2) continue;

    const engOwners = engToLogicals.get(form) ?? new Set();
    const allShareEnglish = logicals.every((l) => engOwners.has(l));
    if (allShareEnglish) continue;

    const primaries = (formToPrimaries.get(form) ?? []).filter((l) => logicals.includes(l));
    const allowlisted = isAllowlistedGroup(form, logicals, allowlist, packName);

    if (primaries.length >= 2 && !allowlisted) {
      errors.push(
        `${packName}: primary alias "${form}" is claimed by ${primaries.join(', ')}. ` +
          `Primaries must be unique per pack — autocomplete and default reverse lookup cannot rank them. ` +
          `Keep the word as primary on one logical (demote others to secondary), or document a genuine ` +
          `linguistic homograph in packs/keyword-form-allowlist.json.`,
      );
      continue;
    }

    // Secondary sharing: record ambiguity for each non-primary claimant
    if (!allowlisted) {
      const primaryOwner = primaries.length === 1 ? primaries[0] : undefined;
      for (const logical of logicals) {
        if (primaryOwner && logical === primaryOwner) continue;
        if (isAllowlistedLogical(form, logical, allowlist, packName)) continue;
        const alsoOn = logicals.filter((l) => l !== logical);
        ambiguities.push({
          form,
          logical,
          alsoOn,
          ...(primaryOwner ? { primaryOwner } : {}),
        });
      }
    }
  }

  // Rule 2: exclusive cross-token English (even if the owning token is not listing the form)
  for (const [logical, value] of Object.entries(keywords)) {
    for (const form of formsOf(value)) {
      if (typeof form !== 'string' || !form.trim()) continue;
      const n = norm(form);
      const owners = engToLogicals.get(n);
      if (!owners || owners.has(logical)) continue;
      if (isAllowlistedLogical(n, logical, allowlist, packName)) continue;
      errors.push(
        `${packName}: ${logical} uses "${form}", which is English for ${[...owners].join('|')} only ` +
          `(not for ${logical}). Do not stub one logical token with another token's English keyword ` +
          `(classic bug: ELIF: ["else"]). Prefer a native phrase, or this token's own English ` +
          `(e.g. ELIF → "elif" / "else if" / "elsif" / "elseif").`,
      );
    }
  }

  return { errors, ambiguities };
}
