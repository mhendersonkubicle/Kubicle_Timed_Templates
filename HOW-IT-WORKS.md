# How the lesson pipeline works

A self-serve, internal course-production pipeline. No Slack, no Fleet.

## The flow
1. **Submit** , a teammate opens the Netlify form (`submit-app/`), enters the
   course, lesson number, title, and requirements, and attaches the `.srt` + `.mp3`.
   Gated by a shared access code.
2. **Upload** , the files go straight to R2 storage; the form writes a
   `request.json` into `inputs/<courseId>-l<n>/` in this repo.
3. **Build** , committing `request.json` auto-starts the **Build Lesson** GitHub
   Action (`.github/workflows/build-lesson.yml`). It runs Claude Code with the
   `lesson-video-pipeline` skill: picks templates, derives on-beat SRT timing,
   resolves icons, bundles every asset into the project
   (`bundle-project.py`), and commits the finished project to `projects/`.
4. **Track** , the form's **Requests** tab lists every request and its status
   (Building -> Ready to render), with the collect command.
5. **Collect + render** , locally: `git pull`, then
   `python script-pipeline/open-in-studio.py <courseId>-l<n>`. It opens the lesson
   in Remotion Studio in your browser to preview and export the MP4. Rendering is
   always local; nothing renders in the cloud.

## Consistency / memory
Every build reads and writes `projects/`, so course identity (title + frozen
icon) and template-variety history carry across lessons of the same course
automatically. See `.claude/skills/lesson-video-pipeline/SKILL.md`.

## Setup
- Form deploy + storage + tokens: `submit-app/SETUP.md`.
- The repo `ANTHROPIC_API_KEY` secret powers the build (keep a spend cap).

## Not used anymore
Slack and Fleet were earlier attempts at the front door and were abandoned (a
chat agent can't run the build or carry multi-MB audio). The Netlify form
replaced them. Safe to delete any Slack app / Fleet agent; nothing here depends
on them. (Do not delete the in-repo `lesson-video-pipeline` skill, that is the
build's brain, not a Fleet artifact.)
