# Kubicle Motion Video Templates

Turn a lesson's narration into a polished, multi-scene Remotion video , locally, with a human sign-off before anything renders.

You provide a subtitle file (`.srt`) and the audio (`.mp3`). Claude Code plans the scenes, shows you the exact **direction** it is taking (which template each scene uses, the script it covers, the scene length, the on-screen text and its character limits) plus a **visual library of every template**, and then waits for your confirmation. Only after you approve do you preview and export the video in Remotion Studio on your own machine. Nothing renders in the cloud.

## What you need

- **Node 20+** and **Python 3.10+**
- **[Claude Code](https://claude.com/claude-code)** (`npm i -g @anthropic-ai/claude-code`) with an Anthropic API key set
- **Chrome/Chromium** , Remotion uses it to render; it installs a headless build on first run

## Build a lesson (local, self-serve)

1. **Open the repo in Claude Code.** Clone or download this repository, then run `claude` from the repo folder.
2. **Add your files.** Put `lesson.srt` and `narration.mp3` into a folder under `inputs/` (for example `inputs/my-course-l1/`), or just attach them in chat.
3. **Ask Claude to build the lesson**, telling it the course name, lesson number, and lesson title. For example:
   > Build lesson 1 of "Requirements Documentation and Traceability", titled "The Strategic Value of Requirements". The SRT and MP3 are in `inputs/`.
4. **Review the direction.** Claude plans the scenes and shows you a breakdown: each scene's template, the narration it covers, its length, every on-screen line with its `(used/limit)` character count, and a link to the **scene library** (`TEMPLATE-CATALOG.html`, a rendered example of every template).
5. **Confirm or adjust.** Approve it, or ask for changes , swap a scene's template (pick one from the library), reword a line, retime a beat. **Character limits are enforced:** if you ask for text that is too long, Claude pushes back and offers either wording that fits or a roomier template. **Nothing renders until you approve.**
6. **Preview and export.** On approval, run the command Claude gives you:
   ```
   python script-pipeline/open-in-studio.py <your-lesson>
   ```
   It opens the lesson in Remotion Studio in your browser. Preview it, then export the MP4 locally.

## The scene library

Open **`TEMPLATE-CATALOG.html`** in any browser: a rendered example of all 42 templates, grouped by category, each with a one-line "use when". Use it to see what is available and to pick replacements during review. (A grey target glyph in an example just means that example referenced a placeholder icon; your lessons resolve real icons.)

Regenerate it any time (after adding or changing a template) with:
```
python script-pipeline/scene-catalog/build-catalog.py
```

## Map of the repo

- `templates/` , the 42 templates, with `SELECTION_INDEX.md`, `README.md` (the design rules), and a `GUIDANCE.md` + worked example per template.
- `TEMPLATE-CATALOG.html` , the rendered scene library.
- `script-pipeline/` , the deterministic tools (SRT timing, re-mention pulses, icon resolution, asset staging, the producer breakdown, `open-in-studio.py`).
- `projects/` , every built lesson, plus per-course identity memory (`<courseId>/course.json`).
- `.claude/skills/lesson-video-pipeline/SKILL.md` , the full build procedure Claude follows (including the confirmation gate).
- `PRODUCER.md` , the review / sign-off flow.
- `HOW-IT-WORKS.md` , an optional hosted self-serve form for teams (not needed for local use).

## How it stays consistent

Every build reads and writes `projects/`, so a course's title and top-left icon, and its template-variety history, carry across lessons of the same course automatically. Reveals are timed **on-beat** from the SRT, so each element appears on screen exactly when it is narrated. Rendering is always local.
