# Fleet setup , how the chat agent triggers a lesson build

Fleet is the controller. It cannot run code, so it does NOT build lessons itself.
It takes a request from Slack, drops the files into the repo, and triggers the
**Build Lesson** GitHub Action (`.github/workflows/build-lesson.yml`), which runs
the real pipeline. The build commits the finished project back to the repo; you
pull it and render locally.

## What Fleet needs (one-time)

- **GitHub tools in the Toolbox:**
  - read a file / list contents (to read course memory in `projects/`)
  - create or update file (to commit the attachments AND the request.json)
  - **No dispatch tool is required.** Committing `request.json` auto-starts the
    build (the Action triggers on a push that adds `inputs/**/request.json`).
- **Slack tool** (already added) for intake and the status reply.
- A Slack channel (the intake), with the request template pinned.

## The request (what a teammate posts in Slack)

```
Build a lesson
Course: <exact course name>
Lesson number: <n>
Lesson title: <title>
Requirements: <optional notes, e.g. case study company>
```
plus the lesson's `.srt` and `.mp3` as attachments.

## What Fleet does with that request

1. Parse course name, lesson number, lesson title, requirements.
2. Derive `courseId` = course name lowercased, spaces to hyphens
   (e.g. "Marketing in Professional Services" -> `marketing-in-professional-services`).
3. Commit the two attachments into the repo (to `main`), using the GitHub
   create-or-update-file tool:
   - `inputs/<courseId>-l<n>/lesson.srt`
   - `inputs/<courseId>-l<n>/narration.mp3`
4. Commit a `request.json` into the SAME folder, **last** (it is the "go" signal
   that auto-starts the build):
   `inputs/<courseId>-l<n>/request.json`
     ```json
     {
       "course": "<exact course name>",
       "courseId": "<courseId>",
       "lessonNumber": "<n>",
       "lessonTitle": "<title>",
       "requirements": "<notes>",
       "model": "claude-sonnet-4-6"
     }
     ```
   The Action triggers on this file landing under `inputs/`, reads it, and builds.
5. Report back in Slack when the Action finishes: the lesson title, scene count,
   and "pull the repo and render locally in Remotion Studio".

## Trigger summary

- **Primary (no dispatch tool needed):** commit `request.json` -> push event ->
  build runs. This is what Fleet uses.
- **Alternative:** a `repository_dispatch` of type `build-lesson`, if Fleet has a
  dispatch/HTTP tool.
- **Manual:** GitHub Actions tab -> Build Lesson -> Run workflow (fill the fields).

## Model / cost

The Action's `model` defaults to `claude-opus-4-8`. For routine builds, pass
`claude-sonnet-4-6` in the client_payload (much cheaper; the deterministic timing
and icon work is unaffected by model choice). Keep a spend cap on the key.

## Memory / consistency (automatic)

Because every build reads and writes `projects/`, course identity (title + icon)
and template-variety history carry across lessons of the same course with no
manual step. See `.claude/skills/lesson-video-pipeline/SKILL.md`.
