# Pack scope: language, country, and region

Each pack is **one language variant for a defined geographic scope** — not “everything spoken in a country.”

Nigeria alone has hundreds of languages. This repo uses **separate packs per language** (Yoruba, Igbo, Hausa, Nigerian Pidgin, …), each with metadata so contributors know exactly what to edit.

## Three different codes (do not mix them up)

| Field | Example | What it means |
|-------|---------|---------------|
| `languageCode` | `pcm` | **Language** (ISO 639). Nigerian Pidgin = `pcm`, not `ng`. |
| `locale` | `pcm-NG` | **Language + primary country** (BCP-47). Use when a creole or dialect is country-specific. |
| `countries` | `["NG"]` | **Where this pack applies** (ISO 3166-1). Can list multiple countries for cross-border languages. |

`ng` is **Nigeria the country**, not a language code. Putting `ng` in `languageCode` would be invalid for tooling and npm consumers.

### Nigerian Pidgin vs other pidgins

| Pack | `languageCode` | `locale` | Notes |
|------|----------------|----------|-------|
| `nigerian-pidgin` | `pcm` | `pcm-NG` | Naija / Nigerian Pidgin only |
| *(future)* `cameroon-pidgin` | `wes` | `wes-CM` | Kamtok — separate pack when added |
| *(future)* Ghanaian Pidgin | TBD | TBD | Separate pack when added |

Do **not** edit `nigerian-pidgin` with Cameroon or Ghana phrases — open a new pack instead.

## Fields on every pack

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | yes | Folder slug, e.g. `yoruba`, `nigerian-pidgin` |
| `languageCode` | yes | ISO 639 language subtag |
| `locale` | yes | BCP-47 tag, usually `{lang}-{CC}` |
| `countries` | yes | ISO country codes where this variant is intended |
| `regions` | yes | Browse group, e.g. `West Africa` |
| `scopeNote` | no | Extra guidance for contributors and reviewers |
| `displayName` | no | Human label in UI and docs |

See `packs/index.json` for a quick directory of all packs with country and region columns.

## Choosing the right pack to contribute to

1. **Find your language** in `packs/index.json` (sort by `countries` or `regions`).
2. **Read `scopeNote`** in that pack’s `pack.json` — especially for languages spoken in many countries (Swahili, Arabic, French, Hausa).
3. **One language variant per PR** — do not mix Nigerian and Ghanaian Twi in the same pack.
4. **New country-specific variant?** Copy an existing pack, set a new `name` and `locale`, and add it to `index.json`.

## Languages spoken in many countries

Some packs intentionally list **multiple** `countries`:

- **Swahili** — `KE`, `TZ`, `UG`, … — Kenya/Tanzania baseline; note dialect differences in PRs.
- **Hausa** — `NG`, `NE`, `GH`, … — prefer aliases over forcing one national form.
- **Arabic / French** — lingua franca packs; `scopeNote` explains MSA / international French baseline.

When in doubt, mention your country and dialect in the PR so a native reviewer from that region can approve.

## Adding a new pack

```bash
cp -r packs/hausa packs/your-pack-name
# Edit pack.json: name, languageCode, locale, countries, regions, scopeNote, keywords
# Edit keywords.json to match
# Add entry to packs/index.json
npm run validate
```

Or extend `scripts/bootstrap-packs.mjs` and run `npm run bootstrap`.
