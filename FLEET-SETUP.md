# Fleet setup , how the chat agent triggers a lesson build

Fleet is the controller. It cannot run code, so it does NOT build lessons itself.
It takes a request from Slack, drops the files into the repo, and triggers the
**Build Lesson** GitHub Action (`.github/workflows/build-lesson.yml`), which runs
the real pipeline. The build commits the finished project back to the repo; you
pull it and render locally.

The audio file is too large to pass through a chat agent, so Fleet does NOT carry
the files. Instead Fleet writes the Slack download LINKS into `request.json`
(small text), and the CI downloads the actual files from Slack using a bot token.

## What Fleet needs (one-time)

- **Slack app scope `files:read`** (so the bot can see attachment links). Adding a
  scope requires reinstalling the app.
- **GitHub secret `SLACK_BOT_TOKEN`** = the Lesson Bot's "Bot User OAuth Token"
  (`xoxb-...`, from api.slack.com/apps -> Lesson Bot -> OAuth & Permissions). The
  CI uses it to download the attachments. (The user adds this secret; never paste
  a token into chat.)
- **GitHub tools in the Toolbox:**
  - read a file / list contents (to read course memory in `projects/`)
  - create or update file (to write `request.json`)
  - **No dispatch tool is required.** Writing `request.json` auto-starts the build
    (the Action triggers on a push that adds `inputs/**/request.json`).
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
3. Get the download link of each attachment (the Slack `url_private_download` of
   the `.srt` and the `.mp3`). Do NOT try to commit the files themselves.
4. Write `request.json` to `inputs/<courseId>-l<n>/request.json` (this is the "go"
   signal that auto-starts the build), using the GitHub create-or-update-file tool:
     ```json
     {
       "course": "<exact course name>",
       "courseId": "<courseId>",
       "lessonNumber": "<n>",
       "lessonTitle": "<title>",
       "requirements": "<notes>",
       "model": "claude-sonnet-4-6",
       "srtUrl": "<url_private_download of the .srt>",
       "mp3Url": "<url_private_download of the .mp3>"
     }
     ```
   The Action triggers on this file, downloads the SRT and MP3 from those URLs
   using `SLACK_BOT_TOKEN`, then builds.
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
