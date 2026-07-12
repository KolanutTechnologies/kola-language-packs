# Pack layers and scope ceilings

What each **layer** in a language pack is, how many entries it has, and where growth stops. This is **not** [`GLOSSARY.md`](./GLOSSARY.md) (ISO country/language codes).

**Why layers exist:** reduce the translate-tax of learning and writing code in a second language. People think in their language; packs map that surface to host English for tools. Full job statement: [`ROADMAP.md`](./ROADMAP.md) · README “Why this exists”.

**Machine roadmap:** [`ROADMAP.md`](./ROADMAP.md) · [`languages-roadmap.json`](./languages-roadmap.json)

---

## Layers in every pack

| Layer | File(s) | Required? | Now (per pack) | v1 ceiling | Notes |
|-------|---------|-----------|----------------:|-----------:|-------|
| **Keywords** | `keywords.json`, `pack.json` → `keywords` | **Yes** | 370 | ~650 | Maps logical tokens → native phrases |
| **Glossary** | `glossary.json` | No | 0 or 30 | ~50–100 | Identifier hints (lowercase keys) |
| **Placeholders** | `placeholders.json` | No | 0 or 12 | ~25–50 | Block/template slot labels |
| **CommonLiterals** | `common-literals.json` | No | 0 or 15 | ~50–150 | UI strings (`Hello`, `Error`, …) |
| **UI / Design** | *(planned)* | No | 0 | ~800–1500 stems | Phased catalog U1–U6 (Design encounter → full Tailwind families) |
| **Stdlib / builtins** | *(planned v2)* | No | 0 | ~150 starter | API names (`len`, `map`, …) — **2.0.0** |
| **Events / a11y** | *(Phase F)* | No | 0 | ~40–80 | `onClick`, `aria-label`, … — **2.1.0** |
| **Test DSL** | *(Phase F)* | No | 0 | ~20–40 | `describe`, `expect`, … — **2.1** / with builtins |
| **Operators (words)** | *(Phase F, optional)* | No | 0 | ~15–30 | Teaching labels only — **2.2.0** if Learn needs them |

**IDE-ready:** keywords + glossary ≥ 30 + placeholders ≥ 10 + commonLiterals ≥ 10 (see `scripts/validate.mjs`). UI/Design is **not** part of the IDE-ready bar until the seed catalog ships.

---

## Learn mode: what stays English (and when we change that)

| Learner token | Layer | Schedule |
|---------------|-------|----------|
| Reserved keywords (`if`, `for`, `in`, `elif`, …) | Keywords | Native phrase when reviewed; English-only stubs (e.g. `IN: ["in"]`) are **patch lane**, any `0.x.y` |
| Identifiers (`out`, `i`, `count`, …) | Glossary | Not Level 1. Fill glossary keys as patches; expand seed lists at **0.34.0** |
| UI / example strings (`Hello`, `Submit`, …) | CommonLiterals | IDE-tier; seed expansion at **0.34.0** |
| Design-tab components (`Button`, `div`, `className`, `flex`, …) | UI / Design | Phases **U1–U6** (0.37 → 1.3); people-facing gloss + English host emit; stem families, not every `p-4` row |
| Stdlib / builtin calls (`len`, Python `range()`, …) | Stdlib (v2) | **2.0.0** |
| Events / a11y / test DSL / operator words / diagnostics | Phase F | See [`ROADMAP.md`](./ROADMAP.md) Phase F; `futureMappingCandidates` |

Do not confuse an English **identifier** at Learn L1 with a missing **keyword** gloss. Do not treat Design-tab JSX staying English as a keyword gap. Full release plan: [`ROADMAP.md`](./ROADMAP.md) → Learn-mode gloss schedule.

---

## Logical tokens (central registry)

File: [`logical-tokens.json`](./logical-tokens.json)

| Metric | Count |
|--------|------:|
| Shipped | **370** |
| core / standard / advanced | 35 / 106 / 229 |
| Unique official keywords (15 targets) | ~374 |
| Practical keyword-layer ceiling | **~400–650** |

Logical tokens are **not** grammar, operators, or punctuation. Those would be a separate registry.

---

## Programming targets

Reserved-keyword transpile languages. **15 shipped**, **Clojure + 4 Tier-A** on roadmap → **~20 at v1.0**.

Practical maximum for this product: **~25–30** languages with formal keyword lists used in teaching.

---

## African language packs

**28 shipped** · roadmap **68** · quality ceiling without partners **~75–100** · living languages in Africa **1,500+** (not in scope).

One pack = one locale variant (`sw-KE`, `ha-NG`, …). Dialects usually add **aliases** inside the same pack.

---

## UI / Design (phased catalog U1–U6)

Not programming keywords. Covers **IDE Design tab** markup people read and edit: components, HTML/JSX tags, props, and Tailwind utility **families**.

**Product rule:** packs are for **people**. Same pattern as `tí` → `if`: show native in the editor, emit English/host forms so React, HTML, and Tailwind still run.

**Catalog goal:** everything someone will encounter in Design + common hand edits, grown in phases (not a one-shot dump of every Tailwind string).

| Phase | Release | Scope |
|-------|---------|--------|
| **U1** | 0.37.0 | Schema + Design-tab emit set (tags, props, components, utilities seen today) |
| **U2** | 0.38.0 | Layout + Flexbox + Grid + Spacing families |
| **U3** | 0.39.0 | Sizing + Typography + Borders |
| **U4** | 1.1.0 | Backgrounds + Colors + Effects |
| **U5** | 1.2.0 | Transitions + Transforms + Interactivity + state/responsive prefixes |
| **U6** | 1.3.0 | Telemetry fill (real encounters missed earlier) + prune |

| Sub-scope | Examples | Approach |
|-----------|----------|----------|
| Component concepts | Button, Badge, Avatar, Alert | Native ↔ host component |
| HTML / JSX tags | `div`, `span`, `nav` | Native ↔ host tag |
| Common props | `className`, `src`, `title` | Native ↔ host prop |
| Utility families | `flex`, `p`/`px`/`py`, `space-y`, `text`, `bg` | Gloss stems; compose scales/palette |
| Prefixes (U5) | `hover:`, `md:` | Gloss prefix keys |

**Compose, do not explode:** prefer stem keys (`P` + scale `4` → `p-4`) over listing every scale as its own pack row. Full CSS property authoring and open-ended arbitrary values stay out until Design emits them as a first-class surface.

Machine notes: `languages-roadmap.json` → `uiDesignRoadmap.catalogPhases`.

---

## Stdlib / builtins (v2.0.0 only)

Not reserved words. Beginner curated set: **~100–150** concepts. Full per-language APIs: **5,000–20,000+** each — out of scope for community packs.

Design notes: `languages-roadmap.json` → `logicalTokenRoadmap.plannedTiers`.

---

## Phase F — Future mapping candidates

Surfaces still English after keywords, IDE gloss, UI/Design, and builtins. **Planned, not started.** Full table: [`ROADMAP.md`](./ROADMAP.md) → Phase F. Machine: `languages-roadmap.json` → `futureMappingCandidates`.

| Candidate | Earliest | Pack vs IDE |
|-----------|----------|-------------|
| Events + a11y props | 2.1.0 | Pack (UI companion) |
| Test DSL | 2.1.0 / with 2.0 | Pack (builtins-adjacent) |
| Doc / comment markers | 2.1.x | Pack (small seeds) |
| Diagnostics (error text) | Product-led | IDE catalogs first |
| Operator word-labels | 2.2.0 optional | Separate registry if Learn shows words |

**Do not map:** punctuation-as-words, npm package names, URLs, git/CLI, raw CSS-as-language (unless Design emits it later).

---

## Two meanings of “tier”

| Term | Meaning |
|------|---------|
| **Logical-token tier** | `core` / `standard` / `advanced` on each entry in `logical-tokens.json` |
| **Pack layer** | keywords, glossary, placeholders, commonLiterals, (future) uiDesign, stdlib, Phase F layers |

Do not confuse them in docs or PRs.
