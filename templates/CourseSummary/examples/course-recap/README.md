# Example, course recap (count variation)

Demonstrates the **1-6 recap count variation** that is intrinsic to this
template, with a 4-recap stack.

## Files

| File | What it is |
|---|---|
| `CourseSummary.example.tsx` | The authored scene: 4 recaps + the reveal sequence. |

## What it shows

With four recaps the pill band auto-centres on the canvas and each pill rolls
out from under the one above it, so the cascade reads as a single growing stack.
The reveal sequence schedules `setup` (the banner drop) then `pill0…pill3`;
`pill4`/`pill5` simply have no content and are never rendered.

The narration that drives it is linear, top-to-bottom, "First… then… next… and
finally…", matching the order the pills stack down the frame.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, recap count (1-6)".
