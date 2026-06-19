# Example, three takeaways (icon anchors)

Demonstrates the standard **three-card big-points** layout under the
reveal-sequence timing model, with every card using an **icon** anchor.

## Files

| File | What it is |
|---|---|
| `BigPoints3V2.example.tsx` | The authored scene: 3 cards + the reveal sequence. |
| `three-takeaways.mp4` | Rendered output, 1920×1080, ~9 s, no audio (layout reference). |

## What it shows

Three pillar cards reveal one at a time, left to right. Each card runs its full
self-contained beat (container pop, then title + icon, then pill + sphere, then
the typewriter subtopic) inside its own `card{i}` reveal step. The sequence
schedules an optional no-op `setup` (this template has no scaffolding to reveal)
then `card0…card2`, each `at` taken from the narration cue that introduces that
card.

Swap any card's anchor to `{ kind: 'character', id }` to use a portrait instead
of an icon, the choice is per card.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, icon or character anchor".
