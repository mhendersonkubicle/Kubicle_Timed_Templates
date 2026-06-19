# Example, "Product Strategist" (single-character introduction)

A worked example of CharacterProfileCard authored from a short single-person introduction script.

## Files

| File | What it is |
|---|---|
| `CharacterProfileCard.example.tsx` | The authored scene: content props + the reveal `sequence` and one re-mention pulse. |

No MP4 is rendered for this example.

## Why this fits the template

The script introduces **one** person by their **workplace role**, and reduces to a portrait, a short role, a one-line bio, and two countable stats, exactly the content model of CharacterProfileCard. It is delivered **linearly, top-to-bottom**: role, then verified status, then bio, then the stats in row order, then the call to follow. No element is described before its reveal. That is the narration shape the template requires (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1), so it needed no reprocessing.

## Narration → reveal sequence

Each step's `at` is the start time of the narration line that introduces it (scene-relative seconds; the scene starts at t=0, so SRT times map directly).

| Start | Narration | Reveal step |
|---|---|---|
| 0.2 s | "Meet our presenter." | `setup` (card pop-in, in 0.65) |
| 0.9 s | (portrait settles in) | `portrait` (0.9, in 0.65) |
| 1.6 s | "She's a Product Strategist," | `name` (1.6, in 0.5) |
| 2.0 s | "a verified voice in the field." | `badge` (2.0, in 0.4) |
| 2.5 s | "She helps early-stage teams ship faster and sharper." | `bio` (2.5, in 0.45) |
| 3.2 s | "With over twelve thousand followers" | `stat0` (3.2, in 0.4) |
| 3.6 s | "and ninety published posts." | `stat1` (3.6, in 0.4) |
| 4.2 s | "Follow along to keep up." | `follow` (4.2, in 0.5) |

## Re-mention pulse

At 6.5 s the narration circles back to the role ("…and that strategist mindset is exactly what early teams need"). The role row was revealed at 1.6 s, well over 2-3 s earlier, so a `pulses` entry `{ target: 'name', at: 6.5 }` gives it a brief, subtle brand pulse (~+5% scale over ~0.45 s) at the re-mention, drawing the eye back without re-animating it.

## Content choices

- `accentColor` is `#0496FF` (dodger blue), tinting the portrait backing, the verified tick, and the Follow button.
- Two stats (`followers`, `posts`) demonstrate the row; the count can be 1-3 (see the Variation section in [`../../GUIDANCE.md`](../../GUIDANCE.md)).

## Notes

- Fonts (Satoshi Bold / Medium) are not bundled, so text falls back to the system sans-serif; layout is unaffected.
- To render: supply this scene as the composition and copy the portrait `characters/female_midcareer_white.png` into `public/characters/`. All other glyphs are inline SVG, so there are no Template-Specific-Assets to copy. Render at ~8 s.
