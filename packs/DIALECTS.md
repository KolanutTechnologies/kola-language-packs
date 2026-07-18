# Dialects — where your contribution goes

Africa has hundreds of languages and many dialects within each language. This repo handles that with a simple rule:

**One pack = one language variant with a clear geographic scope.**  
Dialect differences usually go **inside that pack as aliases**, not as separate folders.

Read this before opening a PR if you speak a regional dialect — e.g. coastal Swahili, Kano Hausa, Wolof in Senegal vs Mauritania, isiXhosa variants, Amharic regional usage.

---

## Decision tree (30 seconds)

```
Is there already a pack for your language?
│
├─ NO  → Add a new pack (see NAMING_GUIDE.md)
│
└─ YES → Is your dialect still the same language in that pack's scopeNote?
         │
         ├─ YES → Edit THAT pack. Add your phrasing as aliases.
         │
         └─ NO  → Different creole / country variant / teaching standard?
                  → New pack with new name + locale (e.g. cameroon-pidgin, hausa-niger)
```

---

## Option 1: Add aliases (most common)

Use this when:

- A pack already exists for your language (`swahili`, `hausa`, `wolof`, `igbo`, `zulu`, …)
- Your dialect differs in **word choice**, not a completely different language
- You are in another city or country but still within that pack’s `scopeNote`

**Where:** `packs/<language>/keywords.json` and `packs/<language>/pack.json` → `keywords`

**Example — Swahili regional phrasing (`sw-KE` pack, East Africa):**

```json
"IF": ["kama", "ikiwa", "if"]
```

**Example — Wolof (`wo-SN`, West Africa):**

```json
"PRINT": ["wone ci ecran bi", "print", "console.log"]
```

**Example — isiZulu (`zu-ZA`, Southern Africa):**

```json
"IF": ["uma", "kepha uma", "if"]
```

**Also update `scopeNote`** if helpful:

```json
"scopeNote": "Swahili baseline (Kenya-led). Includes common East African aliases; say your country in the PR."
```

**PR description:** "I speak Swahili from [country/city]. Added aliases for X, Y — did not change pack scope."

---

## Option 2: New pack (different variant)

Use this when:

- It is a **different creole or language** (Nigerian Pidgin ≠ Cameroon Pidgin)
- It is a **country-specific teaching standard** (planned: `hausa-niger` `ha-NE` vs `hausa` `ha-NG`)
- The existing pack's `scopeNote` says your phrases **do not belong there**

**Where:** new folder `packs/<new-name>/` + entry in `packs/index.json`

**Example — West vs Central Africa pidgin:**

| Field | West (exists) | Central (new pack) |
|-------|---------------|---------------------|
| `name` | `nigerian-pidgin` | `cameroon-pidgin` |
| `languageCode` | `pcm` | `wes` |
| `locale` | `pcm-NG` | `wes-CM` |
| `displayName` | Nigerian Pidgin | Cameroon Pidgin |

Do **not** add Kamtok phrases to `packs/nigerian-pidgin/`.

**Example — Hausa across West Africa (same language, different locale):**

| Field | Nigeria baseline | Niger variant |
|-------|------------------|---------------|
| `name` | `hausa` | `hausa-niger` |
| `languageCode` | `ha` | `ha` |
| `locale` | `ha-NG` | `ha-NE` |

Same `languageCode`, different `locale` — that is how we split regional standards.

**Example — Edoid languages in Edo State (different languages):**

| Field | Ẹdo (Bini) | Etsako (Yekhee) |
|-------|------------|-----------------|
| `name` | `edo` | `etsako` (planned) |
| `languageCode` | `bin` | `ets` |
| `locale` | `bin-NG` | `ets-NG` |

Same Nigerian state does **not** make them one pack. Etsako is a sibling Edoid language, not an Edo dialect. Do not add Etsako glosses under `packs/edo/`.

---

## What NOT to do

| Don't | Why |
|-------|-----|
| Create `packs/zulu-durban/` for alias-level differences | Use aliases in `zulu` instead |
| Mix Nigerian Pidgin and Cameroon Pidgin in one pack | Different countries / creoles → different packs |
| Mix Wolof and Hausa in one pack | Different languages → different packs |
| Mix Ẹdo (Bini) and Etsako (Yekhee) in one pack | Sibling Edoid languages → different packs (`bin` vs `ets`) |
| Change `languageCode` to a country code (`NG`, `ZA`) | Country codes go in `countries`, not `languageCode` |
| Start a new pack without checking `language-registry.json` | You may duplicate a planned pack |

---

## Many languages across Africa

Each **language** gets its own pack (Swahili, Hausa, Wolof, Amharic, Lingala, isiZulu, …).  
Each **dialect of that language** usually shares that pack via aliases.

If your language is not listed in [`index.json`](./index.json), add a **new language pack** — not a dialect folder.

Unsure? Open a GitHub issue with tag `question`. Say your language, dialect, and country/region.
