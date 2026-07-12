# Product roadmap — version plan

Human-readable release plan for `@kolanut/language-packs`. **Source of truth for machines:** [`languages-roadmap.json`](./languages-roadmap.json) → `releaseSequence`.

**Baseline (shipped):** npm **0.11.0** · **28** African packs · **15** programming targets · **370** logical tokens · **8** IDE-ready packs · **0** keyword gaps.

Read [`VERSIONING.md`](../VERSIONING.md) for semver rules. Read [`TIERS.md`](./TIERS.md) for what each pack layer means.

---

## How semver maps to this plan

| Bump | When | Examples in this repo |
|------|------|------------------------|
| **PATCH** (`0.x.Y`) | Translation fixes, validation fixes, doc-only, roadmap text | Fix Hausa `FOR` phrasing; update ROADMAP wording |
| **MINOR** (`0.X.0`) | New African pack, new programming target, new logical token(s), IDE gloss batch | Add Chichewa pack; add Clojure target; IDE tiers for 5 packs |
| **MAJOR** (`X.0.0`) | Breaking `pack.schema.json` or pack format | **1.0.0** = stable API/schema; **2.0.0** = stdlib/builtins tier |

**Rule:** one programming target per release. Batch African packs in groups of 2–4 when they share a region review cycle.

---

## Scope ceilings (what “done” looks like)

These are **product limits**, not hard code limits.

| Layer | Now | v1.0 target | Practical max |
|-------|----:|------------:|--------------:|
| Logical tokens (keywords) | 370 | ~400 | ~650 (keyword union across ~25 langs) |
| Programming targets | 15 | 20 | ~25–30 |
| African language packs | 28 | 68 | ~75–100 with partners |
| IDE-ready packs | 8 | 68 (or 28 minimum) | all shipped packs |
| Glossary keys / pack | 30 | 50 | ~100 starter |
| Placeholders / pack | 12 | 25 | ~50 |
| CommonLiterals / pack | 15 | 50 | ~150 |
| UI / Design concepts | 0 | 0 (pilot at 0.37) | ~40–80 starter |
| Stdlib/builtins concepts | 0 | 0 (until v2) | ~150 starter in v2.0 |

Africa has **1,500–3,000** living languages (UNESCO). This roadmap targets **~68** intentional packs, not full continental coverage.

---

## Phase overview

```text
0.11.x  ── shipped sprint (15 targets, 28 packs, 8 IDE-ready)
   │
0.12–0.21  Phase A — Clojure + complete IDE on 28 packs + 12 named African packs (→40 packs)
   │
0.22–0.29  Phase B — African expansion backlog (→68 packs)
   │
0.30–0.33  Phase C — Tier-A programming targets (Lua, SQL, Scala, Elixir)
   │
0.34–0.39  Phase D — Quality, glossary expansion, UI/Design pilot, partner review
   │
1.0.0      Stable schema + full v1 scope
   │
2.0.0      Stdlib/builtins tier (~150 starter concepts)
```

---

## Detailed release plan

Status: **shipped** · **next** · **planned**

### Shipped (0.1.0 – 0.11.0)

| Version | Bump | Delivered |
|---------|------|-----------|
| 0.1.x | minor | 25 African packs, 5 targets, contributor infra |
| 0.2.0 | minor | `GEN`, `LAZY` logical tokens |
| 0.3.0 | minor | Java target |
| 0.4.0 | minor | IDE gloss tiers (Yorùbá, Hausa, Nigerian Pidgin) |
| 0.5.0 | minor | C++ target, Igbo IDE-ready |
| 0.6.0 | minor | C# target |
| 0.7.0 | minor | Swahili IDE-ready |
| 0.8.0 | minor | Kotlin target |
| 0.9.0 | minor | Swift, Dart, Ruby, PHP, R; Akan pack → 15 targets, 370 tokens |
| 0.10.0 | minor | Cameroon Pidgin, Efik → 28 packs |
| 0.11.0 | minor | Zulu, Twi, Luganda IDE-ready → 8 IDE-ready |
| 0.11.1 | patch | README generator sync for all metrics (docs/tooling) |

### Phase A — Finish keyword scope + IDE on all shipped packs (0.12 – 0.21)

| Version | Bump | Focus | End state |
|---------|------|-------|-----------|
| **0.12.0** | minor | **Clojure** programming target; scope docs (`ROADMAP.md`, `TIERS.md`) | 16 targets · ~385–400 tokens |
| **0.13.0** | minor | IDE gloss batch 1: Akan, Bambara, Wolof, Fulfulde, Arabic (Qalb prior-art aliases staged) | 13 IDE-ready |
| **0.14.0** | minor | IDE batch 2: Amharic, Oromo, Tigrinya, Kinyarwanda, Somali | 18 IDE-ready |
| **0.15.0** | minor | IDE batch 3: Afrikaans, Sesotho, Setswana, Shona, isiXhosa | 23 IDE-ready |
| **0.16.0** | minor | IDE batch 4: Efik, Cameroon Pidgin, Lingala, French, Portuguese-Africa | **28 IDE-ready** |
| **0.17.0** | minor | African packs: **Chichewa**, **Malagasy** | 30 packs |
| **0.18.0** | minor | **Tamazight**, **Hausa Niger** variant | 32 packs |
| **0.19.0** | minor | **Kirundi**, **Kikongo** | 34 packs |
| **0.20.0** | minor | **Ndebele**, **Tsonga**, **Venda**, **Northern Sotho** | 38 packs |
| **0.21.0** | minor | **Umbundu**, **Berber Tifinagh** | **40 named packs complete** |

**Patch lanes (any 0.x.y):** native-speaker review of starter packs; translation fixes; collision fixes in glossary keys; fill English-only keyword stubs (e.g. `IN`) when wording is ready.

### Learn-mode gloss schedule (keywords vs identifiers vs builtins)

IDE Learn Level 1 swaps **keywords** only. Identifiers and string literals stay English until later pack layers (or IDE project symbols). Do not treat “still English in FizzBuzz” as one bug class.

| What the learner sees | Pack layer | When we fill it |
|-----------------------|------------|-----------------|
| Keywords with only English stubs (e.g. `IN: ["in"]`, many packs today) | **Keywords** | **Any patch**, when native wording is reviewed. Not blocked on a minor release. |
| Variable / parameter names (`out`, `i`, `str`, …) | **Glossary** (identifier hints) | Add keys anytime as a patch on IDE-ready packs; **seed list expansion** (30 → 50) planned at **0.34.0**. Project-specific names stay in the IDE symbols map, not this repo. |
| String / UI literals (`"FizzBuzz"`, `"Hello"`, …) | **CommonLiterals** | Same IDE-tier path; seed expansion at **0.34.0**. |
| Design-tab JSX (`Button`, `CardFooter`, Flex/Grid props, Avatar, …) | **UI / Design** | **0.37.0** schema + starter seed catalog; pilot on IDE-ready packs. **Not** logical tokens. Prop keys stay English unless Design mode defines a separate display map. |
| Call names that are not reserved keywords (Python `range()`, `len()`, …) | **Stdlib / builtins** | **2.0.0**. Note: logical token `RANGE` is mainly Go’s `range` keyword; Python’s `range` is closer to builtins. |

**Examples:** Luganda leaving `out` English at L1 is by design. Leaving `in` English is an incomplete keyword entry. Design tab staying English today is expected until **0.37.0**. See [`TIERS.md`](./TIERS.md).

### Phase B — African expansion to 68 packs (0.22 – 0.29)

Seven minor releases, **four packs each** (28 backlog slots). Exact names TBD from contributor demand; sequence by region:

| Version | Bump | Region focus | Pack count |
|---------|------|--------------|------------|
| 0.22.0 | minor | West Africa wave 1 | 44 |
| 0.23.0 | minor | West Africa wave 2 | 48 |
| 0.24.0 | minor | East Africa wave | 52 |
| 0.25.0 | minor | Central Africa wave | 56 |
| 0.26.0 | minor | Southern Africa wave | 60 |
| 0.27.0 | minor | North Africa + Horn wave | 64 |
| 0.28.0 | minor | Indian Ocean + fill gaps | **68 packs** |

Candidate backlog languages (not yet slotted): Sierra Leone Krio, Liberian English creole, Tshiluba, Luba, Sango, Kanuri, Songhai, Zarma, Tigré, Sidamo, Chewa variants, Seychelles Creole, Mauritian Creole, etc. See `plannedBacklog` in JSON.

### Phase C — Tier-A programming targets (0.30 – 0.33)

One target per minor release (same pipeline as Java/Clojure):

| Version | Bump | Target | ~Token delta |
|---------|------|--------|-------------|
| 0.30.0 | minor | **Lua** | +5–15 |
| 0.31.0 | minor | **SQL** (reserved words subset) | +30–40 |
| 0.32.0 | minor | **Scala** | +10–20 |
| 0.33.0 | minor | **Elixir** | +10–15 |

**End:** ~20 targets · ~450 logical tokens.

**Tier B (optional, post-1.0 or 0.34+ if demand):** Haskell, Erlang, Julia, MATLAB, F#.

### Phase D — Hardening before 1.0 (0.34 – 0.39)

| Version | Bump | Focus |
|---------|------|-------|
| 0.34.0 | minor | Expand IDE seed lists: glossary → 50, placeholders → 25, commonLiterals → 50 |
| 0.35.0 | minor | `reviewStatus: community-reviewed` push on top 10 packs by usage |
| 0.36.0 | minor | Partner-verified packs, validation tightening, TypeScript API polish |
| **0.37.0** | minor | **UI / Design layer:** seed catalog + schema for Design-tab components (Button, layout Flex/Grid, Alert, …); pilot glosses on IDE-ready packs |
| 0.38.0 – 0.39.x | patch/minor | Widen UI/Design pilots; partner review; remaining polish |

### UI / Design layer (how it fits)

Design-tab output is **component and layout English**, not reserved-word English. It belongs in a **new optional pack layer**, beside glossary / commonLiterals, not inside `logical-tokens.json`.

| Keep separate | Why |
|---------------|-----|
| Keywords (370) | Host language reserved words for transpile |
| Glossary | Learner variable *names* |
| CommonLiterals | Short teaching/UI strings |
| **UI / Design** | Design-tab kit: components + layout concepts the IDE emits |
| Stdlib (2.0) | Runtime API calls (`len`, `map`, …) |

**Open design choices (decide before 0.37.0 ships):**

1. Translate **component concept labels** only, keep JSX tag/prop identifiers English for React interop.
2. Or emit fully localized tags in a Learn/Design display mode, with a reverse map back to host components.
3. Route default button/alert copy through **commonLiterals**, not duplicate UI keys.
4. Out of scope: Tailwind utility strings, full shadcn/DOM API surfaces.

Machine source: `languages-roadmap.json` → `uiDesignRoadmap`.

---

## Major milestones

### 1.0.0 — Stable v1 (MAJOR)

**Trigger:** pack schema and npm API declared stable.

**Scope checklist:**

- [ ] **68** African language packs (keywords complete)
- [ ] **20** programming targets, **~400–450** logical tokens, 0 keyword gaps
- [ ] IDE gloss on all shipped packs (minimum seed counts met)
- [ ] `pack.schema.json` unchanged for one release cycle OR breaking changes documented with migration
- [ ] Regional maintainer model documented in CONTRIBUTING

**Not in 1.0:** stdlib/builtins tier (that is 2.0). UI/Design may ship as an **optional** layer before 1.0 (0.37+) but is not required for the 1.0 checklist.

### 2.0.0 — Stdlib / builtins tier (MAJOR)

**Trigger:** Kola transpiles translated API calls at scale (not just keywords).

**Scope:**

- New registry group in `logical-tokens.json` (separate from keyword coverage)
- **~100–150** cross-language starter concepts (`len`, `map`, `input`, `json.parse`, …)
- Separate coverage rules (no collision with Go `MAP` keyword, etc.)
- African packs: optional stdlib translations (English fallback OK for v2.0)

**Not in 2.0:** full JDK/DOM/Python-stdlib parity (10,000+ APIs).

---

## Parallel tracks (any version)

These can land as **patch** or ride along with related **minor** releases:

| Track | Owner | Notes |
|-------|-------|-------|
| Translation quality | Community PRs | `starter` → `community-reviewed` |
| Native prior art | Maintainers | Qalb → Arabic; Yorlang/OduduwaLang/Orunmilang → Yoruba; Nuru → Swahili; Tauraro/Hapy → Hausa; Igboscript/Ibolang → Igbo (see `priorArtSources`) |
| README / docs | Maintainers | `npm run readme:sync` after metric changes |
| Validation / CI | Maintainers | Usually no npm bump alone |
| Logical token additions | Maintainers | Only when a shipped target gains new reserved words |
| UI / Design seeds | Maintainers + IDE | Catalog Design-tab concepts before 0.37.0; do not invent keys without a real Design emit |

---

## Following this plan

1. Pick the **next `status: "next"`** item in [`languages-roadmap.json`](./languages-roadmap.json) → `releaseSequence`.
2. Implement one minor feature scope per release (see build skill).
3. Run `npm test`, update CHANGELOG, `direct-release.mjs` when shipping.
4. After pack/target changes, run `npm run registry` if names/locales changed.

Questions or scope changes: open a GitHub issue with label `roadmap`.
