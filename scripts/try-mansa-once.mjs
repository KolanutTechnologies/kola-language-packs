/**
 * One-off Mansa API smoke test. Reads ALL_LAB_PORTAL_API_KEY from .env.
 * Usage: node scripts/try-mansa-once.mjs [target language name]
 * Default target: Hausa. Single request only (cost-conscious).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envText = readFileSync(resolve(root, '.env'), 'utf8');
const token = envText.match(/ALL_LAB_PORTAL_API_KEY=(.+)/)?.[1]?.trim();
if (!token) {
  console.error('Missing ALL_LAB_PORTAL_API_KEY in .env');
  process.exit(1);
}

const target = process.argv[2] ?? 'Hausa';

const text = [
  'Programming keywords for teaching beginners to code.',
  `Translate each numbered item into short, natural ${target} words suitable as code vocabulary (not full sentences):`,
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
  '11. variable — named storage',
  '12. array — list of items',
  '13. string — text type',
  '14. number — numeric type',
  '15. class — object blueprint',
].join('\n');

console.log(`Target: ${target}`);
console.log(`Input chars: ${text.length} (~$${(text.length * 0.0001).toFixed(4)} at $100/1M chars)`);

const res = await fetch('https://all-lab-portal.com/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, text, from: 'English', to: target }),
});

const raw = await res.text();
let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error('Non-JSON response:', raw.slice(0, 500));
  process.exit(1);
}

console.log('HTTP', res.status);
console.log(JSON.stringify(data, null, 2));

if (data.translation) {
  console.log('\n--- translation only ---\n');
  console.log(data.translation);
}
