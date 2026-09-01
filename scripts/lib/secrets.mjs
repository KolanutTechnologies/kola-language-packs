/**
 * Resolve named secrets without keeping them in the project tree.
 * Order: process.env -> Windows Credential Manager (kola:<name>) -> repo .env fallback.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** @type {Map<string, {value: string, source: string} | null>} */
const cache = new Map();
/** @type {Record<string, string> | undefined} */
let dotEnvCache;

function loadDotEnv() {
  if (dotEnvCache !== undefined) return dotEnvCache;
  dotEnvCache = {};
  try {
    const text = readFileSync(resolve(root, '.env'), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i === -1) continue;
      dotEnvCache[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  } catch {
    // .env absent is fine once Credential Manager holds everything
  }
  return dotEnvCache;
}

function credentialTarget(name) {
  return `kola:${name.toLowerCase().replace(/_/g, '-')}`;
}

function runCredReadScript(target) {
  const ps = `
$ProgressPreference = 'SilentlyContinue'
$sig = @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class KolaCredMan {
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  struct CREDENTIAL {
    public int Flags; public int Type; public string TargetName; public string Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
    public int CredentialBlobSize; public IntPtr CredentialBlob; public int Persist;
    public int AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName;
  }
  [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)]
  static extern bool CredReadW(string target, int type, int flags, out IntPtr credPtr);
  [DllImport("advapi32.dll")]
  static extern void CredFree(IntPtr cred);
  public static string Read(string target) {
    IntPtr ptr;
    if (!CredReadW(target, 1, 0, out ptr)) return null;
    CREDENTIAL c = (CREDENTIAL)Marshal.PtrToStructure(ptr, typeof(CREDENTIAL));
    byte[] blob = new byte[c.CredentialBlobSize];
    Marshal.Copy(c.CredentialBlob, blob, 0, c.CredentialBlobSize);
    CredFree(ptr);
    bool isUtf16 = blob.Length > 0 && blob.Length % 2 == 0;
    if (isUtf16) {
      for (int i = 1; i < blob.Length; i += 2) { if (blob[i] != 0) { isUtf16 = false; break; } }
    }
    string s = isUtf16 ? Encoding.Unicode.GetString(blob) : Encoding.UTF8.GetString(blob);
    return s.TrimEnd('\\0');
  }
}
'@
Add-Type -TypeDefinition $sig
[KolaCredMan]::Read('${target}')
`;
  const encoded = Buffer.from(ps, 'utf16le').toString('base64');
  const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 15000,
  });
  return out.trim();
}

export function resolveSecret(name) {
  if (typeof name !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid secret name: ${name}`);
  }
  if (cache.has(name)) return cache.get(name);

  let result = null;

  if (process.env[name]) {
    result = { value: process.env[name].trim(), source: 'environment' };
  }

  if (!result && process.platform === 'win32') {
    try {
      const value = runCredReadScript(credentialTarget(name));
      if (value) result = { value, source: 'credential-manager' };
    } catch {
      // credential missing or CredRead failed; continue to .env fallback
    }
  }

  if (!result) {
    const fromFile = loadDotEnv()[name];
    if (fromFile) {
      console.warn(
        `[secrets] ${name} came from the repo .env file. Migrate it:\n` +
          `  cmdkey /generic:"${credentialTarget(name)}" /user:api /pass:<VALUE>\n` +
          'then delete the entry from .env.',
      );
      result = { value: fromFile, source: '.env-fallback' };
    }
  }

  cache.set(name, result);
  return result;
}

export function getSecret(name) {
  return resolveSecret(name)?.value ?? null;
}
