# Example, three-step process (count variation)

Demonstrates the **1-5 step count variation** that is intrinsic to this
template, authored on the reveal-sequence model with a presenter portrait.

## Files

| File | What it is |
|---|---|
| `ThreeStep.example.tsx` | The authored scene: a presenter + 3 steps + the reveal sequence. |

## What it shows

With three steps the right oxford-blue container auto-sizes and vertically
re-centres on the canvas, and the progress bar splits into thirds, so the
"step N of N" reading still holds with no empty space below the last step. The
reveal sequence schedules `setup` (which slides in the character panel and the
empty container together) then `step0…step2`; `step3` and `step4` simply have
no content and are never rendered.

## How the sequence maps

`setup` brings in the whole split-screen scaffolding, the presenter panel,
the matted portrait, and the empty right container with its empty progress-bar
track. Then `step0…step2` reveal one row at a time (numbered circle + typewritten
phrase + the bar advancing one 1/N segment as one object). Because a process is
linear, the reveal order is simply the step order, and the narration is
presenter-led, sync each `step{i}.at` to the cue that introduces that step.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules,
and "Variation, step count (1-5)" within it for the count behaviour.
