# Fleet setup , how the chat agent triggers a lesson build

Fleet is the controller. It cannot run code, so it does NOT build lessons itself.
It takes a request from Slack, drops the files into the repo, and triggers the
**Build Lesson** GitHub Action (`.github/workflows/build-lesson.yml`), which runs
the real pipeline. The build commits the finished project back to the repo; you
pull it and render locally.

## What Fleet needs (one-time)

- **GitHub tools in the Toolbox:**
  - read a file / list contents (to read course memory in `projects/`)
  - create or update file (to commit the Slack attachments)
  - a "dispatch" / "trigger workflow" tool (to start the Action). If your GitHub
    connector lacks one, see "If Fleet can't dispatch" below.
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
3. Save the two attachments into the repo at
   `inputs/<courseId>-l<n>/lesson.srt` and `inputs/<courseId>-l<n>/narration.mp3`
   (using the GitHub create-or-update-file tool, committed to `main`).
4. Trigger the Build Lesson Action via a **repository_dispatch** event:
   - event type: `build-lesson`
   - client_payload:
     ```json
     {
       "course": "<exact course name>",
       "courseId": "<courseId>",
       "lessonNumber": "<n>",
       "lessonTitle": "<title>",
       "inputsDir": "inputs/<courseId>-l<n>",
       "requirements": "<notes>",
       "model": "claude-sonnet-4-6"
     }
     ```
   (POST `https://api.github.com/repos/mhendersonkubicle/Kubicle_Timed_Templates/dispatches`.)
5. Report back in Slack when the Action finishes: the lesson title, scene count,
   and "pull the repo and render locally in Remotion Studio".

## If Fleet can't dispatch

If your GitHub connector has no "dispatch / run workflow" tool, fall back to either:
- Fleet posts "inputs committed, ready to build" in Slack, and a human clicks
  **Run workflow** in the GitHub Actions tab (filling the same fields), or
- add a small generic HTTP tool to Fleet so it can POST the dispatch call above.

## Model / cost

The Action's `model` defaults to `claude-opus-4-8`. For routine builds, pass
`claude-sonnet-4-6` in the client_payload (much cheaper; the deterministic timing
and icon work is unaffected by model choice). Keep a spend cap on the key.

## Memory / consistency (automatic)

Because every build reads and writes `projects/`, course identity (title + icon)
and template-variety history carry across lessons of the same course with no
manual step. See `.claude/skills/lesson-video-pipeline/SKILL.md`.
