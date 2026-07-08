# @kolanut/language-packs

**Public open-source package** · Apache 2.0 · [Kolanut Technologies Ltd](https://kolacode.africa)

<!-- badges:start -->

[![npm](https://img.shields.io/npm/v/%40kolanut%2Flanguage-packs)](https://www.npmjs.com/package/@kolanut/language-packs)
[![African language packs](https://img.shields.io/badge/African%20language%20packs-25-gold)](./packs/coverage-summary.json)
[![Programming targets](https://img.shields.io/badge/Programming%20targets-10-blue)](./packs/coverage-summary.json)
[![Logical tokens](https://img.shields.io/badge/Logical%20tokens-249-lightgrey)](./packs/logical-tokens.json)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

<!-- badges:end -->

Language packs for African-language programming: a consistent set of **logical programming concepts**, mapped to **native-language phrases**, with enough structure for tools to transpile to **JavaScript, Python, TypeScript, Go, Rust, Java, and C**.

If you’re building an editor, a transpiler, a linter, or a learning tool, this repo is the shared “source of truth”.

Africa-first:

<p>
  <img alt="Algeria" src="https://flagcdn.com/16x12/dz.png" width="16" height="12" />
  <img alt="Angola" src="https://flagcdn.com/16x12/ao.png" width="16" height="12" />
  <img alt="Benin" src="https://flagcdn.com/16x12/bj.png" width="16" height="12" />
  <img alt="Botswana" src="https://flagcdn.com/16x12/bw.png" width="16" height="12" />
  <img alt="Burkina Faso" src="https://flagcdn.com/16x12/bf.png" width="16" height="12" />
  <img alt="Burundi" src="https://flagcdn.com/16x12/bi.png" width="16" height="12" />
  <img alt="Cabo Verde" src="https://flagcdn.com/16x12/cv.png" width="16" height="12" />
  <img alt="Cameroon" src="https://flagcdn.com/16x12/cm.png" width="16" height="12" />
  <img alt="Central African Republic" src="https://flagcdn.com/16x12/cf.png" width="16" height="12" />
  <img alt="Chad" src="https://flagcdn.com/16x12/td.png" width="16" height="12" />
  <img alt="Comoros" src="https://flagcdn.com/16x12/km.png" width="16" height="12" />
  <img alt="Congo (Republic)" src="https://flagcdn.com/16x12/cg.png" width="16" height="12" />
  <img alt="Congo (DRC)" src="https://flagcdn.com/16x12/cd.png" width="16" height="12" />
  <img alt="Djibouti" src="https://flagcdn.com/16x12/dj.png" width="16" height="12" />
  <img alt="Egypt" src="https://flagcdn.com/16x12/eg.png" width="16" height="12" />
  <img alt="Equatorial Guinea" src="https://flagcdn.com/16x12/gq.png" width="16" height="12" />
  <img alt="Eritrea" src="https://flagcdn.com/16x12/er.png" width="16" height="12" />
  <img alt="Eswatini" src="https://flagcdn.com/16x12/sz.png" width="16" height="12" />
  <img alt="Ethiopia" src="https://flagcdn.com/16x12/et.png" width="16" height="12" />
  <img alt="Gabon" src="https://flagcdn.com/16x12/ga.png" width="16" height="12" />
  <img alt="Gambia" src="https://flagcdn.com/16x12/gm.png" width="16" height="12" />
  <img alt="Ghana" src="https://flagcdn.com/16x12/gh.png" width="16" height="12" />
  <img alt="Guinea" src="https://flagcdn.com/16x12/gn.png" width="16" height="12" />
  <img alt="Guinea-Bissau" src="https://flagcdn.com/16x12/gw.png" width="16" height="12" />
  <img alt="Ivory Coast" src="https://flagcdn.com/16x12/ci.png" width="16" height="12" />
  <img alt="Kenya" src="https://flagcdn.com/16x12/ke.png" width="16" height="12" />
  <img alt="Lesotho" src="https://flagcdn.com/16x12/ls.png" width="16" height="12" />
  <img alt="Liberia" src="https://flagcdn.com/16x12/lr.png" width="16" height="12" />
  <img alt="Libya" src="https://flagcdn.com/16x12/ly.png" width="16" height="12" />
  <img alt="Madagascar" src="https://flagcdn.com/16x12/mg.png" width="16" height="12" />
  <img alt="Malawi" src="https://flagcdn.com/16x12/mw.png" width="16" height="12" />
  <img alt="Mali" src="https://flagcdn.com/16x12/ml.png" width="16" height="12" />
  <img alt="Mauritania" src="https://flagcdn.com/16x12/mr.png" width="16" height="12" />
  <img alt="Mauritius" src="https://flagcdn.com/16x12/mu.png" width="16" height="12" />
  <img alt="Morocco" src="https://flagcdn.com/16x12/ma.png" width="16" height="12" />
  <img alt="Mozambique" src="https://flagcdn.com/16x12/mz.png" width="16" height="12" />
  <img alt="Namibia" src="https://flagcdn.com/16x12/na.png" width="16" height="12" />
  <img alt="Niger" src="https://flagcdn.com/16x12/ne.png" width="16" height="12" />
  <img alt="Nigeria" src="https://flagcdn.com/16x12/ng.png" width="16" height="12" />
  <img alt="Rwanda" src="https://flagcdn.com/16x12/rw.png" width="16" height="12" />
  <img alt="São Tomé and Príncipe" src="https://flagcdn.com/16x12/st.png" width="16" height="12" />
  <img alt="Senegal" src="https://flagcdn.com/16x12/sn.png" width="16" height="12" />
  <img alt="Seychelles" src="https://flagcdn.com/16x12/sc.png" width="16" height="12" />
  <img alt="Sierra Leone" src="https://flagcdn.com/16x12/sl.png" width="16" height="12" />
  <img alt="Somalia" src="https://flagcdn.com/16x12/so.png" width="16" height="12" />
  <img alt="South Africa" src="https://flagcdn.com/16x12/za.png" width="16" height="12" />
  <img alt="South Sudan" src="https://flagcdn.com/16x12/ss.png" width="16" height="12" />
  <img alt="Sudan" src="https://flagcdn.com/16x12/sd.png" width="16" height="12" />
  <img alt="Tanzania" src="https://flagcdn.com/16x12/tz.png" width="16" height="12" />
  <img alt="Togo" src="https://flagcdn.com/16x12/tg.png" width="16" height="12" />
  <img alt="Tunisia" src="https://flagcdn.com/16x12/tn.png" width="16" height="12" />
  <img alt="Uganda" src="https://flagcdn.com/16x12/ug.png" width="16" height="12" />
  <img alt="Zambia" src="https://flagcdn.com/16x12/zm.png" width="16" height="12" />
  <img alt="Zimbabwe" src="https://flagcdn.com/16x12/zw.png" width="16" height="12" />
</p>

## Why this exists (the gap we’re filling)

Most tools that try “programming in African languages” run into the same wall:

- **There’s no single public, spec-backed registry** that says *“these are the official reserved words for each target language”* and *“these are the logical concepts they map to”*.
- Even when translation resources exist, they’re often **not packaged, not versioned, and not reusable** across tools.

This project is our attempt to fix that properly:

- A canonical **logical token registry** (the concepts)
- A canonical **official keyword list per programming target** (the specs)
- A growing set of **African language packs** (the human-language layer)
- Validation so everyone can build on top of the same foundation with confidence

## Standards-aligned metadata

Pack metadata follows international conventions so tools worldwide can consume our data:

| Standard | Field | Example |
|----------|-------|---------|
| [ISO 639](https://www.loc.gov/standards/iso639-2/php/code_list.php) | `languageCode` | `sw` (Swahili), `wo` (Wolof), `zu` (isiZulu) |
| [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) | `countries` | `KE`, `SN`, `ZA`, `EG` |
| [BCP-47](https://www.rfc-editor.org/info/bcp47) | `locale` | `sw-KE`, `wo-SN`, `ar-EG` |

We use the same code systems as major platforms and localization projects — **standards-aligned**, not a custom Kolanut-only format. Plain English: [`packs/GLOSSARY.md`](./packs/GLOSSARY.md).

## What’s in this repo

- **25 shipped African language packs** (and a roadmap for more)
- **149 logical tokens** that every pack maps (shared across all programming targets)
- **Schemas + validation** to keep packs consistent
- **Coverage checks** against official keyword lists for each target language

The data lives under [`packs/`](./packs/). The package published to npm is `@kolanut/language-packs`.

## How it fits together

In short:

- **Logical token registry**: a shared list of concepts (the “meaning layer”)
- **Official keyword lists**: spec-backed reserved words for each target language
- **African language packs**: native-language phrases mapped to those concepts
- **Validation**: ensures packs are complete and spec coverage stays at 0 gaps

<!-- metrics:start -->

## At a glance

| What we cover | Shipped | Planned | Source of truth |
|---|---:|---:|---|
| **African language packs** | 25 | +40 | [`packs/coverage-summary.json`](./packs/coverage-summary.json) · [`packs/languages-roadmap.json`](./packs/languages-roadmap.json) |
| **Programming targets** | 10 | +6 | [`packs/coverage-summary.json`](./packs/coverage-summary.json) · [`packs/languages-roadmap.json`](./packs/languages-roadmap.json) |
| **Logical tokens** | 249 | — | [`packs/logical-tokens.json`](./packs/logical-tokens.json) |
| **Keyword coverage gaps** | 0 | — | [`packs/coverage-summary.json`](./packs/coverage-summary.json) |

<!-- metrics:end -->
## Keyword coverage (0 gaps)

We track coverage against official reserved keywords for each transpile target. Some concepts are “structural” (they don’t have a 1:1 keyword in a given language, but still need a consistent logical token).

Source of truth: [`packs/coverage-summary.json`](./packs/coverage-summary.json)

| Target | Spec keywords | Mapped | Gaps | Score |
|--------|-------------:|-------:|-----:|------:|
| JavaScript | 38 | 38 | 0 | 100% |
| Python | 39 | 39 | 0 | 100% |
| TypeScript | 79 tracked† | 79 | 0 | 100% |
| Go | 25 | 25 | 0 | 100% |
| Rust | 39 | 39 | 0 | 100% |
| Java | 51 | 51 | 0 | 100% |

†TypeScript has no single official keyword count in the Handbook; 79 is our tracked reserved/modifier + type-keyword set for coverage (see notes in `official-target-keywords.json`).

## Spec sources (traceable and linkable)

Source of truth: [`packs/official-target-keywords.json`](./packs/official-target-keywords.json)

| Target | Spec keywords | Spec source |
|--------|-------------:|------------|
| JavaScript | 38 | [ECMA-262 §12.7.2 ReservedWord](https://tc39.es/ecma262/#sec-keywords-and-reserved-words) |
| Python | 39 | [Python 3.12 — keywords](https://docs.python.org/3/reference/lexical_analysis.html#keywords) (35 hard + 4 soft) |
| TypeScript | 79 tracked† | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) (no official count) |
| Go | 25 | [Go spec — Keywords](https://go.dev/ref/spec#Keywords) |
| Rust | 39 | [Rust Reference — strict keywords](https://doc.rust-lang.org/reference/keywords.html) |
| Java | 51 | [JLS §3.9 Keywords](https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.9) (Java SE 21) |

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
// { IF: ['ṣé', 'if'], FOR: ['fun', 'for'], ... } — maps 129 logical tokens
```

## Example: English keywords vs localized phrases (illustrative)

Most tools use this package as a **mapping layer**: the official keyword stays the same, but the UI (or source language) can present a localized phrase as an alias.

Example (Nigerian Pidgin, illustrative — exact phrases live in the pack):

```text
IF    → "if case say"
PRINT → "show for screen"
```

## Use the raw JSON (no TS required)

If you prefer to consume JSON directly (Rust/Go/Python/CLI tools), start here:

- [`packs/index.json`](./packs/index.json): pack manifest (locale, region, countries, status)
- [`packs/language-registry.json`](./packs/language-registry.json): taken and planned `name` / `locale` / `languageCode` (check before adding a pack)
- [`packs/NAMING_GUIDE.md`](./packs/NAMING_GUIDE.md): how to name packs and write locales
- [`packs/logical-tokens.json`](./packs/logical-tokens.json): the 129-token registry (the thing packs must fully map)
- [`packs/by-country.json`](./packs/by-country.json): `NG` → `["yoruba", "igbo", ...]`
- [`packs/by-region.json`](./packs/by-region.json): region → pack names
- [`packs/coverage-summary.json`](./packs/coverage-summary.json): auto-generated coverage report
- [`packs/languages-roadmap.json`](./packs/languages-roadmap.json): shipped vs planned packs

## Languages shipped (25)

These are the packs currently shipped in v0.1.

- Flags are shown for the **primary locale** (quick scanning). Many packs apply to multiple countries—see [`packs/index.json`](./packs/index.json) for the full list.
- We use **Twemoji flag images** (not emoji characters) so the flags render reliably on both GitHub and npm.

**West Africa**
- <img alt="NG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f3-1f1ec.svg" width="16" height="16" /> Yorùbá (`yo-NG`)
- <img alt="NG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f3-1f1ec.svg" width="16" height="16" /> Nigerian Pidgin (`pcm-NG`)
- <img alt="NG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f3-1f1ec.svg" width="16" height="16" /> Hausa (`ha-NG`)
- <img alt="NG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f3-1f1ec.svg" width="16" height="16" /> Igbo (`ig-NG`)
- <img alt="NG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f3-1f1ec.svg" width="16" height="16" /> Fulfulde (`ff-NG`)
- <img alt="ML" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f2-1f1f1.svg" width="16" height="16" /> Bambara (`bm-ML`)
- <img alt="GH" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ec-1f1ed.svg" width="16" height="16" /> Twi (`tw-GH`)
- <img alt="SN" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f8-1f1f3.svg" width="16" height="16" /> Wolof (`wo-SN`)
- <img alt="SN" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f8-1f1f3.svg" width="16" height="16" /> French (Africa) (`fr-SN`)

**East Africa**
- <img alt="KE" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f0-1f1ea.svg" width="16" height="16" /> Swahili (`sw-KE`)
- <img alt="ET" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ea-1f1f9.svg" width="16" height="16" /> Amharic (`am-ET`)
- <img alt="ET" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ea-1f1f9.svg" width="16" height="16" /> Oromo (`om-ET`)
- <img alt="ER" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ea-1f1f7.svg" width="16" height="16" /> Tigrinya (`ti-ER`)
- <img alt="RW" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f7-1f1fc.svg" width="16" height="16" /> Kinyarwanda (`rw-RW`)
- <img alt="UG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1fa-1f1ec.svg" width="16" height="16" /> Luganda (`lg-UG`)

**Central Africa**
- <img alt="CD" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1e8-1f1e9.svg" width="16" height="16" /> Lingala (`ln-CD`)

**Horn of Africa**
- <img alt="SO" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f8-1f1f4.svg" width="16" height="16" /> Somali (`so-SO`)

**North / East Africa**
- <img alt="EG" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ea-1f1ec.svg" width="16" height="16" /> Arabic (Africa) (`ar-EG`)

**Southern Africa**
- <img alt="ZA" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ff-1f1e6.svg" width="16" height="16" /> isiZulu (`zu-ZA`)
- <img alt="ZA" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ff-1f1e6.svg" width="16" height="16" /> isiXhosa (`xh-ZA`)
- <img alt="ZA" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ff-1f1e6.svg" width="16" height="16" /> Afrikaans (`af-ZA`)
- <img alt="LS" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1f1-1f1f8.svg" width="16" height="16" /> Sesotho (`st-LS`)
- <img alt="BW" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1e7-1f1fc.svg" width="16" height="16" /> Setswana (`tn-BW`)
- <img alt="ZW" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ff-1f1fc.svg" width="16" height="16" /> Shona (`sn-ZW`)
- <img alt="AO" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1e6-1f1f4.svg" width="16" height="16" /> Portuguese (Africa) (`pt-AO`)

Full metadata (including all countries per pack): [`packs/index.json`](./packs/index.json).

## Language quality (and how it improves)

Most packs start at `reviewStatus: "starter"`. That’s intentional: we’d rather ship useful starter packs quickly, then improve them through native-speaker review.

If you care about linguistic accuracy or preferred terminology for a specific community, open a PR — see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Roadmap (what’s next)

We track roadmaps in [`packs/languages-roadmap.json`](./packs/languages-roadmap.json):

- **Planned African languages** (by region + priority) — 40 more packs on the list
- **Planned programming targets** — C++, Kotlin, Swift, Dart, Ruby, PHP, C# (`v0.4.0+`–`v0.5.0+`); R, Clojure (`v0.5.0+` / `v0.6.0+`) — one target per release; sample keywords + checklist in the JSON
- **Logical tokens** — **149 shipped** (20 C-only + 14 Java-only + `UNDERSCORE`; `GEN`, `LAZY` in v0.2.0); stdlib tier → **v2.0.0**
- **Programming targets** — **7 shipped** (C added in v0.4.0, Java in v0.3.0); C++ next → **v0.4.0+**
- **Planned token tier** — stdlib / builtins (`len`, `map`, `Array`, `fmt`, …) → target **v2.0.0** (design-first; not required for beginner keyword transpilation)

Suggested release sequence (also in the JSON): **v0.1.x** → **v0.2.0** (shipped) → **v0.3.0** / **v0.4.0** (shipped) → **v0.4.0+** (current — C++ next) → **v0.5.0+** → **v2.0.0** (stdlib tier).

Regional focus (how we’re sequencing the work):

- **Phase 1 — West Africa + Central Africa**: highest immediate demand and strong community contributor base
- **Phase 2 — East Africa + Horn of Africa**: expand coverage where multilingual education is already strong
- **Phase 3 — North Africa + Southern Africa + Indian Ocean**: fill remaining gaps and add country-specific variants where needed

High-priority upcoming packs currently include:

- West Africa: Akan (`ak-GH`)
- Central Africa: Cameroon Pidgin / Kamtok (`wes-CM`)

## Contributing

Contributions are welcome—especially from native speakers and educators.

**Start here:** [`CONTRIBUTING.md`](./CONTRIBUTING.md) — step-by-step guide (what to edit, what not to touch, checklist before you open a PR).

**New language?** [`packs/NAMING_GUIDE.md`](./packs/NAMING_GUIDE.md) · [`packs/language-registry.json`](./packs/language-registry.json) · [`packs/DIALECTS.md`](./packs/DIALECTS.md) (dialects)

**Also read:** [`packs/PACK_SCOPE.md`](./packs/PACK_SCOPE.md) · [`packs/GLOSSARY.md`](./packs/GLOSSARY.md) (what ISO / BCP-47 mean)

### What you edit (and what you don’t)

| File | Your role |
|------|-----------|
| `packs/<language>/pack.json` | **Edit** — metadata (`locale`, `countries`, `regions`, `scopeNote`) + keyword mappings |
| `packs/<language>/keywords.json` | **Edit** — same keyword mappings (must match `pack.json`) |
| `packs/logical-tokens.json` | **Read only** — checklist of all 129 concepts; do not edit for translations |
| `packs/index.json` | **Edit only when adding a new pack** |
| [`packs/language-registry.json`](./packs/language-registry.json) | **Check before naming** — shipped + planned identifiers |
| [`packs/NAMING_GUIDE.md`](./packs/NAMING_GUIDE.md) | **Read for new packs** — full field list, locale format, template |

A valid contribution is a **complete pack** (correct scope metadata + all 129 tokens translated), not a few word changes in isolation.

### Two ways to contribute

1. **Improve an existing pack** — e.g. `packs/zulu/` — fix phrasing, add dialect aliases, clarify `scopeNote`
2. **Add a new pack** — copy an existing pack, set all metadata (`name`, `languageCode`, `locale`, `displayName`, `description`, …), translate all 129 tokens, add to `packs/index.json`, run `npm run registry`

One language pack per PR. Run `npm test` from the **repo root** before opening the PR.

**Windows (PowerShell):**
```powershell
git clone https://github.com/KolanutTechnologies/kola-language-packs.git
cd kola-language-packs
npm install
npm test
```

**Mac / Linux:**
```bash
git clone https://github.com/KolanutTechnologies/kola-language-packs.git
cd kola-language-packs
npm install
npm test
```

**Do not run** `npm run bootstrap` — it overwrites all packs ([`scripts/README.md`](./scripts/README.md)).

Docs: [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`packs/REPO_MAP.md`](./packs/REPO_MAP.md) (what each file does) · [`VERSIONING.md`](./VERSIONING.md) · [`CHANGELOG.md`](./CHANGELOG.md)

### Contribution flow (quick)

1. Pick the right pack (or create a new variant) — see `packs/index.json` and `PACK_SCOPE.md`
2. Edit `pack.json` metadata and translations; keep `keywords.json` in sync
3. Map every token listed in `packs/logical-tokens.json` (129 total)
4. Run `npm test`
5. Open a PR for native-speaker review

## Contributors

This project only works if real people show up with real language knowledge. Thank you to everyone who’s contributed time, expertise, and care.

[![Contributors](https://contrib.rocks/image?repo=KolanutTechnologies/kola-language-packs)](https://github.com/KolanutTechnologies/kola-language-packs/graphs/contributors)

## FAQ

Answers to recurring questions. This section lives in **README.md** only — it is **not** a folder or auto-generated file.

**Who adds FAQ entries?** Maintainers, when the same question appears in GitHub issues, PRs, or discussions. **Suggest one:** open an issue with tag `question`.

**Where do answers come from?** Project scope decisions already documented in `packs/` (logical tokens, pack schema, validation rules) — summarized here in plain language.

### Is `packs/logical-tokens.json` exhaustive?

It’s exhaustive for **this project’s current scope**: a shared registry of **logical concepts** needed to map official reserved keywords across five target languages (plus a small set of “structural” concepts).

It is **not** a full programming-language grammar. It intentionally does **not** try to model:

- punctuation (`;`, `{}`, `()`)
- operators (`+`, `==`, `??`, `:=`)
- comment syntax (`//`, `#`, `/* */`)
- every syntax feature that isn’t keyword-driven

If we expand into full syntax coverage later, that would likely be a separate registry rather than inflating “logical tokens” beyond readability.

### How do I contribute a dialect?

Usually **edit the existing pack** and add aliases — not a new folder.

Example (Swahili, East Africa): `"IF": ["kama", "ikiwa", "if"]` in `packs/swahili/`.

Full decision tree: [`packs/DIALECTS.md`](./packs/DIALECTS.md).

### What are ISO 639, ISO 3166-1, and BCP-47? Are we “compliant”?

International standards for **language codes**, **country codes**, and **locale tags**. We follow them so npm, editors, and locale APIs understand our packs — same codes used across the African language ecosystem and global tech.

Plain English: [`packs/GLOSSARY.md`](./packs/GLOSSARY.md). There is no formal certification body for language packs; we are **standards-aligned**.

### Which npm commands do I run?

From the **repo root** only:

- **`npm test`** — every PR (checks your files; does not delete anything)
- **`npm run registry`** — only when adding a new pack
- **Never `npm run bootstrap`** as a contributor — overwrites all packs

Details: [`CONTRIBUTING.md`](./CONTRIBUTING.md) · [`scripts/README.md`](./scripts/README.md)

### Can one pack be version 0.1.2 while another stays 0.1.1?

**Not today** — all packs share the npm package version on each release. See [`VERSIONING.md`](./VERSIONING.md).

### What is `pack.schema.json`? What do all these files do?

[`packs/REPO_MAP.md`](./packs/REPO_MAP.md) — plain map of every folder and file.

## Maintainers (optional)

This section is only relevant if you’re maintaining the package or editing generated pack data.

<details>
<summary>Maintainer notes (publishing + regeneration)</summary>

- Publishing: push to `main` runs [`.github/workflows/release.yml`](./.github/workflows/release.yml) (tag + GitHub Release + npm via **Trusted Publisher OIDC**). Configure on npm: `KolanutTechnologies/kola-language-packs` / `release.yml`. Local fallback: `npm login` then `npm publish --access public`.
- Sync pack versions after a manual version bump: `npm run sync-versions`
- Regenerate derived pack files after changing the source definitions:

```bash
npm run bootstrap
```

</details>

## License

Apache 2.0 — see [LICENSE](./LICENSE).

Some imported terminology may carry additional license terms (e.g. Mafoko/NOODL). Check source licenses before bulk import and cite them in your PR.
