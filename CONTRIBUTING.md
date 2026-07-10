# Contributing to Kola Language Packs

Thank you for helping make programming accessible to African developers in their native languages!

This repo ships **keyword maps for programming tools** (editors, transpilers, learning apps). It is not a standalone programming language like Nuru or Yorlang.

---

## Choose how to contribute

| You are… | Best path | You need |
|----------|-----------|----------|
| **Native speaker or educator** — suggest a word or flag awkward phrasing | **Simple path** (below) | A GitHub account only. No install, no JSON, no pull request. |
| **Developer** — edit pack files directly | **[Pull request path](#pull-request-path)** | git, Node.js, `npm test` |

Most people who are not developers should use the **simple path**.

---

## Simple path (no coding)

Use GitHub **issue forms**. Pick your language and concept from **dropdowns**, type your suggestion, submit. Maintainers apply the change and credit you when we merge.

| Form | Use when |
|------|----------|
| **[Suggest a translation →](https://github.com/KolanutTechnologies/kola-language-packs/issues/new?template=translation-suggestion.yml)** | Add or improve a word (for example a better **FOR** in Swahili) |
| **[Report unnatural phrasing →](https://github.com/KolanutTechnologies/kola-language-packs/issues/new?template=unnatural-phrasing.yml)** | Something sounds wrong in your dialect but you want to explain why |

**Step by step:**

1. Open one of the links above (or go to **Issues → New issue** and pick a template).
2. Choose **language pack** from the dropdown (Swahili, Hausa, Yorùbá, …).
3. Choose **programming concept** from the dropdown (`IF — if / conditional`, `FOR — for loop`, …). Pick **Other** and type the name for less common concepts.
4. Fill in your suggestion, region/dialect, and how we should credit you.
5. Submit. We review within about 1–2 weeks, update the pack, and reply on the issue.

Full guide with examples: **[`CONTRIBUTING-SIMPLE.md`](./CONTRIBUTING-SIMPLE.md)**

Questions without a specific word fix? [GitHub Discussions](https://github.com/KolanutTechnologies/kola-language-packs/discussions) or open an issue tagged `question`.

---

## Pull request path

Use this if you are comfortable editing JSON and opening a pull request on GitHub.

Every contribution is a **language pack** under `packs/<name>/`. You translate programming concepts into native phrases and declare **where that variant applies** (`locale`, `countries`, `regions`).

**Do not edit `packs/logical-tokens.json` to add translations.** That file is the shared checklist of **370** concepts (IF, FOR, FUNCTION, …). Your job is to map those keys in your language pack — not change the registry itself.

| File | What to do |
|------|------------|
| `packs/<name>/pack.json` | Edit metadata + `keywords` |
| `packs/<name>/keywords.json` | Edit the same `keywords` (must match `pack.json` exactly) |
| `packs/logical-tokens.json` | Read only — your translation checklist |
| `packs/index.json` | Add an entry only when creating a **new** pack |

Also read [`packs/PACK_SCOPE.md`](./packs/PACK_SCOPE.md) before you start — especially language codes vs country codes (e.g. `pcm` is Nigerian Pidgin, `NG` is Nigeria).

**New language pack?** Read [`packs/NAMING_GUIDE.md`](./packs/NAMING_GUIDE.md) and check [`packs/language-registry.json`](./packs/language-registry.json) so your `name`, `locale`, and `languageCode` do not overlap existing or planned packs.

**Dialect (e.g. your Igbo region)?** Read [`packs/DIALECTS.md`](./packs/DIALECTS.md) — usually you add aliases to the existing pack, not a new folder.

**Codes confusing (ISO 639, BCP-47, …)?** Plain English: [`packs/GLOSSARY.md`](./packs/GLOSSARY.md)

---

## Commands — what to run (and what never to run)

### Step 0: open the repo root

All commands run here — the folder that contains `package.json` and `packs/`.

**Windows (PowerShell):**
```powershell
cd C:\Users\YOU\OneDrive\Documents\kola-language-packs
```

**Mac / Linux:**
```bash
cd ~/path/to/kola-language-packs
```

Do **not** `cd` into `packs/hausa/` or `scripts/` to run npm. You edit files in your editor; commands run from the root.

---

### DO run these

| Command | What it does in plain English | When |
|---------|------------------------------|------|
| `npm install` | Downloads project tools (once per machine) | First time only |
| `npm test` | **Checks your pack files are valid** — no files deleted | **Every PR** |

**Success looks like:**
```text
Validated 28 language pack(s) against 370 logical token(s).
Coverage OK: ...
```
If you see that, you are done. Open your PR.

| Command | What it does | When |
|---------|--------------|------|
| `npm run registry` | Updates the "taken names" list (`language-registry.json`) | **Only when adding a new pack** |

---

### DO NOT run these (contributors)

| Command | What it actually does | Why not |
|---------|----------------------|---------|
| `npm run bootstrap` | **Overwrites every pack folder** from a maintainer script | Your translations (and others’) can be **wiped** |
| `npm run build` | Compiles TypeScript for npm | Not needed for translation PRs |
| `cd` into a `pack.json` file | `pack.json` is a file, not a folder | Use your editor to open it |

If a PR runs bootstrap and replaces all packs, maintainers will **reject** it unless it was intentional maintainer work.

Details: [`scripts/README.md`](./scripts/README.md) · file map: [`packs/REPO_MAP.md`](./packs/REPO_MAP.md)

**Maintainers:** after adding packs, targets, or logical tokens, `npm test` regenerates `README.md` metrics (badges, coverage tables, pack lists). Commit the updated README — CI checks `git diff README.md`. Do not hand-edit content inside HTML comment markers; extend `scripts/update-readme-metrics.mjs` instead.

---

## Path A: Improve an existing pack

Example: better isiZulu phrasing in `packs/zulu/`.

### Steps

1. **Find your pack** in [`packs/index.json`](./packs/index.json) and open its folder (e.g. `packs/zulu/`).
2. **Read `scopeNote`** in `pack.json` — confirm this pack matches your dialect/region. If not, see Path B (new variant).
3. **Open `packs/logical-tokens.json`** — use it as a checklist. Every `"logical"` key (**370** total) must have a translation in your pack.
4. **Edit translations** in `keywords.json` (easiest) and copy the same changes into `pack.json` → `keywords`.
5. **Update metadata if needed** — e.g. clearer `scopeNote`, corrected `countries`, or added dialect aliases. Do not change `languageCode`/`locale` unless you are fixing a mistake or scoping a variant.
6. **Run validation:**

   ```bash
   npm install
   npm test
   ```

7. **Open a PR** — one language pack per PR. Say which country/dialect you speak and what you changed.

### Translation format

Single phrase:

```json
"IF": "uma"
```

Multiple aliases (recommended — include English fallback last):

```json
"IF": ["uma", "kepha uma", "if"]
```

---

## Path B: Add a new language pack

Use this when the language or **country-specific variant** does not exist yet (e.g. Cameroon Pidgin, not Nigerian Pidgin).

**Before naming anything:** [`packs/NAMING_GUIDE.md`](./packs/NAMING_GUIDE.md) · [`packs/language-registry.json`](./packs/language-registry.json) (taken names, locales, and codes)

### Steps

1. **Check the registry** — confirm your proposed `name` and `locale` are not in `language-registry.json` → `taken`.
2. **Copy a similar pack** (from repo root):

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

3. **Fill in all metadata in `pack.json`** — use the full template in [`NAMING_GUIDE.md`](./packs/NAMING_GUIDE.md):

   | Field | Example | Notes |
   |-------|---------|-------|
   | `name` | `cameroon-pidgin` | Folder slug; unique; lowercase hyphenated |
   | `languageCode` | `wes` | ISO 639 — **not** a country code |
   | `locale` | `wes-CM` | BCP-47: `{lang}-{CC}` — must be unique |
   | `countries` | `["CM"]` | ISO 3166-1 where this variant applies |
   | `regions` | `["Central Africa"]` | Browse grouping |
   | `version` | `0.1.1` | Match root `package.json` version |
   | `displayName` | `"Cameroon Pidgin"` | Human-readable label |
   | `description` | `"Cameroon Pidgin (Kamtok) keyword map — starter pack"` | One-line summary |
   | `scopeNote` | `"Cameroon Pidgin (Kamtok) only."` | Dialect / country boundaries |
   | `reviewStatus` | `"starter"` | Always `starter` for new PRs |
   | `contributors` | `["your-github-username"]` | Your GitHub handle |
   | `targets` | `["javascript","python","typescript","go","rust"]` | All five required |
   | `keywords` | `{ "IF": [...], ... }` | All **370** tokens from `logical-tokens.json` |

4. **Edit `keywords.json`** — must be **identical** to the `keywords` object in `pack.json`.

5. **Add an entry** to [`packs/index.json`](./packs/index.json) (same fields as above; must match `pack.json`).

6. **Regenerate the registry** (from repo root):

   ```powershell
   cd C:\path\to\kola-language-packs
   npm run registry
   ```

7. **Run validation** (from repo root):

   ```powershell
   npm test
   ```

8. **Open a PR** — one new pack per PR.

---

## Checklist before you open a PR

Use this list — incomplete PRs will fail CI or be sent back for revision.

- [ ] If this is a **dialect**, I read [`packs/DIALECTS.md`](./packs/DIALECTS.md) and used aliases (not a duplicate pack folder)
- [ ] I edited `packs/<name>/` — **not** `logical-tokens.json` (unless proposing a new concept in a separate maintainer PR)
- [ ] `displayName`, `description`, and `reviewStatus: "starter"` are set (new packs)
- [ ] `version` matches root `package.json`
- [ ] `languageCode`, `locale`, `countries`, and `regions` correctly describe **my** variant
- [ ] `scopeNote` explains what is in scope and what belongs in a different pack
- [ ] All **370** logical tokens from `logical-tokens.json` have translations in `keywords`
- [ ] `keywords.json` and `pack.json` → `keywords` are **identical**
- [ ] `targets` lists all five: `javascript`, `python`, `typescript`, `go`, `rust`
- [ ] `npm test` passes locally
- [ ] One language pack per PR
- [ ] PR description mentions my country/dialect and any sources I used

---

## What counts as a valid contribution

**Good:**

- Replacing starter translations with natural phrasing a teacher would use
- Adding alias arrays for regional variants within the same pack scope
- Fixing wrong `locale` / `countries` / `scopeNote` metadata
- A complete new pack with correct scope and all 370 tokens

**Not enough on its own:**

- Changing one or two words without checking the full token list
- Mixing phrases from different countries in one pack (e.g. Nigerian + Ghanaian pidgin)
- Editing `logical-tokens.json` instead of the language pack
- Updating only `keywords.json` but forgetting `pack.json` (or vice versa)

---

## Who can contribute?

- **Native speakers** — essential for accuracy
- **Linguists and educators** — culturally appropriate, teachable phrasing
- **Developers** — tooling integration and validation fixes

---

## Language pack structure

```
packs/yoruba/
├── pack.json       ← metadata + keyword mappings
└── keywords.json   ← same keyword mappings (for tooling)
```

### Required metadata example

```json
{
  "name": "nigerian-pidgin",
  "languageCode": "pcm",
  "locale": "pcm-NG",
  "countries": ["NG"],
  "regions": ["West Africa"],
  "scopeNote": "Nigerian Pidgin (Naija) only. Not other West African creoles."
}
```

| Field | Example | What it means |
|-------|---------|---------------|
| `languageCode` | `pcm` | ISO 639 language code — **not** the country (`ng`) |
| `locale` | `pcm-NG` | BCP-47 tag: language + primary country |
| `countries` | `["NG"]` | ISO country codes where this variant applies |
| `regions` | `["West Africa"]` | Geographic grouping for browsing |
| `scopeNote` | (free text) | What's in this pack vs future packs |

Browse packs: [`packs/index.json`](./packs/index.json) · by country: [`packs/by-country.json`](./packs/by-country.json) · by region: [`packs/by-region.json`](./packs/by-region.json)

**Translation quality:** Prefer phrasing you would use when teaching code. Cite borrowed glossaries in the PR. Leave `reviewStatus` as `starter` — maintainers update it after review.

### The token registry

Every pack must translate all logical tokens in [`packs/logical-tokens.json`](./packs/logical-tokens.json) (**370 tokens**).

**Rules:**

- Do not invent custom token keys — propose new tokens in a separate PR
- Minimum enforced by validation: `IF`, `FOR`, `FUNCTION`, `RETURN`, `PRINT`
- English placeholders are OK as a starting point; native-speaker PRs should replace them

See [`packs/target-coverage.json`](./packs/target-coverage.json) for how each token maps to JavaScript, Python, TypeScript, Go, and Rust.

---

## Review process

1. **Submit your PR** — one language pack per PR
2. **Native speaker review** — accuracy and naturalness
3. **Automated checks** — CI runs `npm test` (validation + coverage)
4. **Merge and release** — release-please batches releasable PRs into a Release PR; maintainer merges when ready to publish

Most PRs are reviewed within 1–2 weeks.

---

## Maintainer: applying issue suggestions

Contributors can also use GitHub issue forms ([`CONTRIBUTING-SIMPLE.md`](./CONTRIBUTING-SIMPLE.md)) without opening PRs.

| Label | Form | Your job |
|-------|------|----------|
| `translation-suggestion` | Suggest a translation | Add alias or replace phrasing in `packs/<name>/keywords.json` and `pack.json` → `keywords`; credit submitter in `contributors` when appropriate |
| `translation-review` | Report unnatural phrasing | Same as above; close with link to merged PR or commit |

**Triage checklist:**

1. Confirm pack scope ([`PACK_SCOPE.md`](./packs/PACK_SCOPE.md), [`DIALECTS.md`](./packs/DIALECTS.md)).
2. Keep English fallback as last alias when adding arrays.
3. Sync `keywords.json` and `pack.json` → `keywords` identically.
4. Run `npm test` from repo root.
5. Open a PR (or batch several issues). Reference the issue number.
6. Comment on the issue when shipped; thank the contributor.

When adding a new pack, update the dropdown lists in `.github/ISSUE_TEMPLATE/translation-suggestion.yml` and `unnatural-phrasing.yml`.

### PR titles (for automated changelog)

Use [Conventional Commits](https://www.conventionalcommits.org/) in your **squash merge title** so release-please can write the changelog:

| Prefix | When to use | Example title |
|--------|-------------|---------------|
| `fix:` | Translation or metadata fix | `fix(yoruba): add IF dialect alias` |
| `feat:` | New language pack | `feat: add akan language pack` |
| `docs:` | Docs only (no npm release) | `docs: clarify locale format in NAMING_GUIDE` |
| `chore:` | Tooling / CI (no npm release) | `chore: update validation script` |

Details: [`VERSIONING.md`](./VERSIONING.md)

---

## Code of conduct

We celebrate linguistic diversity and regional variation.

- **Use alias arrays** for regional expressions instead of forcing one "correct" form
- **Be inclusive** — Lagos Pidgin ≠ Port Harcourt Pidgin; include variations when appropriate
- **Be kind in review** — language is personal and cultural

---

## Need help?

**Suggesting a translation (no coding):** use the [issue forms](#simple-path-no-coding) or [`CONTRIBUTING-SIMPLE.md`](./CONTRIBUTING-SIMPLE.md).

**Editing files / PRs:** see [Pull request path](#pull-request-path) above.

- [GitHub Discussions](https://github.com/KolanutTechnologies/kola-language-packs/discussions)
- Open an issue: tag `question`, `new-language`, or `bug`
- Say which language, country, and dialect you are working on
