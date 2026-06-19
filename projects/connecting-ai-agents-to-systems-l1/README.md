# Connecting AI Agents to Systems, Lesson 1: From Map to Connection

Project record for the assembled lesson. Timing is SRT-derived, pulses are SRT-detected, and template selection follows the standards in `templates/README.md` and each template's `GUIDANCE.md`.

## Files

- `lesson.srt`, the narration cue file (copied from the source SRT). Drives all scene-relative timing.
- `narration.mp3`, the voiceover (copied from the produced audio). Wired into `Root.tsx` as the composition `Audio`.
- `src/`, the Remotion sources: `Root.tsx`, `lessonScenes.ts`, and the eleven template `.tsx` files actually used by this lesson (no unused templates copied).

Total runtime: 223.972s (from `lessonScenes.ts`), 11 scenes, FPS 30.

## Scene plan (scene -> template -> beat)

| # | Span (s) | Template | Beat |
|---|----------|----------|------|
| 1 | 0.000 - 14.293 | LessonTitle | Opening title card: course identity + lesson number/title |
| 2 | 14.293 - 21.073 | LessonGoal | The lesson goal: define connecting an agent and why it is more than a feature |
| 3 | 21.073 - 39.916 | Topic1Subtopics6 | "Ask and answer": today's AI sits outside our systems, has no hands |
| 4 | 39.916 - 68.198 | WordDefinition | Defining "Connecting": giving an AI the tools to act, not just answer |
| 5 | 68.198 - 81.841 | ComparativePoints2 | Answering vs Acting, the core distinction the course is about |
| 6 | 81.841 - 115.510 | BigPoints3V1 | The three things connecting changes: who does the work, what runs alone, how information moves |
| 7 | 115.510 - 132.368 | YinYang2Points | Worst way (any step, no plan) vs better way (decide first, keep control) |
| 8 | 132.368 - 155.773 | CirclePoints4 | The points marked on a process map: add value / must not decide / stays in control |
| 9 | 155.773 - 183.348 | BulletList6Pills | Course outline: the three things this course will cover (first-lesson role) |
| 10 | 183.348 - 199.498 | Checklist5Pills | The deliverable: a complete connection design (tools, access, checkpoints, fails safely) |
| 11 | 199.498 - 223.972 | LessonSummary | Closing recap of the three lesson beats |

## How each rule was applied

### SRT timing
Scene spans in `SCENE_SPANS` are cut at SRT cue boundaries. Within each scene, every reveal `at` is the introducing cue's start time converted to scene-relative seconds (cue start minus scene start). Examples: scene 3 `header` at +2.5 lands as the "we ask, and it answers" line begins (cue 9, 21.573s absolute); scene 6 `point1` at +16.83 (abs 98.67s) lands on "what the process can do on its own". Reveals stay anchored to the voiceover and were never sped up to mask gaps.

### Variety (one template per lesson)
All eleven scenes use distinct templates. No content template repeats. The three structural cards (LessonTitle, LessonGoal, LessonSummary) are the standard openers/closer and are exempt from the variety rule.

### Semantic fit
Each template matches the structure of its beat: a two-way contrast (Answering vs Acting) goes to ComparativePoints2; an explicit set of three changes goes to BigPoints3V1; a worst-way/better-way opposition goes to YinYang2Points; the three map points go to CirclePoints4; a single defined term goes to WordDefinition; the course's three-part promise goes to BulletList6Pills. No cycle/flywheel template was used, as nothing in the content is a repeating system.

### No dead air
A LessonTitle card opens the lesson, and every scene leads with a `setup` step at +0.2s so the stage animates within the first second before the first spoken content reveal (which is anchored to its cue). Scene 8 (CirclePoints4) has no `setup` target by design, but its first content reveal lands at +2.5s, within the no-dead-air window, and the template's own circle pop-in carries the motion. No beat was split, and no content was front-loaded ahead of its narration.

### Frame-fit character limits
Labels and items are kept to the short, frame-fit forms each template's schema expects: CirclePoints4 / BigPoints3V1 / ComparativePoints2 / YinYang2Points use 2-to-4-word labels ("Who does the work", "Must not decide", "Answering"); Checklist5Pills items are short phrases ("Tools it needs", "Fails safely"); WordDefinition uses a single headword ("Connecting") plus a one-sentence description.

### Icon resolution (no guessed ids)
Every icon id in `lessonScenes.ts` was verified to be a real file in the master `Icons/` library (all 16 referenced ids resolved; none invented). Variants follow the icon-contrast rule:
- Templates that force icons to solid white (CirclePoints4, scene 8) take any variant; `-dark` here is cosmetic.
- Topic1Subtopics6 (scene 3) places its large anchor on a light platinum-blue left panel and its schema requires a `-light` id; it uses `ai-agent-chatbot-light`.
- Checklist5Pills (scene 10) hero sits on a light platinum background and uses `design-thinking-planning-light`.
- The remaining icon slots sit on dark/coloured surfaces (header pills, dark cards) and correctly use `-dark` ids.

### Re-mention pulses (SRT-detected)
Pulses were populated where an already-revealed item is named again later in the narration:
- Scene 4 (WordDefinition): `title` pulses at +22.46s when "connecting means" is re-stated before the definition expands.
- Scene 6 (BigPoints3V1): `point0` pulses at +9.7s on the re-mention of who does the work.
- Scene 8 (CirclePoints4): `point0` pulses at +10.62s.
- Scene 10 (Checklist5Pills): `item0` pulses at +7.27s.
Scenes with no later re-mention of a revealed item correctly carry empty `pulses` arrays.

### First-lesson roles
This is Lesson 1, so the course-outline beat uses BulletList6Pills (scene 9), the standard for that beat and used in the first lesson only. Course identity (title "Connecting AI Agents to Systems" + the `network-system-dark` course icon, lesson number 1) is set on the LessonTitle card in scene 1, to be reused exactly across later lessons.

### Case study
This lesson contains no case study about a specific company, so no CaseStudyIntro template and no `Logos/` logo were used. The references to AI agents and systems are general concepts, correctly shown as icons.

### Presenter / character variants
The lesson is abstract conceptual content with no named real people, so no profile/duo/trio character cards were used. The plain (non-character) variants of Topic1Subtopics6 and Checklist5Pills were selected.

## QA fixes made

No defects required correction. Verified during assembly:
- All 16 referenced icon ids resolve to real files in `Icons/` (no 404 risk).
- Icon variants match their surface mode per the icon-contrast rule.
- All relative imports in `src/` resolve within the copied file set (Root, lessonScenes, and each template reference only files present); the folder is self-contained.
- Timing reveals and pulse timestamps line up with SRT cue starts; no static stretch exceeds the no-dead-air / keep-moving thresholds.
- No em dashes or en dashes appear in any scene text or in this record.
