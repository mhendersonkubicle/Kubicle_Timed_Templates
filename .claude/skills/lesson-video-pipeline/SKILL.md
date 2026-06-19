---
name: lesson-video-pipeline
description: Turn one lesson's narration (MP3) and subtitles (SRT) into a validated, multi-scene Remotion lesson video, keeping every lesson in the same course visually consistent. Use when a lesson request arrives (in Slack or chat) with a course name, lesson number, lesson title, and the SRT + MP3 files. Builds the composition, runs the timing/pulse/icon pipeline, verifies it by rendering, and reports back.
---

# Lesson Video Pipeline

Turns one lesson (SRT + MP3 in) into a finished, validated Remotion lesson video, and keeps every lesson in the same course looking like it belongs to that course.

Everything you need is in this repo:
- `templates/` , the template library plus `SELECTION_INDEX.md` (how to pick templates), `README.md` (the rules), and each template's `GUIDANCE.md`.
- `script-pipeline/` , the deterministic tools (`build-lesson.workflow.js`, `fit-timing.py`, `detect-rementions.py`, `course-templates.py`, the `icons/` resolver, `stage-assets.py`, `stage-logos.py`).
- `projects/` , the durable record of every lesson already built. This folder is the memory (see "Course memory" below).

## What a request must contain

1. **Course name** , the exact course title, used verbatim on every lesson (for example "Marketing in Professional Services").
2. **Lesson number** , 1, 2, 3, ...
3. **Lesson title** , the title of this specific lesson.
4. **Requirements** , any special notes (a case-study company, a point to emphasise).
5. **The two files** , the lesson's `.srt` and `.mp3`.

If any of the five are missing, ask for them before starting.

## Course memory (read this first, every run)

Separate lesson runs must still feel like one course. The memory lives in `projects/`:

- `courseId` = the course name lowercased with spaces as hyphens (for example `marketing-in-professional-services`). Keep it short and stable.
- `projects/<courseId>/course.json` holds the course identity: `{ "courseName": "...", "courseIcon": "<icon-id>" }`.
- `projects/<courseId>-l<N>/` holds each finished lesson (its `src/`, its template list, its README).

**At the start of every run:**
1. Read `projects/<courseId>/course.json`.
   - **If it does not exist, this is the first lesson of the course.** Choose ONE course icon now (a real icon id, validated via `script-pipeline/icons`), and create `course.json` with the course name and that icon. This icon is frozen for the whole course.
   - **If it exists,** reuse `courseName` and `courseIcon` exactly. Never re-derive or re-pick them.
2. Run `python script-pipeline/course-templates.py <courseId> --exclude <courseId>-l<N>` to see which templates earlier lessons used, so you can favour variety.

**At the end of every run:** make sure `projects/<courseId>/course.json` exists and is correct, and that this lesson's project `projects/<courseId>-l<N>/` is saved. That is what the NEXT lesson will read.

## Build steps

1. Stage the inputs (copy the SRT and MP3 into the build location).
2. Run the one-command pipeline:
   `node script-pipeline/build-lesson.workflow.js` with arguments:
   - `srt`, `audio` , the two files.
   - `courseTitle` , the course name, VERBATIM.
   - `courseIcon` , the frozen icon id from `course.json`.
   - `lessonNumber`, `isFirstLesson` , true only when lesson number is 1.
   - `projectName` = `<courseId>-l<N>`, `courseId` = `<courseId>`.
3. The pipeline picks and fits templates, resolves icons, derives timing from the SRT, adds re-mention pulses, stages assets, and writes the composition.

## Rules that are easy to drop (do not drop them)

- **Course identity is identical across all lessons.** `courseTitle` equals the course name verbatim; the top-left course icon is the one frozen in `course.json`. (This is the L3 "wrong course name" bug; pin it.)
- **Pulsing is mandatory** wherever an already-revealed item is named again later, especially in long scenes. Never ship a long or preview-then-expand scene with empty `pulses`.
- **No dead air.** If a scene would sit silent for several seconds before its first reveal, either pick a template that has a staging animation, or split the quiet lead-in into its own scene. Never front-load content to hide the gap.
- **Icon contrast.** Match the icon suffix to the surface, and force icons to solid white on saturated brand-colour fills (Process5Steps, Flywheel4Petals, SplitscreenPointsV1).
- **Template variety across the course** (soft). Prefer less-used templates when several fit equally; never sacrifice a genuinely better fit.
- **Case studies** use `CaseStudyIntro` plus a company logo from `Logos/` (not an icon), followed by an icon-left bullet template.

Full detail lives in `templates/README.md`, `templates/SELECTION_INDEX.md`, and each `GUIDANCE.md`. Read them; do not rely on memory.

## Verify before delivering

The render bench can be STALE compared to the durable project copy after the verify step. Before rendering or delivering:
1. Compare scene counts in `projects/<courseId>-l<N>/src/lessonScenes.ts` versus the bench. If they differ, the project copy is the truth.
2. Sync the project `src/` into the bench, then render a few stills (course identity, any newly added scene, any scene that had a problem) and look at them.
3. Only then render or hand off the full video.

## Deliver

Rendering is heavy and local. Default behaviour: build and validate the lesson, save the project, and report that the lesson is ready to open in Remotion Studio and export. If asked to render to a file, render the MP4 and report the path. Post a short status back to the requester (Slack channel or chat) with the lesson title, scene count, total length, and the templates used.
