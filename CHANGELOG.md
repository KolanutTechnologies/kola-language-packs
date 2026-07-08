# Changelog

Release notes for `@kolanut/language-packs`. Format based on [Keep a Changelog](https://keepachangelog.com/).

Automated releases on push to `main` via [`scripts/direct-release.mjs`](./scripts/direct-release.mjs).

## [Unreleased]

## [0.9.0] - 2026-07-08

### Added

- **Swift**, **Dart**, **Ruby**, **PHP**, and **R** programming targets — **15 targets** total, **370 logical tokens**, 0 coverage gaps
- Maintainer scripts: `add-swift-target.mjs`, `add-dart-target.mjs`, `add-ruby-target.mjs`, `add-php-target.mjs`, `add-r-target.mjs`

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

[Unreleased]: https://github.com/KolanutTechnologies/kola-language-packs/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.5.0
[0.4.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.4.0
[0.3.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.3.1
[0.3.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.3.0
[0.2.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.2.0
[0.1.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.1.1
