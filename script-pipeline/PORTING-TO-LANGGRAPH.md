# Porting the lesson-video pipeline to LangGraph / a multi-agent fleet

This document specifies how to reproduce the chat-built workflow as a deterministic
graph. The key idea: **most of the work is already in tools and files, not in the
chat.** The LLM only makes four kinds of judgement (segment, re-edit, pick an icon,
look at a render and decide if it's right). Everything else, timing, icon validity,
re-mention detection, asset staging, is deterministic Python you import as-is.

If you port the tools and files faithfully and keep the render-and-look verification
loop, the LLM nodes can be relatively small models; the structure carries the quality.

---

## 1. What flows through the graph (the State)

```python
class LessonState(TypedDict):
    # inputs
    srt_path: str
    audio_path: str
    course_title: str
    lesson_number: int
    is_first_lesson: bool          # gates LessonTitle + BulletList6Pills course-outline

    # derived by the SRT parser (deterministic)
    cues: list[Cue]                # [{idx, start, end, text}] cleaned (no markup/curly quotes/dashes)

    # director output
    scenes: list[Scene]            # each: {id, cue_range, span:[s,e], template, rationale}

    # per-scene re-editor output
    # scene gains: linearized_vo, slots:[{target, text, icon_concept?}], reveal_order, warnings

    # per-scene icon-resolver output
    # scene gains: surface ('dark'|'light'), resolved_icons:[{target, icon_id}]

    # timing (deterministic from SRT)
    # scene gains: timings.sequence:[{target, at, in?}]  (at = scene-relative spoken time)

    # re-mention detector output (deterministic)
    # scene gains: timings.pulses:[{target, at}]

    # build
    lesson_scenes_ts: str          # generated src/lessonScenes.ts
    root_tsx: str                  # generated src/Root.tsx

    # verification
    bundle_ok: bool
    icon_validation_ok: bool
    stills: dict[str, str]         # scene_id -> rendered PNG path
    qa_findings: list[Finding]     # vision-QA: {scene_id, issue, fix}
    iterations: int
```

A scene is the atomic unit. Stages add fields to each scene; the build serializes
all scenes into the Remotion composition.

---

## 2. The graph (nodes + edges)

Deterministic nodes call the imported Python tools. LLM nodes are seeded with the
relevant GUIDANCE/rules. The verification loop is the part that made this project
succeed, do not skip it.

```
parse_srt (det)
   -> director (LLM)                     # segment + assign template per beat
   -> [per scene, in parallel]:
        re_edit (LLM)                     # linearize + map to slots + icon CONCEPTS
        -> resolve_icons (LLM+tool)       # concept -> real id via icon-search.py
   -> apply_timing (det)                  # at = SRT spoken time; spans = cue boundaries
   -> detect_rementions (det)            # detect-rementions.py -> pulses
   -> stage_assets (det)                  # stage-icons.py + stage-assets.py
   -> build_composition (det)            # write lessonScenes.ts + Root.tsx
   -> bundle (det)                        # npx remotion compositions  (gate: must compile)
   -> validate_icons (det)               # validate-icons.py          (gate: no 404s)
   -> render_stills (det)                # npx remotion still, one frame per scene
   -> visual_qa (LLM-vision)             # look at each still, list issues
, if issues --> patch (LLM/det) --> build_composition   (loop, cap ~3 iters)
, if clean  --> assemble_project (det) --> END
```

LangGraph wiring sketch:

```python
g = StateGraph(LessonState)
g.add_node("parse_srt", parse_srt)            # deterministic
g.add_node("director", director_llm)
g.add_node("scene_pipeline", scene_fanout)    # Send() one branch per scene: re_edit -> resolve_icons
g.add_node("apply_timing", apply_timing)
g.add_node("detect_rementions", detect_rementions)
g.add_node("stage_assets", stage_assets)
g.add_node("build", build_composition)
g.add_node("bundle", bundle)                  # raises -> back to build with error in state
g.add_node("validate_icons", validate_icons)
g.add_node("render_stills", render_stills)
g.add_node("visual_qa", visual_qa_vision)
g.add_node("patch", patch_scene)
g.add_node("assemble", assemble_project)

g.set_entry_point("parse_srt")
g.add_edge("parse_srt", "director")
g.add_conditional_edges("director", fanout_scenes)   # -> scene_pipeline per scene
g.add_edge("scene_pipeline", "apply_timing")
g.add_edge("apply_timing", "detect_rementions")
g.add_edge("detect_rementions", "stage_assets")
g.add_edge("stage_assets", "build")
g.add_edge("build", "bundle")
g.add_edge("bundle", "validate_icons")
g.add_edge("validate_icons", "render_stills")
g.add_edge("render_stills", "visual_qa")
g.add_conditional_edges("visual_qa",
    lambda s: "patch" if s["qa_findings"] and s["iterations"] < 3 else "assemble")
g.add_edge("patch", "build")
g.add_edge("assemble", END)
```

Use a checkpointer so a failed render resumes without re-running the LLM stages.

---

## 3. Files to import (the load-bearing assets)

### A. The template library (the visual vocabulary), `templates/`
- `templates/README.md`, the central standards doc (timing model, all the rules below).
- `templates/SELECTION_INDEX.md`, the registry the director scans (one row per template).
- `templates/<T>/<T>.tsx`, the 41 Remotion components (the renderable scenes).
- `templates/<T>/GUIDANCE.md`, per template: `useWhen` / do-NOT-use, slots + char limits,
  canonical reveal order, narration rules, icon surface (`assets.iconVariant`), reprocessing
  directive. **These are the system prompts for the re-editor and icon-resolver nodes.**
- `templates/<T>/Template-Specific-Assets/`, baked PNGs (namespaced; see stage-assets).
- `templates/<T>/examples/`, a worked example per template (few-shot material).

### B. The deterministic tools, `script-pipeline/`
Framework-agnostic Python/JS; wrap each as a graph node. Import unchanged:
- `icons/build-icon-index.py` -> `icons/icon-index.json` (run once over `Icons/`).
- `icons/icon-search.py` + `icons/concept-synonyms.json`, lexical shortlist of REAL icon ids.
- `icons/validate-icons.py`, guardrail: every referenced icon id exists (gate).
- `icons/stage-icons.py`, copy referenced icons into the render `public/icons/`.
- `stage-assets.py`, copy namespaced `Template-Specific-Assets/<T>/` into `public/`.
- `fit-timing.py`, deterministic timing: SRT + plan (cue ranges + per-slot `anchor` phrase) -> per-scene span + reveal `sequence` (each `at` = the SRT moment its anchor is spoken) + a ready-to-use rementions config. This is the `apply_timing` node; the editor only has to pick a good anchor per reveal.
- `detect-rementions.py`, deterministic SRT scan -> re-mention pulses (gap > 4s); feed it fit-timing's rementions config.
- `build-lesson.workflow.js`, the **full end-to-end orchestration** (Plan -> Compose -> Assemble -> Verify loop -> Project): SRT + MP3 in, finished project out, with the render-and-look verify/patch loop included. This is the canonical spec for the whole graph; port its phases and prompts.
- `script-to-scenes.workflow.js`, the earlier reference orchestration covering just Plan + re-edit + icons (a subset of build-lesson).
- `icons/README.md`, this file, the docs.

### C. The shared media libraries (repo root)
- `Icons/`, 13,240 SVGs (4,747 stems x -light/-dark). The icon source. Re-run the index if it changes.
- `CHARACTER LIBRARY (PNG)/`, 16 presenter portraits, staged to `public/characters/` for
  the character templates. (`Small-Icons/` is retired; do not import it.)

### D. The render harness (a Remotion 4 project)
A Node/Remotion project that serves `public/` and renders the `Lesson` composition:
- `package.json` (remotion ^4, react 18, zod 4), `src/index.ts` (registers `RemotionRoot`).
- `src/Root.tsx` + `src/lessonScenes.ts`, GENERATED per lesson (your build node writes these).
- `public/`, `narration.mp3`, `icons/`, `Template-Specific-Assets/<T>/`, `characters/`, `fonts/`.
- Bundle gate: `npx remotion compositions src/index.ts`. Stills: `npx remotion still src/index.ts Lesson out.png --frame=N`.
Use the project at `~/.cache/claude-remotion-bench` as the scaffold to copy.

---

## 4. The rules (inject into every LLM node)

These are the constraints that produced the quality. They live in `templates/README.md`
and each `GUIDANCE.md`; restate them as a shared system preamble:

1. **Reveal-sequence timing.** Templates default to blank; an element shows only when a
   `timings.sequence` step targets it. Never hard-code timing in a template.
2. **Timing is SRT-derived.** Each reveal `at` (scene-relative seconds) = the SRT timestamp
   where that content is first spoken. Scene spans = SRT cue boundaries. Never invent times.
3. **Variety.** One template per lesson (repeats only by genuine exception, justified).
4. **Semantic fit.** A template's visual must match the content's true structure. Flywheel =
   an ongoing system that keeps cycling (test: would it keep going round with no intervention?),
   not a one-time chain that merely ends where it began (that's a linear process).
5. **No dead air.** A beat with a framing lead-in must use a template whose `setup` stages a
   panel/anchor in the first ~1s. Never fix dead air by revealing content early.
6. **Character limits.** Every title/caption obeys its template's schema limit (frame-fit,
   single word or short 2-4 word phrase for titles/captions). The schema enforces it.
7. **First-lesson fixed roles.** Only in lesson 1 of a course: `LessonTitle` opener and the
   course-outline beat as `BulletList6Pills`. Don't recreate them in later lessons.
8. **Icon contrast.** `-dark` = light artwork for dark/coloured surfaces; `-light` = dark
   artwork for light backgrounds. Match the variant to the surface the icon sits on.
9. **Icon resolution, never guess.** The re-editor emits an icon CONCEPT; the resolver maps it
   to a REAL id chosen only from `icon-search.py` output. `validate-icons.py` must pass.
10. **Re-mention pulse.** A revealed object named again >~4s later gets a brief pulse at the
    re-mention's SRT time. Detected by `detect-rementions.py`, never invented.
11. **People templates.** Presenter-led variants (Topic1Subtopics6Character, Timeline5TilesCharacter,
    ...) front abstract content; profile/duo/trio cards are only for introducing real people.
12. **Assets are namespaced** per template (`Template-Specific-Assets/<T>/`); stage with
    `stage-assets.py`. Prevents cross-template filename clobbering.
13. **Delivery.** Preview in Remotion Studio; do not auto-render an MP4 unless asked.
14. **Style.** No em dashes or en dashes in any generated text (use commas/colons/parentheses).

---

## 5. The LLM node prompts (port from script-to-scenes.workflow.js)

- **director**: reads the narration + `SELECTION_INDEX.md`; segments into beats; assigns one
  template per beat under rules 3-7; returns scenes (verbatim segment + template + rationale).
  Output schema = `DIRECTOR_SCHEMA` in the workflow file.
- **re_edit** (per scene): reads `templates/<T>/GUIDANCE.md`; confirms fit; linearizes the VO to
  the canonical reveal order; maps to slots within char limits; emits an `iconConcept` per icon
  slot (NOT an id). Output schema = `REEDIT_SCHEMA`.
- **resolve_icons** (per scene): reads the template's surface from GUIDANCE; for each concept runs
  `python icon-search.py "<concept>" --surface <dark|light> --top 12`, picks the best REAL id,
  re-querying with concrete words for abstract concepts. Output schema = `ICON_SCHEMA`.
- **visual_qa** (vision model, ESSENTIAL): given each scene's rendered still, check: text fits its
  frame (no overflow), icons render (no blanks), correct icon contrast, baked panels not oversized/
  overlapping (asset-collision symptom), reveal/layout matches intent. Return `{scene_id, issue, fix}[]`.
  This loop is what caught the real bugs in this project (a mis-named prop blanking a title; a
  clobbered `icon_base.png` oversizing a panel). Without a vision QA node you lose that safety net.

The `apply_timing` node is deterministic: for each scene, set each slot's `at` to the
scene-relative start time of the cue that introduces it (the re-editor already aligned slot order
to reveal order, so this is a lookup). `setup` at ~0.2s; `in` from the template default.

---

## 6. Verification gates (must pass before output)

1. **bundle**: `npx remotion compositions` lists `Lesson` (composition compiles).
2. **validate-icons**: every referenced icon id is a real file AND staged into `public/icons/`.
3. **visual_qa**: zero unresolved findings across all scene stills.
Only then assemble the project folder (scene source + README + configs) and hand to Studio.

---

## 7. Honest caveats for a faithful port

- **The vision QA loop is not optional.** The project's polish came from rendering each scene and
  looking at it. Your fleet needs a vision-capable node and a working Remotion render environment
  (headless Chromium). Fonts: if the brand woff2 files are absent, renders fall back to system
  fonts; ship the fonts in `public/fonts/` for exact output.
- **The deterministic tools are the moat.** Timing, icon validity, re-mention detection, and
  staging are Python, not prompts. Port them unchanged; do not let an LLM re-derive them.
- **GUIDANCE.md files are the real prompts.** Per-template selection/narration/slot rules live
  there. Keep them in the loop (read at the re_edit and resolve_icons nodes); don't summarize them
  into a single static prompt or you lose fidelity.
- **One render harness, staged per lesson.** Because the bench is shared, run `stage-icons.py` and
  `stage-assets.py --all` before each render so the lesson's exact icons/assets are present.
- **Scale the LLM, not the structure.** With the tools + GUIDANCE + QA loop in place, the LLM
  judgement nodes are small and replaceable; the graph and files carry the quality.
```
```
