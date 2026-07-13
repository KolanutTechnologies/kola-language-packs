# Translation API coverage (maintainer reference)

Optional translation APIs for **triage and cross-checks** when bootstrapping or auditing starter packs. Not used in CI. Native speaker review remains the quality gate.

Live test output: run `node scripts/test-translation-apis.mjs` (writes `research/translation-api-coverage.md`, gitignored).

API keys: `.env` only (`ALL_LAB_PORTAL_API_KEY`, `TRANSLATION_API_PRIMARY_KEY`). Never commit keys.

---

## Khaya v2 (GhanaNLP)

- Portal: [translation.ghananlp.org](https://translation.ghananlp.org/)
- Languages: `GET https://translation-api.ghananlp.org/v2/languages`
- Translate: `POST https://translation-api.ghananlp.org/v2/translate` with `{ "in": "...", "lang": "en-tw" }`
- Auth header: `Ocp-Apim-Subscription-Key`

Fetched **2026-07-10**. Eleven African targets plus English.

| Code | Language | Shipped pack? | Pack slug |
|------|----------|---------------|-----------|
| `tw` | Twi | yes | `twi` |
| `yo` | Yoruba | yes | `yoruba` |
| `ee` | Ewe | planned | `ewe` (0.22.0) |
| `gaa` | Ga | planned | `ga` (0.22.0) |
| `fat` | Fante | planned | `fante` (0.22.0) |
| `dag` | Dagbani | planned | `dagbani` (0.22.0) |
| `gur` | Gurune | planned | `gurune` (0.23.0) |
| `ki` | Kikuyu | planned | `kikuyu` (0.24.0) |
| `luo` | Luo | planned | `luo` (0.24.0) |
| `mer` | Kimeru | planned | `kimeru` (0.24.0) |
| `kus` | Kusaal | planned | `kusaal` (0.23.0) |

**Summary:** 2 of 11 Khaya languages are shipped. **9 are planned** in `languages-roadmap.json` (releases 0.22.0–0.24.0).

Note: `akan` is shipped separately from `twi`. Khaya exposes `tw` (Twi), not a distinct Akan code.

---

## Mansa (All Lab Portal)

- Site: [all-lab-portal.com](https://all-lab-portal.com/)
- Translate: `POST https://all-lab-portal.com/api/translate` with `{ token, text, from: "English", to: "Swahili" }`
- Pricing: pay-as-you-go credits ($100 per 1M characters)
- No public languages list endpoint found; table below is from All Lab Portal product docs (30 African languages).

| Mansa name | Shipped pack? | Pack slug | Roadmap note |
|------------|---------------|-----------|--------------|
| Afrikaans | yes | `afrikaans` | |
| Amharic | yes | `amharic` | |
| Arabic | yes | `arabic` | |
| Bambara | yes | `bambara` | |
| Hausa | yes | `hausa` | |
| Igbo | yes | `igbo` | |
| Kinyarwanda | yes | `kinyarwanda` | |
| Lingala | yes | `lingala` | |
| Luganda | yes | `luganda` | |
| Oromo | yes | `oromo` | |
| Sesotho | yes | `sesotho` | |
| Shona | yes | `shona` | |
| Somali | yes | `somali` | |
| Swahili | yes | `swahili` | |
| Tigrinya | yes | `tigrinya` | |
| Tswana | yes | `setswana` | Mansa uses "Tswana" |
| Twi | yes | `twi` | |
| Xhosa | yes | `xhosa` | Mansa uses "Xhosa" |
| Yoruba | yes | `yoruba` | |
| Zulu | yes | `zulu` | Mansa uses "Zulu" |
| Bemba | planned | `bemba` | `languages-roadmap.json` 0.26.0 |
| Chichewa | planned | `chichewa` | `languages-roadmap.json` |
| Ewe | planned | `ewe` | Khaya + Mansa; `languages-roadmap.json` 0.22.0 |
| Kikongo | planned | `kikongo` | `languages-roadmap.json` |
| Kirundi | planned | `kirundi` | `languages-roadmap.json` |
| Malagasy | planned | `malagasy` | `languages-roadmap.json` |
| Ndebele (South) | planned | `ndebele` | `languages-roadmap.json` |
| Sepedi | planned | `sotho-northern` | `nso` pack covers Sepedi / Northern Sotho |
| Swati | planned | `swati` | `languages-roadmap.json` 0.26.0 |
| Tsonga | planned | `tsonga` | `languages-roadmap.json` |

**Summary:** 20 of 30 Mansa languages are shipped. **10 were unshipped**; all are now named in `languages-roadmap.json` (Sepedi via `sotho-northern`).

---

## Repo packs with no Mansa or Khaya coverage

These 8 shipped packs are outside both APIs today:

| Pack | Why |
|------|-----|
| `akan` | Khaya has `tw` (Twi), not `ak` |
| `cameroon-pidgin` | neither API |
| `efik` | neither API |
| `french` | colonial lingua franca pack, not an African MT target |
| `fulfulde` | neither API |
| `nigerian-pidgin` | neither API (Khaya `kpo` is Ghanaian Pidgin, not in v2 list) |
| `portuguese-africa` | colonial lingua franca pack |
| `wolof` | neither API |

---

## Smoke test notes (2026-07-10)

Batch one paragraph of 10 core keywords per call. Compare output to `pack.json`; do not auto-merge.

| Provider | Language | HTTP | Quality signal |
|----------|----------|------|----------------|
| Khaya | Twi, Yoruba, Ewe, Dagbani, Ga | 200 | Phrase-heavy; needs keyword extraction |
| Mansa | Swahili, Zulu, Yoruba, Somali | 200 | Zulu/Swahili align well with existing packs |
| Mansa | Twi, Ewe | 503 | Cold-start message; retry after 2-3 min |

**Zulu example:** Mansa returned `uma`, `ngoba`, `ngenkathi`, `umsebenzi`, `buyisa`, `iqiniso`, `amanga` - matches or near-matches the shipped `zulu` pack.

**Swahili example:** Mansa `kweli`, loop glosses phrase-heavy; pack uses `ikiwa`, `kwa`, `wakati`, `kazi`, `rudisha`.

---

## When to use which API

| Task | Use |
|------|-----|
| Cross-check Southern/Eastern packs (Zulu, Swahili, Somali, Oromo) | Mansa |
| Bootstrap Ghana/Kenya candidates (Ewe, Ga, Dagbani, Kikuyu, Luo) | Khaya |
| Twi or Yoruba triage | either; Khaya may be stronger, Mansa works when warm |
| Pidgin, Wolof, Fulfulde, Efik | community sources only for now |

---

## Suggested pack add order (Khaya-first)

Named in `languages-roadmap.json` — target releases:

| Pack | Release | API |
|------|---------|-----|
| `ewe`, `ga`, `fante`, `dagbani` | 0.22.0 | Khaya (+ Mansa for Ewe) |
| `gurune`, `kusaal` | 0.23.0 | Khaya |
| `kikuyu`, `luo`, `kimeru` | 0.24.0 | Khaya |
| `bemba`, `swati` | 0.26.0 | Mansa |

Use `packs/NAMING_GUIDE.md` and `npm run registry` before adding any pack.
