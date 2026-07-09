# What each file and folder is for

Quick map of this repository. **Contributors** mostly touch `packs/<language>/` only.

---

## You edit these (contributors)

| Path | Purpose |
|------|---------|
| `packs/<name>/pack.json` | Metadata + all keyword translations |
| `packs/<name>/keywords.json` | Same keywords as `pack.json` (for tools) |
| `packs/index.json` | Directory of all packs — add a row for **new** packs only |

## You read these (contributors)

| Path | Purpose |
|------|---------|
| `packs/logical-tokens.json` | Checklist of **370** concepts every pack must translate |
| `packs/ROADMAP.md` | Version plan (patch / minor / major releases) |
| `packs/TIERS.md` | Pack layers (keywords, glossary, placeholders, stdlib) |
| `packs/language-registry.json` | Taken / planned pack names and locales |
| `CONTRIBUTING.md` | Step-by-step how to contribute (PRs, npm test) |
| `CONTRIBUTING-SIMPLE.md` | Suggest translations via GitHub Issues (no coding) |
| `.github/ISSUE_TEMPLATE/` | Issue forms for translation suggestions and review |
| `packs/NAMING_GUIDE.md` | Naming, locale format, new pack steps |
| `packs/DIALECTS.md` | Dialect → aliases vs new pack |
| `packs/GLOSSARY.md` | ISO 639, ISO 3166-1, BCP-47 explained |

## Do not edit (unless maintainer)

| Path | Purpose |
|------|---------|
| `packs/logical-tokens.json` | Shared concept registry — separate PR to add concepts |
| `packs/official-target-keywords.json` | Spec-backed keyword lists per programming language |
| `packs/target-coverage.json` | Maps tokens → target keywords |
| `packs/coverage-summary.json` | **Auto-generated** coverage report |
| `packs/by-country.json` | **Auto-generated** country → pack index |
| `packs/by-region.json` | **Auto-generated** region → pack index |
| `packs/language-registry.json` | **Auto-generated** — run `npm run registry` after new pack |
| `scripts/*` | Validation and generation — see [`scripts/README.md`](../scripts/README.md) |
| `pack.schema.json` | JSON Schema — required fields and formats for `pack.json` |
| `src/` | TypeScript npm API (`loadPack`, etc.) |
| `dist/` | **Built output** for npm — from `npm run build` |

---

## What is `pack.schema.json`?

A **contract** for `pack.json`. It defines:

- Required fields (`name`, `languageCode`, `locale`, `keywords`, …)
- Valid formats (e.g. `locale` must look like `sw-KE`)
- Allowed values (e.g. `reviewStatus`: `starter` | `community-reviewed` | `partner-verified`)

`npm test` uses the same rules in code. If your pack passes `npm test`, it matches the schema.

---

## Root files

| File | Purpose |
|------|---------|
| `package.json` | npm package `@kolanut/language-packs` — version, scripts, publish config |
| `README.md` | Project overview for GitHub and npm |
| `CHANGELOG.md` | Release notes (what changed each version) |
| `VERSIONING.md` | How npm version and pack versions relate |
| `LICENSE` | Apache 2.0 |

---

## If you edit the wrong file

| Mistake | What happens |
|---------|----------------|
| Wrong pack folder | PR review catches it |
| Invalid JSON / missing fields | `npm test` fails — fix before merge |
| Ran `npm run bootstrap` as contributor | May overwrite all packs — **maintainers will reject** |
| Duplicate locale in `index.json` | `npm test` fails |

You do not break npm or production by a bad PR — CI runs `npm test` before merge.
