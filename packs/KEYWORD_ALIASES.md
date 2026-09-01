# Keyword alias policy

For pack authors and for tools that read these packs (including Kolanut's gloss engine).

Contributor checklist: [`CONTRIBUTING.md`](../CONTRIBUTING.md). Machine export: [`coverage-summary.json`](./coverage-summary.json) → `packCoverage.<name>.ambiguousForms`. Exceptions: [`keyword-form-allowlist.json`](./keyword-form-allowlist.json).

---

## Independent convergence

Teams working separately often land on similar designs when the problem has the same constraints.

**Our path:** Rules here came from shipping packs in this repo: ELIF/`else` bugs, shared primaries that broke undo, UTF-8 fixes, and pure-source `pack.json` (0.18.0). See CHANGELOG.

**Why Legesher, Hedy, and NADA appear below:** Same ambiguity tradeoffs, described in their public docs. We name them as examples of convergence, not as sources we ported. Skip the table if you want; the rules below stand alone.

| Project | What overlaps with our problem |
|---------|--------------------------------|
| **[Legesher](https://legesher.io/)** | Tricky keyword choices go to community review; English on disk, native words in the editor |
| **[Hedy](https://www.hedy.org/)** ([architecture wiki](https://github.com/hedyorg/hedy/wiki/Hedy-Architecture)) | Some tokens are always keywords; others depend on context; multi-word keywords are fine |
| **[NADA](https://nadalang.org/)** | Readable code in your language with runnable English underneath |

---

## Pack layers (source → published → runtime)

| Layer | File / API | Edited by | English fallback |
|-------|------------|-----------|------------------|
| **Source** | `packs/<name>/pack.json` → `keywords` | Contributors | No (native only, or bare English stub if untranslated) |
| **Published** | `packs/<name>/keywords.json` | `npm run generate` | Yes (natives + code-derived fallback) |
| **Runtime npm** | `loadPublishedKeywords(name)` | — | Same as published |
| **Author npm** | `loadPack(name)` + `flattenKeywords(pack)` | — | Source only (coverage, editing) |

Contributors edit **`pack.json`**. Run `npm test` (or `npm run generate`) to refresh derived files. Never hand-sync English fallbacks into source.

---

## For pack authors: polysemy vs bad mapping

### CI hard errors (bad mapping)

| Pattern | Example | Why it fails |
|---------|---------|--------------|
| Cross-token English stub | `ELIF: ["else"]` | Steals another logical's English; reverse peel breaks |
| Shared **primary** (first phrase) | Two logicals start with `"ikiwa"` | Autocomplete and default reverse cannot rank |
| Duplicate in one logical | `ASYNC: ["async","async"]` | Noise |
| English in source beside natives | `IF: ["ṣé", "if"]` when `"if"` is this token's fallback | Duplicate; fallback belongs in generated `keywords.json` only |

### Allowed (polysemy / linguistic reality)

| Pattern | Example | Handling |
|---------|---------|----------|
| Shared **secondary** alias | Non-primary phrase appears on two logicals | Tracked in `ambiguousForms`; not a CI failure |
| Compound ELIF | Luganda `wabula singa`, Yoruba `tàbí ṣé` | Tooling owns host surface (`else if` / `elif`); see below |
| Allowlisted homograph | Afrikaans `as` (IF vs AS) | [`keyword-form-allowlist.json`](./keyword-form-allowlist.json) after native review |
| Shared English emit | NULL + NIL both `"null"` | Every sharer emits that English keyword |

**Rule:** if fluent speakers accept the same word for two control-flow ideas in conversation, treat as polysemy (secondary + track). If the form exists because English ran out or was copied from another token, it is bad mapping (fail CI).

---

## For tools that read these packs

Tools that reverse-map native phrases to host keywords (Learn undo, save round-trip, IDE autocomplete, Kolanut's `@kola/gloss-engine`) should follow this order:

### 1. Use published keywords

Read `keywords.json` or `loadPublishedKeywords()`. Do not reverse from raw `pack.json` (missing fallbacks, wrong shape).

### 2. Primary-first default

For phrase `P`, find logical(s) listing `P`. If exactly one lists `P` as **primary** (first phrase), map to that logical.

### 3. Statement context (Hedy `extend` / `specialize`)

When primaries tie or `P` is a shared secondary:

| Context | Behavior |
|---------|----------|
| **ELIF surface** | Forward: treat `else if`, `elif`, `elsif`, `elseif` as **one** unit → ELIF gloss. Reverse: emit host surface via `elifSurface` (`else if` for JS/TS, `elif` for Python). Do not peel `else` then `if` separately. |
| **Compound native ELIF** | Pack may store `ELSE` + `IF` phrases joined (`wabula singa`). Match the compound; do not require a one-word ELIF. |
| **Specialize tokens** | Words that are always keywords in the host language use stricter matching (Hedy `specialize`). |
| **Extend tokens** | Identifiers that double as gloss aliases only in keyword position use context (Hedy `extend`). |

### 4. Registry ambiguity data

Load `packCoverage.<pack>.ambiguousForms` from [`coverage-summary.json`](./coverage-summary.json):

```json
{
  "form": "example",
  "logical": "CASE",
  "alsoOn": ["IF"],
  "primaryOwner": "IF"
}
```

Prefer `primaryOwner` when present. Use `alsoOn` to build IDE hints or `ambiguousTo` metadata.

### 5. Allowlist

Homographs in [`keyword-form-allowlist.json`](./keyword-form-allowlist.json) override default ranking when native review documented the sharing.

### 6. User disambiguation (last resort)

Only when steps 2 to 5 leave multiple equally valid logicals and statement context does not decide. Learn flow should not prompt on every undo.

### Reference API shape

```typescript
reverseGloss(phrase: string, options: {
  pack: PublishedKeywordMap;
  ambiguousForms: AmbiguousForm[];
  elifSurface?: 'else if' | 'elif' | 'elsif' | 'elseif';
  statementContext?: { kind: 'elif' | 'if' | 'while' | /* … */ };
}): string | undefined;
```

---

## CI validation tiers

| Tier | Rule | On failure |
|------|------|------------|
| Schema | `pack.json` matches `pack.schema.json` (Ajv) | Error |
| Pure source | No English fallback beside natives in `pack.json` | Error |
| Derived sync | `keywords.json` equals generated shape | Error (`npm run generate`) |
| Primary uniqueness | No shared first phrase across logicals | Error |
| English stub theft | No other token's English as your gloss | Error |
| Secondary sharing | Non-primary phrase on multiple logicals | Allowed (exported to `ambiguousForms`) |
| Unicode | NFC, no zero-width; no confusable apostrophes in matchable text | Error |

---

## Metrics on README

The **Shared forms** column in README (from `coverage-summary.json`) counts distinct forms with secondary-alias sharing per pack. Footnote links here. When counts rise, tools should consume `ambiguousForms` in the same release cycle.

---

## Related files

| File | Role |
|------|------|
| [`scripts/lib/keyword-form-collision.mjs`](../scripts/lib/keyword-form-collision.mjs) | Collision detection |
| [`scripts/lib/keywords-json.mjs`](../scripts/lib/keywords-json.mjs) | Source vs published keyword shapes |
| [`scripts/generate-derived.mjs`](../scripts/generate-derived.mjs) | Regenerate `keywords.json`, index lookups |
| [`scripts/generate-coverage.mjs`](../scripts/generate-coverage.mjs) | Writes `ambiguousForms` into coverage summary |
| [`src/load-pack.ts`](../src/load-pack.ts) | `loadPack`, `loadPublishedKeywords`, `loadCoverageSummary` |
