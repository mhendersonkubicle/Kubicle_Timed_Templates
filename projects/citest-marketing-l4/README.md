# CI Smoke Test, Lesson 4

**Lesson title:** Core Principles of Marketing
**Course:** CI Smoke Test
**Lesson number:** 4
**Runtime:** 133.361 s (8 scenes), 30 fps
**Source SRT:** `lesson.srt`
**Narration:** `narration.mp3`
**Case study:** FinSage

This folder is the assembled project record. The Remotion composition lives in
`src/` (`Root.tsx` wires the scenes; `lessonScenes.ts` holds the SRT-derived
timing and content props; each used template ships as its own `.tsx`). Delivery
is to local Remotion Studio for the user to export; nothing is auto-rendered.

## Scene plan (scene to template to beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 to 12.935 | LessonTitle | Opening card: CI Smoke Test course + Lesson Four + lesson headline. Recap of the previous lesson plays over it. |
| 2 | 12.935 to 24.990 | LessonGoal | The lesson goal: explain value, the value proposition, and client lifetime value as they apply to advisory firms. |
| 3 | 24.990 to 41.944 | BigPoints3V1 | Three forms of value an advisory firm delivers: the decision made, the risk avoided, the result achieved. |
| 4 | 41.944 to 65.006 | YinYang2Points | Weak vs strong value proposition: weak lists services; strong names the client problem and states the outcome. |
| 5 | 65.006 to 95.270 | BulletList6Pills | Client lifetime value: six sequential points building from "beyond a single sale" to "retain and grow relationships". |
| 6 | 95.270 to 100.032 | CaseStudyIntro | Case study establishing card: the FinSage company logo (Company-FinSage-light). |
| 7 | 100.032 to 112.317 | Topic1Subtopics6 | FinSage through the CLV lens: picture changes, few clients drive most revenue, focus marketing on key clients. |
| 8 | 112.317 to 133.361 | LessonSummary | Closing recap: value and exchange, the value proposition, client lifetime value. Pulses on pill0 at re-mentions. |

## How each rule was applied

### Course identity
`courseTitle` is set verbatim to `"CI Smoke Test"` in scene 1 (LessonTitle). The
`courseIconUrl` points to `staticFile('icons/marketing-automation-megaphone-dark.svg')`,
the icon frozen in `projects/citest-marketing/course.json`. This is the first
lesson built for the course, so course.json was created here. The identity will
carry unchanged into all future lessons.

### SRT-derived timing
Every scene span comes from the natural narration break points in `lesson.srt`.
Every `at` in each scene's `timings.sequence` is the introducing SRT cue's start
time converted to scene-relative seconds. No reveal was front-loaded to hide gaps;
content stays cued to the narration.

### Template variety
All eight scenes use distinct templates; zero repeats. The comparison beat (weak
vs strong VP) uses YinYang2Points rather than ComparativePoints2 because the
contrast is oppositional (not a causal linkage). The client-lifetime-value build
uses BulletList6Pills because the six points are parallel peers in sequence, not
a causal process. Topic1Subtopics6 follows CaseStudyIntro per the case-study
principle (not IconPointsV1, which the CaseStudyIntro guidance explicitly excludes
for short follow-up scenes).

### No dead air
Every template chosen has a staging animation:
- **LessonTitle** (scene 1): background and logo animate from 0.0 s.
- **LessonGoal** (scene 2): decorative stripe sweeps in at 0.2 s.
- **BigPoints3V1** (scene 3): oxford-blue panel and empty loading bar fade/scale
  in at 0.2 s, covering the 4.8 s lead-in before the first point at 5.0 s.
- **YinYang2Points** (scene 4): both panels slide in at 0.2 s (in: 3.0 s), covering
  the 9.87 s before leftTitle appears while the narrator introduces the value
  proposition concept.
- **BulletList6Pills** (scene 5): empty pill bodies scale in at 0.2 s, first pill
  at 1.0 s.
- **CaseStudyIntro** (scene 6): platinum card fades in at 0.2 s.
- **Topic1Subtopics6** (scene 7): oxford-blue right panel pans in at 0.2 s; header
  and first detail appear at 0.0 / 0.5 s (immediately on narration start).
- **LessonSummary** (scene 8): background fades in at 0.2 s, title at 0.0 s.

### Preview-then-expand
Scene 3 (BigPoints3V1) has a preview structure: the narrator first says "value
rarely comes from the report" (cue 8, lead-in), then names the three forms in
rapid succession (cues 9-10: decision, risk, result). The three points are
revealed at the moment each is named (5.0 / 6.5 / 9.8 s scene-relative), so all
three land on screen as the speaker lists them with no dead air.

### Re-mention pulses
`detect-rementions.py` was run across all content scenes. The only within-scene
re-mentions found: in scene 8 (LessonSummary), the word "value" (pill0 anchor)
recurs when the narrator says "the value proposition" (cue 31) and "client
lifetime value" (cue 32). Two pulses on `pill0` at 8.48 s and 13.99 s
(scene-relative). All other scenes carry `pulses: []`, which is correct.

### Semantic fit
- **BigPoints3V1** (scene 3): exactly three parallel, equal-weight takeaways
  (decision / risk / result), each an icon-able noun phrase. Flat, no ordering
  dependency.
- **YinYang2Points** (scene 4): a clear two-sided opposition (weak vs strong VP),
  with one sub-point on the left and two on the right (asymmetric, valid per
  guidance). Side-complete narration: left fully before right.
- **BulletList6Pills** (scene 5): six parallel peer points read top-to-bottom in
  natural narration order. No icons or sub-points per row needed.
- **CaseStudyIntro** (scene 6): the narration names FinSage as a company case
  study, the exact trigger for this template. Logo from `Logos/Fictional-Company-
  Logos/Company-FinSage-light`.
- **Topic1Subtopics6** (scene 7): one core concept (FinSage through CLV) unpacked
  into three short supporting lines in a waterfall. Chosen per the CaseStudyIntro
  guidance over IconPointsV1.

### Icon resolution (no invented ids, icon-contrast)
All icon ids were verified via `validate-icons.py --ids` and then confirmed via
`validate-icons.py --scene-file`. Suffix-to-surface matching:
- **BigPoints3V1** (scene 3): icons are Pattern B (force-recoloured white), suffix
  is cosmetic; `-dark` ids chosen for consistency.
- **YinYang2Points** (scene 4): icons are Pattern B (force-recoloured white),
  suffix cosmetic; `-dark` ids.
- **Topic1Subtopics6** (scene 7): `titleIcon` (`critical-thinking-analysis-dark`)
  sits in the dark oxford-blue header pill (white-precoloured, `-dark` required).
  `anchor.id` (`enterprise-relationship-light`) sits on the platinum-blue left
  panel (`-light` required per guidance).

### Case study uses a logo, not an icon
The FinSage beat (scene 6) routes to CaseStudyIntro with the fictional company
logo `Company-FinSage-light` from `Logos/Fictional-Company-Logos/`. The company
is never resolved to an `Icons/` glyph. The case-study detail lives in scene 7
on Topic1Subtopics6, per the case-study principle.

### First-lesson roles
This is **Lesson 4**, not the first lesson of the course; however, it is the first
lesson built for `citest-marketing`, so `course.json` was created here with
`courseIcon: "marketing-automation-megaphone-dark"`. The `BulletList6Pills`
course-outline beat was deliberately **not** included (first-lesson-only rule).

## Staging notes (for render bench)
Before rendering, run:
```
python script-pipeline/icons/stage-icons.py --ids \
  choice-decisionmaking-dark data-protection-shield-dark business-strategy-goal-dark \
  tasks-list-dark brain-process-problemsolving-dark data-analysis-outcome-dark \
  critical-thinking-analysis-dark enterprise-relationship-light \
  marketing-automation-megaphone-dark \
  --dest <bench>/public/icons

python script-pipeline/stage-logos.py \
  --ids Company-FinSage-light \
  --dest <bench>/public/logos

python script-pipeline/stage-assets.py --dest <bench>/public --templates \
  LessonTitle LessonGoal BigPoints3V1 YinYang2Points BulletList6Pills \
  CaseStudyIntro Topic1Subtopics6 LessonSummary
```
