# Example, three-card sequence (count variation)

Demonstrates the **1-5 card count variation** that is intrinsic to this
template, plus the single-focus derived-exit timing.

## Files

| File | What it is |
|---|---|
| `ThreeCard.example.tsx` | The authored scene: 3 cards + the reveal sequence. |

(No MP4 is committed for this example; it is a code/layout reference.)

## What it shows

With three cards, only `card0…card2` are scheduled; `card3`/`card4` have no
content and are never rendered. Each card reuses the same centred slot, so the
shorter list just produces a shorter sequence with no layout reflow.

Exit is derived from successor cues: `card0` falls out when `card1` fires
(5.0 s), `card1` falls out when `card2` fires (7.5 s), and `card2`, the last
scheduled card, persists to the end. Only one card is ever on screen at a time.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, card count (1-5)".
