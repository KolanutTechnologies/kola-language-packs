/**
 * Adds ONE new African language pack without re-bootstrapping all packs
 * (bootstrap-packs.mjs resets every pack version).
 *
 * Usage: node scripts/add-language-pack.mjs <pack-name>
 *
 * Supported packs: akan, cameroon-pidgin, efik
 */
import { spawnSync } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const packsRoot = join(root, 'packs');

/** Maps packs to recommended partner orgs for terminology review */
const RECOMMENDED_PARTNERS = {
  akan: ['ACALAN', 'University of Ghana (Linguistics)', 'CASAS'],
  'cameroon-pidgin': ['ACALAN', 'Masakhane', 'University of Buea'],
  efik: ['ALT-I', 'ACALAN', 'University of Calabar (Linguistics)'],
};

/** @type {Record<string, Record<string, string[]>>} */
const PACKS = {
  akan: {
    IF: ['sɛ', 'if'],
    ELSE: ['sɛ ɛnyɛ saa a', 'else'],
    FOR: ['ma', 'for'],
    WHILE: ['bere a', 'while'],
    BREAK: ['bua', 'break'],
    CONTINUE: ['toa so', 'continue'],
    SWITCH: ['paw', 'switch'],
    CASE: ['sɛbea', 'case'],
    DEFAULT: ['deɛ ɛwɔ hɔ', 'default'],
    FUNCTION: ['adwuma', 'dwuma', 'function'],
    RETURN: ['san kɔ', 'return'],
    ASYNC: ['async', 'async'],
    AWAIT: ['twɛn', 'await'],
    TRY: ['bɔ mmɔden', 'try'],
    CATCH: ['kyere', 'catch'],
    FINALLY: ['ewie', 'finally'],
    THROW: ['to gu', 'throw'],
    LET: ['ma', 'let'],
    CONST: ['gyina pintinn', 'const'],
    CLASS: ['kuw', 'ekuri', 'class'],
    EXTENDS: ['toa so', 'extends'],
    NEW: ['foforo', 'new'],
    THIS: ['wei', 'this'],
    IMPORT: ['fa ba', 'import'],
    EXPORT: ['ma kɔ', 'export'],
    PRINT: ['kyerɛ', 'print'],
    TRUE: ['nokware', 'true'],
    FALSE: ['atoro', 'false'],
    NULL: ['hwee', 'null'],
    UNDEFINED: ['nnyɛ nkyerɛase', 'undefined'],
  },
  'cameroon-pidgin': {
    IF: ['if', 'if'],
    ELSE: ['if no be so', 'else'],
    FOR: ['for', 'for'],
    WHILE: ['while e dey', 'while'],
    BREAK: ['stop', 'break'],
    CONTINUE: ['continue', 'continue'],
    SWITCH: ['check which one', 'switch'],
    CASE: ['if na', 'case'],
    DEFAULT: ['if nothing match', 'default'],
    FUNCTION: ['make function', 'function'],
    RETURN: ['bring back', 'return'],
    ASYNC: ['async', 'async'],
    AWAIT: ['wait for', 'await'],
    TRY: ['try am', 'try'],
    CATCH: ['catch am', 'catch'],
    FINALLY: ['for last', 'finally'],
    THROW: ['throw am', 'throw'],
    LET: ['make we talk say', 'let'],
    CONST: ['e no go change', 'const'],
    CLASS: ['kind of thing', 'class'],
    EXTENDS: ['e come from', 'extends'],
    NEW: ['new one', 'new'],
    THIS: ['this one', 'this'],
    IMPORT: ['bring come', 'import'],
    EXPORT: ['send go', 'export'],
    PRINT: ['show', 'print'],
    TRUE: ['e correct', 'true'],
    FALSE: ['e no correct', 'false'],
    NULL: ['nothing', 'null'],
    UNDEFINED: ['e no define', 'undefined'],
  },
  efik: {
    IF: ['ke', 'sok', 'if'],
    ELSE: ['keed', 'else'],
    FOR: ['na', 'for'],
    WHILE: ['ke ini', 'while'],
    BREAK: ['tre', 'break'],
    CONTINUE: ['ka iso', 'continue'],
    SWITCH: ['sat', 'switch'],
    CASE: ['ini', 'case'],
    DEFAULT: ['nditoi', 'default'],
    FUNCTION: ['ufok', 'function'],
    RETURN: ['fiak', 'return'],
    ASYNC: ['async', 'async'],
    AWAIT: ['bet', 'await'],
    TRY: ['nam', 'try'],
    CATCH: ['nyim', 'catch'],
    FINALLY: ['ke mme', 'finally'],
    THROW: ['nuk', 'throw'],
    LET: ['yak', 'let'],
    CONST: ['nkanna', 'const'],
    CLASS: ['otúk', 'class'],
    EXTENDS: ['toho', 'extends'],
    NEW: ['ufok fo', 'new'],
    THIS: ['idem', 'this'],
    IMPORT: ['bo', 'import'],
    EXPORT: ['nó', 'export'],
    PRINT: ['wut', 'print'],
    TRUE: ['eti', 'true'],
    FALSE: ['inyene', 'false'],
    NULL: ['nkpo', 'null'],
    UNDEFINED: ['nde', 'undefined'],
  },
};

/** @type {Record<string, {
  displayName: string;
  languageCode: string;
  locale: string;
  countries: string[];
  regions: string[];
  scopeNote?: string;
  description: string;
}>} */
const META = {
  akan: {
    displayName: 'Akan',
    languageCode: 'ak',
    locale: 'ak-GH',
    countries: ['GH'],
    regions: ['West Africa'],
    scopeNote:
      'Akan of Ghana (Twi, Fante, and related dialects). Prefer inclusive alias arrays; separate dialect PRs as aliases, not new packs unless locale differs.',
    description: 'Akan keyword map — starter pack (community contributions welcome)',
  },
  'cameroon-pidgin': {
    displayName: 'Cameroon Pidgin',
    languageCode: 'wes',
    locale: 'wes-CM',
    countries: ['CM'],
    regions: ['Central Africa'],
    scopeNote:
      'Cameroon Pidgin (Kamtok) only. Not Nigerian Pidgin or other West African creoles — those have separate packs.',
    description: 'Cameroon Pidgin keyword map — bridge language for Cameroonian developers',
  },
  efik: {
    displayName: 'Efik',
    languageCode: 'efi',
    locale: 'efi-NG',
    countries: ['NG'],
    regions: ['West Africa'],
    scopeNote: 'Efik of southeastern Nigeria (Cross River region).',
    description: 'Efik keyword map — starter pack (community contributions welcome)',
  },
};

const SUPPORTED = Object.keys(META);

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function getPackageVersion() {
  const pkg = await readJson(join(root, 'package.json'));
  return pkg.version;
}

async function writePack(name, version, registry) {
  const meta = META[name];
  const keywords = { ...PACKS[name] };
  const targets = registry.targets;

  const pack = {
    name,
    languageCode: meta.languageCode,
    locale: meta.locale,
    countries: meta.countries,
    regions: meta.regions,
    version,
    displayName: meta.displayName,
    description: meta.description,
    reviewStatus: 'starter',
    contributors: ['KolanutTechnologies'],
    targets,
    keywords,
  };

  if (meta.scopeNote) {
    pack.scopeNote = meta.scopeNote;
  }

  const partners = RECOMMENDED_PARTNERS[name];
  if (partners) {
    pack.recommendedPartners = partners;
  }

  const dir = join(packsRoot, name);
  await mkdir(dir, { recursive: true });
  await writeJson(join(dir, 'pack.json'), pack);
  await writeJson(join(dir, 'keywords.json'), keywords);
}

async function appendToIndex(name, version, registry) {
  const indexPath = join(packsRoot, 'index.json');
  const index = await readJson(indexPath);
  const meta = META[name];

  if (index.packs.some((entry) => entry.name === name)) {
    console.log(`index.json already lists "${name}" — skipping append.`);
    return;
  }

  index.packs.push({
    name,
    languageCode: meta.languageCode,
    locale: meta.locale,
    displayName: meta.displayName,
    countries: meta.countries,
    regions: meta.regions,
    version,
    targets: registry.targets,
  });

  index.packs.sort((a, b) => a.name.localeCompare(b.name));
  await writeJson(indexPath, index);
}

function runScript(scriptName) {
  const result = spawnSync(process.execPath, [join(root, 'scripts', scriptName)], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function printStarterKeywords(name) {
  const keywords = PACKS[name];
  const keys = Object.keys(keywords);
  console.log(`\nStarter keywords for ${name} (${keys.length}):`);
  for (const logical of keys) {
    console.log(`  ${logical}: ${JSON.stringify(keywords[logical])}`);
  }
}

async function main() {
  const packName = process.argv[2];

  if (!packName) {
    console.error(`Usage: node scripts/add-language-pack.mjs <pack-name>`);
    console.error(`Supported packs: ${SUPPORTED.join(', ')}`);
    process.exit(1);
  }

  if (!META[packName]) {
    console.error(`Unknown pack "${packName}". Supported packs: ${SUPPORTED.join(', ')}`);
    process.exit(1);
  }

  const packPath = join(packsRoot, packName, 'pack.json');
  if (await pathExists(packPath)) {
    console.error(`Pack already exists: packs/${packName}/pack.json`);
    console.error('This script only creates new packs. Edit the existing pack or remove it first.');
    process.exit(1);
  }

  const version = await getPackageVersion();
  const registry = await readJson(join(packsRoot, 'logical-tokens.json'));

  await writePack(packName, version, registry);
  await appendToIndex(packName, version, registry);

  console.log(`Created packs/${packName}/pack.json and keywords.json (version ${version}).`);
  console.log(`Appended ${packName} to packs/index.json.`);

  runScript('ensure-pack-tokens.mjs');
  runScript('generate-coverage.mjs');

  printStarterKeywords(packName);

  console.log('\nNext steps:');
  console.log('  1. npm test');
  console.log('  2. npm run registry   # refresh language-registry.json taken list');
  console.log('  3. Review starter translations and open a PR');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
