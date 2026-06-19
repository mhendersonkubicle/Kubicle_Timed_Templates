# Vendor Management, Lesson 8: Monitoring Vendor Performance

An end-to-end lesson video built from the recorded narration and its SRT, applying
every standard the system now encodes. It doubles as a full test of that system:
timing model, selection rules (variety / semantic-fit / no-dead-air), character
limits, the icon resolver, and the re-mention detector.

- Duration: 138.77s (4163 frames @ 30fps), 1920x1080
- Composition id: `Lesson`
- 9 scenes, 9 distinct templates (zero repeats), 2 presenter-led people templates

## Files

| File | What it is |
|---|---|
| `narration.mp3` | The recorded voiceover. |
| `lesson8.srt` | Character-timed subtitles. The single source of truth for every reveal time. |
| `rementions.config.json` | Per-scene anchors + reveal times fed to the re-mention detector. |
| `src/lessonScenes.ts` | Authored scene props: every `timings.sequence` (SRT-derived) + `pulses`. |
| `src/Root.tsx` | The composition: audio + a `<Series>` of the 9 scenes, durations from the SRT spans. |
| `src/*.tsx` | The 9 template components used, as rendered. |

## Scene plan (script order)

| # | Template | Beat |
|---|---|---|
| 1 | LessonTitle | "Lesson 8: Monitoring Vendor Performance" title card |
| 2 | LessonGoal | The lesson objective |
| 3 | **Topic1Subtopics6Character** | Why monitor performance? (presenter + 3 reasons) |
| 4 | Checklist5Pills | What's checked: quality, on time, within cost |
| 5 | IconPointsV1 | Contract-compliance terms: reporting, approvals, change control |
| 6 | WordDefinition | Defining a Service Level Agreement (SLA) |
| 7 | BigPoints3V1 | Assessment methods: inspections, audits, performance reviews |
| 8 | **Timeline5TilesCharacter** | Worked example, a 3-step sequence (presenter) |
| 9 | LessonSummary | Recap |

## How the rules were applied

**SRT-derived timing.** No timing is hard-coded; each reveal `at` is the
scene-relative second its content is first spoken. Scene boundaries (`SCENE_SPANS`)
are the SRT times where each beat begins.

**Variety.** Nine beats, nine different templates, zero repeats.

**People templates (as requested), used only where they genuinely fit.** This
lesson introduces no specific *people*, so the profile/duo/trio cards would have
violated the semantic-fit rule. The **presenter-led variants** do fit abstract
content, so two are used: `Topic1Subtopics6Character` fronts the "why monitor"
beat with a presenter and three reasons, and `Timeline5TilesCharacter` has a
presenter walk the worked example, which is a genuine 3-step sequence
(review -> finding -> action). Different presenters and different layouts, placed
apart in the lesson.

**Semantic fit.** The worked example is a real sequence, so it uses a timeline,
not a cycle. The SLA beat names and defines one term, so it uses WordDefinition.
The compliance terms are a short walkthrough, so they use the IconPointsV1
conveyor.

**No dead air.** Each beat with a framing lead-in uses a template whose setup
stages a panel/hero/character in the first ~1s; nothing is front-loaded. Scene 5's
pills were nudged later (6.5s / 9.5s / 11.5s) to land closer to when each term is
actually spoken rather than ~4s early.

**Character limits.** Every title/caption respects its template's limit (e.g.
Topic1Subtopics6Character `mainTitle` is 3 words / <=30 chars; Checklist items
<=30; IconPointsV1 labels <=18; BigPoints3V1 labels <=25). Verified by render.

**Icon selection (resolver).** All icons are real ids resolved from concepts via
`script-pipeline/icons/` (search -> pick -> validate -> stage), never guessed.
Scene 5 uses `-light` ids (required by IconPointsV1); scenes 4/7 match each
surface (`-light` on the platinum checklist, `-dark` on the oxford points).
`validate-icons.py` passes (all 8 ids real and staged).

**Re-mention pulse.** Detected from the SRT by `detect-rementions.py` (gap > 4s).
One genuine re-mention fires: scene 7 `point2` ("performance reviews") pulses at
12.66s when "Findings from reviews" is spoken, ~9s after its reveal. A scene-5
candidate was rejected as a first-utterance artifact (the reveal was retimed
instead).

## Preview

Previewed in Remotion Studio, not rendered to MP4 (per the project rendering
convention). The bench holds `src/lessonScenes.ts` + `src/Root.tsx`, the 9
templates, `narration.mp3` in `public/`, the staged icons in `public/icons/`, and
the two portraits in `public/characters/`. Open the `Lesson` composition at
`localhost:3000`.
