# Project instructions , Kubicle Motion Video Templates

This repo turns a lesson's subtitles (`.srt`) + narration (`.mp3`) into a multi-scene Remotion video, built and exported locally. A fresh clone is self-serve: the user drops in an SRT + MP3 and you carry them through to a rendered lesson, with a confirmation gate in the middle.

## When the user provides an SRT + MP3 (or asks to build a lesson)

Follow the `lesson-video-pipeline` skill at `.claude/skills/lesson-video-pipeline/SKILL.md`. The flow, in short:

1. **Confirm the request.** You need: course name, lesson number, lesson title, the SRT + MP3, and any requirements. Ask for whatever is missing before starting.
2. **Plan and build the composition.** Segment the SRT into scenes, pick the best-fit template per scene, fit each scene's on-screen copy within that template's character limits, resolve every icon to a real id, derive on-beat timing, and write the composition. Then `bundle-project.py` to make it self-contained.
3. **Generate the DIRECTION.** Run `python script-pipeline/scene-breakdown.py projects/<courseId>-l<N>` to write `BREAKDOWN.md`.
4. **GATE , share and wait.** Show the user the direction (the `BREAKDOWN.md` contents) AND link the scene library: `TEMPLATE-CATALOG.html` at the repo root, a rendered example of every template. Ask them to approve, or to change any scene's template, on-screen text, or timing. **Do NOT render, hand off, or call the lesson finished until they explicitly confirm.** Apply changes, regenerate the direction, and re-share until approved.
5. **On approval, hand off to render.** `python script-pipeline/open-in-studio.py <courseId>-l<N>` opens it in local Remotion Studio to preview and export. Never auto-render an MP4 unless explicitly asked.

## Hard rules

- **Character limits are mandatory.** Every on-screen text field has a max set by the template's schema (also in its `GUIDANCE.md`, and shown as the `(used/limit)` column in `BREAKDOWN.md`). If the user asks for longer text, push back: state the limit, and offer either trimmed wording that fits or a roomier template from the scene library. Never overflow a frame, and never raise or remove a limit to force text in.
- **Reveals are on-beat.** Each element appears exactly when its phrase is narrated. Never front-load openers, never even-spread, never clamp a reveal earlier than its beat. Dead air is fixed by template selection or splitting a scene, not by re-timing. (Full detail in the skill and `templates/README.md`.)
- **Course identity is consistent.** A course's `courseTitle` and top-left icon are identical across every lesson; reuse `projects/<courseId>/course.json` verbatim, never re-derive.
- **Never guess an icon id.** Resolve every icon through `script-pipeline/icons` and validate it.
- **No em dashes** anywhere (prose, code comments, on-screen text). Use commas, colons, or parentheses.
- **Rendering is always local.** Nothing renders in the cloud; you deliver to Remotion Studio for the user to export.

## Where things are

- Scene library (rendered catalog of all templates): `TEMPLATE-CATALOG.html`
- Templates, rules, and per-template guidance: `templates/` (`SELECTION_INDEX.md`, `README.md`, each `GUIDANCE.md`)
- Deterministic tools: `script-pipeline/`
- Built lessons + course memory: `projects/`
- The build procedure: `.claude/skills/lesson-video-pipeline/SKILL.md`
- The review / sign-off flow: `PRODUCER.md`
- Optional hosted self-serve form for teams: `HOW-IT-WORKS.md`
