# Example, "Reading skills" (two linked points)

A worked example of ComparativePoints2 authored from a short two-point linkage script.

## Files

| File | What it is |
|---|---|
| `ComparativePoints2.example.tsx` | The authored scene: content props + the reveal `sequence`. |

No MP4 is rendered for this example.

## Why this fits the template

The script is a **linear, two-point linkage**: it names the relationship in one line ("two reading skills that work together"), then delivers the left point fully (word recognition) before moving to the right (working memory). No point is described before its shell is on screen, and the two captions are never blended in one breath. That is exactly the narration shape ComparativePoints2 requires (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1), so it needed no reprocessing.

## Narration → reveal sequence

Each step's `at` is the start time of the narration line that introduces it (scene-relative seconds; the scene starts at t=0, so SRT times map directly).

| Start | Narration | Reveal step |
|---|---|---|
| 0.4 s | "Two reading skills that work together." | `setup` (at 0.4, in 2.4) |
| 2.8 s | "First, word recognition, reading each word on sight." | `leftPoint` (2.8, in 1.4) |
| 6.0 s | "And it links to working memory, holding those words in mind." | `rightPoint` (6.0, in 1.4) |

## Icon choices

Picked from the shared `Icons/` library:

- Word recognition → `vocabulary` (reading / words motif)
- Working memory → `strong-mind` (mind / cognition motif)

## Notes

- Fonts (Satoshi Bold) are not bundled, so text falls back to the system sans-serif; layout is unaffected.
- To render: supply this scene as the composition, copy the two icons into `public/icons/` and the four PNGs from `Template-Specific-Assets/` into `public/Template-Specific-Assets/`, then render at ~8 s.
