#!/usr/bin/env node
// Regression guard against mojibake incidents (see scripts/lib/write-json-utf8.mjs).
//
// 1. Scans repo text sources (*.json, *.md, *.mjs, *.ts) for U+FFFD
//    replacement characters — hard failure on any hit.
// 2. Roundtrips real non-ASCII fixtures from pack data through
//    writeJsonUtf8 into the OS temp dir and verifies byte-level UTF-8
//    integrity (valid decode, lossless parse, no BOM).
// 3. Dual-encoding fixture: NFD form of a real alias survives roundtrip and
//    normalizes back to the stored NFC form.
// 4. Report-only NFC audit of pack displayNames/aliases (validate.mjs enforces).
//
// Exit code 0 = clean, 1 = corruption detected or roundtrip failed.

import { readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { writeJsonUtf8, readJsonUtf8 } from './lib/write-json-utf8.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
const SCAN_EXTENSIONS = new Set(['.json', '.md', '.mjs', '.ts']);
const REPLACEMENT_CHAR = '\uFFFD';
const strictDecoder = new TextDecoder('utf-8', { fatal: true });

/** @returns {Promise<string[]>} Repo-relative paths of scannable text files. */
async function collectScannableFiles() {
  const out = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(full);
      } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
        out.push(path.relative(repoRoot, full));
      }
    }
  }
  await walk(repoRoot);
  return out.sort();
}

async function scanForReplacementChars(files) {
  const offenders = [];
  for (const rel of files) {
    const text = await readFile(path.join(repoRoot, rel), 'utf8');
    if (text.includes(REPLACEMENT_CHAR)) offenders.push(rel);
  }
  return offenders;
}

async function loadPackFixtures() {
  const yoruba = await readJsonUtf8(path.join(repoRoot, 'packs/yoruba/pack.json'));
  const arabic = await readJsonUtf8(path.join(repoRoot, 'packs/arabic/pack.json'));
  const amharic = await readJsonUtf8(path.join(repoRoot, 'packs/amharic/pack.json'));

  const fixtures = [
    ['yoruba', { displayName: yoruba.displayName, ifAlias: yoruba.keywords.IF[0] }],
    ['arabic', arabic.keywords.IF[0]],
    ['amharic', amharic.keywords.IF[0]],
  ];
  for (const [label, value] of fixtures) {
    if (value == null || (typeof value === 'string' && value.length === 0)) {
      throw new Error(`fixture missing: ${label}`);
    }
  }
  return fixtures;
}

async function roundtripFixtures(fixtures) {
  const stamp = `${process.pid}-${Date.now()}`;
  const tempPaths = [];
  try {
    for (const [i, [, value]] of fixtures.entries()) {
      const tempPath = path.join(os.tmpdir(), `kola-utf8-roundtrip-${stamp}-${i}.json`);
      tempPaths.push(tempPath);
      await writeJsonUtf8(tempPath, value);

      const buffer = await readFile(tempPath);
      // (i) bytes must decode as valid UTF-8 (throws otherwise)
      strictDecoder.decode(buffer);
      // (ii) parsed content must deep-equal the original data
      assert.deepStrictEqual(JSON.parse(buffer.toString('utf8')), value);
      // (iii) must not start with a UTF-8 BOM (EF BB BF)
      assert.ok(
        !(buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf),
        `BOM detected in ${tempPath}`,
      );
    }
  } finally {
    await Promise.all(
      tempPaths.map((p) => rm(p, { force: true }).catch(() => {})),
    );
  }
}

/**
 * Dual-encoding fixture: a decomposed (NFD) form of a real pack string must
 * survive the write/read roundtrip byte-for-byte AND normalize back to the
 * canonical NFC form the registry stores. Proves that macOS-style NFD input
 * is recoverable and that NFC comparison in validate.mjs is sound.
 */
async function dualEncodingFixture() {
  const yoruba = await readJsonUtf8(path.join(repoRoot, 'packs/yoruba/pack.json'));
  const canonical = yoruba.keywords.IF[0]; // e.g. 'ṣé' (NFC)
  const decomposed = canonical.normalize('NFD');
  assert.notStrictEqual(decomposed, canonical, 'fixture expected to have combining marks');

  const stamp = `${process.pid}-${Date.now()}`;
  const tempPath = path.join(os.tmpdir(), `kola-utf8-nfd-${stamp}.json`);
  try {
    await writeJsonUtf8(tempPath, { phrase: decomposed });
    const buffer = await readFile(tempPath);
    strictDecoder.decode(buffer); // valid UTF-8
    const parsed = JSON.parse(buffer.toString('utf8')).phrase;
    assert.strictEqual(parsed, decomposed, 'NFD bytes must survive roundtrip unchanged');
    assert.strictEqual(parsed.normalize('NFC'), canonical, 'NFD must normalize back to stored NFC form');
  } finally {
    await rm(tempPath, { force: true }).catch(() => {});
  }
}

async function auditNfc() {
  const packsDir = path.join(repoRoot, 'packs');
  const packDirs = (await readdir(packsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  let totalChecked = 0;
  const nonNfcByPack = new Map();
  for (const packName of packDirs) {
    const packPath = path.join(packsDir, packName, 'pack.json');
    let pack;
    try {
      pack = await readJsonUtf8(packPath);
    } catch {
      continue;
    }
    const candidates = [];
    if (typeof pack.displayName === 'string') candidates.push(pack.displayName);
    if (pack.keywords && typeof pack.keywords === 'object') {
      for (const aliases of Object.values(pack.keywords)) {
        if (Array.isArray(aliases)) {
          for (const alias of aliases) {
            if (typeof alias === 'string') candidates.push(alias);
          }
        }
      }
    }
    let nonNfc = 0;
    for (const str of candidates) {
      totalChecked += 1;
      if (str !== str.normalize('NFC')) nonNfc += 1;
    }
    if (nonNfc > 0) nonNfcByPack.set(packName, nonNfc);
  }
  return { totalChecked, nonNfcByPack };
}

async function main() {
  const failures = [];

  const files = await collectScannableFiles();
  const offenders = await scanForReplacementChars(files);
  if (offenders.length > 0) {
    failures.push(
      `U+FFFD replacement character found in ${offenders.length} file(s):\n` +
        offenders.map((f) => `  - ${f}`).join('\n'),
    );
  }

  let roundtripOk = false;
  try {
    const fixtures = await loadPackFixtures();
    await roundtripFixtures(fixtures);
    await dualEncodingFixture();
    roundtripOk = true;
  } catch (err) {
    failures.push(`roundtrip failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const fixtureCount = roundtripOk ? 4 : 0;

  const { totalChecked, nonNfcByPack } = await auditNfc();
  const nonNfcTotal = [...nonNfcByPack.values()].reduce((a, b) => a + b, 0);
  if (nonNfcTotal > 0) {
    console.warn(
      '[info] Non-NFC normalized strings detected (normalization policy lands in a later phase):',
    );
    for (const [packName, count] of nonNfcByPack) {
      console.warn(`[info]   - ${packName}: ${count} non-NFC string(s)`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`FAIL: ${failure}`);
    console.error(`UTF-8 guard: FAILED (${files.length} files scanned)`);
    process.exit(1);
  }

  console.log(
    `UTF-8 guard: ${files.length} files scanned, 0 replacement chars, ` +
      `roundtrip OK (${fixtureCount} fixtures), ` +
      `non-NFC strings: ${nonNfcTotal}/${totalChecked} checked (informational)`,
  );
}

main().catch((err) => {
  console.error(`FAIL: ${err instanceof Error ? err.stack : String(err)}`);
  process.exit(1);
});
