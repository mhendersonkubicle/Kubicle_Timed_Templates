# Example, agenda, four bullets (count variation)

Demonstrates the **1-6 bullet count variation** that is intrinsic to this
template.

## Files

| File | What it is |
|---|---|
| `BulletList6Pills.example.tsx` | The authored scene: 4 bullets + the reveal sequence. |

## What it shows

With four bullets the pill stack auto-centres vertically on the canvas. The
reveal sequence schedules `setup` (the four empty pills scale/fade in together)
then `pill0…pill3`, each typing its label on at its own cue; `pill4`/`pill5`
simply have no content and are never rendered. Narration runs strictly
top-to-bottom, one bullet at a time.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, bullet count (1-6)".
