/**
 * Single source of truth for IDE-ready pack classification.
 *
 * A pack is IDE-ready iff all three IDE tier files exist in packs/<name>/
 * and each meets its minimum key count. No hardcoded pack list — readiness
 * is computed from data so it can never drift between scripts.
 */

import { join } from 'node:path';

export const IDE_TIER_SPECS = [
  { field: 'glossary', file: 'glossary.json', minKeys: 30 },
  { field: 'placeholders', file: 'placeholders.json', minKeys: 10 },
  { field: 'commonLiterals', file: 'common-literals.json', minKeys: 10 },
];

/**
 * @param {string} packsRoot absolute path to packs/
 * @param {string} name pack folder name
 * @returns {Promise<{ideReady: boolean, counts: Record<string, number|undefined>}>}
 */
export async function computeIdeReadyFromDisk(packsRoot, name, readFileFn) {
  const counts = {};
  let ideReady = true;
  for (const spec of IDE_TIER_SPECS) {
    try {
      const raw = await readFileFn(join(packsRoot, name, spec.file), 'utf8');
      const data = JSON.parse(raw);
      const n = data && typeof data === 'object' ? Object.keys(data).length : 0;
      counts[spec.field] = n;
      if (n < spec.minKeys) ideReady = false;
    } catch {
      counts[spec.field] = undefined;
      ideReady = false;
    }
  }
  return { ideReady, counts };
}
