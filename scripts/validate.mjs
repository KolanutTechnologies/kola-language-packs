import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const schemaPath = join(root, 'pack.schema.json');
const packsRoot = join(root, 'packs');
const logicalTokensPath = join(packsRoot, 'logical-tokens.json');

const COUNTRY_CODE = /^[A-Z]{2}$/;
const LOCALE_CODE = /^[a-z]{2,3}(-[A-Z]{2})?$/;

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

async function loadLogicalTokens() {
  const registry = JSON.parse(await readFile(logicalTokensPath, 'utf8'));
  const allTokens = registry.tokens.map((entry) => entry.logical);
  const requiredTokens = registry.required ?? [];
  const supportedTargets = registry.targets ?? [];
  return { allTokens, requiredTokens, supportedTargets, registry };
}

async function validatePack(name, { allTokens, requiredTokens, supportedTargets }, errors) {
  const packPath = join(packsRoot, name, 'pack.json');
  const keywordsPath = join(packsRoot, name, 'keywords.json');

  let pack;
  try {
    pack = JSON.parse(await readFile(packPath, 'utf8'));
  } catch {
    errors.push(`${name}: missing or invalid pack.json`);
    return pack;
  }

  if (pack.name !== name) {
    errors.push(`${name}: pack.name must match folder name`);
  }

  for (const field of ['languageCode', 'locale', 'countries', 'regions', 'version', 'targets', 'keywords']) {
    if (!(field in pack)) errors.push(`${name}: missing ${field}`);
  }

  validateLocale(pack.locale, name, errors);
  validateCountries(pack.countries, name, errors);
  validateStringArray(pack.regions, 'regions', errors, name);

  if (!Array.isArray(pack.targets) || pack.targets.length === 0) {
    errors.push(`${name}: targets must be a non-empty array`);
  } else if (supportedTargets.length > 0) {
    const missingTargets = supportedTargets.filter((target) => !pack.targets.includes(target));
    if (missingTargets.length > 0) {
      errors.push(`${name}: targets missing canonical transpile backends: ${missingTargets.join(', ')}`);
    }
  }

  const keywords = pack.keywords;
  if (!keywords || typeof keywords !== 'object') {
    errors.push(`${name}: keywords must be an object`);
    return pack;
  }

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

  try {
    const keywordsOnly = JSON.parse(await readFile(keywordsPath, 'utf8'));
    if (JSON.stringify(keywordsOnly) !== JSON.stringify(keywords)) {
      errors.push(`${name}: keywords.json must match pack.json keywords`);
    }
  } catch {
    errors.push(`${name}: missing keywords.json`);
  }

  return pack;
}

function validateIndexEntry(entry, pack, errors) {
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
}

async function main() {
  JSON.parse(await readFile(schemaPath, 'utf8'));

  const logicalTokens = await loadLogicalTokens();
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));
  const listed = index.packs.map((pack) => pack.name);
  const dirs = (await readdir(packsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const errors = [];
  const loadedPacks = new Map();

  for (const name of listed) {
    if (!dirs.includes(name)) errors.push(`index lists missing pack folder: ${name}`);
    const pack = await validatePack(name, logicalTokens, errors);
    loadedPacks.set(name, pack);
  }

  for (const entry of index.packs) {
    validateIndexEntry(entry, loadedPacks.get(entry.name), errors);
  }

  for (const name of dirs) {
    if (!listed.includes(name)) errors.push(`pack folder not listed in index.json: ${name}`);
  }

  if (errors.length > 0) {
    console.error('Validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    process.exit(1);
  }

  console.log(
    `Validated ${listed.length} language pack(s) against ${logicalTokens.allTokens.length} logical token(s).`,
  );
}

main();
