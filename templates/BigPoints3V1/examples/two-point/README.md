# Example, two-point recap (count variation)

Demonstrates the **2-3 point count variation** that is intrinsic to this
template.

## Files

| File | What it is |
|---|---|
| `BigPoints3V1.example.tsx` | The authored scene: 2 points + the reveal sequence. |

## What it shows

With two points the oxford-blue panel and the loading bar auto-size and stay
centred on the canvas, so there is no empty negative space drifting to one side.
The reveal sequence schedules `setup` then `point0…point1`; `point2` simply has
no content and is never rendered. The bar fill advances to the first column on
`point0`, then completes to 100 % on the last scheduled point (`point1`).

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, point count (2-3)".
