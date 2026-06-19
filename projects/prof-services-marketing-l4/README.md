# Marketing in Professional Services, Lesson 4

**Lesson title:** Core Principles of Marketing
**Course:** Marketing in Professional Services (Lesson 4 of the course)
**Runtime:** 133.361 s (8 scenes), 30 fps, 1920x1080
**Source SRT:** `lesson.srt` (copied from `Chapter_4.srt`)
**Narration:** `narration.mp3` (copied from `Timing_Testing_(Mark)_Chapter_4.mp3`)

This folder is the assembled project record. The Remotion composition lives in
`src/` (`Root.tsx` wires the scenes; `lessonScenes.ts` holds the SRT-derived
timing and content props; each used template ships as its own `.tsx`). Delivery
is to local Remotion Studio (`npx remotion studio`) for the user to export;
nothing is auto-rendered to MP4 here.

## Scene plan (scene to template to beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 to 13.935 | LessonTitle | Opening card: course + lesson 4 + headline. The recap of the previous lesson (the four characteristics of services) plays over it. |
| 2 | 13.935 to 29.798 | WordDefinition | The principle of value and exchange: a client engages a firm because the value of the outcome is expected to exceed the fee paid. |
| 3 | 29.798 to 41.944 | Cards5Falling | Where the value actually comes from: the decision the client can now make, the risk avoided, the result achieved. |
| 4 | 41.944 to 66.006 | YinYang2Points | The value proposition, weak versus strong: a weak one lists services; a strong one names the client's problem and the outcome delivered. |
| 5 | 66.006 to 95.270 | Topic1Subtopics6 | Client lifetime value: marketing looks beyond a single sale, returning clients are worth more, and retention reframes the firm's economics. |
| 6 | 95.270 to 100.032 | CaseStudyIntro | Case study establishing card: the FinSage company logo. |
| 7 | 100.032 to 112.317 | Checklist5Pills | FinSage through the lens of client lifetime value: measured one project at a time, a few clients drive most revenue, focus marketing where it pays. |
| 8 | 112.317 to 133.361 | LessonSummary | Closing recap: value and exchange, the value proposition, client lifetime value. |

## How each rule was applied

### SRT-derived timing
Every scene span is a cut on an SRT cue boundary (`SCENE_SPANS` in
`lessonScenes.ts`), and every `at` in each scene's `timings.sequence` is the
introducing cue's start time converted to scene-relative seconds. Nothing was
sped up or front-loaded to mask a gap. Examples:

- Scene 2 (WordDefinition): `title` fires at rel 0.0 (cue 5, 13.935, the word
  "value") and `description` at rel 4.947 (cue 6, 18.882, the exchange idea),
  the natural name-then-define shape.
- Scene 3 (Cards5Falling): the three source cards land at rel 0.887 / 3.307 /
  5.027, tracking the sub-phrases of cue 9 (29.798, "the decision the client can
  now make, the risk they avoid, or the result they achieve").
- Scene 4 (YinYang2Points): `leftTitle` at rel 9.87 (cue 14, 51.814, "A weak
  value proposition lists services") and `rightTitle` at rel 13.61 (cue 15,
  55.554, "A strong one names the client's problem and the outcome").
- Scene 5 (Topic1Subtopics6): the six details fire at rel 1.6 / 4.204 / 13.192 /
  17.025 / 19.5 / 22.691, tracking cues 17 to 24.
- Scene 8 (LessonSummary): the three recap pills fire at rel 3.46 / 7.16 / 10.66,
  matching cues 30 / 31 / 32.

### Variety (one template per lesson)
All eight scenes use eight distinct templates; zero repeats. The two value-themed
beats deliberately use different shapes: scene 2 defines the term (WordDefinition)
and scene 3 lists where value comes from (Cards5Falling, a single-focus card
sequence). YinYang2Points was reserved for the genuinely oppositional beat (weak
versus strong value proposition), not defaulted to elsewhere.

### Course-level variety
Lessons 1 to 3 of this course already leaned on Topic1Subtopics6, YinYang2Points,
WordDefinition, ComparativePoints2, BigPoints3V1, Process5Steps, IconPointsV1 and
Points3Subtopics2. This lesson introduces Cards5Falling (not used earlier in the
course) for the three-sources beat, and reuses WordDefinition, YinYang2Points and
Topic1Subtopics6 only where they remain the best semantic fit. Reuse across
lessons is expected; the variety rule is per-lesson (no template twice in one
lesson), and the structural templates (LessonTitle, CaseStudyIntro, Checklist5Pills
as the case-study follow-up, LessonSummary) recur as designed.

### Semantic fit
- **WordDefinition** (scene 2): naming and defining exactly one term ("value")
  with one short definition. The narration follows the template's name-then-define
  shape precisely.
- **Cards5Falling** (scene 3): a flat, ordered list of three self-contained
  point-cards (decision, risk, result), each a short title plus an icon,
  introduced one at a time with single-focus pacing. Exactly its use case.
- **YinYang2Points** (scene 4): a clear two-state contrast (weak versus strong
  value proposition), each side reducible to a short caption plus an icon,
  delivered side-complete (weak fully, then strong).
- **Topic1Subtopics6** (scene 5): one core concept (client lifetime value)
  fanning into a top-to-bottom waterfall of short parallel detail lines.
- **CaseStudyIntro** (scene 6): the narration turns to a worked example about a
  specific company (FinSage), the defining cue for this template.
- **Checklist5Pills** (scene 7): the case-study follow-up, an icon-left,
  bullets-right single-colour list ticked off top to bottom, exactly the template
  the CaseStudyIntro guidance names for the detail scene (not the cycling
  IconPointsV1 or the multicoloured Points3Subtopics2).
- **LessonSummary** (scene 8): the closing three-point recap.

### No dead air
Every chosen template stages an animation inside the first ~1 s, so no scene
opens on a static stage: scene 1 (LessonTitle) fades its background in at 0.2 s;
scene 2 (WordDefinition) drops its banner and slides its icon pill in at 0.0 s
ahead of the description; scene 4 (YinYang2Points) slides both panels in at 0.0 s;
scene 5 (Topic1Subtopics6) pans its oxford-blue right panel in at 0.2 s; scene 6
(CaseStudyIntro) fades the platinum card and eyebrow in at 0.0 to 0.2 s; scene 7
(Checklist5Pills) fades its hero icon in at 0.0 s. Scene 3 (Cards5Falling) has a
no-op setup (`staging: none`), so it was placed only where its first card lands
almost immediately (rel 0.887 s), well inside the ~1 to 2 s window.

This is the lesson's one substantive QA fix (see below): the bench draft had put
both the value-and-exchange lead-in and the three sources of value on a single
Cards5Falling scene, which left ~16.75 s of blank stage on a `staging: none`
template while value and exchange were narrated. Per the no-dead-air principle
(add a scene when no staging-capable template fits the lead-in), the beat was
split into WordDefinition (animated setup) plus Cards5Falling (first card at rel
0.887). No content reveal was sped up.

### Frame-fit character limits
Every text field is within its template's documented limit.
- WordDefinition: `title` "Value" (5 chars, <=40); `description` "The outcome a
  client gains beyond the fee they pay" (50 chars, well under the ~120 char
  2-to-3-line target and the 200 hard cap).
- Cards5Falling: titles "Better decisions" (16), "Risk avoided" (12), "Result
  achieved" (15), all <=24.
- YinYang2Points: titles "Weak" (4) / "Strong" (6), <=18; captions "Lists
  services" (14), "Names problem" (13), "Delivers outcome" (16), all <=16.
- Topic1Subtopics6: `mainTitle` "Client lifetime value" (21 chars, 3 words,
  <=30); details all <=38 (longest "Trusted relationships last for years", 36).
- Checklist5Pills: labels <=30 ("Measured one project at a time" 30, "Few clients
  drive most revenue" 30, "Focus marketing where it pays" 29).
- LessonSummary: recap captions <=32 (longest "Client lifetime value", 21).
- LessonTitle: courseTitle "Marketing in Professional Services" (34 chars, <=80);
  lessonTitle "Core Principles of Marketing" (28 chars, <=120).
Zero violations.

### Icon resolution (no invented ids)
All ten distinct icon ids in `lessonScenes.ts` were verified to exist as real
files in the master `Icons/` library before assembly; none were hand-guessed:
`marketing-automation-megaphone`, `roadway-crossroad`, `security-shield`,
`arrows-target`, `tasks-list`, `business-strategy-target`, `data-analysis-outcome`,
`kpi-customerretention`, `business-strategy-handshake`, `kpi-revenuegrowth`
(each confirmed present in both `-dark` and `-light`). WordDefinition uses no
shared-library icon (its chrome is template-specific). The FinSage case study is a
company, so it is shown as a logo (`Company-FinSage-light`, verified present in
`Logos/Fictional-Company-Logos/`), never an icon, per the case-study principle.
Stage the icons and logo before preview with `script-pipeline/stage-icons.py`,
`stage-assets.py` and `stage-logos.py` into the render's `public/`.

### Icon contrast (suffix matched to surface mode)
- **LessonTitle** (scene 1): the course icon `marketing-automation-megaphone-dark`
  sits on the dark title surface, so `-dark` (light artwork) is correct, and it is
  identical to earlier lessons (course identity).
- **Cards5Falling** (scene 3): all three body icons are `-dark`; the template
  places them in the Oxford-Blue card body and its guidance requires `-dark`
  (light line art on the dark body). Correct.
- **YinYang2Points** (scene 4): the template force-recolours icons to solid white
  (Pattern B), so the suffix is cosmetic; `-dark` is kept for consistency.
- **Topic1Subtopics6** (scene 5): `titleIcon` `kpi-customerretention-dark` sits in
  the dark oxford-blue header pill (`-dark` required); `anchor`
  `business-strategy-handshake-light` sits on the light platinum-blue left panel
  (`-light` required, as `-dark` would vanish there). Correct.
- **Checklist5Pills** (scene 7): the hero icon `kpi-revenuegrowth-light` renders
  in native colours on the light platinum stage, so `-light` is correct.
- **CaseStudyIntro** (scene 6): the FinSage logo sits on the light platinum card,
  so the `-light` logo variant is used. Correct.

### Re-mention pulses
Scene 5 (Topic1Subtopics6) is the lesson's lengthy scene and carries the one
re-mention pulse. The header "Client lifetime value" is revealed visually at rel
0.0, but the term is first actually NAMED in narration at cue 19 (rel 9.134),
more than ~2 to 3 s after its reveal. Per the re-mention-pulse principle, the
header therefore carries a brand pulse at rel 9.134 (a value taken straight from
the SRT, not invented). Topic1Subtopics6's pulse schema allows `header` as a
target, so this is functional, not a no-op.

Every other scene's `pulses` array is empty, correct by evidence. The SRT was
scanned for within-scene re-mentions of already-revealed items more than ~2 to
3 s after their reveal: the value-proposition contrast (scene 4) reveals weak and
strong once each with no later callback inside the scene; the three value sources
(scene 3) are named once; the recap pills (scene 8) are first mentions of the
summary phrasing. The "value proposition" and "client lifetime value" terms do
recur across scenes, but those are separate scenes, not within-scene callbacks, so
the pulse mechanism does not apply to them.

### First-lesson roles
This is **Lesson 4**, not the first lesson, so the `BulletList6Pills`
course-outline beat was deliberately **not** included; it appears only in the
first lesson of a course (it is present in this course's Lesson 1). Only the
per-lesson `LessonTitle` opener is present (scene 1), which every lesson carries.

### Presenter-led character variants
None used. The sibling character variants (e.g. Topic1Subtopics6Character,
Checklist5Pills with a character hero, FivePoints1SubtopicV2Character) were not
selected because no beat here is framed as a presenter address or introduces named
people; the plain icon-anchored and definition layouts fit the explanatory content
better.

## QA fixes / checks made
- **Fix (no dead air, scenes 2 to 3):** the bench draft folded the value-and-
  exchange principle (cues 5 to 8) and the three sources of value (cues 9 to 10)
  into one Cards5Falling scene. Because Cards5Falling has a no-op setup
  (`staging: none`), its first card did not appear until ~16.75 s into the scene,
  leaving a long blank stage while value and exchange were narrated, a no-dead-air
  violation, and front-loading the cards to fill it was explicitly disallowed. Per
  the no-dead-air fallback (add a scene), the beat was split: WordDefinition
  (animated banner-and-pill setup) now carries the value definition (span 13.935
  to 29.798) and Cards5Falling carries the three sources (span 29.798 to 41.944),
  with its first card landing at rel 0.887 s. This also aligns the scene plan with
  the lesson's own summary, which names "value and exchange" as a distinct
  takeaway. `Root.tsx`, the scene exports and `SCENE_SPANS` were updated to eight
  scenes; total runtime is unchanged (every span boundary is still an SRT cue
  time and the spans remain contiguous and gap-free).
- **Fix (re-mention pulse, scene 5):** the bench draft left scene 5's `pulses`
  empty even though "client lifetime value" (the header) is revealed at rel 0.0
  and only named in narration at cue 19 (rel 9.134). Added a header pulse at rel
  9.134 so the term gets its brand callback when it is finally spoken. Confirmed
  Topic1Subtopics6 accepts `header` as a pulse target, so the fix is functional.
- Confirmed all ten icon ids resolve to real files in `Icons/` (both variants
  present) and the FinSage logo resolves in `Logos/Fictional-Company-Logos/`. No
  guessed ids.
- Verified icon suffixes against each template's real surface and recolour mode
  (Cards5Falling body icons `-dark`; Topic1Subtopics6 anchor `-light` on the light
  panel, header icon `-dark` on the dark pill; Checklist hero `-light` on the
  light stage; CaseStudyIntro logo `-light`; YinYang force-recolours to white).
- Confirmed the company case study is routed to a logo (CaseStudyIntro), not an
  icon, per the case-study principle.
- Confirmed the lesson opens on LessonTitle and that the course-outline pill list
  (BulletList6Pills) is absent (correct for a non-first lesson).
- Confirmed no template repeats across the eight scenes (variety rule, zero
  repeats).
- Confirmed every text field is within its template's documented character limit
  (zero violations).
- Confirmed all eight template `.tsx` files imported by `Root.tsx` /
  `lessonScenes.ts` are present in `src/`.
- Confirmed all on-screen text and this record are free of em dashes and en dashes
  (and double-hyphen substitutes); soft pauses use commas.
