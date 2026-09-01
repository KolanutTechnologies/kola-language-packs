/**
 * Unicode policy for pack data.
 *
 * Two strictness levels:
 * - MATCHABLE surfaces (keyword aliases, tier keys + phrases) get the full
 *   policy: NFC required, zero-width characters forbidden, confusable
 *   apostrophe/dash look-alikes forbidden. These strings are matched against
 *   user input, so invisible or look-alike characters silently break lookup.
 * - PROSE fields (displayName, description, scopeNote) require NFC and forbid
 *   zero-width characters only; typographic dashes etc. are legitimate prose.
 *
 * Policy codifies the state of the data at adoption time (all packs already
 * NFC; matchable surfaces free of confusables), so violations are always new.
 */

export const ZERO_WIDTH_RE = /[\u200B-\u200D\u2060\uFEFF]/;

/** Look-alikes that break exact matching: curly quotes, modifier-letter
 *  apostrophes (glottal stop orthography uses ASCII ' in this registry),
 *  acute/grave accents used as apostrophes, en/em/minus dashes. */
export const CONFUSABLE_RE = /[\u2018\u2019\u02BB\u02BC\u00B4\u0060\u2013\u2014\u2212]/;

export function isNfc(s) {
  return s === s.normalize('NFC');
}

function firstMatchingChar(s, re) {
  const m = re.exec(s);
  return m ? m[0] : null;
}

function codePointLabel(ch) {
  return 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * @param {string} s
 * @param {{matchable?: boolean}} [options]
 * @returns {string[]} human-readable violation messages (empty = clean)
 */
export function findStringPolicyViolations(s, options = {}) {
  const { matchable = false } = options;
  const issues = [];
  if (!isNfc(s)) {
    issues.push('must be Unicode NFC (decomposed marks found — normalize the string)');
  }
  const zw = firstMatchingChar(s, ZERO_WIDTH_RE);
  if (zw) {
    issues.push(`zero-width character ${codePointLabel(zw)} is forbidden`);
  }
  if (matchable) {
    const conf = firstMatchingChar(s, CONFUSABLE_RE);
    if (conf) {
      issues.push(
        `confusable character ${codePointLabel(conf)} is forbidden in matchable text (use ASCII apostrophe ' or hyphen -)`,
      );
    }
  }
  return issues;
}

/** Extract every surface string from a keyword value:
 *  string | string[] | { phrases: string | string[] } */
export function keywordSurfaceStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((x) => typeof x === 'string');
  if (value && typeof value === 'object' && 'phrases' in value) {
    return keywordSurfaceStrings(value.phrases);
  }
  return [];
}
