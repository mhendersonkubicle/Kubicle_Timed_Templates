# Templates

Motion-video templates rebuilt on a **standard reveal-sequence timing model**, each shipping with a **guidance + selection file** that says when to use the template and how narration must be written for it.

Each template is a **self-contained folder** with the same internal structure. This `templates/` folder is the canonical home for migrated templates; templates not yet here still live under `../scenes/` on the old bespoke-timing model.

## Folder layout

```
templates/
  README.md              ← this file
  SELECTION_INDEX.md     ← registry: pick a template by intent/tags
  <TemplateName>/        ← one self-contained folder per template (same structure each)
    <TemplateName>.tsx           ← the Remotion scene (reveal-sequence timing)
    GUIDANCE.md                  ← selection + narration guidance (YAML frontmatter + Markdown)
    Template-Specific-Assets/    ← PNGs unique to this template
```

**Template-specific PNGs are namespaced per template.** Each template fetches its baked assets from `staticFile('Template-Specific-Assets/<TemplateName>/<file>')`, and `script-pipeline/stage-assets.py` copies `templates/<T>/Template-Specific-Assets/*` into `public/Template-Specific-Assets/<T>/`. This is collision-proof: two templates may ship a differently-drawn `icon_base.png`, but they live under different template names, so reusing the shared bench across lessons can never clobber one with the other. Run `python script-pipeline/stage-assets.py --dest <public> --all` (or `--templates <names>`) when staging a lesson.

Icons are **not** duplicated per template. They resolve at render time from the single shared master library at the repo root (`../Icons/`); a render/bundle step copies the specific icons a render references into `public/icons/` (see the icon-resolution principle below). The legacy `../Small-Icons/` set is retired and no standard template depends on it.

## The reveal-sequence timing model

Every reworked template follows one timing contract:

- **Timing is a separate block** (`timings.sequence`), kept apart from content props.
- **The default is blank.** An element renders only when a step in the sequence targets it. An empty sequence = nothing on screen.
- **A sequence is an ordered list of steps:** `{ target, at, in? }`.
  - `target`, a named, addressable element of the template (its "slot"). The slot list is in each template's guidance frontmatter.
  - `at`, when the element starts appearing, in **scene-relative seconds** (drop SRT cue start times straight in).
  - `in`, entrance/pulse duration in seconds (default `0.5`).
- **One step = one object.** A compound object (e.g. an icon + its caption) reveals as a unit from a single step.

This makes templates **SRT-drivable**: convert each narration cue's start time to scene-relative seconds and assign it to the slot that cue introduces.

### Lifecycle phases

1. **Blank**, nothing scheduled yet (implicit; `t` before the first step).
2. **Setup** *(optional)*, empty scaffolding (containers, bars, empty boxes) animates in, via a `setup` step.
3. **Objects**, content reveals one slot at a time, each at its own cue.

(A standard top-left **scene pill** is planned as a later addition across all templates; deferred for now.)

## The guidance + selection file

Each `GUIDANCE.md` has two jobs and serves both humans and automated tooling (template selection, script reprocessing):

**YAML frontmatter (machine-readable):** `template`, `category`, `useWhen`, `tags`, `layout`, `slots`, `narration` rules, `timing` (model + canonical reveal order + duration), `assets`.

**Markdown body (human/LLM-readable):**
- What it is
- Use it when / Do NOT use it when
- Content model
- Reveal order (canonical)
- **Narration rules**, how narration must be structured for this template
- Narration template (fill-in skeleton)
- Worked example (narration → sequence + props)
- **Reprocessing directive**, how to adapt an existing script to fit
- Field / prop reference

### The universal narration principle

Across all templates: **narration order must match reveal order.** A template's guidance specialises this into concrete rules. For YinYang2Points it becomes *linear, side-complete comparison*, deliver one side fully (title + both sub-points) before the other, never ping-ponging sub-points across the two sides.

### The no-dead-air principle (selection, not a timing hack)

A scene must never open with a static/blank stage and no animation for more than ~1-2 seconds. The engine handles the OPENING beat for you: a scene's first content reveal is clamped to land by ~3.5s (`FIRST_CONTENT_CAP`) so the stage is never empty. But **do NOT lean on that, and do NOT hand-front-load the REST of the content reveals**, pulling later items in early makes them pop before they are narrated and reads as out of sync. Dead air across the body of a scene is a **selection + length** problem, solved in this order:

1. **Default: choose a template with a staging animation.** Prefer a template whose `setup` brings an intermediate/staging animation on screen within the first ~1s (a panel pans in, a container rises, a background scales, an anchor fades in, a scaffold appears). That motion covers the gap before the first spoken content while the content reveals stay cued to the SRT. If a beat's best content-fit template has a **no-op / blank `setup`** (nothing animates in) and the narration has a lead-in before the first content word, pick an alternative template that *does* stage in.
2. **Fallback: add a scene.** If the dead-air stretch is long and no staging-capable template fits the content, split the beat into an establishing/transition scene so the stage is never static for too long.

**Keep scenes short for momentum + variety.** Aim for 8-12s per scene; 15-18s is the exception, not the rule. A scene over ~18s (`LONG_SCENE_CAP`) should almost always be SPLIT into two scenes at a natural narration boundary (a new sub-topic, a "however", context-then-example, naming-a-list-then-unpacking-it). A long stretch of context before the real content is itself a split point: make the context its own short establishing scene so the content scene starts naming things straight away. More, shorter scenes mean more template variety and better storytelling; prefer splitting over one long static scene.

The body reveals always stay synced to the SRT; never speed them up to paper over dead air. Templates with a no-op setup (currently flagged `staging: none` in their guidance, e.g. `BigPoints3V2`, `CirclePoints4`) must not be chosen for a beat whose first spoken content arrives more than ~2s in.

### The preview-then-expand principle (reveal on naming, pulse on expansion)

A very common narration shape: the speaker **names a set of items as a group**, then **expands each one in turn** ("the four Ps: product, price, place, promotion" … then "Product is what the firm offers. Price is what it charges. …"; or "three levers: people, process, physical evidence" … then "People matter because…"). 

The trap: timing each item's reveal to its *later expansion* leaves a long static gap right after the opening, the names are spoken with nothing on screen, then items trickle in much later. Instead:

1. **Reveal each item when it is first NAMED** (at the preview), so the whole set lands on screen as the speaker lists it. This fills the gap, no dead air.
2. **When the narration returns to expand an item, PULSE it** (and reveal its detail, if the template has separate detail slots). The pulse is the callback emphasis; the detail builds out on the expansion cue. This is exactly what the re-mention pulse is for, and because the reveal sits at the preview and the expansion is >~4s later, `detect-rementions.py` will generate these pulses automatically once the reveal is anchored to the naming.

So for a preview-then-expand beat, **anchor each item's reveal to where it is first named, not to its expansion**. Choose a template that can show the whole set early and emphasize/build each item later: e.g. `Topic1Subtopics6` (reveal all rows at the preview, pulse each on its definition) or `Points3Subtopics2` (reveal all section titles at the preview, then build each section's detail + pulse the title on its expansion). This is a refinement of no-dead-air + re-mention pulse for the "list then unpack" structure.

### The icon-contrast principle (selection)

An icon must read clearly against the surface it sits on. The shared Icons library ships each glyph in two variants, and **the suffix names the target mode, while the artwork colour is the inverse** (the gotcha):

- **`-dark`** = the dark-mode asset → **light artwork** (platinum `#E6ECF2` + Dodger-Blue `#0496FF`) → use it on **dark** surfaces (oxford-blue panels, dark shells).
- **`-light`** = the light-mode asset → **dark artwork** (oxford `#052438` + Dodger-Blue) → use it on **light** surfaces (platinum backgrounds).

**Rule: match the icon's suffix to the mode of the surface the icon actually sits on**, which may be a shell/panel, not the root background. Putting a `-light` (dark-bodied) icon on a dark panel makes it disappear (the failure we hit: dark-grey on dark-blue, half the glyph invisible).

The suffix rule above applies to templates that render icons **as-is** (Pattern A, no runtime recolour), e.g. `ComparativePoints2`, `SplitscreenPointsV1`, `Points3Subtopics2` (anchor, locked to `-dark`). Templates that **force-recolour icons to solid white** (Pattern B: `YinYang2Points`, `IconPointsV1`, `CirclePoints4`, `BigPoints3V2`) are immune, the suffix is cosmetic there.

**Saturated-colour surfaces (the third case).** When an icon sits on a saturated brand-colour fill, a two-tone `-dark`/`-light` icon's **Dodger-Blue accents disappear against the blue** (blue on blue), so the icon reads as broken with half its strokes missing. Templates that place icons on such a fill therefore **force the icon to solid white**: `Process5Steps` (dodger-blue chevrons), `Flywheel4Petals` (dodger-blue petals), and `SplitscreenPointsV1` (the blue + pink pill circles, where a two-tone icon goes blue-on-blue on the left and clashes on the pink right). Rule of thumb: on a plain dark/light surface, match the variant; on a **saturated-colour surface, force the icon white** (the id/variant becomes cosmetic). Each template's `GUIDANCE.md` states what its icon slots do; follow it.

### The icon-resolution principle (no invented ids)

Icons come from the master **`Icons/`** library (~4,747 stems × `-light`/`-dark`). Templates fetch from a per-render `public/icons/` folder; the starved 19-icon `Small-Icons/` set is retired and no standard template depends on it. **Never guess an icon id**: a guessed id that isn't a real filename 404s to a blank icon (the failure we hit: `search`/`document` were never real names). Instead, resolve every icon through `script-pipeline/icons/`:

- The re-editor emits an icon **concept** (plain words), not an id.
- `icon-search.py` lexically ranks the real library for that concept and returns a shortlist of **real** ids; an LLM picks the best from that shortlist only (the hybrid resolver), choosing the `-dark`/`-light` variant per the surface (icon-contrast rule above).
- `validate-icons.py` (guardrail) must pass (every referenced id is a real file), and `stage-icons.py` copies exactly those icons into the render's `public/icons/`. No 404 ever ships.

See [`script-pipeline/icons/README.md`](../script-pipeline/icons/README.md) for the full system.

### The case-study principle (a company is a logo, not an icon)

When the narration introduces a **case study / worked example about a specific company**, that company is shown with a **logo**, never an icon. Use the `CaseStudyIntro` template for the establishing beat and give it a **made-up company logo** from `Logos/Fictional-Company-Logos/` (`Company-<Name>-light.svg`, 41 fictional companies; the name is baked into the wordmark, so no separate name text). For a **real named product** (Excel, Power BI, Teams, Claude) use a `Logos/Software/` logo instead. Stage the chosen logo with `script-pipeline/stage-logos.py` into `public/logos/`.

The distinction to hold: a **company example wants a logo**; a **general concept wants an icon**. The icon resolver only searches `Icons/`, so if a case-study company isn't routed to a logo it will get a wrong, generic icon. Detect the case study at selection time and route it to `CaseStudyIntro` + a logo.

### The re-mention pulse (animation)

When an object (or group) that has **already been revealed** is **named again later** in the narration (more than ~2-3s after its reveal), it gives a **brief, subtle brand pulse** at the exact re-mention timestamp, a quick scale bump (~+5% over ~0.45s, half-sine ease) that draws the eye back without re-animating the whole object. The pulse is driven by the SRT (the re-mention's cue time), never invented.

**Reference implementation: `ComparativePoints2`.** The pattern, copy it into any template:
- A `pulses: { target, at }[]` field on the timing schema (alongside `sequence`); `at` is the scene-relative second of the re-mention.
- A small `pulseScale(frame, pulseFrames, durF)` helper (returns 1 at rest, up to `1 + PULSE_AMP` at a pulse peak via a half-sine; overlapping pulses take the max). Brand values: `PULSE_DUR_S = 0.45`, `PULSE_AMP = 0.05`.
- Each content object multiplies its pulse scale into its **outer transform** with `transformOrigin` at the object's centre, so the bump composes with (never replaces) the object's reveal transform.

This is Pattern-A friendly (works for any template). The re-mention *times* come from the timing-fit stage scanning the SRT for repeat mentions of already-revealed items.

**Pulsing is REQUIRED wherever the opportunity exists, do not ship a scene with empty `pulses` when items are re-mentioned.** This is a mandatory production step, not optional polish, and it is the one most easily dropped at the build/compose stage. After timing every scene, run `detect-rementions.py` for the whole lesson and populate each scene's `pulses`. Pay special attention to **lengthy scenes and preview-then-expand beats** (a list named up front then unpacked over many seconds): those almost always have re-mention opportunities (each item is named, then named again as it is defined), and a long scene with empty pulses feels static. The QA pass must treat a lengthy or preview-then-expand scene whose items are re-mentioned later but whose `pulses` array is empty as a **defect to fix**, not a pass.

These rules are dual-use: they guide writing a new script for a chosen template, and they drive **reprocessing** an existing script so it fits the template (e.g. re-sequencing an interleaved comparison into side-complete order).

## Authoring / reprocessing workflow

1. **Select**, scan `SELECTION_INDEX.md`, confirm against the candidate's `GUIDANCE.md`.
2. **Write or reprocess narration** per that file's narration rules.
3. **Map narration → slots**, taking each `at` from the introducing line's SRT start time.
4. **Resolve icons**: for each icon slot, take its concept to a real id via `script-pipeline/icons/` (search → pick the right `-dark`/`-light` variant → `validate` → `stage`). Never hand-type an id.
5. **Author the `timings.sequence`** and preview.

## Previewing vs rendering

Compositions are delivered to **local Remotion Studio** (`npx remotion studio`) for preview. **Producing the final MP4 is the user's step**, done from Studio. The pipeline and these templates are not auto-rendered to MP4; quick PNG stills are used only for development checks.

## Migration status

**Complete: all 41 templates are migrated** to the reveal-sequence model and carry the identical standard (reveal-sequence timing, count variation where applicable, the re-mention pulse mechanism, a `GUIDANCE.md`, and an example). See `SELECTION_INDEX.md` for the catalogue. **YinYang2Points** was the first reference implementation for the model and guidance standard; **ComparativePoints2** is the reference for the re-mention pulse.

## On-beat reveals (and what to do about long gaps)

Every reveal is **anchored to the narration**: an element appears at the exact moment its statement is spoken. That on-beat sync is the point , do NOT slide reveals off their cue to "keep things moving" or fill time. `fit-timing.py` anchors each reveal to where its phrase occurs in the SRT. **The one exception is each scene's FIRST content reveal**: it is the establishing beat and is clamped to land by ~3.5s (`FIRST_CONTENT_CAP`) so the stage is never left empty waiting on the voiceover. Only that first reveal is moved; every subsequent reveal stays strictly on-beat (the engine does not even-spread).

If a scene is so sparse that on-beat reveals leave a long static stretch (e.g. a 2-reveal template over 28s), or the scene simply runs too long (over ~18s, `LONG_SCENE_CAP`), that is a **structural** signal, not a timing one: **split the beat into its own scene, or use a denser template** so each scene's content is being named throughout. `fit-timing.py` emits a "static stretch" warning and a "scene too long" warning when these happen; fix them by changing the scene plan (shorter scenes, more of them), never by moving body reveals away from the words they belong to. Openers (LessonTitle/LessonGoal) front-load all reveals deliberately.

