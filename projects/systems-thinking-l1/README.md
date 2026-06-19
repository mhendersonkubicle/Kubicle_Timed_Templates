# Systems Thinking, Lesson 1: A Different Way of Thinking

A finished lesson video built end-to-end from the recorded narration and its SRT,
with every timing, scene-selection and production rule applied.

- Duration: 269.33s (8080 frames @ 30fps), 1920x1080
- Composition id: `Lesson`
- 10 scenes, 10 distinct templates (zero repeats)

## Files

| File | What it is |
|---|---|
| `narration.mp3` | The recorded voiceover (the audio track). |
| `lesson1.srt` | Character-timed subtitle file. The single source of truth for every reveal time. |
| `narration.md` | The plain-text linear narration the director segmented. |
| `scene-plan.json` | Director + re-edit output: per-scene segment, chosen template, linearized VO, slot text, reveal order. |
| `rementions.config.json` | Per-scene re-mention config (object anchors + reveal times) fed to the pulse detector. |
| `src/lessonScenes.ts` | The authored scene props: every scene's `timings.sequence` (SRT-derived reveal times) + `pulses`. |
| `src/Root.tsx` | The Remotion composition: audio track + a `<Series>` of the 10 scenes, durations from the SRT spans. |

> These two `src/` files are the deliverable. They drop into the Remotion bench
> (`~/.cache/claude-remotion-bench/src/`) which holds the 10 template components.

## Scene plan (script order)

| # | Template | Beat |
|---|---|---|
| 1 | LessonTitle | Course + lesson title card |
| 2 | Timeline5Tiles | The customer-service example, told as a chronological story |
| 3 | YinYang2Points | The two-state contrast: where linear thinking works vs where it fails |
| 4 | Process5Steps | The fix that failed, as a one-time causal chain (add staff → problem returns) |
| 5 | Points3Subtopics2 | The three signals a problem is systemic |
| 6 | WordDefinition | Defining "systems thinking" |
| 7 | ComparativePoints2 | Analytical thinking vs systems thinking |
| 8 | SplitscreenPointsV1 | What systems thinking is NOT |
| 9 | BulletList6Pills | Course outline (course-intro standard, first-lesson-only) |
| 10 | LessonSummary | Recap |

## How the production rules were applied

**Timing is a derivative of the SRT.** No timing is hard-coded in the templates.
Each scene defaults to blank; every object's reveal time (`timings.sequence[].at`,
scene-relative seconds) is the SRT timestamp where that object's content is first
spoken, taken to character-offset precision within the cue. Scene boundaries
(`SCENE_SPANS` in `Root.tsx`) are the SRT times where each beat begins.

**No dead air.** Each beat with a framing lead-in was routed to a template whose
setup stages a panel/container/anchor in the first ~1s, never by making content
appear early. Scene 2 uses Timeline5Tiles (an unfolding chronology) rather than a
static list so the example never sits on a blank frame.

**Variety.** Ten beats, ten different templates. Zero repeats.

**Course-outline standard.** The "in this course we'll cover..." beat uses
BulletList6Pills, and only because this is Lesson 1 (course-intro is first-lesson-only).

**Icon selection.** Every icon is a real id from the master `Icons/` library,
resolved from a concept via `script-pipeline/icons/` (lexical search → pick →
validate → stage) rather than guessed, so none 404 to a blank. Scene 8 originally
shipped two blank icons (`search`, `document` were never real filenames); it now
uses resolved `-dark` ids (`science-magnifyingglass-dark`, `info-diagram-dark`,
`construction-toolbox-dark`, `grammar-vocabulary-dark`). Variants were matched to
each surface's mode so artwork reads against its background (no dark-on-dark).
`validate-icons.py` against `src/lessonScenes.ts` passes (all 14 ids real).

**Re-mention pulses.** When an already-revealed object's key term is spoken again
clearly later in the scene, that object pulses briefly (half-sine, ~0.45s, +5%) at
the moment of the re-mention. Detected deterministically from the SRT by
`script-pipeline/detect-rementions.py` (gap > 4s after reveal, so a slightly-early
reveal is not mistaken for a re-mention). Applied:

| Scene | Object | Pulse @ (scene-rel s) | Re-mention |
|---|---|---|---|
| 5 (Points3Subtopics2) | title1 | 25.05 | "blame" |
| 5 (Points3Subtopics2) | title2 | 46.65 | "intervention" |
| 7 (ComparativePoints2) | leftPoint | 10.32 | "analytical thinking" |

## Preview

This project is previewed in Remotion Studio, not rendered to MP4 (per the project
rendering convention). Copy `src/lessonScenes.ts` + `src/Root.tsx` into the bench,
ensure `narration.mp3` is in the bench `public/`, then run the studio and open the
`Lesson` composition at `localhost:3000`.
