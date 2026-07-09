# Contribute without coding

You can improve African-language programming vocabulary **without installing tools, editing JSON, or opening a pull request**.

This repo ships **keyword maps for programming tools** (editors, transpilers, learning apps). It is not a standalone programming language like Nuru or Yorlang.

---

## Who we need

- **Native speakers** and **educators** who know how people actually talk about logic, loops, and functions in their language
- **Regional dialect experts** who can say whether a phrase fits Lagos, Kano, Dar es Salaam, Kinshasa, and so on

Developers are welcome too, but you do not need to be one.

---

## Two ways to help (pick one)

### 1. Suggest a translation

Use this when you want to **add or improve a word** for a programming concept.

**[Open: Suggest a translation →](https://github.com/KolanutTechnologies/kola-language-packs/issues/new?template=translation-suggestion.yml)**

Examples:

- Add a dialect alias for **IF** in Yorùbá
- Propose a more natural **FOR** in Swahili
- Fix **PRINT** in Hausa for classroom teaching

### 2. Report unnatural phrasing

Use this when something in the pack **sounds wrong** but you are not sure of the exact fix yet.

**[Open: Report unnatural phrasing →](https://github.com/KolanutTechnologies/kola-language-packs/issues/new?template=unnatural-phrasing.yml)**

---

## What to put in the form

| Field | Tips |
|-------|------|
| **Language pack** | **Dropdown** — pick Swahili, Hausa, Yorùbá, etc. Choose "Other" if your language is not listed yet. |
| **Programming concept** | **Dropdown** — pick IF, FOR, PRINT, etc. (plain English hint in each option). Choose "Other" and type the name for less common concepts. |
| **Your suggestion** | One phrase or several alternatives separated by commas. |
| **Region / dialect** | City, country, or variant (for example "Owerri Igbo", "Senegal Wolof"). |
| **Credit** | GitHub username or your name. We add contributors to pack metadata when we merge. |

**Concept names are in English on purpose.** They label programming ideas (`IF` = conditional, `FOR` = loop) so every pack stays aligned. Your job is to supply the **native phrase**, not to rename the concept.

Browse concepts: [`packs/logical-tokens.json`](./packs/logical-tokens.json) (370 total). Common starter concepts: `IF`, `ELSE`, `FOR`, `WHILE`, `FUNCTION`, `RETURN`, `PRINT`.

Browse shipped packs: [`packs/index.json`](./packs/index.json).

---

## What happens after you submit

1. A maintainer reads your issue (usually within 1–2 weeks).
2. We check scope (right pack, right dialect, not mixing countries).
3. We update the pack files and run automated checks.
4. Your change ships in the next npm release.
5. We credit you in the pack when possible.

You do **not** need to follow up unless we ask a question on the issue.

---

## Good suggestions

- Natural phrasing you would use when **teaching** code to students
- **Extra dialect aliases** (keep existing ones unless they are wrong)
- Notes like "we say X in school but Y at home" (both can be listed)

## Please avoid

- Mixing two countries in one pack (Nigerian Pidgin words in Cameroon Pidgin, etc.)
- Inventing new concept names (stick to `IF`, `FOR`, …)
- Suggesting changes for a language you do not speak without citing a source

Dialect rules: [`packs/DIALECTS.md`](./packs/DIALECTS.md). Scope rules: [`packs/PACK_SCOPE.md`](./packs/PACK_SCOPE.md).

---

## Want to edit files directly?

Use the full guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md) (git, JSON, `npm test`, pull requests).

---

## Questions?

- [GitHub Discussions](https://github.com/KolanutTechnologies/kola-language-packs/discussions)
- [Open a question issue](https://github.com/KolanutTechnologies/kola-language-packs/issues/new/choose)

Tag new language ideas with **`new-language`** in Discussions or Issues.
