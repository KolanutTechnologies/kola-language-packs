# Changelog

Release notes for `@kolanut/language-packs`. Format based on [Keep a Changelog](https://keepachangelog.com/).

Automated releases on push to `main` via [`scripts/direct-release.mjs`](./scripts/direct-release.mjs).

## [Unreleased]

## [0.15.2] - 2026-07-12

### Changed

- Roadmap / tiers: document Learn-mode gloss schedule (keyword stubs like `IN` = any patch; identifiers like `out` = glossary / 0.34.0; builtins = 2.0.0)
- Roadmap / tiers: plan **UI / Design** pack layer with phased **full encounter catalog** (U1–U6): Design-tab set, Tailwind families, telemetry fill; stem+scale compose; people-facing gloss with English host emit
- Roadmap / tiers: **Phase F** future mapping candidates (events/a11y, test DSL, doc markers, diagnostics, optional operator words) with do-not-map list (`futureMappingCandidates`)
- Docs: product **pain/job** (second-language translate-tax; learn and write code in languages people think in) in README, ROADMAP, TIERS, and `productJob`

### Fixed

- Release notes snippet no longer pulls Added/Fixed bullets from older CHANGELOG sections when the target version omits those headings

## [0.15.1] - 2026-07-11

### Fixed

- **ELIF** no longer stubs with English `else` in any pack (was poisoning reverse gloss / Learn round-trips). Safe stub is `elif`; Luganda/Zulu keep native phrases; Yoruba/Hausa/Igbo/Swahili keep native + `elif`
- Pidgin **PRINT** no longer shares bare `show` with Dart **SHOW** (Nigerian Pidgin, Cameroon Pidgin)

### Added

- Validation rejects same-pack keyword form collisions and exclusive cross-token English stubs (`scripts/lib/keyword-form-collision.mjs`); rare linguistic homographs go in `packs/keyword-form-allowlist.json`
- Shared safe English fallback helper (`scripts/lib/english-fallback.mjs`) so `else if` never becomes stub `else`

## [0.15.0] - 2026-07-10

### Added

- `scripts/sync-issue-templates.mjs` and `npm run issue-templates:sync`: auto-update GitHub issue form pack/concept dropdowns from `packs/index.json` and `logical-tokens.json`; CI check on `.github/ISSUE_TEMPLATE/`


## [0.14.1] - 2026-07-10

### Changed

- `CONTRIBUTING.md`: lead with simple path (issue forms + dropdowns) before pull request instructions


## [0.14.0] - 2026-07-09

### Added

- **Non-developer contributions:** GitHub issue forms with **language** and **concept dropdowns** (`translation-suggestion`, `unnatural-phrasing`) and [`CONTRIBUTING-SIMPLE.md`](./CONTRIBUTING-SIMPLE.md) (suggest translations without git, JSON, or npm)

### Changed

- `CONTRIBUTING.md`: correct logical token count (370, not 112); maintainer triage notes for issue suggestions


## [0.13.2] - 2026-07-09

### Changed

- Release docs: npm provenance publish guardrails in `VERSIONING.md` and inline comment in `release.yml` (do not global-upgrade npm before `--provenance`)


## [0.13.1] - 2026-07-09

### Fixed

- CI npm publish: drop global `npm@latest` upgrade that broke `--provenance` (`Cannot find module 'sigstore'`); use bundled npm with `registry-url` for OIDC


## [0.13.0] - 2026-07-09

### Added

- **Arabic** Qalb (قلب) prior-art keyword aliases (`قول`, `حدد`, `لامدا`, `و`, `أو`, `ضمن`, `إفعل`) and IDE gloss seeds (glossary, placeholders, commonLiterals)
- **Yorùbá** prior-art aliases from Yorlang, OduduwaLang, and Orunmilang (`jẹ́kí`, `tàbí`, `sope`, `gbewọlé`, `òótọ́`, `irọ́`, `ati`, and related forms)
- **Swahili** prior-art aliases from Nuru (`kama`, `sivyo`, `au kama`, `fanya`, `unda`, `tumia`, `andika`, `jaza`, and related forms)
- **Hausa** prior-art aliases from Tauraro, Hapy, Hausalang, and Dabara (`koidan`, `sai`, `buga`, `da`, `ko`, `ba`, and related forms)
- **Igbo** prior-art aliases from Igboscript and Ibolang (`oburu`, `pụta`, `deputa`, `kowa`, `ma`, `obu`, `lamuda`, and related forms)
- Roadmap **`priorArtSources`** registry (nine native languages enriched across seven packs)

### Changed

- README: **Language pack registry** identity badge; subtitle clarifies this is tool vocabulary data, not a runtime language
- README: npm weekly downloads badge, GitHub star CTA badge, and one-line star prompt; `package.json` `homepage` and `bugs` for npm sidebar links


## [0.12.1] - 2026-07-08

### Changed

- IDE tier metadata: product-neutral descriptions in `ide-tier-seeds.json` and `languages-roadmap.json` (no Kola Code coupling)


## [0.12.0] - 2026-07-08

### Added

- **Product roadmap:** [`packs/ROADMAP.md`](./packs/ROADMAP.md) (version plan 0.12 → 1.0 → 2.0), [`packs/TIERS.md`](./packs/TIERS.md) (scope ceilings), and refreshed [`packs/languages-roadmap.json`](./packs/languages-roadmap.json) (`releaseSequence` with patch/minor/major bumps)

### Changed

- Roadmap JSON: removed shipped packs from `planned`, fixed stale token counts, added African expansion waves and Tier-A programming targets


## [0.11.1] - 2026-07-08

### Fixed

- README metrics generator sync for all 15 targets, coverage tables, and regional pack lists

## [0.11.0] - 2026-07-08

### Added

- **Zulu**, **Twi**, and **Luganda** IDE gloss tiers — **8 IDE-ready** packs (keywords + glossary + placeholders + commonLiterals)


## [0.10.0] - 2026-07-08

### Added

- **Cameroon Pidgin** (`wes-CM`) and **Efik** (`efi-NG`) language packs — **28 African language packs**

## [0.9.0] - 2026-07-08

### Added

- **Swift**, **Dart**, **Ruby**, **PHP**, and **R** programming targets — **15 targets** total, **370 logical tokens**, 0 coverage gaps
- Maintainer scripts: `add-swift-target.mjs`, `add-dart-target.mjs`, `add-ruby-target.mjs`, `add-php-target.mjs`, `add-r-target.mjs`
- **Akan** language pack (`ak-GH`) — **26 African language packs**

### Changed

- IDE glossary key `list` → `item_list` (PHP keyword collision)

## [0.8.0] - 2026-07-08

### Added

- **Kotlin** programming target (80 keywords, 0 coverage gaps)
- 28 Kotlin-only logical tokens (`VAL`, `SUSPEND`, `TYPEALIAS`, `COMPANION`, `DATA`, …). **249 tokens** total, **10 targets**.
- `scripts/add-kotlin-target.mjs` maintainer script
- `scripts/add-language-pack.mjs` for adding African packs without full bootstrap

### Changed

- IDE glossary keys `data` → `payload`, `file` → `file_ref` (Kotlin keyword collision)

## [0.7.0] - 2026-07-08

### Added

- **Swahili** IDE gloss tiers (glossary, placeholders, commonLiterals) — **5 IDE-ready** packs

## [0.6.0] - 2026-07-08

### Added

- **C#** programming target (C# 12 keywords, 104 reserved/contextual words, 0 coverage gaps)
- 36 C#-only logical tokens (`DELEGATE`, `FOREACH`, `LOCK`, LINQ keywords, …). **221 tokens** total, **9 targets**.
- `scripts/add-csharp-target.mjs` maintainer script for the C# target migration

### Changed

- IDE glossary key `value` → `data_value` in four IDE-ready packs (avoids collision with C# keyword `value`)

## [0.5.0] - 2026-07-08

### Added

- **C++** programming target (C++20 keywords, 92 reserved words, 0 coverage gaps)
- 36 C++-only logical tokens (`TEMPLATE`, `VIRTUAL`, `CONCEPT`, `CO_AWAIT`, cast operators, …). **185 tokens** total.
- `scripts/add-cpp-target.mjs` maintainer script for the C++ target migration
- **Igbo** IDE gloss tiers (glossary, placeholders, commonLiterals) — **4 IDE-ready** packs

### Fixed

- CI release: tag-only path when maintainer already committed version bump (no empty `git commit`)

## [0.4.0] - 2026-07-08

### Added

- IDE gloss tiers integration: `glossary`, `placeholders`, and `commonLiterals` (optional in `pack.json` or separate JSON files per pack)
- Starter tier content (30 glossary + 12 placeholders + 15 common literals) for **Yorùbá**, **Hausa**, and **Nigerian Pidgin**
- `packs/ide-tier-seeds.json`, `scripts/bootstrap-ide-tiers.mjs`, and `scripts/update-index-ide-fields.mjs`
- `packs/index.json`: `targets` and `ideReady` on every entry (3 packs IDE-ready)
- TypeScript: `GlossTierMap`, `TargetLanguage`, loaders for glossary / placeholders / common literals
- npm export: `./packs/index.json`
- Validation: English fallback, glossary vs keyword collision, duplicate gloss phrases, IDE-ready tier minimums

## [0.3.1] - 2026-07-07

### Changed

- CI npm publish: Trusted Publisher (OIDC) via `release.yml`; no `NPM_TOKEN` secret required
- CI npm publish: catch-up job when git tag exists but npm is behind; manual republish via workflow dispatch

## [0.3.0] - 2026-07-07

### Added

- **Java** programming target (JLS §3.9 keywords, 51 reserved words, 0 coverage gaps)
- 14 Java-only logical tokens (`BYTE`, `CHAR`, `SHORT`, `INT`, `LONG`, `FLOAT`, `DOUBLE`, `FINAL`, `NATIVE`, `STRICTFP`, `SYNCHRONIZED`, `THROWS`, `TRANSIENT`, `VOLATILE`). **129 tokens** after Java.
- `scripts/add-java-target.mjs` maintainer script for the Java target migration
- **C** programming target (C11 §6.4.1 keywords, 45 reserved words, 0 coverage gaps)
- 20 C-only logical tokens (`AUTO`, `REGISTER`, …, `ASM`). **149 tokens** total.
- `scripts/add-c-target.mjs` maintainer script for the C target migration
- `scripts/release-notes-snippet.mjs` GitHub release notes helper
- `scripts/direct-release.mjs` direct release on push (no Release PR)

### Changed

- README: shields.io badges for African language packs, programming targets, logical tokens, and license
- `VERSIONING.md`: npm semver vs internal JSON versions; direct-release workflow; end-of-build version rule
- Clarified `official-target-keywords.json` spec notes for JavaScript, Python, TypeScript, Go, and Rust
- All 25 packs include `java` and `c` in `targets`; new token slots use English fallback until community translation

### Fixed

- Java: missing reserved keyword `_`; added `UNDERSCORE` logical token (**51** JLS keywords)
- CI release: replace release-please with `direct-release.mjs` (fixes GITHUB_TOKEN PR permission errors)

## [0.2.0] - 2026-07-07

### Added

- Contributor docs: `NAMING_GUIDE.md`, `DIALECTS.md`, `GLOSSARY.md`, `REPO_MAP.md`, `language-registry.json`
- Validation for `displayName`, `description`, `reviewStatus`, duplicate locales
- Automated releases: GitHub Actions CI, release-please, npm publish workflow
- `scripts/sync-pack-versions.mjs`, `scripts/bump-version.mjs`, and `scripts/ensure-pack-tokens.mjs`
- Logical token **GEN** (Rust 2024 `gen` keyword) and **LAZY** (Python 3.15 `lazy` soft keyword, PEP 810) — **114 tokens** total
- Roadmap entries for **R** and **Clojure** programming targets (`v0.5.0+`)

### Changed

- Documentation: Africa-first examples, clearer command guide, standards explanation
- `VERSIONING.md`, `CONTRIBUTING.md`, and `scripts/README.md` updated for automated release flow
- `languages-roadmap.json` release sequence now includes `v0.4.0+` and `v0.5.0+` target phases

### Fixed

- Stop tracking `.cursor/` in git — IDE-local only

## [0.1.1] - 2026-07-04

### Added

- 25 African language packs (112 logical tokens each)
- npm package `@kolanut/language-packs`
- Validation and keyword coverage checks
[0.15.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.15.1
[0.15.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.15.0
[0.14.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.14.1
[0.14.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.14.0
[0.13.2]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.13.2
[0.13.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.13.1
[0.13.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.13.0
[0.12.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.12.1
[0.12.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.12.0
[0.11.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.11.1
[Unreleased]: https://github.com/KolanutTechnologies/kola-language-packs/compare/v0.15.2...HEAD
[0.15.2]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.15.2
[0.5.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.5.0
[0.4.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.4.0
[0.3.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.3.1
[0.3.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.3.0
[0.2.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.2.0
[0.1.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.1.1
