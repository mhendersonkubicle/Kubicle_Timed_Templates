# Example, decision tree (3-branch count variation + re-mention pulse)

Demonstrates the **2-5 branch count variation** intrinsic to this template,
plus a single **re-mention pulse**.

## Files

| File | What it is |
|---|---|
| `TreeDiagram4x2.example.tsx` | The authored scene: a 3-branch tree + the reveal sequence + one pulse. |

(No MP4 is rendered for this example.)

## What it shows

The hero panel (the root topic, "Choosing a Model") and the panel→trunk stub
stage in during `setup`. Then each branch reveals top-to-bottom, root-outward:
`branch0` (Cost), `branch1` (Latency), `branch2` (Quality). Each branch is one
object, its trunk segment, caption pill, junction lines and leaves all reveal at
that branch's cue.

The three branches carry **2, 1 and 3 leaves** respectively, showing the per-
branch leaf-count variation (1-3): rows auto-centre in the vertical band, the
trunk reaches each row, and leaf size/spacing scale so nothing overlaps.
`branch3`/`branch4` have no content and are never rendered.

The `pulses` entry gives `branch0` a brief, subtle brand pulse at `t=11.0`, the
moment the narration names "cost" again, drawing the eye back without re-
animating the branch. With an empty `pulses` array the scene renders identically
minus that bump.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, branch + leaf count"
and "Reveal order".
