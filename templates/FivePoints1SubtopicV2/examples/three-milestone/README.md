# Example, three-milestone roadmap (count variation)

Demonstrates the **1-5 milestone count variation** that is intrinsic to this
template.

## Files

| File | What it is |
|---|---|
| `FivePoints1SubtopicV2.example.tsx` | The authored scene: 3 milestones + the reveal sequence. |

(No MP4 is committed, this example is a layout/timing reference only.)

## What it shows

With three milestones the card/tick column auto-centres vertically and the
dotted spine spans the first to the last tick, so fewer milestones still read
cleanly. The reveal sequence schedules `setup` then `card0/tick0` …
`card2/tick2`, one milestone at a time top-to-bottom (the card on the
introducing cue, its tick a beat later). `card3`/`tick3` and `card4`/`tick4`
simply have no content and are never rendered. As each tick fires, the blue
dotted overlay fills the spine down to it.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, milestone count
(1-5)".
