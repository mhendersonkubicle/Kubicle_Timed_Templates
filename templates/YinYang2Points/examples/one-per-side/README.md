# Example, one sub-point per side (variation)

Demonstrates the **1-or-2 sub-points per side** option: each side carries a
single box instead of two.

## Files

| File | What it is |
|---|---|
| `OnePerSide.example.tsx` | The authored scene: one box per side + the reveal sequence. |
| `one-per-side.mp4` | Rendered output, 1920×1080, ~10 s, no audio (layout reference). |

## What it shows

When a side supplies one box (`leftBoxes` / `rightBoxes` of length 1), the
template centres a **single fixed-size box** under that side's title rather than
using the baked two-box scaffolding. The box is pixel-identical to one of the
paired boxes (same width, height, corner radius, shadow), and all caption/title
constraints are unchanged.

Each side decides independently, so asymmetric layouts (1 on one side, 2 on the
other) are also valid.

## Sequence note

Only `leftBox0` and `rightBox0` are scheduled. The `leftBox1` / `rightBox1`
targets are inert here, with no second box content they are simply never
rendered, so leaving them out of (or in) the sequence has no effect.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, one sub-point per side".
