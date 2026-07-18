# Product roadmap — version plan

Human-readable release plan for `@kolanut/language-packs`. **Source of truth for machines:** [`languages-roadmap.json`](./languages-roadmap.json) → `releaseSequence`.

## Why this registry exists

**Pain:** coding and learning in a second language adds a constant translate-tax. Attention that should go to the problem goes to English (or French, …) surface words instead.

**Job:** give tools a shared, versioned map so people can learn and write code in languages they actually think in. Keywords, IDE gloss, UI/Design, builtins, and Phase F are layers that serve that job.

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
| UI / Design concepts | 0 | ~200–400 (U1–U3) | ~800–1500 stems (full encounter catalog via U4–U6; scale numbers compose) |
| Stdlib/builtins concepts | 0 | 0 (until v2) | ~150 starter in v2.0 |
| Events / a11y props | 0 | 0 | ~40–80 (Phase F) |
| Test DSL concepts | 0 | 0 | ~20–40 (Phase F / with builtins) |
| Operator word-labels | 0 | 0 | ~15–30 (Phase F, optional) |

Africa has **1,500–3,000** living languages (UNESCO). This roadmap targets **~68** intentional packs, not full continental coverage.

---

## Phase overview

```text
0.11.x  ── shipped sprint (15 targets, 28 packs, 8 IDE-ready)
   │
0.12–0.21  Phase A — Clojure + complete IDE on shipped packs + named African packs (→41 packs)
   │
0.22–0.29  Phase B — African expansion backlog (→68 packs)
   │
0.30–0.33  Phase C — Tier-A programming targets (Lua, SQL, Scala, Elixir)
   │
0.34–0.39  Phase D — Quality, UI/Design catalog phases U1–U3, partner review
   │
1.0.0      Stable schema + full v1 scope
   │
1.1–1.3    Phase E — UI/Design catalog phases U4–U6 (colors, effects, states, telemetry fill)
   │
2.0.0      Stdlib/builtins tier (~150 starter concepts)
   │
2.1–2.x    Phase F — Future mapping candidates (events/a11y, test DSL, operators, diagnostics)
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
| **0.16.0** | minor | **Ẹdo (Bini)** pack; IDE batch 4: Efik, Cameroon Pidgin, Lingala, French, Portuguese-Africa | 29 packs · **28 IDE-ready** |
| **0.17.0** | minor | African packs: **Chichewa**, **Malagasy** | 31 packs |
| **0.18.0** | minor | **Tamazight**, **Hausa Niger** variant | 33 packs |
| **0.19.0** | minor | **Kirundi**, **Kikongo** | 35 packs |
| **0.20.0** | minor | **Ndebele**, **Tsonga**, **Venda**, **Northern Sotho** | 39 packs |
| **0.21.0** | minor | **Umbundu**, **Berber Tifinagh** | **41 named packs** |

**Patch lanes (any 0.x.y):** native-speaker review of starter packs; translation fixes; collision fixes in glossary keys; fill English-only keyword stubs (e.g. `IN`) when wording is ready.

### Learn-mode gloss schedule (keywords vs identifiers vs builtins)

IDE Learn Level 1 swaps **keywords** only. Identifiers and string literals stay English until later pack layers (or IDE project symbols). Do not treat “still English in FizzBuzz” as one bug class.

| What the learner sees | Pack layer | When we fill it |
|-----------------------|------------|-----------------|
| Keywords with only English stubs (e.g. `IN: ["in"]`, many packs today) | **Keywords** | **Any patch**, when native wording is reviewed. Not blocked on a minor release. |
| Variable / parameter names (`out`, `i`, `str`, …) | **Glossary** (identifier hints) | Add keys anytime as a patch on IDE-ready packs; **seed list expansion** (30 → 50) planned at **0.34.0**. Project-specific names stay in the IDE symbols map, not this repo. |
| String / UI literals (`"FizzBuzz"`, `"Hello"`, …) | **CommonLiterals** | Same IDE-tier path; seed expansion at **0.34.0**. |
| Design-tab JSX (`Button`, `div`, `className`, `flex`, …) | **UI / Design** | **Phased catalog** (U1 at **0.37.0**, then U2–U6). Goal: everything a learner will encounter in Design + common hand edits. People read native; IDE emits English/host. |
| Call names that are not reserved keywords (Python `range()`, `len()`, …) | **Stdlib / builtins** | **2.0.0**. Note: logical token `RANGE` is mainly Go’s `range` keyword; Python’s `range` is closer to builtins. |
| React events / a11y (`onClick`, `aria-label`, …) | **Events / a11y** (Phase F) | After UI/Design U1+; fold into UI layer or thin companion seeds |
| Test helpers (`describe`, `it`, `expect`, …) | **Test DSL** (Phase F) | With or just after builtins **2.0** / **2.1** |
| Operator *word* labels (not `{` `;`) | **Operators** (Phase F, optional) | Only if Learn shows words for `===`, `=>`, … |
| Compiler / IDE error text | **Diagnostics** | Prefer **IDE message catalogs**; optional shared keys in packs later |

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
| **0.37.0** | minor | **UI/Design U1:** schema + seed file; Design-tab encounter set (tags, props, components, utilities Design emits today); pilot IDE-ready packs |
| **0.38.0** | minor | **UI/Design U2:** full Layout + Flexbox + Grid + Spacing utility *families* (stems; scales compose) |
| **0.39.0** | minor | **UI/Design U3:** Sizing + Typography + Borders families; widen pack pilots |

### Phase E — Complete the encounter catalog (1.1 – 1.3)

After **1.0.0** schema lock. UI/Design stays optional for pack IDE-ready status until U1 ships; later phases deepen coverage.

| Version | Bump | Focus |
|---------|------|-------|
| **1.1.0** | minor | **UI/Design U4:** Backgrounds + Colors + Effects families |
| **1.2.0** | minor | **UI/Design U5:** Transitions + Transforms + Interactivity + common state/responsive *prefixes* (`hover:`, `md:`, …) |
| **1.3.0** | minor | **UI/Design U6:** Telemetry fill. Add stems learners actually type that earlier phases missed; prune unused invent-keys |

### UI / Design layer (how it fits)

Design-tab output is **markup people read**, not only reserved-word English. It belongs in a **new optional pack layer**, beside glossary / commonLiterals, not inside `logical-tokens.json`.

**Why map `div` / `className` / `flex`:** packs exist so humans can read and **manually edit** code in their language. The IDE maps native → English host forms, same as keywords (`tí` → `if`).

| Keep separate | Why |
|---------------|-----|
| Keywords (370) | Host language reserved words for transpile |
| Glossary | Learner variable *names* |
| CommonLiterals | Short teaching/UI strings |
| **UI / Design** | Design-tab + hand-edit catalog: tags, props, components, Tailwind utility families |
| Stdlib (2.0) | Runtime API calls (`len`, `map`, …) |

**Catalog goal:** everything someone will **encounter** in Design mode and common manual tweaks, expanded in **phases U1–U6**. Not inventing unused class names up front.

**How “all” works without 10,000 pack rows:**

| Approach | Example |
|----------|---------|
| Gloss the **stem / family** | `p` / `padding`, `flex`, `text` (size), `bg` |
| Keep **scale / color token** as host or shared digits | `4` in `p-4`, `red-500` in `bg-red-500` (decide per family in U1 design notes) |
| Prefixes as their own keys | `hover`, `md`, `dark` (U5) |

So packs cover the **vocabulary people read**, while numbers and some palette tokens can compose.

**Phase summary**

| Phase | Release | What lands |
|-------|---------|------------|
| **U1** | 0.37.0 | Schema, seeds, Design-tab emit set, pilot packs |
| **U2** | 0.38.0 | Layout, Flexbox, Grid, Spacing (full families) |
| **U3** | 0.39.0 | Sizing, Typography, Borders |
| **U4** | 1.1.0 | Backgrounds, Colors, Effects |
| **U5** | 1.2.0 | Transitions, Transforms, Interactivity, state/responsive prefixes |
| **U6** | 1.3.0 | Encounter telemetry fill + prune |

**Still out of scope even after U6:** raw CSS property language (`margin-top: 1rem` as authoring), arbitrary values as an open-ended English grammar (`[17px]`), every third-party plugin. Those can become later phases if Design starts emitting them.

Machine source: `languages-roadmap.json` → `uiDesignRoadmap` → `catalogPhases`.

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

**Not in 1.0:** stdlib/builtins tier (that is 2.0). UI/Design **U1–U3** should land before or with late 0.x; **U4–U6** complete the encounter catalog after 1.0 (Phase E). U1 is enough for optional Design gloss; full catalog is the phased goal, not a 1.0 blocker.

### 2.0.0 — Stdlib / builtins tier (MAJOR)

**Trigger:** Kola transpiles translated API calls at scale (not just keywords).

**Scope:**

- New registry group in `logical-tokens.json` (separate from keyword coverage)
- **~100–150** cross-language starter concepts (`len`, `map`, `input`, `json.parse`, …)
- Separate coverage rules (no collision with Go `MAP` keyword, etc.)
- African packs: optional stdlib translations (English fallback OK for v2.0)

**Not in 2.0:** full JDK/DOM/Python-stdlib parity (10,000+ APIs).

### Phase F — Future mapping candidates (after builtins)

Tracked so we do not forget surfaces learners still read in English after keywords, IDE gloss, UI/Design, and builtins. Machine source: `languages-roadmap.json` → `futureMappingCandidates`.

| Priority | Candidate | Examples | Home | Earliest |
|----------|-----------|----------|------|----------|
| High | **Events + a11y** | `onClick`, `onChange`, `aria-label`, `role` | UI/Design companion or pack field | **2.1.0** (needs U1 schema first) |
| High | **Test DSL** | `describe`, `it`, `expect`, `test` | Builtins adjacent / thin tier | **2.1.0** or ride **2.0** |
| Medium | **Doc / comment markers** | `TODO`, `FIXME`, `@param`, `@returns` | Small seed list (IDE gloss-like) | **2.1.x** patch/minor |
| Medium | **Diagnostics** | “Unexpected token”, “Cannot find name” | **IDE i18n** first; optional pack hooks | Product + later pack keys |
| Lower | **Operators (word labels)** | Teaching labels for `===`, `=>`, `...` | Separate registry (not logical-tokens) | **2.2.0** only if Learn shows words |
| Lower | **More HTML tags** | `section`, `main`, `form`, `label` | UI/Design U6 telemetry / U1 expand | With Design growth |
| Lower | **Regex flags** | `g`, `i`, `m`, named groups | Tiny catalog | If Learn teaches regex heavily |

**Keep English / symbols (do not map as pack vocabulary):**

- Punctuation as words (`{`, `;`, `(`, `.`) unless a special pedagogy mode exists
- npm package names (`react`, `lodash`)
- File extensions, URLs, git / CLI commands
- Raw CSS property language and open-ended arbitrary values (already deferred past U6)

**IDE product (not this npm package alone):** Learn chrome (Run, Debug, Problems). Translate in the IDE; packs stay code-facing.

| Version | Bump | Focus |
|---------|------|-------|
| **2.1.0** | minor | Events/a11y seeds + test DSL starter (or fold test DSL into 2.0 if ready) |
| **2.2.0** | minor | Optional operators word-label registry; doc/comment markers; diagnostics key hooks if IDE is ready |

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
| UI / Design seeds | Maintainers + IDE | Phases U1–U6 in `uiDesignRoadmap.catalogPhases`; seed from Design emits + encounter telemetry, not invented unused keys |
| Future mapping (Phase F) | Maintainers + IDE | `futureMappingCandidates` in roadmap JSON; do not start until U1 / 2.0 foundations exist |

---

## Following this plan

1. Pick the **next `status: "next"`** item in [`languages-roadmap.json`](./languages-roadmap.json) → `releaseSequence`.
2. Implement one minor feature scope per release (see build skill).
3. Run `npm test`, update CHANGELOG, `direct-release.mjs` when shipping.
4. After pack/target changes, run `npm run registry` if names/locales changed.

Questions or scope changes: open a GitHub issue with label `roadmap`.
