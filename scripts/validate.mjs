import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import {
  GLOSSARY_KEY,
  PLACEHOLDER_KEY,
  collectKeywordCanonicals,
  isValidGlossValue,
  phrasesOf,
} from './lib/gloss-value.mjs';
import { findKeywordFormCollisions } from './lib/keyword-form-collision.mjs';
import { IDE_TIER_SPECS } from './lib/ide-ready.mjs';
import { findStringPolicyViolations, keywordSurfaceStrings } from './lib/unicode-policy.mjs';
import { buildKeywordsJson, nativePhrases, keywordRawPhrases } from './lib/keywords-json.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const schemaPath = join(root, 'pack.schema.json');
const packsRoot = join(root, 'packs');
const logicalTokensPath = join(packsRoot, 'logical-tokens.json');
const keywordFormAllowlistPath = join(packsRoot, 'keyword-form-allowlist.json');

const TIER_SPECS = IDE_TIER_SPECS.map((spec) => ({
  ...spec,
  keyPattern:
    spec.field === 'glossary' ? GLOSSARY_KEY : spec.field === 'placeholders' ? PLACEHOLDER_KEY : null,
  keyLabel: { glossary: 'glossary', placeholders: 'placeholder', commonLiterals: 'common literal' }[spec.field],
}));

function checkStringPolicy(value, path, errors, options) {
  if (typeof value !== 'string') return;
  for (const issue of findStringPolicyViolations(value, options)) {
    errors.push(`${path}: ${issue}`);
  }
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return undefined;
  }
}

async function loadLogicalTokens() {
  const registry = JSON.parse(await readFile(logicalTokensPath, 'utf8'));
  const allTokens = registry.tokens.map((entry) => entry.logical);
  // Draft-tier tokens are staged: known everywhere, but not yet required in packs.
  const draftTokens = registry.tokens.filter((entry) => entry.tier === 'draft');
  const presenceTokens = allTokens.filter((logical) => !draftTokens.some((d) => d.logical === logical));
  const requiredTokens = registry.required ?? [];
  const supportedTargets = registry.targets ?? [];
  const keywordCanonicals = collectKeywordCanonicals(registry);
  return { allTokens, presenceTokens, draftTokens, requiredTokens, supportedTargets, registry, keywordCanonicals };
}

async function loadKeywordFormAllowlist() {
  try {
    const data = JSON.parse(await readFile(keywordFormAllowlistPath, 'utf8'));
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

function validateGlossTierObject(tier, spec, packName, keywordCanonicals, errors) {
  if (!tier || typeof tier !== 'object') return null;

  const keys = Object.keys(tier);
  if (keys.length > 0 && keys.length < spec.minKeys) {
    errors.push(`${packName}: ${spec.field} has ${keys.length} entries but at least ${spec.minKeys} are required (IDE tier minimum — add entries or remove the file)`);
  }

  const seenPhrases = new Map();

  for (const [key, value] of Object.entries(tier)) {
    const path = `${packName}.${spec.field}.${key}`;

    checkStringPolicy(key, path, errors, { matchable: true });

    if (spec.keyPattern && !spec.keyPattern.test(key)) {
      errors.push(`${path}: ${spec.keyLabel} key must be lowercase (snake_case allowed)`);
    }

    if (spec.field === 'glossary' && keywordCanonicals.has(key.toLowerCase())) {
      errors.push(`${path}: ${spec.keyLabel} key collides with a programming keyword`);
    }

    if (!isValidGlossValue(value)) {
      errors.push(`${path}: must be a non-empty string or string[]`);
      continue;
    }

    for (const phrase of phrasesOf(value)) {
      checkStringPolicy(phrase, path, errors, { matchable: true });
      const norm = phrase.toLowerCase();
      if (norm === key.toLowerCase()) continue;
      if (seenPhrases.has(norm)) {
        errors.push(`${path}: gloss phrase "${phrase}" duplicates ${seenPhrases.get(norm)}`);
      } else {
        seenPhrases.set(norm, path);
      }
    }
  }

  return tier;
}

async function loadTier(name, spec) {
  return readOptionalJson(join(packsRoot, name, spec.file));
}

function computeIdeReady(tiersLoaded) {
  return TIER_SPECS.every((spec) => {
    const tier = tiersLoaded[spec.field];
    return tier && Object.keys(tier).length >= spec.minKeys;
  });
}

async function validatePack(name, logicalTokens, ajvValidate, errors, ambiguities) {
  const packPath = join(packsRoot, name, 'pack.json');
  const keywordsPath = join(packsRoot, name, 'keywords.json');

  let pack;
  try {
    pack = JSON.parse(await readFile(packPath, 'utf8'));
  } catch {
    errors.push(`${name}: missing or invalid pack.json`);
    return { pack: undefined, tiersLoaded: {}, ideReady: false };
  }

  if (pack.name !== name) {
    errors.push(`${name}: pack.name must match folder name`);
  }

  if (!ajvValidate(pack)) {
    for (const err of ajvValidate.errors) {
      errors.push(`${name}: schema: ${err.instancePath || '/'} ${err.message}`);
    }
  }

  for (const field of ['displayName', 'description', 'reviewStatus']) {
    if (!(field in pack)) errors.push(`${name}: missing ${field} (required for all packs — see packs/NAMING_GUIDE.md)`);
  }

  if (Array.isArray(pack.targets) && logicalTokens.supportedTargets.length > 0) {
    const missingTargets = logicalTokens.supportedTargets.filter((target) => !pack.targets.includes(target));
    if (missingTargets.length > 0) {
      errors.push(`${name}: targets missing canonical transpile backends: ${missingTargets.join(', ')}`);
    }
  }

  const keywords = pack.keywords;
  if (!keywords || typeof keywords !== 'object') {
    return { pack, tiersLoaded: {}, ideReady: false };
  }

  const byLogical = new Map(logicalTokens.registry.tokens.map((t) => [t.logical, t]));
  for (const [logical, value] of Object.entries(keywords)) {
    const tokenEntry = byLogical.get(logical) ?? { logical };
    const natives = nativePhrases(value, tokenEntry);
    if (natives !== null && keywordRawPhrases(value).length !== natives.length) {
      errors.push(
        `${name}.keywords.${logical}: source must be pure translations — remove the English fallback phrase (it is generated into keywords.json)`,
      );
    }
    for (const phrase of keywordSurfaceStrings(value)) {
      checkStringPolicy(phrase, `${name}.keywords.${logical}`, errors, { matchable: true });
    }
  }
  for (const field of ['displayName', 'description', 'scopeNote']) {
    checkStringPolicy(pack[field], `${name}.${field}`, errors);
  }

  const { allTokens, presenceTokens, requiredTokens, keywordCanonicals } = logicalTokens;

  for (const token of requiredTokens) {
    if (!(token in keywords)) {
      errors.push(`${name}: missing required logical token ${token}`);
    }
  }

  for (const token of presenceTokens) {
    if (!(token in keywords)) {
      errors.push(`${name}: missing canonical logical token ${token}`);
    }
  }

  const collisionResult = findKeywordFormCollisions(
    name,
    keywords,
    logicalTokens.registry,
    logicalTokens.homographAllowlist ?? [],
  );
  for (const collision of collisionResult.errors) {
    errors.push(collision);
  }
  ambiguities.push(...collisionResult.ambiguities.map((a) => ({ pack: name, ...a })));

  const extraTokens = Object.keys(keywords).filter((token) => !allTokens.includes(token));
  if (extraTokens.length > 0) {
    errors.push(`${name}: unknown logical token(s): ${extraTokens.join(', ')}`);
  }

  try {
    const keywordsOnly = JSON.parse(await readFile(keywordsPath, 'utf8'));
    const expected = buildKeywordsJson(keywords, logicalTokens.registry.tokens);
    if (JSON.stringify(keywordsOnly) !== JSON.stringify(expected)) {
      errors.push(`${name}: keywords.json must equal the generated shape (natives + English fallback) — run npm run generate`);
    }
  } catch {
    errors.push(`${name}: missing keywords.json`);
  }

  const tiersLoaded = {};
  for (const spec of TIER_SPECS) {
    const tier = await loadTier(name, spec);
    if (tier) {
      tiersLoaded[spec.field] = validateGlossTierObject(
        tier,
        spec,
        name,
        keywordCanonicals,
        errors,
      );
    }
  }

  const ideReady = computeIdeReady(tiersLoaded);
  return { pack, tiersLoaded, ideReady };
}

function validateIndexEntry(entry, pack, ideReady, errors) {
  const name = entry.name;
  if (!pack) return;

  for (const field of ['languageCode', 'locale', 'countries', 'regions', 'version']) {
    if (JSON.stringify(entry[field]) !== JSON.stringify(pack[field])) {
      errors.push(`${name}: index.json ${field} must match pack.json`);
    }
  }

  if (entry.displayName && pack.displayName && entry.displayName !== pack.displayName) {
    errors.push(`${name}: index.json displayName must match pack.json`);
  }

  if (!Array.isArray(entry.targets) || entry.targets.length === 0) {
    errors.push(`${name}: index.json must include targets`);
  } else if (JSON.stringify(entry.targets) !== JSON.stringify(pack.targets)) {
    errors.push(`${name}: index.json targets must match pack.json`);
  }

  const expectedIdeReady = ideReady;
  if (Boolean(entry.ideReady) !== expectedIdeReady) {
    errors.push(`${name}: index.json ideReady must be ${expectedIdeReady}`);
  }
}

async function main() {
  const ajv = new Ajv2020({ allErrors: true });
  let ajvValidate;
  try {
    const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
    ajvValidate = ajv.compile(schema);
  } catch (error) {
    console.error(`pack.schema.json failed to compile: ${error.message}`);
    process.exit(1);
  }

  const logicalTokens = await loadLogicalTokens();
  logicalTokens.homographAllowlist = await loadKeywordFormAllowlist();
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));
  const listed = index.packs.map((pack) => pack.name);
  const dirs = (await readdir(packsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const errors = [];
  const ambiguities = [];
  const loaded = new Map();

  for (const name of listed) {
    if (!dirs.includes(name)) errors.push(`index lists missing pack folder: ${name}`);
    const result = await validatePack(name, logicalTokens, ajvValidate, errors, ambiguities);
    loaded.set(name, result);
  }

  for (const entry of index.packs) {
    const result = loaded.get(entry.name);
    validateIndexEntry(entry, result?.pack, result?.ideReady ?? false, errors);
  }

  const names = new Map();
  const locales = new Map();
  for (const entry of index.packs) {
    if (names.has(entry.name)) {
      errors.push(`duplicate pack name in index.json: ${entry.name}`);
    }
    names.set(entry.name, true);

    if (locales.has(entry.locale)) {
      errors.push(
        `duplicate locale "${entry.locale}" in index.json: ${locales.get(entry.locale)} and ${entry.name} — each pack needs a unique locale (see packs/language-registry.json)`,
      );
    }
    locales.set(entry.locale, entry.name);
  }

  for (const name of dirs) {
    if (!listed.includes(name)) errors.push(`pack folder not listed in index.json: ${name}`);
  }

  if (errors.length > 0) {
    console.error('Validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  if (process.env.VALIDATE_SELFTEST === '1') {
    const sample = [...loaded.values()].find((r) => r.pack)?.pack;
    if (!sample) {
      console.error('schema selftest: FAILED (no pack loaded)');
      process.exit(1);
    }
    const badField = structuredClone(sample);
    badField.badField = true;
    const badLocale = structuredClone(sample);
    badLocale.locale = 'nope';
    const rejectsBadField = !ajvValidate(badField);
    const rejectsBadLocale = !ajvValidate(badLocale);
    if (!rejectsBadField || !rejectsBadLocale) {
      console.error(
        `schema selftest: FAILED (badField rejected: ${rejectsBadField}, badLocale rejected: ${rejectsBadLocale})`,
      );
      process.exit(1);
    }
    console.log('schema selftest: OK');
  }

  const ideReadyCount = [...loaded.values()].filter((r) => r.ideReady).length;
  console.log(
    `Validated ${listed.length} language pack(s) against ${logicalTokens.allTokens.length} logical token(s); ${ideReadyCount} IDE-ready.`,
  );
  if (ambiguities.length > 0) {
    const byPack = new Map();
    for (const a of ambiguities) byPack.set(a.pack, (byPack.get(a.pack) ?? 0) + 1);
    console.log(
      `Secondary-alias ambiguities: ${ambiguities.length} (allowed; ` +
        [...byPack.entries()].map(([p, n]) => `${p}: ${n}`).join(', ') + ')',
    );
  }

  if (logicalTokens.draftTokens.length > 0) {
    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    const minorOf = (v) => Number(String(v).split('.')[1] ?? 0);
    const currentMinor = minorOf(pkg.version);
    for (const draft of logicalTokens.draftTokens) {
      const introducedMinor = draft.introducedIn ? minorOf(draft.introducedIn) : currentMinor;
      const age = Math.max(0, currentMinor - introducedMinor);
      if (age >= 2) {
        console.warn(
          `WARNING: draft token ${draft.logical} (introduced ${draft.introducedIn ?? 'unknown'}) is ${age} minor cycles old — promote to standard/core (then run npm run ensure-tokens) or drop it.`,
        );
      } else {
        console.log(`Draft tokens: ${logicalTokens.draftTokens.map((d) => d.logical).join(', ')} — not yet required, excluded from coverage denominators.`);
        break;
      }
    }
  }
}

main();

