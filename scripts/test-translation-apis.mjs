/**
 * Cost-conscious smoke tests for Mansa + Khaya translation APIs.
 * Reads keys from .env. Writes report to research/translation-api-coverage.md
 *
 * Usage: node scripts/test-translation-apis.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const researchDir = resolve(root, 'research');

function loadEnv() {
  const text = readFileSync(resolve(root, '.env'), 'utf8');
  /** @type {Record<string, string>} */
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const PROMPT = [
  'Programming keywords for teaching beginners to code.',
  'Translate each numbered item into short, natural words suitable as code vocabulary (not full sentences):',
  '1. if — conditional branch',
  '2. else — otherwise branch',
  '3. for — for-loop',
  '4. while — while-loop',
  '5. function — define a function',
  '6. return — return a value',
  '7. print — output to screen',
  '8. true — boolean true',
  '9. false — boolean false',
  '10. null — empty/no value',
].join('\n');

/** Mansa language names from All Lab Portal marketing/docs (30 African languages). */
const MANSA_LANGUAGES = [
  'Afrikaans',
  'Amharic',
  'Arabic',
  'Bambara',
  'Bemba',
  'Chichewa',
  'Ewe',
  'Hausa',
  'Igbo',
  'Kikongo',
  'Kinyarwanda',
  'Kirundi',
  'Lingala',
  'Luganda',
  'Malagasy',
  'Ndebele (South)',
  'Oromo',
  'Sepedi',
  'Sesotho',
  'Shona',
  'Somali',
  'Swahili',
  'Swati',
  'Tigrinya',
  'Tsonga',
  'Tswana',
  'Twi',
  'Xhosa',
  'Yoruba',
  'Zulu',
];

/** @type {Record<string, { name: string, languageCode: string, displayName: string }>} */
const REPO_PACKS = JSON.parse(readFileSync(resolve(root, 'packs/index.json'), 'utf8')).packs.reduce(
  (acc, p) => {
    acc[p.name] = p;
    return acc;
  },
  {},
);

const MANSA_TO_PACK = {
  Afrikaans: 'afrikaans',
  Amharic: 'amharic',
  Arabic: 'arabic',
  Bambara: 'bambara',
  Hausa: 'hausa',
  Igbo: 'igbo',
  Kinyarwanda: 'kinyarwanda',
  Lingala: 'lingala',
  Luganda: 'luganda',
  Oromo: 'oromo',
  Sesotho: 'sesotho',
  Shona: 'shona',
  Somali: 'somali',
  Swahili: 'swahili',
  Tigrinya: 'tigrinya',
  Twi: 'twi',
  Xhosa: 'xhosa',
  Yoruba: 'yoruba',
  Zulu: 'zulu',
  Tswana: 'setswana',
  Ewe: null,
  Chichewa: null,
  Bemba: null,
  Kikongo: null,
  Kirundi: null,
  Malagasy: null,
  'Ndebele (South)': null,
  Sepedi: null,
  Swati: null,
  Tsonga: null,
};

const KHAYA_TO_PACK = {
  tw: 'twi',
  yo: 'yoruba',
  ee: null,
  gaa: null,
  fat: null,
  dag: null,
  ki: null,
  gur: null,
  luo: null,
  mer: null,
  kus: null,
};

const MANSA_TEST_TARGETS = ['Swahili', 'Zulu', 'Twi', 'Yoruba', 'Somali', 'Ewe'];
const KHAYA_TEST_LANGS = [
  ['tw', 'Twi'],
  ['yo', 'Yorùbá'],
  ['ee', 'Ewe'],
  ['dag', 'Dagbani'],
  ['gaa', 'Ga'],
];

async function khayaTranslate(apiKey, langCode) {
  const res = await fetch('https://translation-api.ghananlp.org/v2/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': apiKey,
    },
    body: JSON.stringify({ in: PROMPT, lang: `en-${langCode}` }),
  });
  const raw = await res.text();
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    body = { raw };
  }
  return { status: res.status, body };
}

async function mansaTranslate(apiKey, target) {
  const res = await fetch('https://all-lab-portal.com/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: apiKey,
      text: PROMPT,
      from: 'English',
      to: target,
    }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function khayaLanguages(apiKey) {
  const res = await fetch('https://translation-api.ghananlp.org/v2/languages', {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  });
  return { status: res.status, body: await res.json() };
}

const env = loadEnv();
const khayaKey = env.TRANSLATION_API_PRIMARY_KEY;
const mansaKey = env.ALL_LAB_PORTAL_API_KEY;

if (!khayaKey) throw new Error('Missing TRANSLATION_API_PRIMARY_KEY in .env');
if (!mansaKey) throw new Error('Missing ALL_LAB_PORTAL_API_KEY in .env');

const khayaLangs = await khayaLanguages(khayaKey);
const khayaResults = [];
for (const [code, label] of KHAYA_TEST_LANGS) {
  const result = await khayaTranslate(khayaKey, code);
  khayaResults.push({ code, label, ...result });
}

const mansaResults = [];
for (const target of MANSA_TEST_TARGETS) {
  const result = await mansaTranslate(mansaKey, target);
  mansaResults.push({ target, ...result });
}

const khayaLanguageMap = khayaLangs.body?.languages ?? {};
const khayaCodes = Object.keys(khayaLanguageMap).filter((c) => c !== 'en');

const lines = [];
lines.push('# Translation API coverage (maintainer reference)');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('Local maintainer doc. API keys stay in `.env` only. Do not commit secrets.');
lines.push('');
lines.push('## Khaya v2 (`translation-api.ghananlp.org`)');
lines.push('');
lines.push('Languages endpoint: `GET /v2/languages`');
lines.push('');
lines.push('| Code | Khaya name | In repo? | Pack slug |');
lines.push('|------|------------|----------|-----------|');
for (const code of khayaCodes.sort()) {
  const name = khayaLanguageMap[code];
  const pack = KHAYA_TO_PACK[code];
  const inRepo = pack ? 'yes' : 'no';
  lines.push(`| \`${code}\` | ${name} | ${inRepo} | ${pack ?? '— (candidate pack)'} |`);
}
lines.push('');
lines.push('### Khaya-only candidates (not shipped yet)');
lines.push('');
for (const code of khayaCodes) {
  if (KHAYA_TO_PACK[code]) continue;
  lines.push(`- **${khayaLanguageMap[code]}** (\`${code}\`)`);
}
lines.push('');
lines.push('### Khaya smoke tests (10 core keywords, one call each)');
lines.push('');
for (const r of khayaResults) {
  lines.push(`#### ${r.label} (\`en-${r.code}\`) — HTTP ${r.status}`);
  lines.push('');
  const out = typeof r.body === 'string' ? r.body : r.body.out ?? r.body.translation ?? JSON.stringify(r.body, null, 2);
  lines.push('```');
  lines.push(String(out).trim());
  lines.push('```');
  lines.push('');
}

lines.push('## Mansa / All Lab Portal (`all-lab-portal.com`)');
lines.push('');
lines.push('Translate endpoint: `POST /api/translate` with `{ token, text, from, to }`.');
lines.push('');
lines.push('Documented African language set (30 names, from All Lab Portal site/docs):');
lines.push('');
lines.push('| Mansa name | In repo? | Pack slug | Notes |');
lines.push('|------------|----------|-----------|-------|');
for (const name of MANSA_LANGUAGES) {
  const pack = MANSA_TO_PACK[name];
  const inRepo = pack ? 'yes' : 'no';
  const notes = pack ? '' : 'candidate for future pack';
  lines.push(`| ${name} | ${inRepo} | ${pack ?? '—'} | ${notes} |`);
}
lines.push('');
lines.push('### Mansa-only candidates (not shipped yet)');
lines.push('');
for (const name of MANSA_LANGUAGES) {
  if (MANSA_TO_PACK[name]) continue;
  lines.push(`- **${name}**`);
}
lines.push('');
lines.push('### Mansa smoke tests (10 core keywords, one call each)');
lines.push('');
for (const r of mansaResults) {
  const b = r.body;
  lines.push(`#### ${r.target} — HTTP ${r.status}`);
  if (b.billing) {
    lines.push(`Cost: $${b.billing.cost?.toFixed?.(4) ?? b.billing.cost}; balance after: $${b.billing.balanceAfter}`);
  }
  lines.push('');
  lines.push('```');
  lines.push(String(b.translation ?? JSON.stringify(b, null, 2)).trim());
  lines.push('```');
  lines.push('');
}

lines.push('## Overlap summary');
lines.push('');
lines.push(`- Repo packs: **${Object.keys(REPO_PACKS).length}**`);
lines.push(`- Khaya v2 targets (excl. English): **${khayaCodes.length}**; in repo: **${khayaCodes.filter((c) => KHAYA_TO_PACK[c]).length}**`);
lines.push(`- Mansa documented set: **${MANSA_LANGUAGES.length}**; in repo: **${Object.values(MANSA_TO_PACK).filter(Boolean).length}**`);
lines.push('');
lines.push('## Usage notes');
lines.push('');
lines.push('- Batch concepts in one paragraph per call. Do not fire 370 separate requests.');
lines.push('- Output is triage only. Native speaker review before any `pack.json` change.');
lines.push('- Khaya: best for Ghana + Kenya niche (Twi, Ewe, Ga, Dagbani, Kikuyu, etc.).');
lines.push('- Mansa: broader continental coverage (Swahili, Zulu, Somali, Chichewa, Malagasy, etc.).');

mkdirSync(researchDir, { recursive: true });
const outPath = resolve(researchDir, 'translation-api-coverage.md');
writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');

console.log('Wrote', outPath);
console.log('Khaya languages:', khayaCodes.join(', '));
console.log('Khaya in repo:', khayaCodes.filter((c) => KHAYA_TO_PACK[c]).map((c) => khayaLanguageMap[c]).join(', '));
console.log('Khaya NOT in repo:', khayaCodes.filter((c) => !KHAYA_TO_PACK[c]).map((c) => khayaLanguageMap[c]).join(', '));
for (const r of mansaResults) {
  console.log(`Mansa ${r.target}: HTTP ${r.status}, balance $${r.body.billing?.balanceAfter ?? '?'}`);
}
