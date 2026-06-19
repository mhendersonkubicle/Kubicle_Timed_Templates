# Marketing in Professional Services, Lesson 3

**Lesson title:** The Four Characteristics of Services
**Course:** Marketing in Professional Services (Lesson 3 of the course)
**Runtime:** 145.175 s (8 scenes), 30 fps, 1920x1080
**Source SRT:** `lesson.srt` (copied from `BD_3_FINAL.srt`)
**Narration:** `narration.mp3` (copied from `BD_3_FINAL.mp3`)

This folder is the assembled project record. The Remotion composition lives in
`src/` (`Root.tsx` wires the scenes; `lessonScenes.ts` holds the SRT-derived
timing and content props; each used template ships as its own `.tsx`). Delivery
is to local Remotion Studio (`npx remotion studio`) for the user to export;
nothing is auto-rendered to MP4 here.

## Scene plan (scene to template to beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 to 7.641 | LessonTitle | Opening card: course + lesson 3 + headline. The recap of the previous lesson (seven Ps) plays over it. |
| 2 | 7.641 to 15.328 | LessonGoal | The lesson goal: identify the four characteristics of services and explain how each one shapes marketing. |
| 3 | 15.328 to 50.839 | Topic1Subtopics6 | The four characteristics named together, then defined one by one: intangibility, inseparability, variability, perishability. |
| 4 | 50.839 to 81.935 | FivePoints1SubtopicV2 | The distinct challenge each characteristic creates, each a title plus a one-line consequence. |
| 5 | 81.935 to 107.505 | SplitscreenPointsV1 | How firms respond deliberately: countering intangibility (left) and managing variability (right). |
| 6 | 107.505 to 110.570 | CaseStudyIntro | Case study establishing card: the FinSage company logo. |
| 7 | 110.570 to 124.131 | Checklist5Pills | FinSage detail: perishability bites, so it must keep advisors deployed, recover idle time, and build a clearer market view. |
| 8 | 124.131 to 145.175 | LessonSummary | Closing recap: the four characteristics, the challenge each creates, how firms respond. |

## How each rule was applied

### SRT-derived timing
Every scene span is a cut on an SRT cue boundary (`SCENE_SPANS` in
`lessonScenes.ts`), and every `at` in each scene's `timings.sequence` is the
introducing cue's start time converted to scene-relative seconds. No reveal was
sped up or front-loaded to mask a gap; content stays cued to the narration.
Examples: scene 3's header fires at 2.7 s (the "Services behave differently in
four ways" lead-in, cue 5 at 18.03 s) and the four detail pills land in the two
naming cues (6-7) at 6.51 / 6.51 / 8.84 / 8.84 s; scene 4's four challenge cards
fire at 3.83 / 10.84 / 16.51 / 23.64 s tracking cues 14, 16, 18, 20; scene 8's
three recap pills fire at 4.05 / 8.32 / 12.34 s matching cues 35, 36, 37.

### Variety (one template per lesson)
All eight scenes use eight distinct templates; no template repeats. The two
beats that both walk the four characteristics deliberately use different shapes
so the lesson stays varied: scene 3 names and defines them (Topic1Subtopics6, a
header plus a four-row waterfall) and scene 4 is the later "what challenge each
creates" pass (FivePoints1SubtopicV2, each item a title plus a one-line
consequence). YinYang2Points was not defaulted to for the comparison-flavoured
"firm responses" beat; SplitscreenPointsV1 carries it instead, as it needs two
short bulleted lists rather than a two-state contrast.

### Course-level variety
Lessons 1 and 2 of this course already used the obvious comparison and list
templates (YinYang2Points, ComparativePoints2, BigPoints3V1, Points3Subtopics2,
IconPointsV1, WordDefinition). This lesson reaches for shapes not yet leaned on
in the course (FivePoints1SubtopicV2, SplitscreenPointsV1, Checklist5Pills) where
they also fit the beat, while the structural templates (LessonTitle, LessonGoal,
CaseStudyIntro, LessonSummary) recur as expected and are exempt.

### Semantic fit
- **Topic1Subtopics6** (scene 3): one core concept (the characteristics of
  services) fanning into a top-to-bottom waterfall of short parallel single-word
  labels. Exactly its use case.
- **FivePoints1SubtopicV2** (scene 4): an ordered set of four items, each a short
  title plus a one-line description and an icon, anchored by a left visual.
  Matches the "each characteristic creates a distinct challenge" run.
- **SplitscreenPointsV1** (scene 5): a two-column layout where each side carries a
  short bulleted list of responses (intangibility: three counters; variability:
  two counters). Fits the "firms manage these deliberately" beat better than a
  two-state contrast template.
- **CaseStudyIntro** (scene 6): the narration turns to a worked example about a
  specific company (FinSage), the defining cue for this template.
- **Checklist5Pills** (scene 7): the case-study follow-up, an icon-left, bullets-
  right single-colour list ticked off top to bottom, exactly the template the
  CaseStudyIntro guidance names for the detail scene (not the cycling IconPointsV1
  or the multicoloured Points3Subtopics2).
- **LessonSummary** (scene 8): the closing three-point recap.

### No dead air
Every chosen template stages an animation inside the first ~1 s, so no scene
opens on a static stage: scene 1 (LessonTitle) fades its background and logo from
0.0 to 0.2 s; scene 3 (Topic1Subtopics6) pans the oxford-blue right panel in and
fades the left anchor at 0.2 s, covering the lead-in before the first content
word; scene 4 (FivePoints1SubtopicV2) brings its dark left panel, anchor and
dotted spine in at 0.2 s ahead of the first card at 3.83 s; scene 5
(SplitscreenPointsV1) pans its dark right panel in at 0.2 s; scene 6
(CaseStudyIntro) fades the platinum card and eyebrow in at 0.0 to 0.2 s. No
`staging: none` template (BigPoints3V2, CirclePoints4) was placed on any beat, so
no scene relies on front-loaded content to hide a gap. No beat needed a split to
add a filler scene.

### Frame-fit character limits
Every text field is within its template's documented limit.
- Topic1Subtopics6: mainTitle "Service traits" (3 words, 14 chars, <=30); details
  are single words (<=38).
- FivePoints1SubtopicV2: titles <=20 ("Inseparability" 14); descriptions <=32
  ("Team experience is the product" 30, "Inconsistent delivery hurts rep" 31).
- SplitscreenPointsV1: titles <=40; pill captions <=22 ("Build a strong brand"
  20, "Standardise methods" 19).
- Checklist5Pills: labels <=30 ("Keep advisors fully deployed" 28).
- LessonSummary: recap captions <=32 ("Four characteristics of services" 31).
- LessonGoal: goal 88 chars (<=160). LessonTitle: courseTitle 28 chars (<=80),
  lessonTitle 36 chars (<=120).
Zero violations.

### Icon resolution (no invented ids)
All 14 icon ids in `lessonScenes.ts` were verified to exist as real files in the
master `Icons/` library before assembly; none were hand-guessed. The FinSage
case study is a company, so it is shown as a logo (`Company-FinSage-light`,
verified present in `Logos/Fictional-Company-Logos/`), never an icon, per the
case-study principle.

### Icon contrast (suffix matched to surface mode)
- **Topic1Subtopics6** (scene 3): `titleIcon`
  `technical-support-handholdingwrench-dark` sits in the dark oxford-blue header
  pill (white-precoloured; schema requires `-dark`); `anchor` `mindset-quality-light`
  sits on the platinum-blue left panel (schema requires `-light`, as `-dark`
  would vanish there). Correct.
- **FivePoints1SubtopicV2** (scene 4): all milestone icons and the anchor
  (`critical-thinking-warning-dark`) are `-dark`; they render white inside the
  blue squares and on the dark left panel. Correct.
- **SplitscreenPointsV1** (scene 5): all pill icons are `-dark` (light/blue line
  art) so they read on the dark and coloured pills, per the template guidance.
  Correct.
- **Checklist5Pills** (scene 7): the hero icon (`time-management-hourglass-light`)
  renders in native colours on the light platinum stage, so `-light` is correct.
- **CaseStudyIntro** (scene 6): the FinSage logo sits on the light platinum card,
  so the `-light` logo variant is used. Correct.

### Re-mention pulses
Scene 3 is a preview-then-expand beat: the four characteristics are named
together (cues 6-7) and revealed at the naming, then the narration returns to
define each one (cues 8-11), each definition arriving roughly 5 to 8 s after the
reveal. Per the re-mention-pulse principle, each detail therefore carries a brand
pulse at its definition's scene-relative cue time (detail0 at 16.65 s, detail1 at
21.55 s, detail2 at 26.96 s, detail3 at 27.96 s). These times come straight from
the SRT, not invented. Every other scene's `pulses` array is empty: the SRT was
scanned for within-scene re-mentions of already-revealed items more than ~2-3 s
after their reveal and none were found (re-mentions of the characteristics across
scenes 3, 4, 5 are separate scenes, not within-scene callbacks, so the pulse
mechanism does not apply). Those empty arrays are correct by evidence, not
omissions.

### First-lesson roles
This is **Lesson 3**, not the first lesson, so the `BulletList6Pills`
course-outline beat was deliberately **not** included; it appears only in the
first lesson of a course. Only the per-lesson `LessonTitle` opener is present
(scene 1), which every lesson carries.

### Presenter-led character variants
None used. The sibling character variants (e.g. FivePoints1SubtopicV2Character,
Topic1Subtopics6Character, Checklist5Pills with a character hero) were not
selected because no beat here is framed as a presenter address or introduces
named people; the plain icon-anchored layouts fit the explanatory content
better.

## QA fixes / checks made
- **Fix (re-mention pulses, scene 3):** the original draft left scene 3's
  `pulses` empty even though it is a textbook preview-then-expand beat (name all
  four, then define each). Added four SRT-derived pulses so each characteristic
  gets its brand callback as the narration expands it. Verified Topic1Subtopics6
  actually consumes the `pulses` field (it carries the pulse schema and the
  `PULSE_DUR_S` helper), so the fix is functional and not a no-op.
- Confirmed all 14 icon ids resolve to real files in `Icons/` and the FinSage
  logo resolves in `Logos/Fictional-Company-Logos/`. No guessed ids.
- Verified icon suffixes against each template's real surface and recolour mode
  (Topic1Subtopics6 anchor `-light` on the light panel; FivePoints and
  SplitscreenPoints icons `-dark` on dark/coloured surfaces; Checklist hero
  `-light` on the light stage). All consistent.
- Confirmed the lesson opens on LessonTitle and that the course-outline pill list
  is absent (correct for a non-first lesson).
- Confirmed no template repeats across the eight scenes (variety rule, zero
  repeats), including that the two four-characteristics passes use different
  templates.
- Confirmed no scene opens with more than ~1 to 2 s of static stage before an
  animation (no-dead-air rule); no `staging: none` template was used.
- Confirmed all eight template `.tsx` files imported by `Root.tsx` /
  `lessonScenes.ts` are present in `src/`.
- Confirmed all on-screen text and this record are free of em dashes and en
  dashes (and double-hyphen substitutes); soft pauses use commas.
