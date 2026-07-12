/**
 * Audit all packs for reverse-gloss / keyword-form hazards.
 * Run from repo root: node scripts/audit-keyword-forms.mjs
 *
 * Exit 1 if validate-equivalent collisions remain (same rules as validate.mjs).
 * Also prints soft notes (English-only stubs for core control tokens).
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findKeywordFormCollisions } from './lib/keyword-form-collision.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

const CORE_CONTROL = new Set(['IF', 'ELSE', 'ELIF', 'FOR', 'WHILE', 'IN', 'RETURN', 'FUNCTION', 'CLASS']);

async function main() {
  const registry = JSON.parse(await readFile(join(packsRoot, 'logical-tokens.json'), 'utf8'));
  const allowlist = JSON.parse(await readFile(join(packsRoot, 'keyword-form-allowlist.json'), 'utf8'));
  const entries = Array.isArray(allowlist.entries) ? allowlist.entries : [];
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));

  const errors = [];
  const englishOnlyCore = [];

  for (const { name } of index.packs) {
    const pack = JSON.parse(await readFile(join(packsRoot, name, 'pack.json'), 'utf8'));
    const keywords = pack.keywords ?? {};
    errors.push(...findKeywordFormCollisions(name, keywords, registry, entries));

    for (const logical of CORE_CONTROL) {
      const forms = keywords[logical];
      if (!Array.isArray(forms) || forms.length === 0) continue;
      const primary = String(forms[0]).trim().toLowerCase();
      const engForms = new Set();
      const token = registry.tokens.find((t) => t.logical === logical);
      for (const v of Object.values(token?.targets ?? {})) {
        if (typeof v === 'string' && v.trim()) engForms.add(v.trim().toLowerCase());
      }
      if (engForms.has(primary) || primary === logical.toLowerCase()) {
        englishOnlyCore.push(`${name}.${logical} primary=${JSON.stringify(forms[0])}`);
      }
    }
  }

  console.log(`Audited ${index.packs.length} packs.`);
  if (errors.length) {
    console.error(`\nHard failures (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
  } else {
    console.log('Hard failures: 0 (same rules as npm test / validate).');
  }

  console.log(
    `\nSoft note: ${englishOnlyCore.length} core-control tokens still use English as primary ` +
      `(not a CI failure; fill when native wording exists):`,
  );
  for (const line of englishOnlyCore.slice(0, 40)) console.log(`  - ${line}`);
  if (englishOnlyCore.length > 40) console.log(`  … and ${englishOnlyCore.length - 40} more`);

  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
