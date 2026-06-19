---
name: sync
description: Keep the local git source and the render bench in agreement, so every refinement reaches BOTH local renders and the GitHub repo (and therefore CI). Use when the user types /sync, says "sync", "did my changes get pushed", "is the bench up to date", or right before a /save or a local render. Explain each step plainly; the user is learning by watching.
---

# /sync , keep source and bench in agreement

There are two copies of every template and tool on this machine:

- **SOURCE** (the git checkout, pushed to GitHub, used by CI):
  `templates/`, `script-pipeline/`, `.claude/skills/`, and the rule docs, all under the repo folder.
- **BENCH** (a disposable working copy, used only for local rendering/preview):
  `C:\Users\Mark\.cache\claude-remotion-bench\src`.

A refinement only reaches GitHub and CI if it lands in **SOURCE**. The classic
trap is editing a template *only* in the bench during a render session: it
previews fine locally but git and CI never see it, so local and GitHub drift.
`/sync` exists to make that impossible.

## Repo + bench facts

- Repo folder (SOURCE): the current working directory (a git checkout of
  `github.com/mhendersonkubicle/Kubicle_Timed_Templates`).
- Bench: `C:\Users\Mark\.cache\claude-remotion-bench` (holds one lesson at a time
  in `src/`, overwritten per build).
- The bench `src/` contains the current lesson's `lessonScenes.ts`, `Root.tsx`,
  and a COPY of each template `.tsx` it uses. Those template copies are what can
  drift from the source in `templates/<Name>/<Name>.tsx`.

## Modes

- **`/sync`** (default): check for drift, reconcile toward the user's intent, ask
  when direction is unclear, then remind to `/save`.
- **`/sync to-bench`**: copy current SOURCE templates/tools into the bench
  (refresh the bench before a local preview/render, so you preview what you'll push).
- **`/sync from-bench`**: pull bench template edits back into SOURCE (before a
  `/save`, so a bench-only tweak can't slip through unpushed).
- **`/sync check`**: report drift only; change nothing.

## The flow (default mode)

### 1. Find the drift

For each template `.tsx` in the bench `src/`, diff it against its source at
`templates/<Name>/<Name>.tsx`. Use `git`-style or `diff` output, but only
summarise (which files differ, and roughly what changed); don't dump huge diffs.
Also diff any `script-pipeline` tool or skill file the user says they edited.

Report plainly, for example:
> Two files differ between the bench and the source:
> - `SplitscreenPointsV1.tsx` , the bench copy has changes the source doesn't.
> - `Cards5Falling.tsx` , identical.

### 2. Decide direction per file

- The user refined **in the bench** (bench is newer / has the change) → copy
  **bench → source** (`templates/<Name>/<Name>.tsx`). This is the common case
  after a local render-and-tweak session.
- The user refined the **source** and wants to preview → copy **source → bench**.
- **Unclear** → show the diff and ask which side is correct. Never guess on a
  file with edits on both sides; surface it.

### 3. Reconcile toward SOURCE

Apply the copies. SOURCE is the thing that must end up correct, because that is
what gets pushed and what CI builds from. If a template lives in more than one
place that matters (for example a built lesson under `projects/<...>/src/`),
mention it so the user can decide whether that project record should also be
refreshed.

### 4. Remind to publish

After reconciling, say plainly:
> Source is now up to date. Run `/save` to push these refinements to GitHub so the
> next CI build uses them.

Do not auto-`/save`; let the user choose when to publish.

### 5. Confirm

List what was synced and in which direction.

## Safety

- Never delete a bench or source file as part of a sync; only copy/overwrite the
  drifting file in the chosen direction, and say which way.
- If a file differs on BOTH sides (genuine conflict), stop and show both; ask.
- `/sync` is about templates, tools, and skills (the shared SOURCE). It does not
  touch `node_modules`, caches, or rendered MP4s.

## Why this exists

Local refinements must stay compatible with GitHub/CI results. The render bench
is deliberately separate plumbing (CI uses the repo `harness/` instead), but both
build from the same SOURCE. Keeping SOURCE correct, then `/save`, is what holds
local and GitHub results identical. Related skill: `/save` (commit + push to main).
