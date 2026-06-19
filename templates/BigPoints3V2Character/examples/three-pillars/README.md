# Example, three pillar cards (standard layout)

Demonstrates the **standard fixed-3 team layout** for this template: three
presenter cards arriving one at a time in a left-to-right waterfall.

## Files

| File | What it is |
|---|---|
| `ThreePillars.example.tsx` | The authored scene: 3 cards + the reveal sequence. |

(No MP4, this is a layout/authoring reference only.)

## What it shows

Each card reveals as a single object: its dodger-blue backdrop pops in, the
character portrait and title fade up, the pill/sphere/number fade in, and the
subtopic types out, the whole cascade folded into one step's `in` window
(default 2.4 s). The sequence schedules `card0…card2` at the cue where each
person is introduced; `setup` is omitted because this template has no shared
scaffolding to reveal.

Note the content rules: each card uses a **different** character id so the trio
reads as a team, titles are parallel (three names), and each subtopic is a short
typewriter-safe phrase (≤30 chars).

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Narration rules" and
"Variation, none (fixed three)".
