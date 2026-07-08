# Scripts — what they do

All commands run from the **repo root** (`kola-language-packs/`).

---

## For contributors

### `validate.mjs` — via `npm test`

**What it does:** Reads every pack and checks:

- Required fields exist (`displayName`, `locale`, `keywords`, …)
- All logical tokens are translated (see `packs/logical-tokens.json`)
- `keywords.json` matches `pack.json`
- Optional IDE tiers (`glossary.json`, `placeholders.json`, `common-literals.json`): English fallback, keyword collision, duplicate gloss phrases
- `index.json` includes `targets`, `ideReady`, and matches each pack
- No duplicate locales

**Does it change files?** No — read-only check.

**When:** Every PR. Run `npm test`.

---

### `generate-language-registry.mjs` — via `npm run registry`

**What it does:** Rebuilds `packs/language-registry.json` from `index.json` + roadmap.

**Does it change files?** Yes — updates one file (`language-registry.json`).

**When:** After adding a **new** pack to `index.json`. Not needed for translation-only edits.

---

### `generate-coverage.mjs` — via `npm test` (second step)

**What it does:** Checks official programming-language keywords are covered; writes `packs/coverage-summary.json`.

**Does it change files?** Yes — updates `coverage-summary.json`.

**When:** Runs automatically in `npm test`.

---

## Maintainers only

### `bootstrap-packs.mjs` — via `npm run bootstrap`

**What it does:** **Overwrites** all `packs/*/pack.json` and `keywords.json` from definitions inside this script. Also regenerates `by-country.json`, `by-region.json`, etc.

**Does it change files?** Yes — **many files at once**. Community hand-edits in pack folders can be **lost**.

**When:** Only when intentionally regenerating from the bootstrap source. **Contributors must not run this.**

---

### `add-java-target.mjs` — maintainer (one-time / reference)

**What it does:** Adds Java as a transpile target — updates `logical-tokens.json`, `official-target-keywords.json`, pack schema, and all pack `targets` arrays; runs `ensure-pack-tokens` + coverage.

**When:** Already applied in v0.3.0. Re-run only if setting up a fresh fork without Java.

---

### `update-readme-metrics.mjs` — via `npm run readme:sync` (alias: `readme:metrics`)

**What it does:** Updates the shields.io badge row and “At a glance” metrics table in `README.md`.

**When:** After shipping new packs or changing roadmap counts.

---

### `sync-pack-versions.mjs` — via `npm run sync-versions`

**What it does:** Sets every pack `version` field (and related index/roadmap JSON) to match `package.json`.

**Does it change files?** Yes — updates `packs/*/pack.json`, `index.json`, `languages-roadmap.json`, `language-registry.json`, `by-country.json`, `by-region.json`.

**When:** Automatically on release (CI). Maintainers can run manually before publish. Use `--check` in CI to fail if versions drift.

---

### `ensure-pack-tokens.mjs` — via `npm run ensure-tokens`

**What it does:** Adds missing logical tokens to every pack using English fallback labels. Syncs `keywords.json` with `pack.json`.

**Does it change files?** Yes — only missing keyword slots in pack folders.

**When:** After adding tokens to `logical-tokens.json`. Safer than `bootstrap` — does not overwrite existing translations.

---

### `bump-version.mjs` — via `npm run bump-version`

**What it does:** Bumps `package.json` semver (`patch`, `minor`, or `major`), updates `.release-please-manifest.json`, then runs `sync-versions`.

**Does it change files?** Yes — version fields across the repo.

**When:** Completing a releasable change (maintainer or agent per build skill). Not for `docs:`/`chore:`-only work.

---

## Quick reference

| npm command | Script | Changes files? | Contributor? |
|-------------|--------|----------------|--------------|
| `npm test` | validate + coverage + README sync | coverage-summary + README.md | **Yes — always** |
| `npm run readme:sync` | update-readme-metrics | README.md | After pack/target/token changes |
| `npm run registry` | generate-language-registry | language-registry.json | New pack only |
| `npm run ensure-tokens` | ensure-pack-tokens | missing keywords in packs | Maintainers (new tokens) |
| `npm run sync-versions` | sync-pack-versions | pack + index versions | Maintainers / CI |
| `npm run bump-version` | bump-version | package + all pack versions | Maintainers only |
| `npm run bootstrap` | bootstrap-packs | **All packs** | **No** |
| `npm run build` | TypeScript compiler | `dist/` | No (unless TS work) |
