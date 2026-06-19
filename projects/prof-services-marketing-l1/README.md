# Marketing in Professional Services, Lesson 1

**Lesson title:** What Marketing Means for Advisory Firms
**Course:** Marketing in Professional Services (Lesson 1 of the course)
**Runtime:** 211.177s, 30fps, 1920x1080
**Source SRT:** `lesson.srt` (copied from `BD_1_FINAL.srt`)
**Narration:** `narration.mp3` (copied from `BD_1_FINAL.mp3`)

This is the project record for the assembled lesson. The composition lives in
`src/` (one `Root.tsx`, one `lessonScenes.ts`, and the twelve template `.tsx`
files the lesson uses). Deliver it to local Remotion Studio (`npx remotion
studio`) for preview; the final MP4 is exported by the user from Studio, not
auto-rendered here.

## Scene plan (scene -> template -> beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 - 22.898 | LessonTitle | Course and lesson title card; "growth from reputation and word of mouth", course intro |
| 2 | 22.898 - 32.397 | LessonGoal | "In this first lesson we'll explain what marketing means, and why reputation and relationships drive revenue" |
| 3 | 32.397 - 43.428 | YinYang2Points | Common view of marketing (advertising, social media) vs the broader, strategic view in professional services |
| 4 | 43.428 - 52.230 | WordDefinition | Defines the marketing concept: succeed by understanding client needs and meeting them better than competitors |
| 5 | 52.230 - 74.364 | Topic1Subtopics6 | Client orientation: not a department/campaign, shapes firm behaviour, advisory work bought on trust, cannot inspect upfront, judged on reputation and relationships |
| 6 | 74.364 - 92.571 | ComparativePoints2 | Selling mindset vs client-centric; the marketing concept reverses the starting point to the client's problem |
| 7 | 92.571 - 116.258 | BigPoints3V1 | Client-centric firm: start with the client, led by partners/advisors, roles (marketing, BD, delivery) blur together |
| 8 | 116.258 - 143.639 | Process5Steps | How reputation sells: Reputation -> Lower Risk -> Relations -> Trust (the engine of revenue) |
| 9 | 143.639 - 153.788 | CaseStudyIntro | Case study introduction of the fictional firm FinSage |
| 10 | 153.788 - 168.349 | IconPointsV1 | FinSage profile: strong reputation, grew by accident, via referrals, wants deliberate growth, no clear market view |
| 11 | 168.349 - 187.532 | BulletList6Pills | Course outline: what marketing means for advisory, how services are bought/sold, how to analyse a market, build a defensible market view |
| 12 | 187.532 - 211.177 | LessonSummary | Recap: the marketing concept, a client-centric orientation, reputation drives revenue |

## How each rule was applied

### SRT-derived timing
Scene spans come straight from SRT cue boundaries (`SCENE_SPANS` in
`lessonScenes.ts`), and every `sequence` step's `at` is the introducing cue's
start time converted to scene-relative seconds. Examples: scene 3 reveals
`leftTitle` at 2.18s (cue 10 "advertising, brochures, or social media" begins
34.397 - 32.397), and the right-side "Pro Services" reveals at 5.67s tracking
cue 12 ("marketing is something broader and more strategic"). Scene 8's `step3`
(Trust) lands at 22.85s, matching cue 40 ("Trust, built over time, is the real
engine of revenue") at 145.49s into a scene starting at 116.258s.

### Variety (one template per lesson)
All twelve scenes use twelve distinct templates; no template repeats. This
honours the one-template-per-lesson rule and the memory note not to over-pick
YinYang2Points (used exactly once, scene 3, where a genuine two-state
comparison fits).

### Semantic fit
Each template matches its beat's shape: a two-state comparison ->
YinYang2Points; a single defined term -> WordDefinition; one concept fanning
into supporting points -> Topic1Subtopics6; a paired before/after contrast ->
ComparativePoints2; a flat 3-point recap -> BigPoints3V1; an ordered causal
chain (reputation to trust) -> Process5Steps; a specific named company ->
CaseStudyIntro; an agenda walked one item at a time -> IconPointsV1; the
first-lesson course outline -> BulletList6Pills.

### No dead air
Every chosen template has a staging animation in its `setup` step (scheduled at
0.2s) that brings scaffolding on screen within the first second: LessonTitle's
background fade, LessonGoal's stripe sweep, YinYang's panels and empty boxes,
WordDefinition's banner and icon pill, Topic1Subtopics6's right panel pan plus
anchor, ComparativePoints2's background scale and chain-link connector,
BigPoints3V1 / Process5Steps panels, CaseStudyIntro's platinum card,
IconPointsV1's rising container, BulletList6Pills' empty pills, and
LessonSummary's background. No `staging: none` template (e.g. BigPoints3V2,
CirclePoints4) was selected. No content reveal was pulled early to mask a gap;
reveals stay synced to the SRT.

### Frame-fit character limits
Every text field is within its template's documented limit. Tightest cases all
pass: Process5Steps labels (<=14: "Reputation" 10, "Lower Risk" 10, "Relations"
9, "Trust" 5), IconPointsV1 labels (<=18: "Strong reputation" 17), YinYang
captions (<=16), Topic1Subtopics6 details (<=38: "Judged on reputation and
relationships" exactly 38), and CaseStudyIntro summary (<=340: 308). Zero
violations.

### Icon resolution (no invented ids)
All 20 icon ids were verified to exist as real files in the master `Icons/`
library before assembly; none were hand-guessed. FinSage is a company, so it is
shown as a logo (`Company-FinSage-light`, confirmed present in
`Logos/Fictional-Company-Logos/`), never an icon, per the case-study principle.

### Icon contrast (suffix matched to surface mode)
- ComparativePoints2 and Process5Steps render icons as-is on dark oxford-blue
  shells, so they use `-dark` (light-artwork) ids. Correct.
- Topic1Subtopics6 uses a `-dark` `titleIcon` on its oxford-blue right panel and
  a `-light` anchor (`career-pathway-compass-light`) on its platinum-blue left
  panel. Correct per its guidance.
- IconPointsV1 sits its large icon on a light pill surface, so it uses `-light`
  ids (guidance requires the `-light` suffix). Correct.
- CaseStudyIntro's logo sits on the platinum left zone, so the `-light` FinSage
  logo is used. Correct.
- BigPoints3V1 force-recolours icons (Pattern B), so the suffix is cosmetic;
  `-dark` is used consistently and reads fine.

### Re-mention pulses
Every scene's `pulses` array is empty. The SRT was scanned for re-mentions of
already-revealed on-screen items more than ~2-3s after their reveal; within
each scene's own window no revealed slot is named again late enough to warrant a
brand pulse (re-mentions such as "FinSage" recur across scene boundaries, not
within a single scene's revealed set, so they introduce a fresh scene rather
than pulse a prior one). No pulse was invented; the field is left empty by
evidence, following the ComparativePoints2 reference pattern.

### First-lesson roles
This is Lesson 1, so the first-lesson-only roles are present and used once each:
LessonTitle opens the lesson (scene 1) and BulletList6Pills carries the
course-outline beat (scene 11), the standard template for that beat. Neither
would appear in a non-first lesson.

### Presenter-led character variants
None used. The sibling character variants (e.g. Topic1Subtopics6Character,
Timeline5TilesCharacter) were not selected because no beat here is framed as a
presenter address; the plain layouts fit the explanatory content better.

## QA fixes made
No content fixes were required. Validation performed and passed:
- All 20 icon ids resolve to real files in `Icons/`; FinSage logo present in `Logos/Fictional-Company-Logos/`.
- All 39 text fields within their per-template character limits (0 violations).
- No em dashes or en dashes (and no double-hyphen dash substitutes) in any user-facing text.
- One template per scene, no repeats.
- All twelve template `.tsx` files imported by `Root.tsx` / `lessonScenes.ts` are present in `src/`.
