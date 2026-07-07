# Changelog

Release notes for `@kolanut/language-packs`. Format based on [Keep a Changelog](https://keepachangelog.com/).

Automated releases via [release-please](https://github.com/googleapis/release-please) on merge of the Release PR.

## [Unreleased]

### Added

- **Java** programming target — JLS §3.9 keywords (51 reserved words, 0 coverage gaps)
- 14 Java-only logical tokens (`BYTE`, `CHAR`, `SHORT`, `INT`, `LONG`, `FLOAT`, `DOUBLE`, `FINAL`, `NATIVE`, `STRICTFP`, `SYNCHRONIZED`, `THROWS`, `TRANSIENT`, `VOLATILE`) — **129 tokens** after Java
- `scripts/add-java-target.mjs` — maintainer script for the Java target migration
- **C** programming target — C11 §6.4.1 keywords (45 reserved words, 0 coverage gaps)
- 20 C-only logical tokens (`AUTO`, `REGISTER`, `SIGNED`, `UNSIGNED`, `SIZEOF`, `TYPEDEF`, `UNION`, `INLINE`, `RESTRICT`, `C_BOOL`, `C_COMPLEX`, `C_IMAGINARY`, `C_ALIGNAS`, `C_ALIGNOF`, `C_ATOMIC`, `C_GENERIC`, `C_NORETURN`, `C_STATIC_ASSERT`, `C_THREAD_LOCAL`, `ASM`) — **149 tokens** total
- `scripts/add-c-target.mjs` — maintainer script for the C target migration
- `scripts/release-notes-snippet.mjs` — GitHub release notes copy-paste helper

### Changed

- README: shields.io badges for African language packs, programming targets, logical tokens, and license
- `VERSIONING.md`: separate npm semver from internal JSON registry versions; release-please alignment; GitHub release notes format
- Clarified `official-target-keywords.json` spec notes for JavaScript, Python, TypeScript, Go, and Rust (keyword tiers; no list changes, 0 coverage gaps)
- All 25 packs include `java` and `c` in `targets`; new token slots use English fallback until community translation

### Fixed

- Java: missing reserved keyword `_` — **51** JLS §3.9 reserved keywords (not 50); added `UNDERSCORE` logical token
- release-please: reset manifest/package to last tag (`v0.2.0`); add `bootstrap-sha`; do not manual-bump ahead of tags
- release-please: direct release on push (`skip-github-pull-request`); auto `vX.Y.Z` tags; formatted release body; Node 24 in CI

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

[Unreleased]: https://github.com/KolanutTechnologies/kola-language-packs/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.2.0
[0.1.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.1.1
