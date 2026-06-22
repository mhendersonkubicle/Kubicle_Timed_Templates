---
name: lesson-video-pipeline
description: Turn one lesson's narration (MP3) and subtitles (SRT) into a validated, multi-scene Remotion lesson video, keeping every lesson in the same course visually consistent. Use when SRT + MP3 are provided with a course name, lesson number, and lesson title. Plans the scenes, then shares the DIRECTION (template per scene, narration, scene length, on-screen text with character limits) plus a link to the scene library, and WAITS for the producer to confirm before anything is rendered. On approval, finalises the composition and hands it to local Remotion Studio to export.
---

# Lesson Video Pipeline

Turns one lesson (SRT + MP3 in) into a finished, validated Remotion lesson video, and keeps every lesson in the same course looking like it belongs to that course.

Everything you need is in this repo:
- `templates/` , the template library plus `SELECTION_INDEX.md` (how to pick templates), `README.md` (the rules), and each template's `GUIDANCE.md`.
- `script-pipeline/` , the deterministic tools (`build-lesson.workflow.js`, `fit-timing.py`, `detect-rementions.py`, `course-templates.py`, the `icons/` resolver, `stage-assets.py`, `stage-logos.py`).
- `projects/` , the durable record of every lesson already built. This folder is the memory (see "Course memory" below).
- `TEMPLATE-CATALOG.html` , the SCENE LIBRARY: a rendered example of every template, grouped by category, with a one-line "use when". This is the resource the producer browses at the approval gate. Regenerate it any time with `python script-pipeline/scene-catalog/build-catalog.py`.

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

## How a lesson is built (the local flow)

This flow has a HARD human-in-the-loop gate: you PLAN, you SHARE the direction, you WAIT for the producer's confirmation, and only THEN do you finalise and hand the lesson to render. Never skip the gate, and never render before it is approved.

1. **Stage the inputs.** Copy the SRT and MP3 into the build location (`inputs/<courseId>-l<N>/`).
2. **Plan and build the composition.** Either run the one-command pipeline
   `node script-pipeline/build-lesson.workflow.js` with arguments:
   - `srt`, `audio` , the two files.
   - `courseTitle` , the course name, VERBATIM.
   - `courseIcon` , the frozen icon id from `course.json`.
   - `lessonNumber`, `isFirstLesson` , true only when lesson number is 1.
   - `projectName` = `<courseId>-l<N>`, `courseId` = `<courseId>`.

   ...or build it directly following the rules below. Segment the SRT into scenes, pick the best template per scene, fit each scene's on-screen copy WITHIN that template's character limits, resolve every icon to a real id, derive on-beat timing from the SRT, add re-mention pulses, stage assets, and write the composition.
3. **Make the project self-contained.** Run `python script-pipeline/bundle-project.py projects/<courseId>-l<N>`.
4. **Generate the DIRECTION.** Run `python script-pipeline/scene-breakdown.py projects/<courseId>-l<N>`. It writes `BREAKDOWN.md`: the full narration laid over the scenes (transition points = scene boundaries), the template chosen per scene, the scene length, every on-screen text line with its `(used/limit)` character count, the reveal beats, the flags, and a link to the scene library.
5. **GATE , share the direction and WAIT for confirmation.** Present the producer with the direction (the contents of `BREAKDOWN.md`) AND serve them the scene library: `TEMPLATE-CATALOG.html` at the repo root, a rendered example of every template, so they can see what each looks like and ask to swap one. (If that file is missing, or templates/examples changed, regenerate it first with `python script-pipeline/scene-catalog/build-catalog.py`.) Ask them to approve, or to change any scene's template, on-screen text, or timing. **Do NOT render, deliver, or call the lesson finished until they explicitly confirm.** Apply any requested changes (enforcing character limits, see below), regenerate the direction, and re-share. Loop until every scene is approved.
6. **Only on approval, hand off to render.** Deliver to local Remotion Studio with `python script-pipeline/open-in-studio.py <courseId>-l<N>` for the producer to preview and export. Do not auto-render an MP4 unless explicitly asked.

## Character limits are mandatory

Every on-screen text field has a maximum character count, fixed in the template's zod schema (also listed in its `GUIDANCE.md`, and shown as the `(used/limit)` column in `BREAKDOWN.md`), so the text always fits its frame. These are not suggestions:

- Never write copy that exceeds a field's limit; tighten the wording until it fits.
- If the producer asks for text longer than the limit, **push back**: state the limit, explain it is a frame-fit constraint, and offer either a trimmed version that fits or a roomier template from the scene library that can hold the longer copy. Never silently overflow a frame, and never raise or remove a template's limit to force text in.

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

Rendering is heavy and local, and it only happens AFTER the producer has approved the direction (the gate above). Once approved: save the project and tell the producer it is ready to open in Remotion Studio and export (`python script-pipeline/open-in-studio.py <courseId>-l<N>`). Render an MP4 to a file only if explicitly asked, then report the path. Report the lesson title, scene count, total length, and the templates used.

## Make the project self-contained

After writing the project, run `python script-pipeline/bundle-project.py
projects/<courseId>-l<n>`. It copies every referenced icon, the case-study logo,
each used template's assets, and narration.mp3 into the project's `public/`, so
the lesson renders anywhere with no missing-file errors. It exits non-zero if the
build referenced an asset that is not in the libraries (catch this, never ship it).

## Producer confirmation document (the gate artifact)

`python script-pipeline/scene-breakdown.py projects/<courseId>-l<n>` generates
`BREAKDOWN.md` , the full narration script laid over the scenes (transition points =
scene boundaries), with the template per scene, scene length, on-screen copy with its
`(used/limit)` character count, reveal beats, and flags (including any text over its
limit). This IS the sign-off gate from step 5: the producer reviews it against the
scene library (`TEMPLATE-CATALOG.html`) and approves each scene or asks for changes
before anything renders. See `PRODUCER.md` for the full review flow.
