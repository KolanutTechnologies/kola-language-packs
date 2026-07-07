/**
 * Builds packs/language-registry.json from shipped packs (index.json)
 * and planned packs (languages-roadmap.json).
 *
 * Run from repo root: npm run registry
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

const COUNTRY_NAMES = {
  AO: 'Angola',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  BJ: 'Benin',
  BW: 'Botswana',
  CD: 'DR Congo',
  CG: 'Congo',
  CI: 'Ivory Coast',
  CM: 'Cameroon',
  CV: 'Cabo Verde',
  DJ: 'Djibouti',
  DZ: 'Algeria',
  EG: 'Egypt',
  ER: 'Eritrea',
  ET: 'Ethiopia',
  GA: 'Gabon',
  GH: 'Ghana',
  GM: 'Gambia',
  GN: 'Guinea',
  GQ: 'Equatorial Guinea',
  GW: 'Guinea-Bissau',
  KE: 'Kenya',
  KM: 'Comoros',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  MA: 'Morocco',
  MG: 'Madagascar',
  ML: 'Mali',
  MR: 'Mauritania',
  MW: 'Malawi',
  MZ: 'Mozambique',
  NA: 'Namibia',
  NE: 'Niger',
  NG: 'Nigeria',
  RW: 'Rwanda',
  SD: 'Sudan',
  SL: 'Sierra Leone',
  SN: 'Senegal',
  SO: 'Somalia',
  SS: 'South Sudan',
  ST: 'São Tomé and Príncipe',
  SZ: 'Eswatini',
  TD: 'Chad',
  TG: 'Togo',
  TN: 'Tunisia',
  TZ: 'Tanzania',
  UG: 'Uganda',
  ZA: 'South Africa',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};

function countryName(code) {
  return COUNTRY_NAMES[code] ?? code;
}

function localeCountry(locale) {
  const parts = locale.split('-');
  return parts.length > 1 ? parts[1] : null;
}

function titleCaseName(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function main() {
  const index = JSON.parse(await readFile(join(packsRoot, 'index.json'), 'utf8'));
  const roadmap = JSON.parse(await readFile(join(packsRoot, 'languages-roadmap.json'), 'utf8'));
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

  const shipped = index.packs.map((entry) => ({
    name: entry.name,
    languageCode: entry.languageCode,
    locale: entry.locale,
    displayName: entry.displayName ?? null,
    countries: entry.countries,
    regions: entry.regions,
    status: 'shipped',
  }));

  const planned = (roadmap.planned ?? []).map((entry) => ({
    name: entry.name,
    languageCode: entry.languageCode,
    locale: entry.locale,
    displayName: titleCaseName(entry.name),
    regions: entry.regions ?? [],
    priority: entry.priority ?? null,
    note: entry.note ?? null,
    status: 'planned',
  }));

  const allEntries = [...shipped, ...planned];

  const takenNames = [...new Set(allEntries.map((p) => p.name))].sort();
  const takenLocalesFlat = [...new Set(allEntries.map((p) => p.locale))].sort();

  const takenLocales = allEntries
    .map((entry) => {
      const countryCode = localeCountry(entry.locale);
      return {
        locale: entry.locale,
        pack: entry.name,
        displayName: entry.displayName ?? titleCaseName(entry.name),
        languageCode: entry.languageCode,
        countryCode,
        countryName: countryCode ? countryName(countryCode) : null,
        status: entry.status,
      };
    })
    .sort((a, b) => a.locale.localeCompare(b.locale));

  const shippedLanguageCodes = [...new Set(shipped.map((p) => p.languageCode))].sort();

  const registry = {
    version: pkg.version,
    description:
      'Reserved pack names and locales for contributors. Read the sections below BEFORE searching taken.*. Auto-generated — run npm run registry from repo root after adding a pack.',
    howToUse: [
      '1. Read namingRules — how to pick name, languageCode, and locale.',
      '2. Check reference.countryCodes if you see a country code (NG = Nigeria, KE = Kenya, …).',
      '3. Search taken.names — your folder name must not appear.',
      '4. Search taken.locales — your locale must not appear.',
      '5. Guides: packs/NAMING_GUIDE.md · packs/DIALECTS.md · packs/GLOSSARY.md',
    ],
    fileLayout: [
      'Explanation first: description, howToUse, namingRules, reference',
      'Lookup tables: taken',
      'Full detail lists last: shipped, planned',
    ],
    namingRules: {
      name: 'Folder slug (readable). Example: cameroon-pidgin — not wes (wes is languageCode).',
      languageCode: 'ISO 639 language code (2–3 letters). Example: sw, wo, wes — not NG or ZA.',
      locale: 'BCP-47: {languageCode}-{COUNTRY}. Example: sw-KE, wo-SN, wes-CM.',
      uniqueness:
        'Each pack needs a unique name and unique locale. Same languageCode OK if locale differs (ha-NG vs ha-NE).',
    },
    reference: {
      glossary: 'packs/GLOSSARY.md',
      countryCodes: COUNTRY_NAMES,
    },
    taken: {
      names: takenNames,
      locales: takenLocales,
      localesFlat: takenLocalesFlat,
      languageCodesInUse: shippedLanguageCodes,
    },
    shipped,
    planned,
  };

  const outPath = join(packsRoot, 'language-registry.json');
  await writeFile(outPath, JSON.stringify(registry, null, 2) + '\n');
  console.log(
    `Language registry: ${shipped.length} shipped, ${planned.length} planned, ${takenNames.length} reserved names, ${takenLocalesFlat.length} reserved locales.`,
  );
}

main();
