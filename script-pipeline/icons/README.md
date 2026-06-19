# Icon resolution

Turns an icon **concept** ("a team of people", "a recurring cycle") into a
**real, validated icon id** from the master library, so a scene never ships a
guessed id that 404s to a blank icon.

## Why this exists

Templates fetch icons from a per-render `public/icons/` folder. Before this,
the director/re-editor *guessed* icon ids; many didn't exist in the library, so
they 404'd and rendered blank (e.g. a lesson scene with `search`/`document` that
were never real filenames). The fix is a **hybrid resolver**: a deterministic
lexical search narrows the 4,747-stem library to a real shortlist, and an LLM
picks the best from that shortlist only, so it can never invent an id.

## The library

- **`Icons/`** (repo root), the real set: ~4,747 stems, each as `-light` and
  `-dark`, keyword-rich hyphenated names (`business-strategy-team`,
  `finance-hourglass`, `conflict-management-conflict`). **Use this.**
- `Small-Icons/`, a starved 19-icon set with messy names (`user (1).svg`). All
  standard templates have been repointed OFF this onto `Icons/`; do not add new
  dependencies on it.

### Variant by surface (icon-contrast rule)

The suffix names the **target surface**, and the artwork is the inverse:
`-dark` = light/blue artwork that reads on a **dark or saturated-colour**
surface; `-light` = dark artwork that reads on a **light** background. Most
Kubicle templates place icons on a dark/coloured surface, so they want `-dark`.
Each template's `GUIDANCE.md` states its surface in `assets.iconVariant`.

## Tools

| Tool | What it does |
|---|---|
| `build-icon-index.py` | Scans `Icons/` → `icon-index.json` (stems, tokens, light/dark ids, token document-frequencies for IDF). Run once, or after the library changes. |
| `icon-search.py "<query>" [--top N] [--surface dark\|light] [--json]` | Ranks the library for a query (IDF-weighted token overlap + substring + concept-synonym expansion). Returns a shortlist of **real** ids. The deterministic half of the resolver. |
| `concept-synonyms.json` | Concept → icon-vocabulary expansion (e.g. `blame → conflict, argument`). Improves recall; edit freely. |
| `validate-icons.py --scene-file <ts> [--ids ...] [--public <dir>]` | Guardrail: asserts every referenced id is a real file in `Icons/`; with `--public`, also flags ids not yet staged. Exits non-zero on any missing id. |
| `stage-icons.py --dest <public/icons> --scene-file <ts>` | Copies exactly the referenced icons from `Icons/` into a render's `public/icons/`, so the per-lesson public set is complete and small. |

## Pipeline integration

`script-pipeline/script-to-scenes.workflow.js` runs three phases:

1. **Direct**: segment the script, assign a template per scene.
2. **Re-edit**: per scene: linearize the narration, map to slots, and emit an
   `iconConcept` (plain words) for each icon slot. It does **not** guess ids.
3. **Icons**: per scene: read the template's GUIDANCE for the surface, run
   `icon-search.py` per concept, and pick the best **real** id (re-querying with
   concrete words when a concept is abstract).

After the workflow, the build step runs `stage-icons.py` then `validate-icons.py`
against the lesson's `lessonScenes.ts`; validation must pass before previewing.

## Manual use (resolving / fixing one lesson)

```bash
# find a good real id for a concept on a dark surface
python icon-search.py "recurring problem returns" --surface dark --top 12

# after editing scene props, guarantee no 404s and stage the icons
python stage-icons.py    --dest <bench>/public/icons --scene-file <bench>/src/lessonScenes.ts
python validate-icons.py --scene-file <bench>/src/lessonScenes.ts --public <bench>/public/icons
```
