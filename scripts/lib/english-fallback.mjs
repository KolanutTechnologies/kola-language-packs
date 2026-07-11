/**
 * English stub labels for missing pack keyword translations.
 *
 * Never take the first word of a multi-word emit (e.g. "else if" → "else").
 * That stole ELSE's keyword and poisoned reverse gloss maps (ELIF ↔ ELSE).
 */

/** Prefer single-token emits; python/ruby/php before languages that use "else if". */
const PREFER_TARGETS = [
  'python',
  'ruby',
  'php',
  'javascript',
  'typescript',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
  'csharp',
  'kotlin',
  'swift',
  'dart',
  'r',
];

/** Explicit stubs when target emits are multi-word, dotted, or empty. */
export const FALLBACK_LABEL = {
  ELIF: 'elif',
  LAMBDA: 'lambda',
  MATCH: 'match',
  CASE: 'case',
  DEFAULT: 'default',
  THROW: 'throw',
  PRINT: 'print',
  IMPORT: 'import',
  EXPORT: 'export',
  AND: 'and',
  OR: 'or',
  NOT: 'not',
  DEL: 'del',
  TYPEOF: 'typeof',
  VOID: 'void',
  INSTANCEOF: 'instanceof',
  DEBUGGER: 'debugger',
  ASSERTS: 'asserts',
  NAMESPACE: 'namespace',
  INFER: 'infer',
  KEYOF: 'keyof',
  UNIQUE: 'unique',
  SATISFIES: 'satisfies',
  GEN: 'gen',
  LAZY: 'lazy',
};

function isSingleTokenEmit(value) {
  const v = value.trim().toLowerCase();
  if (!v) return false;
  // Reject multi-word, dotted calls, and macros with "!"
  if (/[\s.!]/.test(v)) return false;
  return true;
}

/**
 * @param {{ logical: string, targets?: Record<string, string> }} entry
 * @param {string[]} [targetOrder]
 * @returns {string}
 */
export function englishFallback(entry, targetOrder = PREFER_TARGETS) {
  if (FALLBACK_LABEL[entry.logical]) {
    return FALLBACK_LABEL[entry.logical];
  }

  const targets = entry.targets ?? {};

  for (const target of targetOrder) {
    const value = targets[target];
    if (typeof value === 'string' && isSingleTokenEmit(value)) {
      return value.trim().toLowerCase();
    }
  }

  for (const target of targetOrder) {
    const value = targets[target];
    if (typeof value === 'string' && value.trim()) {
      // Keep the full emit (e.g. "else if"), never the first word alone.
      return value.trim().toLowerCase();
    }
  }

  return entry.logical.toLowerCase();
}

/**
 * Build map: normalized English emit → set of logical tokens that emit it.
 * Uses full target strings only (no splitting "else if" into "else").
 *
 * @param {{ tokens: Array<{ logical: string, targets?: Record<string, string> }> }} registry
 * @returns {Map<string, Set<string>>}
 */
export function buildEnglishEmitToLogicals(registry) {
  const map = new Map();
  for (const token of registry.tokens ?? []) {
    for (const value of Object.values(token.targets ?? {})) {
      if (typeof value !== 'string' || !value.trim()) continue;
      const key = value.trim().toLowerCase();
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(token.logical);
    }
  }
  return map;
}
