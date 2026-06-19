# Business Development in Professional Services, Lesson 1

**Lesson title:** Introduction to Marketing in Professional Services
**Course:** Business Development in Professional Services (Lesson 1 of the course)
**Runtime:** 211.177s, 30fps, 1920x1080
**Source SRT:** `lesson.srt`
**Narration:** `narration.mp3`

This is the project record for the assembled lesson. The composition lives in
`src/` (one `Root.tsx`, one `lessonScenes.ts`, and the twelve template `.tsx`
files the lesson uses). Deliver it to local Remotion Studio (`npx remotion
studio`) for preview; the final MP4 is exported by the user from Studio.

## Scene plan (scene -> template -> beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 - 22.898 | LessonTitle | Course and lesson title card; "growth has traditionally come from reputation and word of mouth", course intro |
| 2 | 22.898 - 32.397 | LessonGoal | "Explain what marketing means in professional services, and why reputation and relationships drive revenue" |
| 3 | 32.397 - 43.428 | YinYang2Points | Common view of marketing (advertising, social media) vs the broader, strategic view in professional services |
| 4 | 43.428 - 52.230 | WordDefinition | Defines the marketing concept: succeed by understanding client needs and meeting them better than competitors |
| 5 | 52.230 - 74.364 | Topic1Subtopics6 | Client orientation: not a department/campaign, shapes firm behaviour, advisory work bought on trust, cannot inspect upfront, judged on reputation |
| 6 | 74.364 - 92.571 | ComparativePoints2 | Selling mindset vs client-centric; the marketing concept reverses the starting point to the client's problem |
| 7 | 92.571 - 116.258 | BigPoints3V1 | Client-centric firm: start with client goals, partners lead marketing, roles blur together |
| 8 | 116.258 - 143.639 | Timeline5Tiles | Sequential chain: reputation signals quality -> lowers risk -> relationships carry forward -> via networks -> trust drives revenue; re-mention pulse on step0 at 13.65s |
| 9 | 143.639 - 153.788 | CaseStudyIntro | Case study introduction of the fictional firm FinSage |
| 10 | 153.788 - 168.349 | Checklist5Pills | FinSage profile: strong reputation, grew mostly by accident, through referrals, wants deliberate growth, no clear market view |
| 11 | 168.349 - 187.532 | BulletList6Pills | Course outline: what marketing means for advisory, how services are bought/sold, how to analyse a market, build a defensible market view |
| 12 | 187.532 - 211.177 | LessonSummary | Recap: the marketing concept, a client-centric orientation, reputation drives revenue |

## How each rule was applied

### SRT-derived timing
Scene spans come straight from SRT cue boundaries (`SCENE_SPANS` in
`lessonScenes.ts`), and every `sequence` step's `at` is the scene-relative
offset of the cue that introduces that element. Examples: scene 3 reveals
`leftTitle` at 0.71s (cue 10 "When people hear the word marketing" begins
32.397s, hit word at ~0.7s in), `leftBox0` at 3.36s (cue 10 "advertising"),
and `rightTitle` at 5.93s (cue 12 "professional services firm"). Scene 8's
`step4` (Trust) lands at 22.85s, matching cue 40 ("Trust, built over time")
at 139.11s into a scene starting at 116.258s.

### Variety (one template per lesson)
All twelve scenes use twelve distinct templates; no template repeats. This
honours the one-template-per-lesson rule. Timeline5Tiles was preferred over
Process5Steps (used in other lessons) to show the causal chain in scene 8.

### Semantic fit
Each template matches its beat's shape: a two-state comparison ->
YinYang2Points; a single defined term -> WordDefinition; one concept fanning
into supporting details -> Topic1Subtopics6; a paired before/after contrast ->
ComparativePoints2; three parallel takeaways -> BigPoints3V1; an ordered causal
chain (reputation to trust) -> Timeline5Tiles; a specific named company ->
CaseStudyIntro; five profile facts ticked off -> Checklist5Pills; the
first-lesson course outline -> BulletList6Pills.

### No dead air
Every chosen template has a staging animation in its `setup` step (scheduled at
0.2s): LessonTitle's background fade, LessonGoal's stripe sweep, YinYang's
panels and empty boxes, WordDefinition's banner and icon pill,
Topic1Subtopics6's right panel pan plus anchor, ComparativePoints2's background
and chain-link connector, BigPoints3V1's panels, Timeline5Tiles' track,
CaseStudyIntro's platinum card, Checklist5Pills' container, BulletList6Pills'
empty pills, and LessonSummary's background. No content reveal was pulled
early to mask a gap; reveals stay synced to the SRT.

### Icon resolution (no invented ids)
All 14 icon ids were verified to exist as real files in the master `Icons/`
library via `validate-icons.py` (PASS). FinSage is a company, so it is shown
as a logo (`Company-FinSage-light`, confirmed present in `Logos/`), never an
icon, per the case-study principle.

### Icon contrast (suffix matched to surface mode)
- ComparativePoints2 renders icons AS-IS on dark oxford-blue shells -> `-dark`
  (light-artwork) ids. Correct.
- BigPoints3V1 and YinYang2Points force-recolour icons to solid white (Pattern B)
  so the suffix is cosmetic; `-dark` used consistently.
- Topic1Subtopics6: `titleIcon` on dark right panel uses `-dark`; `anchor` on
  light platinum-blue left panel uses `-light` (`career-pathway-compass-light`).
  Correct per guidance.
- Checklist5Pills: hero on light platinum background uses `-light`
  (`job-portal-professional-light`). Correct.
- Timeline5Tiles: anchor icon auto-whitened by the template; `-light`
  (`reputation-badge-light`) used. Correct.
- CaseStudyIntro: logo on platinum left zone uses `-light` (`Company-FinSage-light`).
  Correct.

### Re-mention pulses
Scene 8 has one mandatory pulse: `step0` ("Reputation signals quality") is
re-mentioned in cue 37 ("Relationships then carry that reputation forward") at
scene-relative 13.65s, more than 4s after the initial reveal at 2.58s. The
pulse is recorded as `{ target: 'step0', at: 13.65 }` in the scene's timings.
All other scenes have empty `pulses` arrays — no other revealed slot is named
again late enough (>4s gap) within the same scene's window.

### First-lesson roles
This is Lesson 1, so the first-lesson-only templates are used once each:
LessonTitle opens the lesson (scene 1) and BulletList6Pills carries the
course-outline beat (scene 11). Neither would appear in a non-first lesson.

### Course identity frozen
`course.json` records `courseIcon: "strategic-consulting-businessdevelopment-dark"`.
This icon and the course name "Business Development in Professional Services"
are frozen for all future lessons in this course.

## QA checks

- All 14 icon ids resolve to real files in `Icons/` (validate-icons.py PASS).
- FinSage logo (`Company-FinSage-light`) present in `Logos/`.
- One template per scene, no repeats across 12 scenes.
- All twelve template `.tsx` files imported by `Root.tsx` are present in `src/`.
- No dead air in any scene (all templates have setup staging animation).
- Re-mention pulse correctly recorded for scene 8 step0.
- Icon contrast: all `-dark`/`-light` suffixes matched to their surface.
