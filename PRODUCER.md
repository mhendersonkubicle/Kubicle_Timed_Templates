# Producer approval flow

How a built lesson is reviewed and signed off before it is rendered and published.
The goal: a producer can approve the plan from the script, without reading code.

## The artifact , `BREAKDOWN.md`

Every build generates `projects/<courseId>-l<n>/BREAKDOWN.md` via
`script-pipeline/scene-breakdown.py`. It lays the **full narration script over the
scenes**, so you see exactly where each scene transitions and what carries it.

Per scene it shows:
- Scene number, **template**, time range, duration.
- The **verbatim script segment** for that scene (the transition points are the
  scene boundaries).
- **On screen** , the copy that actually appears.
- **Reveals** , each element and the second it appears (the on-beat timing).
- **Flags** , anything to scrutinise: a long static lead-in/tail, a scene too
  sparse for its length, or re-mention pulses present.
- An **Approve** line with room for change requests.

Header: lesson title, total runtime, scene count, course identity, the full
template list (variety at a glance), and a one-line "preview locally" command.

## The flow

1. **Build** runs → `BREAKDOWN.md` is generated and committed with the project.
2. **Review** , the producer reads `BREAKDOWN.md`: does each scene's template and
   on-screen copy land the point being spoken? Are the scene transitions in the
   right places? Is the template variety sensible? Do the flags reveal anything?
3. **Approve, or request changes per scene** , e.g. "scene 6: split this beat",
   "scene 3: wrong template", "scene 8: reword bullet 2".
4. If changes: adjust (or rebuild) the affected scenes, regenerate the breakdown,
   repeat.
5. **On approval:** preview in Remotion Studio (`open-in-studio.py`), then render
   and deliver.

## What makes the review fluid (the extras)

- **Script-aligned** , the producer reviews against the actual narration, not code
  or jargon.
- **Per-scene approve + change line** , granular sign-off and structured change
  requests that map straight back to a scene.
- **Self-reported flags** , the build surfaces its own timing/sparsity issues, so
  the producer does not have to hunt for them.
- **One-command preview** , `python script-pipeline/open-in-studio.py <id>`.
- **Variety + identity at a glance** , catch template over-use or course-identity
  drift in the header.
- **Regenerable** , re-run `scene-breakdown.py` after any edit to refresh it.

## Where it is generated

- **CI build:** a workflow step runs `scene-breakdown.py` after assembly, so
  `BREAKDOWN.md` lands in the repo with the project.
- **Local build:** run `python script-pipeline/scene-breakdown.py projects/<id>`.
- **Next step (optional):** surface `BREAKDOWN.md` in the Requests portal so a
  producer can read and approve it in the browser.

See also: `.claude/skills/lesson-video-pipeline/SKILL.md` (the build spec),
`templates/README.md` (the visual rules), `HOW-IT-WORKS.md` (the system overview).
