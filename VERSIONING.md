# Versioning and releases

How version numbers work in `@kolanut/language-packs`.

---

## Two version numbers (today they stay in sync)

| Where | Example | What it means |
|-------|---------|---------------|
| `package.json` → `version` | `0.1.1` | **npm package release** — the whole repo publish |
| Each `pack.json` → `version` | `0.1.1` | Copy of the package version at last release |

**Current policy:** when we publish to npm, **all packs get the same `version`** as `package.json`.

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

Releases are automated on merge to `main` using [release-please](https://github.com/googleapis/release-please).

### How it works

1. PRs merge to `main` with [Conventional Commits](https://www.conventionalcommits.org/) in the **squash merge title**
2. **release-please** opens or updates a **Release PR** with `CHANGELOG.md` + `package.json` bumps
3. A companion workflow syncs all `pack.json` versions into that Release PR
4. A maintainer **merges the Release PR** when ready to ship (batch patches weekly, or merge immediately for features)
5. On merge: GitHub tag + Release are created, then **npm publish** runs

### Commit / PR title prefixes

| Prefix | Release bump | Example |
|--------|--------------|---------|
| `fix:` | patch | `fix(swahili): correct IF alias` |
| `feat:` | minor | `feat: add akan language pack` |
| `feat!:` or `BREAKING CHANGE:` | major | `feat!: rename pack schema field` |
| `docs:`, `chore:`, `ci:` | no release | `docs: update NAMING_GUIDE` |

### Maintainer setup (one-time)

Add an **`NPM_TOKEN`** secret in GitHub repo settings (npm automation token with publish access to `@kolanut/language-packs`).

### Manual fallback

```bash
npm run sync-versions   # align all pack versions to package.json
npm test
npm publish --access public
```

---

## Release notes (GitHub)

- **File:** [`CHANGELOG.md`](./CHANGELOG.md) — updated automatically by release-please
- **GitHub:** Releases tab — created on Release PR merge
- **Contributors:** describe changes in PR body; release-please summarizes from commit titles

---

## Contributors

You **do not** bump npm version. Set `version` in a **new pack** to match current `package.json`. CI checks pack versions stay in sync (`npm run sync-versions -- --check`).
