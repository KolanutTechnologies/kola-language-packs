# Naming guide — new language packs

Use this **before** you create a folder or open a PR.

| Read first | Why |
|------------|-----|
| [`language-registry.json`](./language-registry.json) → **`taken`** (top of file) | Names and locales already reserved |
| [`GLOSSARY.md`](./GLOSSARY.md) | What ISO 639, ISO 3166-1, and BCP-47 mean in plain English |
| [`DIALECTS.md`](./DIALECTS.md) | Igbo/Hausa/Pidgin dialects — aliases vs new pack |
| [`PACK_SCOPE.md`](./PACK_SCOPE.md) | Language vs country codes |

---

## Step 1: Check what is already taken

Open [`language-registry.json`](./language-registry.json). Read **`howToUse`** and **`namingRules`** first, then check **`taken`**.

| Check | Where | Rule |
|-------|-------|------|
| Folder / pack `name` | `taken.names` | Must be **unique** |
| `locale` | `taken.locales` | Must be **unique** — each row shows country name |
| `languageCode` | `taken.languageCodesInUse` | May repeat if your **locale** is new |

**Examples**

| Situation | OK? |
|-----------|-----|
| New pack `akan` with `ak-GH` | Yes — planned, not shipped yet |
| New pack `swahili-tz` with `sw-TZ` | Yes — `sw` exists (`sw-KE`) but locale differs |
| Reuse `name: "zulu"` or `locale: "zu-ZA"` | **No** — already shipped |
| `languageCode: "ng"` | **No** — `ng` is Nigeria (country), not a language |

---

## Step 2: How to write each identifier

### `name` (folder slug) — readable name for humans

This is the **folder name** under `packs/`. Make it descriptive.

| Good folder `name` | Bad folder `name` | Why |
|--------------------|-------------------|-----|
| `cameroon-pidgin` | `wes` | Folder should describe the language; `wes` is the ISO code (goes in `languageCode`) |
| `hausa-niger` | `hausa2` | Use a meaningful slug |
| `portuguese-africa` | `pt` | `pt` belongs in `languageCode`, not the folder |

**Format:** lowercase letters, digits, hyphens — must match folder `packs/<name>/`

**Examples that pass:** `yoruba`, `nigerian-pidgin`, `cameroon-pidgin`, `igbo`

**Examples that fail:** `Yoruba`, `igbo_owerri`, `my pack`

---

### `languageCode` — ISO 639 standard language code

Short code for the **language** (from ISO 639). Not the country.

| Language | `languageCode` | Do not use |
|----------|----------------|------------|
| Yorùbá | `yo` | `ng` (Nigeria) |
| Igbo | `ig` | `ng` |
| Nigerian Pidgin | `pcm` | `ng` |
| Cameroon Pidgin | `wes` | `cm` (Cameroon) |
| Hausa | `ha` | `ng` |

**Format:** 2–3 lowercase letters — e.g. `ig`, `pcm`, `wes`

---

### `locale` — BCP-47 language + country tag

Combines language + primary country: **`{languageCode}-{COUNTRY}`**

| Variant | `languageCode` | `locale` | Reads as |
|---------|----------------|----------|----------|
| Yorùbá (Nigeria) | `yo` | `yo-NG` | Yorùbá, Nigeria |
| Igbo (Nigeria) | `ig` | `ig-NG` | Igbo, Nigeria |
| Nigerian Pidgin | `pcm` | `pcm-NG` | Pidgin, Nigeria |
| Cameroon Pidgin | `wes` | `wes-CM` | Kamtok, Cameroon |
| isiZulu | `zu` | `zu-ZA` | Zulu, South Africa |

**Format:** lowercase language, hyphen, **uppercase** country — e.g. `ig-NG` not `ig-ng`

**Same language, two packs (regional standards):**

| Pack folder `name` | `languageCode` | `locale` |
|--------------------|----------------|----------|
| `hausa` | `ha` | `ha-NG` |
| `hausa-niger` | `ha` | `ha-NE` |

---

### `name` vs `languageCode` — Cameroon Pidgin example

These work **together** — not contradictory:

```json
{
  "name": "cameroon-pidgin",
  "languageCode": "wes",
  "locale": "wes-CM",
  "displayName": "Cameroon Pidgin"
}
```

- **`name`** = readable folder (`cameroon-pidgin`)
- **`languageCode`** = ISO code (`wes`) — looks cryptic alone, correct in this field
- **`locale`** = `wes` + Cameroon (`wes-CM`)

---

### `countries` — ISO 3166-1 country list

Uppercase 2-letter codes. See [`GLOSSARY.md`](./GLOSSARY.md) for the full explanation.

```json
"countries": ["NG"]
```

Multi-country example (Hausa):

```json
"countries": ["NG", "NE", "GH", "SD"]
```

Country code reference also lives in `language-registry.json` → `reference.countryCodes` (`NG` = Nigeria, etc.).

---

### `regions`

Browse groups — use existing values when possible:

`West Africa` · `East Africa` · `Central Africa` · `Southern Africa` · `North Africa` · `Horn of Africa` · `Indian Ocean`

---

## Step 3: Full `pack.json` template (new pack)

```json
{
  "name": "your-pack-name",
  "languageCode": "xx",
  "locale": "xx-YY",
  "countries": ["YY"],
  "regions": ["West Africa"],
  "version": "0.1.1",
  "displayName": "Human-readable language name",
  "description": "One sentence — which variant and region this pack covers",
  "scopeNote": "What belongs in this pack vs other packs (dialect, country, creole variant).",
  "reviewStatus": "starter",
  "contributors": ["your-github-username"],
  "targets": ["javascript", "python", "typescript", "go", "rust"],
  "keywords": {
    "IF": ["your phrase", "if"],
    "ELSE": ["...", "else"]
  }
}
```

See field table in [`CONTRIBUTING.md`](../CONTRIBUTING.md) Path B.

---

## Step 4: Copy an existing pack (new language only)

**Run all commands from the repo root** (`kola-language-packs/`), not from inside `packs/hausa/`.

**Windows (PowerShell):**

```powershell
cd C:\path\to\kola-language-packs
Copy-Item -Recurse packs\hausa packs\your-pack-name
```

**Mac / Linux:**

```bash
cd kola-language-packs
cp -r packs/hausa packs/your-pack-name
```

Then edit:

1. `packs/your-pack-name/pack.json` — all metadata + keywords  
2. `packs/your-pack-name/keywords.json` — must match `pack.json` keywords  
3. `packs/index.json` — add your pack entry  

---

## Step 5: Validate (repo root only)

**Windows (PowerShell):**
```powershell
cd C:\path\to\kola-language-packs
npm install
npm test
```

**Mac / Linux:**
```bash
cd ~/path/to/kola-language-packs
npm install
npm test
```

### What each command does

| Command | Plain English | Changes your pack files? |
|---------|---------------|--------------------------|
| `npm test` | “Are my files valid?” | **No** — safe always |
| `npm run registry` | “Refresh the taken-names list” | Only updates `language-registry.json` |
| `npm run bootstrap` | “Replace ALL packs from script” | **Yes — wipes hand edits** — maintainers only |

**`npm run bootstrap` does not mean “refresh” or “validate”.** It regenerates every pack from `scripts/bootstrap-packs.mjs`. Contributors must **never** run it.

**Good `npm test` output:**
```text
Validated 25 language pack(s) against 112 logical token(s).
Coverage OK: ...
```

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Running `npm test` inside `packs/hausa/` | `cd` to repo root first |
| Using `ng` as `languageCode` | Use `yo`, `ig`, `ha`, `pcm` |
| Folder named `wes` instead of `cameroon-pidgin` | Readable `name`; ISO code goes in `languageCode` |
| Locale `yo-ng` (lowercase country) | Use `yo-NG` |
| Dialect PR as new folder `igbo-owerri` | Add aliases in existing `igbo` pack — see [`DIALECTS.md`](./DIALECTS.md) |
| Only editing `keywords.json` | Mirror in `pack.json` → `keywords` |

---

## Need help?

Open a GitHub issue with tag `new-language` or `question` before starting if unsure about dialect vs new pack.
