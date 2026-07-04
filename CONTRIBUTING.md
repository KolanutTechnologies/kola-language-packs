# Contributing to Kola Language Packs

Thank you for helping make programming accessible to African developers in their native languages! Your contribution, whether it's a new language pack, an improvement to an existing one, or feedback, is valuable to our community.

## Who can contribute?

We welcome contributions from:

- **Native speakers** — Essential for new language packs and accuracy improvements
- **Linguists and educators** — Help us ensure translations are culturally appropriate and pedagogically sound
- **Developers** — Integrate these packs into other tools and platforms

## Language pack structure

Each language pack lives in its own folder under `packs/<name>/` and contains two key files:

```
packs/yoruba/
├── pack.json       ← Main file with all metadata and keyword mappings
└── keywords.json   ← Keyword mappings only (for easier tooling integration)
```

**Before you start:** Please read [packs/PACK_SCOPE.md](./packs/PACK_SCOPE.md) first. It explains the difference between language codes and country codes, and helps you choose the right scope when a country has multiple languages.

### Required metadata: Geographic scope

Every language pack must clearly declare which language variant it represents and where it's used. This helps contributors know exactly what belongs in each pack:

```json
{
  "name": "nigerian-pidgin",
  "languageCode": "pcm",
  "locale": "pcm-NG",
  "countries": ["NG"],
  "regions": ["West Africa"],
  "scopeNote": "Nigerian Pidgin (Naija) only. Not other West African creoles."
}
```

| Field | Example | What it means |
|-------|---------|---------------|
| `languageCode` | `pcm` | ISO 639 language code (e.g., Nigerian Pidgin). **Important:** This is the language (`pcm`), not the country (`ng`). |
| `locale` | `pcm-NG` | BCP-47 locale tag combining language and primary country |
| `countries` | `["NG"]` | ISO 3166-1 country codes where this language variant is spoken |
| `regions` | `["West Africa"]` | Geographic grouping for browsing and organization |
| `scopeNote` | (free text) | Explains what's included in this pack and what belongs in future packs. Example: "Nigerian Pidgin only, not Cameroonian or Ghanaian creoles." |

You can browse packs in `packs/index.json`, filter by country in `packs/by-country.json`, or by region in `packs/by-region.json`.

**Translation quality:** Prefer phrasing you would actually use when teaching code. If you borrowed terms from another project or glossary, say so in the PR. Leave `reviewStatus` as `starter` — maintainers update it after review.

### The token registry: What you need to translate

**Every pack must translate all logical tokens in `packs/logical-tokens.json`** (currently **112 tokens** across core, standard, advanced, and typescript-types tiers).

**Important rules:**
- Don't create custom token keys — propose new tokens in a separate PR
- Minimum enforced: `IF`, `FOR`, `FUNCTION`, `RETURN`, `PRINT`
- New tokens may ship with English placeholders until a native speaker PR replaces them

See `packs/target-coverage.json` for how each token maps to JavaScript, Python, TypeScript, Go, and Rust.

### How to provide translations

You can provide either a single translation or multiple aliases (for regional variants or different phrasings):

**Single translation:**
```json
{
  "LET": "make we say"
}
```

**Multiple aliases (recommended):**
```json
{
  "LET": ["make we say", "make", "let"]
}
```

**Best practice:** When providing multiple aliases, include the English fallback as the last option. This helps learners transition between languages.

### Transpilation targets

Every pack must declare all five transpile backends (the transpiler picks the subset it needs per target language):

```json
"targets": ["javascript", "python", "typescript", "go", "rust"]
```

## Review process

Here's what happens after you submit your contribution:

1. **Submit your PR** — Please include only one language pack per pull request to make reviews easier
2. **Native speaker review** — We'll find a native speaker to review your translations for accuracy and naturalness
3. **Automated validation + coverage** — Our CI runs `npm test` (validation + official keyword coverage) to check technical correctness
4. **Merge and release** — Once approved, we'll merge your PR and publish a patch release to npm

**Estimated review time:** Most PRs are reviewed within 1-2 weeks, though this can vary depending on reviewer availability for less common languages.

## Code of conduct

We celebrate linguistic diversity and regional variations. Many African languages have multiple dialects and regional variants — and that's a strength, not a problem!

**Our approach:**
- **Embrace multiple variants** — Use alias arrays to include different regional expressions rather than choosing one "correct" form
- **Be inclusive** — Nigerian Pidgin in Lagos sounds different from Port Harcourt; Yoruba in Nigeria differs from Benin. Include variations when appropriate
- **Respect all contributors** — Be kind and constructive in reviews. Remember that language is personal and cultural

## Need help?

If you have questions, encounter issues, or need clarification:

- **Open a GitHub issue** in the `kolanutTechnologies/kola-language-packs` repository
- **Tag your issue** appropriately (`question`, `new-language`, `bug`, etc.)
- **Be specific** — Include details about which language you're working on and what you need help with

We're here to support you throughout the contribution process!
