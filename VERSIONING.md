# Versioning and releases

How version numbers work in `@kolanut/language-packs`.

**Before citing any version:** read `package.json` on disk. Do not guess. Internal JSON files have their own `version` fields. See below.

---

## npm release (the one users care about)

| Where | Source of truth | Meaning |
|-------|-----------------|---------|
| `package.json` → `version` | **Read this file** | **npm package** `@kolanut/language-packs` |
| Each `packs/*/pack.json` → `version` | Synced via `npm run sync-versions` | Same as npm at last sync |
| `CHANGELOG.md` latest `## [x.y.z]` | Dated section | Last prepared or published release |
| `[Unreleased]` in CHANGELOG | Empty after direct-release | Fill during work; cleared when version is dated |

**Current npm version:** check `package.json`. Do not hard-code in docs.

When we publish to npm, **all packs get the same `version`** as `package.json`.

---

## End of every releasable build (required)

After `npm test` passes and the build is ready to ship:

```bash
node scripts/direct-release.mjs
```

This command:

1. Computes the next semver from commits since the last git tag
2. Moves `[Unreleased]` into `## [x.y.z] - date`
3. Updates `package.json`, `.release-please-manifest.json`, and all pack versions

**Do not finish a releasable build with `package.json` still at the last npm release** (e.g. `0.2.0` on npm but Java/C work landed). That causes `npm publish` to fail with "cannot publish over previously published versions".

Preview without writing files: `node scripts/direct-release.mjs --dry-run`

---

## Internal JSON versions (not npm)

These track registry document generations. They **do not** match npm semver.

| File | Field | Purpose |
|------|-------|---------|
| `packs/logical-tokens.json` | `version` | Logical token registry schema generation |
| `packs/official-target-keywords.json` | `version` | Official keyword list document generation |

Example: npm `0.3.0` can coexist with `logical-tokens.json` `4.5.0`. Say which file you mean.

---

## Semver

Format: **MAJOR.MINOR.PATCH**

| Part | Meaning here |
|------|--------------|
| MAJOR | Breaking pack schema (future `1.0.0`) |
| MINOR | New pack, logical token, or programming target |
| PATCH | Translation fix, validation fix, doc fix |

Commit prefixes: `feat:` → minor, `fix:` → patch, `feat!:` → major. `docs:` / `chore:` alone do not release.

---

## Automated releases (CI)

On **push to `main`**, [`.github/workflows/release.yml`](./.github/workflows/release.yml):

1. Runs `direct-release.mjs` (or tags an already-prepared version)
2. Creates **`vX.Y.Z` git tag** + GitHub Release
3. Runs **npm publish** via **Trusted Publisher (OIDC)** from workflow `release.yml`

One-time setup:

| Setting | Where | Value |
|---------|-------|-------|
| **Trusted Publisher** | npm package → Settings → Trusted Publisher | GitHub: `KolanutTechnologies/kola-language-packs`, workflow **`release.yml`**, permission `npm publish` |
| **Workflow permissions** | GitHub repo → Settings → Actions | **Read and write permissions** |

**No `NPM_TOKEN` secret required** when Trusted Publisher is configured. CI uses short-lived OIDC credentials from GitHub Actions.

Manual local publish still uses `npm login` / your npm account.

You do not create tags manually. If a tag is missing, check Actions → **Release**.

---

## Release notes (GitHub)

CI formats the release body (stats line + Install). Preview locally:

```bash
node scripts/release-notes-snippet.mjs 0.3.0
```

### Format (match v0.2.0)

```markdown
## @kolanut/language-packs v0.3.0

149 logical tokens · 25 African language packs · 7 programming targets · 0 keyword gaps

### Added
- …

**Install:** `npm install @kolanut/language-packs@0.3.0`
```

---

## Manual npm publish (fallback)

Only if CI failed. **`package.json` must be higher than npm** (e.g. `0.3.0`, not `0.2.0`).

```bash
npm test
npm run build
npm publish --access public
```

---

## Contributors

In translation PRs, do **not** bump `package.json`. Match `version` in new packs to current `package.json`. Maintainers run `direct-release.mjs` when batching a release.
