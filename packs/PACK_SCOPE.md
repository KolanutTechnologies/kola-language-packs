# Pack scope: language, country, region, and dialect

Each pack is **one language variant for a defined geographic scope** — not “everything spoken in a country.”

Nigeria alone has hundreds of languages and many dialects per language. This repo uses:

- **Separate packs per language** (Yoruba, Igbo, Hausa, Nigerian Pidgin, …)
- **Aliases inside a pack** for dialect differences (Owerri Igbo vs Onitsha Igbo)
- **Separate packs** only when the variant is a different creole, country standard, or locale (see [`DIALECTS.md`](./DIALECTS.md))

---

## Codes explained (plain English)

Full glossary: [`GLOSSARY.md`](./GLOSSARY.md)

| Term | Field | Example | Plain meaning |
|------|-------|---------|---------------|
| **ISO 639** | `languageCode` | `ig` | The language (Igbo) |
| **ISO 3166-1** | `countries` | `["NG"]` | Countries where this pack applies (Nigeria) |
| **BCP-47** | `locale` | `ig-NG` | Language + primary country together |

`NG` is **Nigeria the country**, not a language. Never use `ng` as `languageCode`.

---

## Three fields — do not mix them up

| Field | Example | What it means |
|-------|---------|---------------|
| `languageCode` | `pcm` | **Language** (ISO 639). Nigerian Pidgin = `pcm`, not `ng`. |
| `locale` | `pcm-NG` | **Language + primary country** (BCP-47). |
| `countries` | `["NG"]` | **Where this pack applies** (ISO 3166-1). Can list multiple countries. |

### Nigerian Pidgin vs other pidgins

| Pack folder `name` | `languageCode` | `locale` | Notes |
|--------------------|----------------|----------|-------|
| `nigerian-pidgin` | `pcm` | `pcm-NG` | Naija only |
| `cameroon-pidgin` *(planned)* | `wes` | `wes-CM` | Kamtok — separate pack |

- Folder **`name`** = readable slug (`cameroon-pidgin`)
- **`languageCode`** = ISO code (`wes`) — correct in that field, not as folder name

Do **not** add Cameroon phrases to `nigerian-pidgin`.

---

## Dialects (Igbo, Hausa, Pidgin, …)

**Most dialect contributions → edit the existing pack, add aliases.**

Example for Igbo (`packs/igbo/`):

```json
"IF": ["ọ bụrụ na", "ọ bụ na", "if"]
```

**New pack only when** the variant is a different creole, country standard, or locale — not for every Nigerian state.

Full decision tree: [`DIALECTS.md`](./DIALECTS.md)

---

## Fields on every pack

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | yes | Folder slug, e.g. `yoruba`, `nigerian-pidgin` |
| `languageCode` | yes | ISO 639 language subtag |
| `locale` | yes | BCP-47 tag, usually `{lang}-{CC}` |
| `countries` | yes | ISO country codes where this variant is intended |
| `regions` | yes | Browse group, e.g. `West Africa` |
| `scopeNote` | strongly recommended | Dialect / country boundaries |
| `displayName` | yes | Human label in UI and docs |
| `description` | yes | One-line summary |
| `reviewStatus` | yes | Use `starter` for new contributions |

Directory: [`index.json`](./index.json)

**New pack?** [`NAMING_GUIDE.md`](./NAMING_GUIDE.md) · check [`language-registry.json`](./language-registry.json) → `taken` first.

---

## Choosing the right pack

1. **Find your language** in [`index.json`](./index.json).
2. **Read `scopeNote`** in that pack’s `pack.json`.
3. **Dialect only?** → [`DIALECTS.md`](./DIALECTS.md) — add aliases, same pack.
4. **Different creole / country variant?** → new pack with new `name` + `locale`.
5. **One language per PR.**

---

## Languages spoken in many countries

Some packs list **multiple** `countries` — dialect aliases welcome:

- **Swahili** — `KE`, `TZ`, `UG`, …
- **Hausa** — `NG`, `NE`, `GH`, …
- **Arabic / French** — lingua franca baselines; see `scopeNote`

When in doubt, mention your country and dialect in the PR.

---

## Adding a new pack

Step-by-step (Windows + Mac commands, field list, validation): [`NAMING_GUIDE.md`](./NAMING_GUIDE.md)

Quick summary:

1. Check `language-registry.json` → `taken`
2. Copy `packs/hausa` → `packs/your-pack-name`
3. Edit `pack.json`, `keywords.json`, `index.json`
4. From repo root: `npm test` then `npm run registry`

Do **not** run `npm run bootstrap` unless you are a maintainer.
