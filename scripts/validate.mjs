import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GLOSSARY_KEY,
  PLACEHOLDER_KEY,
  collectKeywordCanonicals,
  hasEnglishFallback,
  isValidGlossValue,
  phrasesOf,
} from './lib/gloss-value.mjs';
import { findKeywordFormCollisions } from './lib/keyword-form-collision.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const schemaPath = join(root, 'pack.schema.json');
const packsRoot = join(root, 'packs');
const logicalTokensPath = join(packsRoot, 'logical-tokens.json');
const keywordFormAllowlistPath = join(packsRoot, 'keyword-form-allowlist.json');

const COUNTRY_CODE = /^[A-Z]{2}$/;
const LOCALE_CODE = /^[a-z]{2,3}(-[A-Z]{2})?$/;
const IDE_READY_PACKS = new Set([
  'yoruba',
  'hausa',
  'nigerian-pidgin',
  'igbo',
  'swahili',
  'zulu',
  'twi',
  'luganda',
  'edo',
]);
const MIN_GLOSSARY = 30;
const MIN_PLACEHOLDERS = 10;
const MIN_COMMON_LITERALS = 10;

const TIER_SPECS = [
  { field: 'glossary', file: 'glossary.json', minKeys: MIN_GLOSSARY, keyPattern: GLOSSARY_KEY, keyLabel: 'glossary' },
  {
    field: 'placeholders',
    file: 'placeholders.json',
    minKeys: MIN_PLACEHOLDERS,
    keyPattern: PLACEHOLDER_KEY,
    keyLabel: 'placeholder',
  },
  {
    field: 'commonLiterals',
    file: 'common-literals.json',
    minKeys: MIN_COMMON_LITERALS,
    keyPattern: null,
    keyLabel: 'common literal',
  },
];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateKeywordValue(value, path, errors) {
  if (isNonEmptyString(value)) return;
  if (Array.isArray(value) && value.every(isNonEmptyString)) return;
  errors.push(`${path}: keyword must be a non-empty string or string[]`);
}

function validateStringArray(value, field, errors, prefix) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${prefix}: ${field} must be a non-empty array`);
    return;
  }
  for (const item of value) {
    if (!isNonEmptyString(item)) {
      errors.push(`${prefix}: ${field} entries must be non-empty strings`);
    }
  }
}

function validateCountries(value, prefix, errors) {
  validateStringArray(value, 'countries', errors, prefix);
  if (!Array.isArray(value)) return;
  for (const code of value) {
    if (!COUNTRY_CODE.test(code)) {
      errors.push(`${prefix}: invalid country code "${code}" (use ISO 3166-1 alpha-2, e.g. NG)`);
    }
  }
}

function validateLocale(value, prefix, errors) {
  if (!isNonEmptyString(value) || !LOCALE_CODE.test(value)) {
    errors.push(`${prefix}: locale must be a BCP-47 tag like pcm-NG or yo-NG`);
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
  const requiredTokens = registry.required ?? [];
  const supportedTargets = registry.targets ?? [];
  const keywordCanonicals = collectKeywordCanonicals(registry);
  return { allTokens, requiredTokens, supportedTargets, registry, keywordCanonicals };
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
  if (keys.length > 0 && keys.length < spec.minKeys && IDE_READY_PACKS.has(packName)) {
    errors.push(`${packName}: ${spec.field} needs at least ${spec.minKeys} entries for IDE-ready packs`);
  }

  const seenPhrases = new Map();

  for (const [key, value] of Object.entries(tier)) {
    const path = `${packName}.${spec.field}.${key}`;

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

    if (!hasEnglishFallback(key, value)) {
      errors.push(`${path}: must include English fallback "${key}"`);
    }

    for (const phrase of phrasesOf(value)) {
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

async function loadTier(name, spec, pack, errors) {
  const filePath = join(packsRoot, name, spec.file);
  const fromFile = await readOptionalJson(filePath);
  const fromPack = pack?.[spec.field];

  if (fromPack !== undefined && fromFile !== undefined && JSON.stringify(fromPack) !== JSON.stringify(fromFile)) {
    errors.push(`${name}: pack.json ${spec.field} must match ${spec.file}`);
  }

  return fromPack ?? fromFile;
}

function computeIdeReady(name, tiersLoaded) {
  if (!IDE_READY_PACKS.has(name)) return false;
  return TIER_SPECS.every((spec) => {
    const tier = tiersLoaded[spec.field];
    return tier && Object.keys(tier).length >= spec.minKeys;
  });
}

async function validatePack(name, logicalTokens, errors) {
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

  for (const field of ['languageCode', 'locale', 'countries', 'regions', 'version', 'targets', 'keywords']) {
    if (!(field in pack)) errors.push(`${name}: missing ${field}`);
  }

  for (const field of ['displayName', 'description', 'reviewStatus']) {
    if (!(field in pack)) errors.push(`${name}: missing ${field} (required for all packs — see packs/NAMING_GUIDE.md)`);
  }

  if (pack.reviewStatus && !['starter', 'community-reviewed', 'partner-verified'].includes(pack.reviewStatus)) {
    errors.push(`${name}: reviewStatus must be starter, community-reviewed, or partner-verified`);
  }

  validateLocale(pack.locale, name, errors);
  validateCountries(pack.countries, name, errors);
  validateStringArray(pack.regions, 'regions', errors, name);

  if (!Array.isArray(pack.targets) || pack.targets.length === 0) {
    errors.push(`${name}: targets must be a non-empty array`);
  } else if (logicalTokens.supportedTargets.length > 0) {
    const missingTargets = logicalTokens.supportedTargets.filter((target) => !pack.targets.includes(target));
    if (missingTargets.length > 0) {
      errors.push(`${name}: targets missing canonical transpile backends: ${missingTargets.join(', ')}`);
    }
  }

  const keywords = pack.keywords;
  if (!keywords || typeof keywords !== 'object') {
    errors.push(`${name}: keywords must be an object`);
    return { pack, tiersLoaded: {}, ideReady: false };
  }

  const { allTokens, requiredTokens, keywordCanonicals } = logicalTokens;

  for (const token of requiredTokens) {
    if (!(token in keywords)) {
      errors.push(`${name}: missing required logical token ${token}`);
    }
  }

  for (const token of allTokens) {
    if (!(token in keywords)) {
      errors.push(`${name}: missing canonical logical token ${token}`);
    }
  }

  const extraTokens = Object.keys(keywords).filter((token) => !allTokens.includes(token));
  if (extraTokens.length > 0) {
    errors.push(`${name}: unknown logical token(s): ${extraTokens.join(', ')}`);
  }

  for (const [logical, value] of Object.entries(keywords)) {
    validateKeywordValue(value, `${name}.keywords.${logical}`, errors);
  }

  for (const collision of findKeywordFormCollisions(
    name,
    keywords,
    logicalTokens.registry,
    logicalTokens.homographAllowlist ?? [],
  )) {
    errors.push(collision);
  }

  try {
    const keywordsOnly = JSON.parse(await readFile(keywordsPath, 'utf8'));
    if (JSON.stringify(keywordsOnly) !== JSON.stringify(keywords)) {
      errors.push(`${name}: keywords.json must match pack.json keywords`);
    }
  } catch {
    errors.push(`${name}: missing keywords.json`);
  }

  const tiersLoaded = {};
  for (const spec of TIER_SPECS) {
    const tier = await loadTier(name, spec, pack, errors);
    if (tier) {
      tiersLoaded[spec.field] = validateGlossTierObject(
        tier,
        spec,
        name,
        keywordCanonicals,
        errors,
      );
    } else if (IDE_READY_PACKS.has(name)) {
      errors.push(`${name}: missing ${spec.file} (required for IDE-ready pack)`);
    }
  }

  const ideReady = computeIdeReady(name, tiersLoaded);
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
  JSON.parse(await readFile(schemaPath, 'utf8'));

  const logicalTokens = await loadLogicalTokens();
  logicalTokens.homographAllowlist = await loadKeywordFormAllowlist();
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));
  const listed = index.packs.map((pack) => pack.name);
  const dirs = (await readdir(packsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const errors = [];
  const loaded = new Map();

  for (const name of listed) {
    if (!dirs.includes(name)) errors.push(`index lists missing pack folder: ${name}`);
    const result = await validatePack(name, logicalTokens, errors);
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

  const ideReadyCount = [...loaded.values()].filter((r) => r.ideReady).length;
  console.log(
    `Validated ${listed.length} language pack(s) against ${logicalTokens.allTokens.length} logical token(s); ${ideReadyCount} IDE-ready.`,
  );
}

main();
