# Versioning and releases

How version numbers work in `@kolanut/language-packs`.

**Before citing any version:** read `package.json` on disk. Do not guess. Internal JSON files have their own `version` fields — see below.

---

## npm release (the one users care about)

| Where | Source of truth | Meaning |
|-------|-----------------|---------|
| `package.json` → `version` | **Read this file** | **npm package** `@kolanut/language-packs` |
| Each `packs/*/pack.json` → `version` | Synced via `npm run sync-versions` | Same as npm at last sync |
| `CHANGELOG.md` latest `## [x.y.z]` | Dated section | Last **published** release on npm |
| `[Unreleased]` in CHANGELOG | Working tree | Not on npm until Release PR merges |

**Current npm version:** check `package.json` — do not hard-code in docs.

When we publish to npm, **all packs get the same `version`** as `package.json`.

---

## Internal JSON versions (not npm)

These track registry document generations. They **do not** match npm semver.

| File | Field | Purpose |
|------|-------|---------|
| `packs/logical-tokens.json` | `version` | Logical token registry schema generation |
| `packs/official-target-keywords.json` | `version` | Official keyword list document generation |

Example: npm `0.3.0` can coexist with `logical-tokens.json` `4.4.0` and `official-target-keywords.json` `1.6.0`. Say which file you mean.

---

## Two version numbers (packs follow npm)

| Where | Example | What it means |
|-------|---------|---------------|
| `package.json` → `version` | *(read file)* | **npm package release** — the whole repo publish |
| Each `pack.json` → `version` | *(same as package.json after sync)* | Copy of the package version at last release |

---

## Can one pack be `0.1.2` while another is `0.1.1`?

**Not today.** Nothing in the tooling tracks per-pack semver separately. A future web app might — for now, one release bumps everything together.

If you improve only Swahili in a PR, the **npm package** still patches (`0.1.1` → `0.1.2`) and all pack `version` fields update to match on release.

---

## Semver — what the digits mean (`0.1.1`)

Format: **MAJOR.MINOR.PATCH**

| Part | Value | Meaning here |
|------|-------|--------------|
| MAJOR | `0` | Pre-1.0 — API and pack format may still evolve |
| MINOR | `1` | Feature set generation (e.g. 25 packs, 112 tokens shipped) |
| PATCH | `1` | Bug fixes, translation improvements, doc fixes — no breaking schema change |

Examples:

- Translation fixes only → **patch** (`0.1.1` → `0.1.2`)
- New logical tokens or new programming target → **minor** (`0.1.x` → `0.2.0`)
- Breaking pack schema change → **major** (`0.x` → `1.0.0`) — future

---

## Automated releases (release-please)

Releases are **automatic on push to `main`** — no Release PR to merge, no manual `git tag`.

### What happens on push

1. Conventional commits since the last tag (`v0.2.0`, `v0.3.0`, …) are collected
2. **release-please** bumps `package.json`, dates `CHANGELOG.md`, creates **`vX.Y.Z` git tag** + GitHub Release
3. CI formats the release body (stats line + Install — same format as v0.2.0)
4. **npm publish** runs from the tagged commit
5. A follow-up commit syncs all `pack.json` versions on `main`

**You never create tags manually.** If `v0.3.0` is missing, the Release workflow did not succeed — check Actions → Release.

### One-time repo setup

| Setting | Where | Value |
|---------|-------|-------|
| Workflow permissions | Settings → Actions → General | **Read and write permissions** |
| `NPM_TOKEN` | Settings → Secrets | npm automation token with publish access |
| `RELEASE_PLEASE_TOKEN` (optional) | Settings → Secrets | PAT with `contents: write` if org restricts `GITHUB_TOKEN` |

We use `skip-github-pull-request: true` so release-please does **not** open a Release PR (avoids “Actions not permitted to create pull requests”).

### Commit / PR title prefixes

| Prefix | Release bump | Example |
|--------|--------------|---------|
| `fix:` | patch | `fix(swahili): correct IF alias` |
| `feat:` | minor | `feat: add akan language pack` |
| `feat!:` or `BREAKING CHANGE:` | major | `feat!: rename pack schema field` |
| `docs:`, `chore:`, `ci:` | no release | `docs: update NAMING_GUIDE` |

### Maintainer setup (one-time)

Add **`NPM_TOKEN`** in GitHub repo secrets (npm automation token with publish access to `@kolanut/language-packs`).

Enable **Read and write permissions** for GitHub Actions (Settings → Actions → General → Workflow permissions).

### Manual fallback

```bash
npm run sync-versions   # align all pack versions to package.json
npm test
npm publish --access public
```

---

## Release notes (GitHub)

release-please creates a GitHub Release from CHANGELOG on Release PR merge. For the **published format** (stats line + Install), paste this template — or run:

```bash
node scripts/release-notes-snippet.mjs 0.3.0
```

### Format (match v0.2.0)

```markdown
## @kolanut/language-packs v0.3.0

149 logical tokens · 25 African language packs · 7 programming targets · 0 keyword gaps

### Added
- …

### Changed
- …

### Fixed
- …

**Install:** `npm install @kolanut/language-packs@0.3.0`
```

- **File:** [`CHANGELOG.md`](./CHANGELOG.md) — `[Unreleased]` on feature PRs; release-please dates it on tag
- **Contributors:** conventional commit squash titles; release-please summarizes into CHANGELOG

### release-please must stay aligned

| File | Must match |
|------|------------|
| `.release-please-manifest.json` | Last **git tag** (e.g. `v0.2.0` → `"0.2.0"`) |
| `package.json` `version` | Same as manifest until Release PR merges |
| `CHANGELOG.md` | `[Unreleased]` only — do not pre-date future versions on `main` |

Manual `bump-version.mjs` or manual `git tag` causes **Release workflow drift**. Tags are CI-owned.

---

## Contributors

You **do not** bump npm version. Set `version` in a **new pack** to match current `package.json`. CI checks pack versions stay in sync (`npm run sync-versions -- --check`).
