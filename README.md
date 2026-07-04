# @kolanut/language-packs

**Public open-source package** · Apache 2.0 · [Kolanut Technologies Ltd](https://kolacode.africa)

[![packs](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/KolanutTechnologies/kola-language-packs/main/badges/packs.json)](./packs/index.json)
[![targets](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/KolanutTechnologies/kola-language-packs/main/badges/targets.json)](./packs/coverage-summary.json)
[![logical tokens](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/KolanutTechnologies/kola-language-packs/main/badges/tokens.json)](./packs/logical-tokens.json)
[![coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/KolanutTechnologies/kola-language-packs/main/badges/coverage.json)](./packs/coverage-summary.json)

Language packs for African-language programming: a consistent set of **logical programming concepts**, mapped to **native-language phrases**, with enough structure for tools to transpile to **JavaScript, Python, TypeScript, Go, and Rust**.

If you’re building an editor, a transpiler, a linter, or a learning tool, this repo is the shared “source of truth”.

## Why this exists (the gap we’re filling)

Most tools that try “programming in African languages” run into the same wall:

- **There’s no single public, spec-backed registry** that says *“these are the official reserved words for each target language”* and *“these are the logical concepts they map to”*.
- Even when translation resources exist, they’re often **not packaged, not versioned, and not reusable** across tools.

This project is our attempt to fix that properly:

- A canonical **logical token registry** (the concepts)
- A canonical **official keyword list per programming target** (the specs)
- A growing set of **African language packs** (the human-language layer)
- Validation so everyone can build on top of the same foundation with confidence

## What’s in this repo

- **25 shipped African language packs** (and a roadmap for more)
- **99 logical tokens** that every pack maps (shared across all programming targets)
- **Schemas + validation** to keep packs consistent
- **Coverage checks** against official keyword lists for each target language

The data lives under [`packs/`](./packs/). The package published to npm is `@kolanut/language-packs`.

<!-- metrics:start -->

## At a glance

| What we cover | Shipped | Planned | Source of truth |
|---|---:|---:|---|
| **African language packs** | 25 | +40 | [`packs/coverage-summary.json`](./packs/coverage-summary.json) · [`packs/languages-roadmap.json`](./packs/languages-roadmap.json) |
| **Programming targets** | 5 | +9 | [`packs/coverage-summary.json`](./packs/coverage-summary.json) · [`packs/languages-roadmap.json`](./packs/languages-roadmap.json) |
| **Logical tokens** | 99 | — | [`packs/logical-tokens.json`](./packs/logical-tokens.json) |
| **Keyword coverage gaps** | 0 | — | [`packs/coverage-summary.json`](./packs/coverage-summary.json) |

<!-- metrics:end -->
## Keyword coverage (0 gaps)

We track coverage against official reserved keywords for each transpile target. Some concepts are “structural” (they don’t have a 1:1 keyword in a given language, but still need a consistent logical token).

Source of truth: [`packs/coverage-summary.json`](./packs/coverage-summary.json)

| Target | Spec keywords | Mapped | Gaps | Score |
|--------|-------------:|-------:|-----:|------:|
| JavaScript | 38 | 37 direct + 1 structural | 0 | 100% |
| Python | 39 | 38 direct + 1 structural | 0 | 100% |
| TypeScript | 64 tracked† | 63 direct + 1 structural | 0 | 100% |
| Go | 25 | 25 | 0 | 100% |
| Rust | 39 | 38 direct + 1 structural | 0 | 100% |

†TypeScript has no single official keyword count in the Handbook; 64 is our tracked reserved/modifier set for coverage (see notes in `official-target-keywords.json`).

## Spec sources (traceable and linkable)

Source of truth: [`packs/official-target-keywords.json`](./packs/official-target-keywords.json)

| Target | Spec keywords | Spec source |
|--------|-------------:|------------|
| JavaScript | 38 | [ECMA-262 §12.7.2 ReservedWord](https://tc39.es/ecma262/#sec-keywords-and-reserved-words) |
| Python | 39 | [Python 3.12 — keywords](https://docs.python.org/3/reference/lexical_analysis.html#keywords) (35 hard + 4 soft) |
| TypeScript | 64 tracked† | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) (no official count) |
| Go | 25 | [Go spec — Keywords](https://go.dev/ref/spec#Keywords) |
| Rust | 39 | [Rust Reference — strict keywords](https://doc.rust-lang.org/reference/keywords.html) |

## Install

```bash
npm install @kolanut/language-packs
```

## Use it in code

```typescript
import { listPackNames, loadPack, flattenKeywords } from '@kolanut/language-packs';

const packs = await listPackNames(); // e.g. 25 packs

const yoruba = await loadPack('yoruba');
const keywords = flattenKeywords(yoruba);
// { IF: ['ṣé', 'if'], FOR: ['fun', 'for'], ... } — maps 99 logical tokens
```

## Use the raw JSON (no TS required)

If you prefer to consume JSON directly (Rust/Go/Python/CLI tools), start here:

- [`packs/index.json`](./packs/index.json): pack manifest (locale, region, countries, status)
- [`packs/logical-tokens.json`](./packs/logical-tokens.json): the 99-token registry (the thing packs must fully map)
- [`packs/by-country.json`](./packs/by-country.json): `NG` → `["yoruba", "igbo", ...]`
- [`packs/by-region.json`](./packs/by-region.json): region → pack names
- [`packs/coverage-summary.json`](./packs/coverage-summary.json): auto-generated coverage report
- [`packs/languages-roadmap.json`](./packs/languages-roadmap.json): shipped vs planned packs

## Languages shipped (25)

These are the packs currently shipped in v0.1.

- Flags are shown for the **primary locale** (quick scanning). Many packs apply to multiple countries—see [`packs/index.json`](./packs/index.json) for the full list.
- **On GitHub, flags render as images**, so they should display even if your laptop doesn’t support emoji flags. (In some local Markdown previews, they may appear as squares.)

**West Africa**
- 🇳🇬 Yorùbá (`yo-NG`)
- 🇳🇬 Nigerian Pidgin (`pcm-NG`)
- 🇳🇬 Hausa (`ha-NG`)
- 🇳🇬 Igbo (`ig-NG`)
- 🇳🇬 Fulfulde (`ff-NG`)
- 🇲🇱 Bambara (`bm-ML`)
- 🇬🇭 Twi (`tw-GH`)
- 🇸🇳 Wolof (`wo-SN`)
- 🇸🇳 French (Africa) (`fr-SN`)

**East Africa**
- 🇰🇪 Swahili (`sw-KE`)
- 🇪🇹 Amharic (`am-ET`)
- 🇪🇹 Oromo (`om-ET`)
- 🇪🇷 Tigrinya (`ti-ER`)
- 🇷🇼 Kinyarwanda (`rw-RW`)
- 🇺🇬 Luganda (`lg-UG`)

**Central Africa**
- 🇨🇩 Lingala (`ln-CD`)

**Horn of Africa**
- 🇸🇴 Somali (`so-SO`)

**North / East Africa**
- 🇪🇬 Arabic (Africa) (`ar-EG`)

**Southern Africa**
- 🇿🇦 isiZulu (`zu-ZA`)
- 🇿🇦 isiXhosa (`xh-ZA`)
- 🇿🇦 Afrikaans (`af-ZA`)
- 🇱🇸 Sesotho (`st-LS`)
- 🇧🇼 Setswana (`tn-BW`)
- 🇿🇼 Shona (`sn-ZW`)
- 🇦🇴 Portuguese (Africa) (`pt-AO`)

Full metadata (including all countries per pack): [`packs/index.json`](./packs/index.json).

## Language quality (and how it improves)

Most packs start at `reviewStatus: "starter"`. That’s intentional: we’d rather ship useful starter packs quickly, then improve them through native-speaker review.

If you care about linguistic accuracy or preferred terminology for a specific community, open a PR — see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Roadmap (what’s next)

We track two roadmaps:

- **Planned African languages** (by region + priority): [`packs/languages-roadmap.json`](./packs/languages-roadmap.json)
- **Planned programming targets**: C, C++, Java, C#, Kotlin, Swift, Dart, Ruby, PHP

Regional focus (how we’re sequencing the work):

- **Phase 1 — West Africa + Central Africa**: highest immediate demand and strong community contributor base
- **Phase 2 — East Africa + Horn of Africa**: expand coverage where multilingual education is already strong
- **Phase 3 — North Africa + Southern Africa + Indian Ocean**: fill remaining gaps and add country-specific variants where needed

High-priority upcoming packs currently include:

- West Africa: Akan (`ak-GH`)
- Central Africa: Cameroon Pidgin / Kamtok (`wes-CM`)

## Contributing

Contributions are welcome—especially from native speakers and educators.

- **Improve an existing pack**: add better phrasing, aliases for dialects, or clearer scope notes
- **Add a new pack**: follow the template, map all 99 tokens, and run validation

Before contributing, please read [`packs/PACK_SCOPE.md`](./packs/PACK_SCOPE.md). It explains:

- language codes vs country codes (e.g. `pcm` vs `NG`)
- how we handle cross-border languages
- when a dialect needs a new pack vs an alias in the same pack

Quick start:

```bash
git clone https://github.com/kolanutTechnologies/kola-language-packs.git
cd kola-language-packs
npm install
npm test       # validate + keyword coverage
npm run build
```

Full guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Contributors

This project only works if real people show up with real language knowledge. Thank you to everyone who’s contributed time, expertise, and care.

[![Contributors](https://contrib.rocks/image?repo=kolanutTechnologies/kola-language-packs)](https://github.com/kolanutTechnologies/kola-language-packs/graphs/contributors)

## FAQ

### Is `packs/logical-tokens.json` exhaustive?

It’s exhaustive for **this project’s current scope**: a shared registry of **logical concepts** needed to map official reserved keywords across five target languages (plus a small set of “structural” concepts).

It is **not** a full programming-language grammar. It intentionally does **not** try to model:

- punctuation (`;`, `{}`, `()`)
- operators (`+`, `==`, `??`, `:=`)
- comment syntax (`//`, `#`, `/* */`)
- every syntax feature that isn’t keyword-driven

If we expand into full syntax coverage later, that would likely be a separate registry (or multiple registries) rather than inflating “logical tokens” beyond readability.

## Maintainers (optional)

This section is only relevant if you’re maintaining the package or editing generated pack data.

<details>
<summary>Maintainer notes (publishing + regeneration)</summary>

- Publishing: `npm publish --access public` (package is `@kolanut/language-packs`)
- Regenerate derived pack files after changing the source definitions:

```bash
npm run bootstrap
```

</details>

## License

Apache 2.0 — see [LICENSE](./LICENSE).

Some imported terminology may carry additional license terms (e.g. Mafoko/NOODL). Check source licenses before bulk import and cite them in your PR.
