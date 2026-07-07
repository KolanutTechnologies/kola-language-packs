# Glossary — codes and standards (plain English)

You will see these acronyms in `pack.json` and the docs. They are **international standards** — not something Kolanut invented.

---

## Why we use standards

We follow **ISO 639**, **ISO 3166-1**, and **BCP-47** so language packs work with:

- npm, VS Code, and other developer tools
- Locale APIs in browsers and operating systems
- Other African language and localization projects worldwide

This repo is **standards-aligned**. There is no formal “certification” for language packs — we use the same codes UNESCO, governments, and major tech platforms use.

Full file map: [`REPO_MAP.md`](./REPO_MAP.md)

---

## ISO 639 — language codes (`languageCode`)

**What it is:** A worldwide list of short codes for **languages**.

**In this repo:** the `languageCode` field — 2 or 3 lowercase letters.

| Code | Language | Region |
|------|----------|--------|
| `sw` | Swahili | East Africa |
| `ha` | Hausa | West Africa |
| `wo` | Wolof | West Africa |
| `am` | Amharic | East Africa |
| `ar` | Arabic | North / Horn |
| `zu` | isiZulu | Southern Africa |
| `ln` | Lingala | Central Africa |

**Not a language code:** `NG`, `ZA`, `KE` (those are countries).

Look up codes: [ISO 639 list](https://www.loc.gov/standards/iso639-2/php/code_list.php)

---

## ISO 3166-1 — country codes (`countries`)

**What it is:** A worldwide list of 2-letter codes for **countries**.

**In this repo:** the `countries` array — uppercase 2 letters.

| Code | Country | Region |
|------|---------|--------|
| `NG` | Nigeria | West Africa |
| `SN` | Senegal | West Africa |
| `KE` | Kenya | East Africa |
| `CM` | Cameroon | Central Africa |
| `ZA` | South Africa | Southern Africa |
| `EG` | Egypt | North Africa |

Look up codes: [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

---

## BCP-47 — locale tags (`locale`)

**What it is:** A standard way to write **language + region** together.

**In this repo:** the `locale` field — format `{languageCode}-{COUNTRY}`.

| Locale | Meaning |
|--------|---------|
| `sw-KE` | Swahili, Kenya anchor |
| `wo-SN` | Wolof, Senegal anchor |
| `am-ET` | Amharic, Ethiopia |
| `ar-EG` | Arabic, Egypt anchor |
| `ln-CD` | Lingala, DR Congo |
| `zu-ZA` | isiZulu, South Africa |

- Left part = language — lowercase  
- Right part = country — **uppercase**  
- Wrong: `sw-ke` · Right: `sw-KE`

---

## Quick reference — three fields side by side

**Swahili (East Africa):**

| Field | Value | Standard | Plain meaning |
|-------|-------|----------|---------------|
| `languageCode` | `sw` | ISO 639 | Swahili language |
| `locale` | `sw-KE` | BCP-47 | Swahili, Kenya anchor |
| `countries` | `["KE","TZ","UG",…]` | ISO 3166-1 | Where this pack applies |

**Wolof (West Africa):**

| Field | Value | Plain meaning |
|-------|-------|---------------|
| `languageCode` | `wo` | Wolof language |
| `locale` | `wo-SN` | Wolof, Senegal anchor |
| `countries` | `["SN","GM","MR"]` | West African countries in scope |

---

## `name` vs `languageCode`

| Field | Example | Purpose |
|-------|---------|---------|
| `name` | `cameroon-pidgin` | Folder name — human-readable slug |
| `languageCode` | `wes` | ISO code — can look short/opaque; correct in this field |

Both appear together in the same `pack.json` — they are not contradictory.
