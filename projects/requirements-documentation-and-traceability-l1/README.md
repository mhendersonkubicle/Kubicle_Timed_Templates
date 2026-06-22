# Requirements Documentation and Traceability, Lesson 1: The Strategic Value of Requirements

Project record for the assembled lesson. Timing is SRT-derived, pulses are SRT-detected, and template selection follows the standards in `templates/README.md` and each template's `GUIDANCE.md`.

## Files

- `lesson.srt`, the narration cue file (copied from `inputs/requirements-documentation-and-traceability-l1/lesson.srt`). Drives all scene-relative timing.
- `narration.mp3`, the voiceover (copied from `inputs/requirements-documentation-and-traceability-l1/narration.mp3`). Wired into `Root.tsx` as the composition `Audio` via `staticFile('narration.mp3')`.
- `src/`, the Remotion sources: `Root.tsx`, `lessonScenes.ts`, and the nine template `.tsx` files actually used by this lesson (no unused templates copied).

Total runtime: 214.216s (from `lessonScenes.ts`), 9 scenes, FPS 30, 1920x1080.

Authoritative source of truth for the scene plan is the current bench `src/` (`Root.tsx` + `lessonScenes.ts`); this record was copied from it during assembly.

## Scene plan (scene -> template -> beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 - 13.353 | LessonTitle | Mandatory opener: course identity (title + icon) + lesson number and title ("The Strategic Value of Requirements") |
| 2 | 13.353 - 28.342 | ComparativePoints2 | Requirements bridge strategic intent (boardroom) and the operational teams building the solution |
| 3 | 28.342 - 42.960 | IconPointsV1 | Failure modes of poor requirements management: scope creep, budget overruns, unused products |
| 4 | 42.960 - 60.771 | WordDefinition | Defining the "single source of truth": a codified agreement between business need and technical solution |
| 5 | 60.771 - 111.823 | Topic1Subtopics6 | The Business Analysis Mindset and its five characteristics (lengthy concept scene) |
| 6 | 111.823 - 121.947 | CaseStudyIntro | Case study establishing beat: the consulting firm shown as a fictional company logo |
| 7 | 121.947 - 169.980 | Checklist5Pills | Project Polaris real needs: reduce churn, attract younger investors, replace paper reporting, deliver a real-time portal |
| 8 | 169.980 - 195.929 | BulletList6Pills | Course outline: the six topics this course will cover (first-lesson role) |
| 9 | 195.929 - 214.216 | LessonSummary | Closing recap of the three lesson beats |

## How each rule was applied

### SRT timing
Scene spans in `SCENE_SPANS` are cut at SRT cue boundaries. Within each scene, every reveal `at` is the introducing cue's start time converted to scene-relative seconds (cue start minus scene start). For example, scene 2's two reveals at +9.95 / +11.66 land as cue 3 ("bridging strategic intent with operational reality", absolute ~23.3s) is spoken; scene 8's six bullets at +6.65 through +20.11 track the course-outline cues (52 through 56). Reveals stay anchored to the voiceover and were never sped up to mask gaps.

### Variety (one template per lesson)
All nine scenes use distinct templates; no content template repeats. The three structural cards (LessonTitle, WordDefinition is content, LessonSummary) and the first-lesson outline (BulletList6Pills) cover standard recurring roles and are exempt from the variety rule. The two "topic plus supporting points" beats were given distinct templates rather than a reuse (ComparativePoints2 for the two-sided bridge in scene 2, Topic1Subtopics6 for the single-topic five-point fan in scene 5).

### Semantic fit
Each template matches the structure of its beat: a two-sided bridge (strategic intent versus operational teams) goes to ComparativePoints2; a flat set of three failure modes goes to IconPointsV1; a single defined term goes to WordDefinition; one core topic fanning into five supporting characteristics goes to Topic1Subtopics6; a list of concrete deliverable needs ticked off goes to Checklist5Pills; the course's multi-part promise goes to BulletList6Pills. No cycle or flywheel template was used, as nothing in the content is an ongoing repeating system.

### No dead air
A LessonTitle card opens the lesson. Every scene leads with a `setup` step at +0.2s so the stage scaffolding animates within the first second before the first spoken content reveal (which stays anchored to its cue). Scene 5 (Topic1Subtopics6, 51s long) and scene 7 (Checklist5Pills, 48s long) both stage in immediately and reveal content on-beat, so neither opens static. No staging-capable template was passed over for a no-op-setup one, no beat was front-loaded ahead of its narration.

### Frame-fit character limits
Labels and items are kept to the short, frame-fit forms each template's schema expects: ComparativePoints2 labels are short noun phrases ("Strategic intent", "Operational teams"); IconPointsV1 pills are 2-to-3-word phrases ("Scope creep", "Budget overruns", "Unused products"); Topic1Subtopics6 detail lines are short noun phrases ("Prioritizes value over templates", "Thinks holistically across the org"); Checklist5Pills items are short single lines ("Reduce client churn", "Deliver a real-time portal"); BulletList6Pills bullets are compact topic labels; WordDefinition uses a single headword phrase ("Single Source of Truth") plus a one-sentence description.

### Icon resolution (no guessed ids)
Every icon id in `lessonScenes.ts` was verified to be a real file in the master `Icons/` library (all nine referenced ids resolved; none invented). Variants follow the icon-contrast rule:
- ComparativePoints2 (scene 2): renders icons as-is (Pattern A) on dark surfaces, so `-dark` ids are used (`decisions-strategy-dark`, `team-building-teamwork-dark`).
- IconPointsV1 (scene 3): forces icons to a white body with Dodger-Blue accents (Pattern B), but the schema expects `-light` pill ids and they are (`arrows-expand-light`, `control-your-cost-budget-light`, `product-recommendation-box-light`).
- Topic1Subtopics6 (scene 5): `titleIcon` is a `-dark` id used on the header (`mindset-thinking-dark`); the large left-panel `anchor` sits on the light platinum panel and correctly uses a `-light` id (`business-strategy-lightbulb-light`).
- Checklist5Pills (scene 7): the hero renders on the light hero area and uses a `-light` id (`productivity-dashboard-light`).
- The LessonTitle course icon is `documents-clipboard-dark`, the registered course-identity icon.

### Re-mention pulses (SRT-detected)
Pulses were populated where an already-revealed item is named again later in the narration. Scene 5 (Topic1Subtopics6, the long concept scene most likely to feel static) carries two `header` pulses at +19.51s and +41.15s, on the two later re-mentions of the "mindset" after its header reveal at +5.59s. All other scenes correctly carry empty `pulses` arrays, as no revealed item is re-named more than a few seconds after its reveal within those spans.

### First-lesson roles
This is Lesson 1, so the course-outline beat uses BulletList6Pills (scene 8), the standard for that beat and used in the first lesson only. Course identity on the LessonTitle card (scene 1: course title "Requirements Documentation and Traceability" + the `documents-clipboard-dark` course icon, registered in the course's `course.json`, lesson number 1) is reused verbatim and must be reused, never re-derived, on later lessons of this course.

### Case study (company is a logo, not an icon)
This lesson introduces a case study about a specific consulting firm and its client, so the establishing beat (scene 6) uses CaseStudyIntro with a fictional company logo from `Logos/Fictional-Company-Logos/` (`Company-CoreSage-light`), never an icon. The company name is baked into the wordmark, so no separate name text is set; the `eyebrow` reads "Case Study". The client's project ("Polaris") is then unpacked as general deliverable needs in scene 7 (Checklist5Pills), which are concepts and so correctly shown with an icon hero rather than a logo.

### Presenter / character variants
The lesson is abstract conceptual content; the only named entities are the case-study firms, which are handled by the company-logo route, not real-person portraits. No profile, duo, or trio character cards were used, and the plain (non-character) variants of Topic1Subtopics6 and Checklist5Pills were selected.

## QA fixes made

No defects required correction during assembly. Verified:
- All nine referenced icon ids resolve to real files in `Icons/` (`documents-clipboard-dark`, `decisions-strategy-dark`, `team-building-teamwork-dark`, `arrows-expand-light`, `control-your-cost-budget-light`, `product-recommendation-box-light`, `mindset-thinking-dark`, `business-strategy-lightbulb-light`, `productivity-dashboard-light`), so there is no 404 risk, and every variant matches its surface mode per the icon-contrast rule.
- The case-study logo `Company-CoreSage-light` resolves to a real file in `Logos/Fictional-Company-Logos/`.
- All relative imports in `src/` (Root, lessonScenes, and each of the nine templates) resolve within the copied file set; the folder is self-contained, with no import pointing at a template that was not copied.
- The long scene (scene 5) carries SRT-derived re-mention pulses, so no scene reads as static.
- No em dashes or en dashes appear in any scene text, in any code comment, or in this record.
