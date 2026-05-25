# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static study dashboard for the **TJSC 2026 Analista Jurídico** competitive exam (FGV examining board). It helps a candidate track the syllabus, review past exam questions, and save personal study notes backed by Supabase.

Deployed as a single-page static site on Vercel (`vercel.json` routes everything to `index.html`).

## Files

- **`index.html`** — the live application (≈2373 lines, all-in-one HTML/CSS/JS).
- **`Dashboard - Analista Jurídico TJSC.html`** — identical copy kept as a local backup/reference; changes go into `index.html`.
- **`Anotações - Analista Jurídico TJSC.html`** — an earlier standalone notes page (≈927 lines); superseded by the annotations section now embedded in `index.html`.
- **`vercel.json`** — static build config (`@vercel/static`), all routes fall back to `index.html`.

There is no build step, bundler, package manager, or test suite. Open `index.html` directly in a browser or serve with any static server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

## Architecture of `index.html`

The file is structured in three sequential zones:

### 1. CSS (lines 1–603)
All styles are in a single `<style>` block with a CSS custom-property palette at the top (`--off-white`, `--accent`, `--mid-orange`, etc.). Sections are separated by `/* ── NAME ── */` comments. The design language is a SaaS-minimalist monochrome system: black/off-white base with amber (`#FFCD71`) as the accent.

### 2. HTML (lines 605–1393)
- **Header** — exam title and badge.
- **Tab nav** — two tabs: `data-tab="edital"` and `data-tab="questoes"`.
- **`#page-edital`** — syllabus breakdown: summary stat cards → two `modulo-card` groups (Conhecimentos Gerais / Específicos) → each with a `.disc-table` of rows for each discipline → collapsible topic details and per-topic question lists with `expand-btn` / `subsec-btn`.
- **`#page-questoes`** — question bank UI shell (discipline grid and question list rendered entirely by JS).
- **`#anot-section`** — study notes section (always rendered inside the edital tab; toggled visible/hidden by tab switching logic in JS).

### 3. JavaScript (lines ~1395–2373)
Four logical blocks, each introduced by a `/* ══ NAME ══ */` banner:

| Block | Responsibility |
|---|---|
| Expand/collapse buttons | `expand-btn` and `subsec-btn` click handlers toggle `topics-detail` and `questions-section` divs |
| **Anotações · Supabase** | Full CRUD for study notes via the Supabase REST API |
| **Tab navigation** | Switches `.active` on `.tab-btn` / `.tab-page`; hides `#anot-section` when on questões tab |
| **Banco de Questões** | Renders discipline selector grid and question cards from the inline `QUESTOES_BANCO` array |

## Supabase Integration

The notes feature calls the Supabase REST API directly from the browser using a publishable key. The table is `analista_tjsc` with columns: `id`, `materia_anl`, `assunto_anl`, `topicos_anl`, `ref_anl`.

```js
const SUPA_URL = 'https://plwspyrxxygpkqhvzvkc.supabase.co/rest/v1/analista_tjsc';
const SUPA_KEY = 'sb_publishable_...';  // publishable (anon) key — safe to commit
```

Operations: `GET ?select=*&order=id.desc`, `POST` with `Prefer: return=minimal`, `DELETE ?id=eq.<id>`.

## Key Conventions

**Adding a new discipline's questions** — append objects to the `QUESTOES_BANCO` array (lines ~2027–2346). Each object has `{ n, grupo, lei, sub, inst, stmt, gab }`. Then update the `count` field on the matching entry in `QB_DISCIPLINES` (lines ~1974–1987) so the discipline card shows the count.

**Adding topics to the Anotações form** — the `ANOT_ASSUNTOS` map (lines ~1423–1539) lists the dropdown options per subject. Update it when the syllabus changes.

**CSS token additions** — add new variables to the `:root` block at the top of the `<style>` element; follow the existing naming pattern (`--<descriptor>-<modifier>`).

**Text formatting in notes** — the textarea stores `**bold**` / `*italic*` markers. `anotRenderFmt()` converts them to `<strong>`/`<em>` for display; `anotEsc()` sanitises before rendering to prevent XSS.

**`ref_anl` generation** — `anotGerarRef(mat, ass)` builds a short mnemonic tag (`#LP...`) from initials of non-stop words in the subject and topic strings. The generated ref is display-only and stored alongside the note.
