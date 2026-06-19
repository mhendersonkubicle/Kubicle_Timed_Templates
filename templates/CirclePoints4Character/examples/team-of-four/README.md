# Example, team of four (full point count)

Demonstrates the **1-4 point count variation** that is intrinsic to this
template, here at its maximum of four portrait circles, plus the **setup
staging** and an optional **re-mention pulse**.

## Files

| File | What it is |
|---|---|
| `CirclePoints4Character.example.tsx` | The authored scene: 4 points + the reveal sequence + two re-mention pulses. |

(No MP4 rendered yet, this is a layout / authoring reference.)

## What it shows

With four points the circle row fills the frame and auto-centres via
`circleCxFor`. The `setup` step scales and fades the platinum background stage
in first, so the frame is never a static blank before the first portrait
lands. Each point then reveals as one object: its dodger-blue disc pops in with
a soft pulse, the head-and-shoulders portrait scales with it (clipped to the
disc), and its label fades in alongside. The reveal sequence schedules
`point0…point3`, one per narration cue, in left-to-right order.

The `pulses` array adds two re-mention pulses: when point0 (Strategy) and
point2 (Design) are named again later, their circles give a brief, subtle brand
pulse. Removing the `pulses` array leaves the scene rendering identically.

The `characterId` values (`presenter-red`, etc.) are placeholders, swap them
for real portrait PNGs from the shared `characters/` library, and tune
`characterHeight` / `characterY` per PNG so each face centres on its disc.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, point count (1-4)".
