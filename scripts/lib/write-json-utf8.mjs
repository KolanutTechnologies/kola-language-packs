// UTF-8-safe JSON I/O helpers.
//
// Why this module exists: this repo previously suffered mojibake incidents
// where diacritics in African-language pack data (Yorùbá subdots, Ethiopic,
// Arabic script) were corrupted because files were written through tools that
// did not guarantee explicit UTF-8 encoding (notably PowerShell rewrites,
// which default to legacy code pages on Windows). Always route JSON writes
// through these helpers so every file lands on disk as BOM-less UTF-8.

import { writeFile, readFile } from 'node:fs/promises';

/**
 * Serialize `data` as pretty-printed JSON (2-space indent, trailing newline)
 * and write it to `filePath` with an explicit 'utf8' encoding so no platform
 * default code page can ever mangle non-ASCII content. Never emits a BOM.
 *
 * @param {string} filePath Absolute or repo-relative destination path.
 * @param {unknown} data JSON-serializable value.
 * @returns {Promise<void>}
 */
export async function writeJsonUtf8(filePath, data) {
  const text = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(filePath, text, 'utf8');
}

/**
 * Read a JSON file as UTF-8 and parse it.
 *
 * @param {string} filePath Path to a UTF-8 JSON file.
 * @returns {Promise<any>} Parsed JSON value.
 */
export async function readJsonUtf8(filePath) {
  const text = await readFile(filePath, 'utf8');
  return JSON.parse(text);
}
