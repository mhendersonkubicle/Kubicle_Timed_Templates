# Example, three-milestone timeline (count variation)

Demonstrates the **1-6 checkpoint count variation** that is intrinsic to this
template.

## Files

| File | What it is |
|---|---|
| `Timeline6Checkpoints.example.tsx` | The authored scene: 3 checkpoints + the reveal sequence. |

## What it shows

With three checkpoints the oxford-blue panel and track auto-shrink and
re-centre on the canvas, so the timeline wraps snugly with no empty space. The
blue fill grows from the left and reaches each circle exactly as that
checkpoint activates (circle pulse + recolor + check icon, then the
date → title → description cascade). The reveal sequence schedules `setup` then
`checkpoint0…checkpoint2`; `checkpoint3`/`checkpoint4`/`checkpoint5` simply have
no content and are never rendered.

The narration runs strictly in chronological order, January, then March, then
June, matching the left-to-right fill (see the inline comment in the example
for the cue times this maps to).

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, checkpoint count (1-6)".
