# Example, four features (full point count)

Demonstrates the **1-4 point count variation** that is intrinsic to this
template, here at its maximum of four points.

## Files

| File | What it is |
|---|---|
| `CirclePoints4.example.tsx` | The authored scene: 4 points + the reveal sequence. |

(No MP4 rendered yet, this is a layout / authoring reference.)

## What it shows

With four points the circle row fills the frame and auto-centres via
`circleCxFor`. Each point reveals as one object: its circle pops in with a soft
pulse and its label fades in alongside. The reveal sequence schedules
`point0…point3`, one per narration cue, in left-to-right order. There is no
`setup` step, this template has no scaffolding to stage, so the blank canvas is
just the flat `#E6ECF2` fill.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, point count (1-4)".
