# Changelog

Release notes for `@kolanut/language-packs`. Format based on [Keep a Changelog](https://keepachangelog.com/).

Automated releases via [release-please](https://github.com/googleapis/release-please) on merge of the Release PR. Agents and maintainers keep `[Unreleased]` current during development.

## [Unreleased]

### Added
- Contributor docs: `NAMING_GUIDE.md`, `DIALECTS.md`, `GLOSSARY.md`, `REPO_MAP.md`, `language-registry.json`
- Validation for `displayName`, `description`, `reviewStatus`, duplicate locales
- Automated releases: GitHub Actions CI, release-please, npm publish workflow
- `scripts/sync-pack-versions.mjs` and `scripts/bump-version.mjs` for version alignment
- Agent skill `kola-language-packs-build` (CHANGELOG + semver workflow)
- Agent skill `kola-language-packs-ship` (when to git push vs npm publish)
- Logical token **GEN** (Rust 2024 `gen` keyword) — 113 tokens total; `LAZY` still planned for v0.2.0
- `scripts/ensure-pack-tokens.mjs` — add new tokens to packs without full bootstrap
- Roadmap entries for **R** and **Clojure** programming targets (`v0.5.0+`)

### Fixed
- Stop tracking `.cursor/` in git — IDE-local only (removed erroneous `!.cursor/skills/` gitignore exceptions)
- `VERSIONING.md`, `CONTRIBUTING.md`, and `scripts/README.md` updated for automated release flow
- `languages-roadmap.json` release sequence now includes `v0.4.0+` and `v0.5.0+` target phases

## [0.1.1] — 2026-07-04

### Added
- 25 African language packs (112 logical tokens each)
- npm package `@kolanut/language-packs`
- Validation and keyword coverage checks

[Unreleased]: https://github.com/KolanutTechnologies/kola-language-packs/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/KolanutTechnologies/kola-language-packs/releases/tag/v0.1.1
