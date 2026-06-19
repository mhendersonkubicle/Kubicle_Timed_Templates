# Marketing in Professional Services, Lesson 2

**Lesson title:** The Marketing Mix and the Seven Ps
**Course:** Marketing in Professional Services
**Lesson number:** 2
**Runtime:** 159.605 s (10 scenes), 30 fps
**Source SRT:** `lesson.srt` (BD_2_FINAL.srt)
**Narration:** `narration.mp3` (BD_2_FINAL.mp3)

This folder is the assembled project record. The Remotion composition lives in
`src/` (`Root.tsx` wires the scenes; `lessonScenes.ts` holds the SRT-derived
timing and content props; each used template ships as its own `.tsx`). Delivery
is to local Remotion Studio for the user to export; nothing is auto-rendered.

## Scene plan (scene to template to beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 to 8.245 | LessonTitle | Opening card: course + lesson 2 + headline. Recap of the previous lesson plays over it. |
| 2 | 8.245 to 15.004 | LessonGoal | The lesson goal: describe the marketing mix and apply the seven Ps to an advisory offer. |
| 3 | 15.004 to 41.089 | Topic1Subtopics6 | The classic four Ps unpacked: product, price, place, promotion. |
| 4 | 41.089 to 52.585 | WordDefinition | Why the four Ps fall short: the advisory product is a service delivered by people. |
| 5 | 52.585 to 84.728 | Points3Subtopics2 | The three services levers added: people, process, physical evidence (each with two detail lines). |
| 6 | 84.728 to 97.548 | ComparativePoints2 | The restaurant analogy: the meal versus the whole experience, linked. |
| 7 | 97.548 to 118.218 | BigPoints3V1 | The most powerful advisory levers, recapped flat: people, process, physical evidence. |
| 8 | 118.218 to 126.975 | CaseStudyIntro | Case study establishing card: the FinSage company logo. |
| 9 | 126.975 to 137.633 | IconPointsV1 | FinSage's blind spot: how it presents its people and its past work. |
| 10 | 137.633 to 159.605 | LessonSummary | Closing recap: classic four Ps, the seven Ps mix, the mix for an advisory firm. |

## How each rule was applied

### SRT-derived timing
Every scene span comes straight from `fit-timing.py` over `lesson.srt`
(`SCENE_SPANS` in `lessonScenes.ts`), and every `at` in each scene's
`timings.sequence` is the introducing cue's start time converted to
scene-relative seconds. No reveal was sped up or front-loaded to mask gaps;
content stays cued to the narration. Examples: scene 3's four detail pills fire
at 13.31 / 16.07 / 18.98 / 22.25 s, matching cues 8, 9, 10, 11; scene 5's three
section titles fire at 12.8 / 17.98 / 24.46 s, matching the people / process /
physical-evidence cues.

### Variety (one template per lesson)
All ten scenes use distinct templates. No template repeats. The two "three
levers" beats deliberately use different shapes so the lesson stays varied:
scene 5 is the detailed introduction (Points3Subtopics2, three titles each with
two supporting lines) and scene 7 is the later flat recap of the same levers
(BigPoints3V1, one icon plus a short caption each). YinYang2Points was not
defaulted to for either comparison-flavoured beat.

### Semantic fit
- **Topic1Subtopics6** (scene 3): one core concept (the four Ps) broken into a
  top-to-bottom waterfall of short parallel lines. Exactly its use case.
- **WordDefinition** (scene 4): names and defines a single idea (the product in
  an advisory firm), one term plus one definition.
- **Points3Subtopics2** (scene 5): exactly three parallel main ideas, each with
  two supporting detail lines. Matches the three-levers-with-reasons beat.
- **ComparativePoints2** (scene 6): a two-point pairing joined by association
  (the meal and the whole experience belong together), the centre chain-link
  reads "these go together", which fits the analogy better than a contrast
  template.
- **BigPoints3V1** (scene 7): a flat recap of three top-level takeaways, one
  icon plus a short caption each.
- **CaseStudyIntro** (scene 8): the narration introduces a worked example about
  a specific company (FinSage), the defining cue for this template.
- **IconPointsV1** (scene 9): a short walkthrough of the two things FinSage
  under-presents, filed one at a time.
- **LessonSummary** (scene 10): the closing three-point recap.

### No dead air
Every chosen template stages an animation inside the first ~1 s, so no scene
opens on a static stage. Scene 1 (LessonTitle) animates its background and logo
from 0.0 s; scene 3 (Topic1Subtopics6) pans the oxford-blue right panel in and
fades the left anchor at 0.2 s, covering the lead-in before the first content
word at 13.31 s; scene 5 (Points3Subtopics2) pans its split-screen panel in at
0.2 s ahead of the first title at 12.8 s; scene 8 (CaseStudyIntro) brings its
setup in at 0.2 s. No `staging: none` template (BigPoints3V2, CirclePoints4) was
placed on a beat with a delayed first word. No beat needed a split to add a
filler scene.

### Frame-fit character limits
Captions were written to the per-template limits. ComparativePoints2 pill
captions are <=30 chars ("The meal on the plate", "The whole experience").
Topic1Subtopics6 mainTitle is 3 words or fewer ("The four Ps"). Points3Subtopics2
section titles are short noun phrases ("People", "Process", "Physical Evidence")
with two short detail lines each. IconPointsV1 and LessonSummary labels are short
single lines.

### Icon resolution (no invented ids, icon-contrast)
Every icon id in `lessonScenes.ts` was verified to be a real file in the master
`Icons/` library before use, and the FinSage logo was verified in
`Logos/Fictional-Company-Logos/`. Suffix-to-surface matching was checked against
each template's actual surface and recolour behaviour:

- **Topic1Subtopics6** (scene 3): `titleIcon` is `enterprise-marketing-dark`
  (sits in the dark oxford-blue header pill, white-precoloured; the template
  schema requires `-dark`). `anchor` is `job-promotion-puzzlepieces-light` (sits
  on the platinum-blue left panel; the schema requires `-light`, as `-dark`
  would vanish there).
- **Points3Subtopics2** (scene 5): anchor is `marketing-technology-services-dark`
  on the oxford-blue panel (schema enforces `-dark`).
- **ComparativePoints2** (scene 6): `hospitality-food-dark` and
  `locations-restaurant-dark` sit on the dark side shells. The template is
  Pattern A (renders icons as-is) and its guidance locks `iconVariant: -dark`,
  so `-dark` is correct here even though the root background is platinum.
- **BigPoints3V1** (scene 7) and **IconPointsV1** (scene 9): icons render inside
  recoloured badges (force-white / Pattern B), so the suffix is cosmetic; the
  chosen ids are real files (`-dark` on scene 7, `-light` on scene 9).

### Case study uses a logo, not an icon
The FinSage beat (scene 8) routes to CaseStudyIntro with the fictional company
logo `Company-FinSage-light` from `Logos/Fictional-Company-Logos/`. The company
is never resolved to an `Icons/` glyph. The "CASE STUDY" eyebrow plus the centred
logo is the establishing card; the case-study detail (the blind spot) lives in
the next scene (9) on a list template, per the case-study principle.

### Re-mention pulses
The SRT was scanned for within-scene re-mentions of already-revealed objects
arriving more than ~2 to 3 s after their reveal. None were found: in each scene
every item is named once around its reveal cue with no later same-scene callback
that warrants a pulse. (The seven Ps are named again across scenes 7 to 9, but
those are separate scenes, not within-scene re-mentions, so the pulse mechanism
does not apply.) Every scene therefore carries `pulses: []`, which is correct,
not an omission.

### First-lesson roles
This is **Lesson 2**, not the first lesson, so the `BulletList6Pills`
course-outline beat was deliberately **not** included. Only the per-lesson
`LessonTitle` opener is present (scene 1), which every lesson carries. No
presenter-led character variants were used, as no beat introduces a presenter or
named people.

## QA fixes / checks made
- Confirmed all 11 icon ids resolve to real files in `Icons/` and the FinSage
  logo resolves in `Logos/Fictional-Company-Logos/`. No guessed ids.
- Verified icon suffixes against each template's real surface and recolour mode
  (Topic1Subtopics6 anchor `-light` on the light panel; ComparativePoints2 icons
  `-dark` on the dark shells per the template's locked variant). All consistent.
- Confirmed the lesson opens on LessonTitle and that the course-outline pill list
  is absent (correct for a non-first lesson).
- Confirmed no template repeats across the ten scenes (variety rule, zero
  repeats).
- Confirmed no scene opens with more than ~1 to 2 s of static stage before an
  animation (no-dead-air rule).
- Confirmed all on-screen text is free of em dashes and en dashes; soft pauses
  use commas (for example "Product, what the firm offers").
