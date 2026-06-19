# Marketing in Professional Services, Lesson 4

**Lesson title:** Core Principles of Marketing
**Course:** Marketing in Professional Services (`courseId: citest-marketing`)
**Runtime:** 133.361 s (8 scenes), 30 fps, 1920×1080
**Source SRT:** `lesson.srt` (from `inputs/citest-marketing-l4/lesson.srt`)
**Narration:** `narration.mp3` (from `inputs/citest-marketing-l4/narration.mp3`)
**Case study:** FinSage (company logo, not an icon)

This folder is the assembled project record. The Remotion composition lives in
`src/` (`Root.tsx` wires the scenes; `lessonScenes.ts` holds the SRT-derived
timing and content props; each used template ships as its own `.tsx`). Delivery
is to local Remotion Studio (`npx remotion studio`) for the user to export;
nothing is auto-rendered to MP4 here.

`plan.json` is the scene plan fed to `script-pipeline/fit-timing.py`;
`rementions.json` is the key-term config fed to `script-pipeline/detect-rementions.py`.
Both are kept as the timing/pulse provenance.

## Course identity (frozen)

`citest-marketing` had no `course.json` when this lesson was built, so the course
identity was created and frozen here:

```json
{ "courseName": "Marketing in Professional Services",
  "courseIcon": "marketing-automation-megaphone-dark" }
```

`courseIcon` was chosen via `script-pipeline/icons/icon-search.py "marketing
megaphone"` (top real hit) and validated. Every later lesson must reuse this
exact `courseName` and `courseIcon`; this lesson's `LessonTitle` uses them verbatim
(`courseTitle` text + `courseIconUrl = staticFile('icons/marketing-automation-megaphone-dark.svg')`).

## Scene plan (scene → template → beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000–13.935 | LessonTitle | Opening card: course + lesson 4 + headline. The previous-lesson recap (the four characteristics of services, cues 1–2) plays over the branded background. |
| 2 | 13.935–29.798 | WordDefinition | Value & exchange: a client engages a firm because the value of the outcome is expected to exceed the fee paid. |
| 3 | 29.798–41.944 | Cards5Falling | Where value comes from: the decision the client can now make, the risk avoided, the result achieved. |
| 4 | 41.944–66.006 | YinYang2Points | The value proposition, weak vs strong: a weak one lists services; a strong one names the client's problem and the outcome delivered. |
| 5 | 66.006–95.270 | Topic1Subtopics6 | Client lifetime value: marketing looks beyond a single sale; returning clients are worth more; retention reframes the firm's economics. |
| 6 | 95.270–100.032 | CaseStudyIntro | Case-study establishing card: the FinSage company logo. |
| 7 | 100.032–112.317 | Checklist5Pills | FinSage through client lifetime value: measured one project at a time; a few clients drive most revenue; focus marketing where it pays. |
| 8 | 112.317–133.361 | LessonSummary | Closing recap: value and exchange, the value proposition, client lifetime value. |

## How each rule was applied

### SRT-derived timing (fit-timing.py)
`plan.json` (scene cue ranges + per-slot anchor phrases) was run through
`fit-timing.py lesson.srt plan.json`. Every scene span in `SCENE_SPANS` is a cut on
an SRT cue boundary (span end = next scene's first cue start), and every `at` is
the introducing cue's start time (char-offset estimate of the anchor phrase)
converted to scene-relative seconds. The fit ran with **zero unmatched-anchor
warnings**. Nothing was sped up or front-loaded to mask a gap. Examples:

- Scene 2: `title` at rel 0.0 (cue 5, 13.935), `description` at rel 7.31 (cue 6,
  where "the value of the outcome to exceed [the fee]" is articulated).
- Scene 3: the three source cards at rel 0.89 / 3.31 / 5.03 (sub-phrases of cue 9).
- Scene 4: `leftTitle` "Weak" at rel 9.87 (cue 14), `rightTitle` "Strong" at rel
  13.61 (cue 15).
- Scene 5: the six details at rel 1.6 / 5.01 / 13.55 / 17.03 / 20.97 / 23.36
  (cues 17–24).
- Scene 8: the three recap pills at rel 5.22 / 7.68 / 12.69 (cues 30–32).

### Re-mention pulses (detect-rementions.py) — MANDATORY
After timing, `detect-rementions.py lesson.srt rementions.json` was run with each
object's distinctive **key term** as its anchor (not the long reveal phrase). It
flagged the two real re-mention opportunities, both populated in `lessonScenes.ts`:

- **Scene 2 (WordDefinition):** "value" is the defined term and is re-mentioned at
  cues 6 and 8 → `title` pulses at rel **7.52** and **12.36**.
- **Scene 5 (Topic1Subtopics6, long preview-then-frame scene):** the header term
  "client lifetime value" is revealed at rel 0.0 as the topic frame, then first
  *named* at cue 19 → `header` pulses at rel **11.27**. A long scene with a
  re-mentioned topic must not ship with empty pulses; this is the required pulse.

Scenes 1, 3, 4, 6, 7, 8 have no qualifying re-mention (each key term is spoken once
after its reveal, or only within `END_MARGIN` of the cut), so their `pulses` are
legitimately empty.

### No dead air
Every scene's first content (or its setup staging) lands within ~1–2 s of the
scene open, except scene 4's contrast, which is handled by selection rather than
by front-loading:
- Scenes 2, 5, 6, 7, 8 reveal their first element at rel 0.0; scene 3 (Cards5Falling
  has `setup: none`) lands card0 at rel 0.89 — its first card *is* its first object.
- **Scene 4:** the value-proposition framing (cues 12–13) narrates while the
  YinYang scaffold (both panels + empty title bars + empty boxes) slides in over a
  2.5 s `setup`; the two contrast sides then reveal on their own cues (9.87 / 13.61).
  The contrast genuinely belongs to one beat (weak vs strong value proposition) and
  no other template fits a bare second definition without violating per-lesson
  variety, so the framing rides the staging animation rather than being split off.
  Reveals stay synced to the SRT; nothing was pulled early.

### Icon contrast & resolution (never guessed)
Every glyph id was validated against the master `Icons/` library with
`script-pipeline/icons/validate-icons.py --scene-file src/lessonScenes.ts`
(**9/9 real, PASS**). Variants follow the surface:
- Scene 3 Cards5Falling: `-dark` icons on the Oxford-Blue card body.
- Scene 4 YinYang2Points: Pattern B (icons forced to solid white), suffix cosmetic;
  kept `-dark` for consistency.
- Scene 5 Topic1Subtopics6: `titleIcon` `-dark` on the oxford header pill;
  `anchor` `-light` on the platinum left panel (template enforces `-light`).
- Scene 7 Checklist5Pills: hero icon `-light` on the light stage.

### Case study = a logo, not an icon
The FinSage worked example is introduced with `CaseStudyIntro` carrying the
`Company-FinSage-light` wordmark from `Logos/Fictional-Company-Logos/` (the name is
in the artwork), followed immediately by an icon-left bullet template
(`Checklist5Pills`) for the case-study detail — exactly the case-study pattern.

### Variety
All eight scenes use eight distinct templates; zero repeats within the lesson.
`citest-marketing` has no prior lessons (`course-templates.py` reports the course is
new), so course-level variety resets here and imposes no constraint. The two
value-themed beats deliberately use different shapes: WordDefinition defines the
term (scene 2) and Cards5Falling lists where value comes from (scene 3);
YinYang2Points was reserved for the genuinely oppositional weak-vs-strong beat.

### First-lesson-only elements
The course-outline agenda (`BulletList6Pills`) appears only in a course's first
lesson. This is lesson 4, so no agenda scene is included.
