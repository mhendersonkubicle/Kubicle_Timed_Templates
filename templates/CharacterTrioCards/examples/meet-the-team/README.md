# Example, meet the team (3-card trio + re-mention pulses)

The canonical **trio of 3 cards**, authored from a team-introduction script,
showing the reveal sequence and a couple of re-mention pulses.

## Files

| File | What it is |
|---|---|
| `CharacterTrioCards.example.tsx` | The authored scene: 3 cards + the reveal sequence + 2 pulses. |

(No MP4 rendered.)

## What it shows

The empty card shells rise in during `setup`, then each card fills in left to
right (`card0…card2`), one at a time, so a card is fully introduced before the
next begins. Inside each card the portrait settles, then the title, verified
tick, bio, stats and Follow button cascade within that card's own `in` window.

Two `pulses` fire later in the narration: when the **Product Strategist**
(`card0`) and the **Engineering Lead** (`card2`) are named again, each gives a
brief, subtle brand pulse at the re-mention's cue time, drawing the eye back
without re-animating the whole card. With an empty `pulses` array the scene
renders identically.

To run the **2-card** variation instead, supply 2 cards and schedule `setup`,
`card0`, `card1`; the pair auto-centres on the canvas.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, card count (2-3)" and
"Narration rules".
