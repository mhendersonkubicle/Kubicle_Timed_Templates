# Connecting AI Agents to Systems, Lesson 1: From Map to Connection

Project record for the assembled lesson. Timing is SRT-derived, pulses are SRT-detected, and template selection follows the standards in `templates/README.md` and each template's `GUIDANCE.md`.

## Files

- `lesson.srt`, the narration cue file (copied from the source SRT). Drives all scene-relative timing.
- `narration.mp3`, the voiceover (copied from the produced audio). Wired into `Root.tsx` as the composition `Audio`, and also staged at `public/narration.mp3` so a local Remotion Studio render picks it up.
- `src/`, the Remotion sources: `Root.tsx`, `lessonScenes.ts`, and the eleven template `.tsx` files actually used by this lesson (no unused templates copied).
- `public/`, staged render assets: `icons/` (the 15 SVG ids referenced by the scenes), `Template-Specific-Assets/<Template>/` (the baked PNGs for each used template), and `narration.mp3`. `public/logos/` is intentionally empty (no case study, so no company logo).

Total runtime: 223.972s (from `lessonScenes.ts`), 11 scenes, FPS 30, 1920x1080.

Authoritative source of truth for the scene plan is the current bench `src/` (`Root.tsx` + `lessonScenes.ts`); this record was reconciled to it during assembly (see QA fixes).

## Scene plan (scene -> template -> beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 - 14.293 | LessonTitle | Opening title card: course identity + lesson number and title |
| 2 | 14.293 - 21.073 | LessonGoal | The lesson goal: define connecting an AI agent and why it is more than adding a feature |
| 3 | 21.073 - 39.916 | Topic1Subtopics6 | "Ask and answer" mode: today's AI sits outside our systems, has no hands, a person carries the output |
| 4 | 39.916 - 60.675 | BigPoints3V1 | An agent acts: it can read a record, update a field, or trigger the next step |
| 5 | 60.675 - 68.198 | WordDefinition | Defining "Connecting": giving an AI the tools to act, not just answer |
| 6 | 68.198 - 115.510 | Points3Subtopics2 | The three things connecting changes: who does the work, what runs alone, how info flows |
| 7 | 115.510 - 132.368 | YinYang2Points | Worst way (no plan, just guess) vs better way (plan ahead, stay in control) |
| 8 | 132.368 - 155.773 | IconPointsV1 | The points marked on a process map: add value / do not decide / stay in control |
| 9 | 155.773 - 183.348 | BulletList6Pills | Course outline: the three things this course will cover (first-lesson role) |
| 10 | 183.348 - 197.269 | Checklist5Pills | The deliverable: a connection design (tools it needs, access allowed, checkpoints, fails safely) |
| 11 | 197.269 - 223.972 | LessonSummary | Closing recap of the three lesson beats |

## How each rule was applied

### SRT timing
Scene spans in `SCENE_SPANS` are cut at SRT cue boundaries. Within each scene, every reveal `at` is the introducing cue's start time converted to scene-relative seconds (cue start minus scene start). For example, scene 4's three reveals at +7.29 / +8.67 / +9.87 land as cue 15 ("read a record, update a field, or trigger the next step", absolute 51.105s) is spoken; scene 6's titles at +23.34 / +24.45 / +26.93 land on the "who does the work, what the process can do on its own, how information moves" lines (cue 27, absolute ~91s). Reveals stay anchored to the voiceover and were never sped up to mask gaps.

### Variety (one template per lesson)
All eleven scenes use distinct templates; no content template repeats. The three structural cards (LessonTitle, LessonGoal, LessonSummary) and the first-lesson outline (BulletList6Pills) are standard recurring roles and are exempt from the variety rule. The two split-screen "topic into sub-points" beats were deliberately split across two different templates (Topic1Subtopics6 for the simple waterfall in scene 3, Points3Subtopics2 for the three-band title-plus-detail structure in scene 6) rather than reusing one.

### Semantic fit
Each template matches the structure of its beat: a single core topic fanning into a flat list of supporting points goes to Topic1Subtopics6; an explicit set of three concrete agent actions goes to BigPoints3V1; a single defined term goes to WordDefinition; three parallel ideas each with a supporting line go to Points3Subtopics2; a worst-way/better-way opposition goes to YinYang2Points; a walkthrough of map points filed one at a time goes to IconPointsV1; the course's three-part promise goes to BulletList6Pills; a list of deliverables ticked off goes to Checklist5Pills. No cycle/flywheel template was used, as nothing in the content is an ongoing repeating system.

### No dead air
A LessonTitle card opens the lesson. Every scene leads with a `setup` step at +0.2s so the stage scaffolding animates within the first second before the first spoken content reveal (which stays anchored to its cue). No staging-capable template was passed over for a no-op-setup one, no beat was split for pacing, and no content was front-loaded ahead of its narration.

### Frame-fit character limits
Labels and items are kept to the short, frame-fit forms each template's schema expects: Topic1Subtopics6 detail lines are short noun phrases (<=38 chars: "The AI sits outside systems"); BigPoints3V1 / IconPointsV1 labels are 2-to-4-word phrases ("Read a record", "Stay in control"); YinYang2Points captions are <=16 chars ("No plan", "Plan ahead"); Checklist5Pills items are short single lines ("The tools it needs", "The way it fails safely"); WordDefinition uses a single headword ("Connecting") plus a one-sentence description.

### Icon resolution (no guessed ids)
Every icon id in `lessonScenes.ts` was verified to be a real file in the master `Icons/` library (all 15 referenced ids resolved; none invented). Variants follow the icon-contrast rule:
- Topic1Subtopics6 (scene 3): `titleIcon` is a `-dark` id pre-coloured white (`speech-bubbles-questiontalk-dark`); the large left-panel `anchor` sits on the light platinum-blue panel and correctly uses a `-light` id (`ai-agent-virtualassistant-light`).
- BigPoints3V1 (scene 4) and YinYang2Points (scene 7) force icons to a white body with Dodger-Blue accents (Pattern B), so the suffix is cosmetic; `-dark` ids are used.
- Points3Subtopics2 (scene 6): the anchor icon sits on the Oxford-Blue left panel and is locked to a `-dark` id (`business-strategy-automation-dark`).
- IconPointsV1 (scene 8): pill icons must end `-light` and do (`arrows-infographics-elements-growth-light`, `hands-stop-light`, `teacher-during-an-exam-supervising-light`).
- Checklist5Pills (scene 10): the hero renders in native colours on the light hero area and uses `project-management-processflow-light`.
- The LessonTitle course icon is `network-system-dark` (the course identity icon).

### Re-mention pulses (SRT-detected)
Pulses were populated where an already-revealed item is named again later in the narration:
- Scene 3 (Topic1Subtopics6): `header` pulses at +9.62s when "ask and answer" is re-mentioned after the header was revealed earlier.
- Scene 6 (Points3Subtopics2): `title1` pulses at +42.35s and `detail0a` pulses at +44.42s, on the closing re-statement of the three changes near the end of the long scene.
Scenes with no later re-mention of a revealed item correctly carry empty `pulses` arrays. The two longest scenes (3 and 6, the most likely to feel static) both carry pulses.

### First-lesson roles
This is Lesson 1, so the course-outline beat uses BulletList6Pills (scene 9), the standard for that beat and used in the first lesson only. Course identity on the LessonTitle card (scene 1: course title "Connecting AI Agents to Systems" + the `network-system-dark` course icon, lesson number 1) is set here to be reused verbatim across later lessons, never re-derived.

### Case study
This lesson contains no case study about a specific company, so no CaseStudyIntro template and no `Logos/` logo were used (`public/logos/` is empty). References to AI agents and systems are general concepts, correctly shown as icons.

### Presenter / character variants
The lesson is abstract conceptual content with no named real people, so no profile/duo/trio character cards were used. The plain (non-character) variants of Topic1Subtopics6, Points3Subtopics2, and Checklist5Pills were selected.

## QA fixes made

The project folder pre-existed with a stale README and stale staged assets that described an earlier scene plan; these were reconciled to the current authoritative bench `src/`:
- The stale README listed ComparativePoints2 (scene 5) and CirclePoints4 (scene 8) and omitted Topic1Subtopics6, Points3Subtopics2, and IconPointsV1, and used incorrect spans. The README was rewritten to match the actual `Root.tsx` / `lessonScenes.ts` (Topic1Subtopics6, BigPoints3V1, WordDefinition, Points3Subtopics2, YinYang2Points, IconPointsV1).
- Three stale unused template files (`CirclePoints4.tsx`, `ComparativePoints2.tsx`, `KubicleAIChat.tsx`) were removed from `src/` so the record holds only the eleven templates the lesson actually imports.
- `public/icons/` was re-staged from the master `Icons/` library to exactly the 15 ids the current scenes reference (stale ids such as `ai-agent-chatbot-light`, `design-thinking-planning-light`, and the unused `hands-stop-dark` were dropped; missing ids were added).
- `public/Template-Specific-Assets/` was rebuilt to cover exactly the used templates (added Topic1Subtopics6 and Points3Subtopics2; removed the stale CirclePoints4, ComparativePoints2, and KubicleAIChat asset folders).

Verified during assembly:
- All 15 referenced icon ids resolve to real files in `Icons/` (no 404 risk), and every icon variant matches its surface mode per the icon-contrast rule.
- All relative imports in `src/` (Root, lessonScenes, and each template) resolve within the copied file set; the folder is self-contained.
- Timing reveals and pulse timestamps line up with SRT cue starts; the long scenes carry pulses, so no scene reads as static.
- No em dashes or en dashes appear in any scene text or in this record.
