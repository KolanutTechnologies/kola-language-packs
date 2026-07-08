# Pack layers and scope ceilings

What each **layer** in a language pack is, how many entries it has, and where growth stops. This is **not** [`GLOSSARY.md`](./GLOSSARY.md) (ISO country/language codes).

**Machine roadmap:** [`ROADMAP.md`](./ROADMAP.md) · [`languages-roadmap.json`](./languages-roadmap.json)

---

## Layers in every pack

| Layer | File(s) | Required? | Now (per pack) | v1 ceiling | Notes |
|-------|---------|-----------|----------------:|-----------:|-------|
| **Keywords** | `keywords.json`, `pack.json` → `keywords` | **Yes** | 370 | ~650 | Maps logical tokens → native phrases |
| **Glossary** | `glossary.json` | No | 0 or 30 | ~50–100 | Identifier hints (lowercase keys) |
| **Placeholders** | `placeholders.json` | No | 0 or 12 | ~25–50 | Block/template slot labels |
| **CommonLiterals** | `common-literals.json` | No | 0 or 15 | ~50–150 | UI strings (`Hello`, `Error`, …) |
| **Stdlib / builtins** | *(planned v2)* | No | 0 | ~150 starter | API names (`len`, `map`, …) — **2.0.0** |

**IDE-ready:** keywords + glossary ≥ 30 + placeholders ≥ 10 + commonLiterals ≥ 10 (see `scripts/validate.mjs`).

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

## Stdlib / builtins (v2.0.0 only)

Not reserved words. Beginner curated set: **~100–150** concepts. Full per-language APIs: **5,000–20,000+** each — out of scope for community packs.

Design notes: `languages-roadmap.json` → `logicalTokenRoadmap.plannedTiers`.

---

## Two meanings of “tier”

| Term | Meaning |
|------|---------|
| **Logical-token tier** | `core` / `standard` / `advanced` on each entry in `logical-tokens.json` |
| **Pack layer** | keywords, glossary, placeholders, commonLiterals, (future) stdlib |

Do not confuse them in docs or PRs.
