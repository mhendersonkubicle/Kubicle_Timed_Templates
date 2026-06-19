# Example, four-topic course agenda (count variation)

Demonstrates the **2-6 pill count variation** that is intrinsic to this
template, used as a guided course agenda.

## Files

| File | What it is |
|---|---|
| `FourTopic.example.tsx` | The authored scene: 4 pills + the reveal sequence. |

## What it shows

With four points the right-hand container and the left "covered" stack
auto-size and vertically centre, so the layout stays balanced rather than
stranded at the top of a 6-tall container. The reveal sequence schedules
`setup` then `pill0…pill3`; `pill4`/`pill5` simply have no content and are
never rendered.

Each pill enters the conveyor from the left, holds at centre to read (large
icon below it), then pans off the right while its faded copy materialises and
**persists** on the left stack, first topic at the top, matching list order.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, pill count (2-6)".
