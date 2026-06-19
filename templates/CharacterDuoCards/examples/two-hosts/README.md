# Example, "Two hosts" (character duo introduction)

A worked example of CharacterDuoCards authored from a short two-person introduction script.

## Files

| File | What it is |
|---|---|
| `CharacterDuoCards.example.tsx` | The authored scene: content props + the reveal `sequence` (and a sample re-mention pulse). |

No MP4 is rendered for this example.

## Why this fits the template

The script is a **linear, one-person-at-a-time introduction**: it frames the pair in one line ("meet the two hosts"), then delivers the left person fully (the product strategist) before moving to the right (the head of design). No person is described before their card is on screen, and the two are never blended in one breath. That is exactly the narration shape CharacterDuoCards requires (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1), so it needed no reprocessing.

## Narration → reveal sequence

Each step's `at` is the start time of the narration line that introduces it (scene-relative seconds; the scene starts at t=0, so SRT times map directly).

| Start | Narration | Reveal step |
|---|---|---|
| 0.3 s | "Meet the two hosts of today's session." | `setup` (at 0.3, in 1.0), card shells stage in |
| 1.3 s | "First, our product strategist, who helps early-stage teams ship faster." | `card0` (1.3) |
| 4.5 s | "And alongside them, our head of design, who builds systems people love to use." | `card1` (4.5) |
| 7.2 s | "Back to our strategist for the roadmap…" (re-mention) | `pulses: card0` (7.2) |

## Content choices

- Titles are **roles, not names** ("Product Strategist", "Head of Design").
- Portraits are consistently-framed library presenters (NOT daniel/lena, which are off-scale).
- Accent colours use two of the three brand options (dodger blue, wild strawberry).

## Notes

- Fonts (Satoshi Bold / Medium) are not bundled, so text falls back to the system sans-serif; layout is unaffected.
- To render: supply this scene as the composition and copy the two character PNGs into `public/characters/`, then render at ~9 s.
