# Team Ground Rules, Lesson 1: What Ground Rules Are, and Why They Matter

A finished lesson video built from the recorded narration and its SRT, applying
every standard the system encodes. This is the **first lesson of a course**, so it
carries the two first-lesson-only fixed roles: a LessonTitle opener and a
BulletList6Pills course-outline.

- Duration: 305.43s (9163 frames @ 30fps), 1920x1080
- Composition id: `Lesson`
- 10 scenes, 10 distinct templates (zero repeats)

## Files

| File | What it is |
|---|---|
| `narration.mp3` | The recorded voiceover. |
| `lesson.srt` | Character-timed subtitles. The source of truth for every reveal time. |
| `rementions.config.json` | Per-scene anchors + reveal times fed to the re-mention detector. |
| `src/lessonScenes.ts` | Authored scene props: every `timings.sequence` (SRT-derived) + `pulses`. |
| `src/Root.tsx` | The composition: audio + a `<Series>` of the 10 scenes. |
| `src/*.tsx` | The 10 template components used, as rendered. |

## Scene plan (script order)

| # | Template | Beat |
|---|---|---|
| 1 | LessonTitle | Title card (first-lesson opener) |
| 2 | ComparativePoints2 | The gap: task clarity vs behavioural clarity |
| 3 | LessonGoal | The lesson objective |
| 4 | SplitscreenPointsV1 | Project policies vs ground rules (side-complete) |
| 5 | WordDefinition | Defining "ground rules" |
| 6 | Points3Subtopics2 | The three things ground rules do |
| 7 | Process5Steps | The cost of skipping (escalation) |
| 8 | YinYang2Points | Ground rules vs working agreement |
| 9 | BulletList6Pills | Course outline (first-lesson-only) |
| 10 | LessonSummary | Recap (+ next-lesson teaser in VO) |

## How the rules were applied

**SRT-derived timing.** No timing is hard-coded; each reveal `at` is the
scene-relative second its content is first spoken. Scene boundaries (`SCENE_SPANS`)
are the SRT cue times where each beat begins.

**Variety.** Ten beats, ten different templates, zero repeats.

**Semantic fit.** The two-term distinction (policies vs ground rules) uses a
side-complete split-screen; the cost-of-skipping beat is a one-directional
escalation, so it uses a linear process (Process5Steps), not a cycle; the
ground-rules-vs-working-agreement nuance is a stark two-term dichotomy, so it uses
YinYang2Points with one sub-point per side. The definition beat names and defines
a term, so WordDefinition.

**First-lesson fixed roles.** Because this is Lesson 1, it opens with LessonTitle
and carries the course-outline beat as BulletList6Pills. These do not recur in
later lessons of the course.

**People templates.** Judged not to fit here: this lesson introduces no specific
people, and the conceptual beats are better served by the structured templates
above than by a presenter-led variant. (The presenter variants were used in the
Vendor-Management lesson where a beat genuinely suited them.)

**No dead air.** Each beat with a framing lead-in uses a template whose setup
stages a panel/anchor in the first ~1s; nothing is front-loaded.

**Character limits.** Every title/caption respects its template's limit (e.g.
Points3Subtopics2 `mainText` 3 words / <=30; SplitscreenPointsV1 pills <=22;
Process5Steps labels <=14; YinYang titles <=18, captions <=16). Verified by render.

**Icon selection (resolver).** All 15 icons are real ids resolved from concepts
via `script-pipeline/icons/` (search -> pick -> validate -> stage), never guessed,
each in the correct `-dark` variant for its surface. `validate-icons.py` passes.

**Re-mention pulse.** Detected from the SRT by `detect-rementions.py` (gap > 4s).
Five genuine pulses fire: scene 6 reinforces "psychological safety" (22.7s) and
"accountability" (79.64s) as each is elaborated; scene 8 pulses "ground rules"
(12.24s, 31.0s) and "working agreement" (35.82s) as the terms are revisited.

## Preview

Previewed in Remotion Studio, not rendered to MP4 (per the project rendering
convention). The bench holds the composition, the 10 templates, `narration.mp3`
in `public/`, and the 15 staged icons in `public/icons/`. Open the `Lesson`
composition at `localhost:3000`.
