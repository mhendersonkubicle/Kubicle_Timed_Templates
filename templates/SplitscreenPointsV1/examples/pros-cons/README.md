# Example, pros vs cons (two-column comparison)

A two-sided comparison ("In the office" vs "Remote"), three pills per side,
authored on the reveal-sequence model with a side-complete linear cadence.

## Files

| File | What it is |
|---|---|
| `SplitscreenPointsV1.example.tsx` | The authored scene: both sides + the reveal sequence. |

(No MP4 is bundled, this example is a timing/layout reference only.)

## How the sequence maps

`setup` pans the dark right panel in to establish the splitscreen frame. Then
the **whole left side reveals first**, `leftTitle`, then `leftPill0…leftPill2`
top to bottom, before the right side starts with `rightTitle` and
`rightPill0…rightPill2`. Each pill is one object: the pill scales in and its
caption (plus optional icon) cascades from the same step. Sync each
`{side}Pill{i}.at` to the narration cue that introduces that point.

Because the comparison is side-complete, narration order equals reveal order:
finish one side fully before the other, and within a side go top to bottom.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules,
including the permitted parallel-cadence variant.
