# Example, "You vs Me"

A worked example of YinYang2Points authored from a real narration track.

## Files

| File | What it is |
|---|---|
| `YouVsMe.example.tsx` | The authored scene: content props + the reveal `sequence` + the narration audio. |
| `narration.srt` | Source subtitle file the timing was derived from. |
| `narration.mp3` | Narration audio (ElevenLabs), muxed into the render. |
| `you-vs-me.mp4` | Rendered output, 1920×1080, ~20 s, with audio. |

## Why this fits the template

The script is a **linear, side-complete comparison**: it covers everything about "You" (pizza, then sweet things) before moving to "Me" (spicy food, then cheese & crackers), then wraps up. No sub-point is compared across sides in the same breath. That is exactly the narration shape YinYang2Points requires (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1), so it needed no reprocessing.

## SRT → reveal sequence

Each step's `at` is the start time of the SRT cue that introduces it (scene-relative seconds; the scene starts at t=0, so SRT times map directly).

| Cue | Start | Narration | Reveal step |
|---|---|---|---|
| 1 | 0.0 s | "the difference between you and I" | `setup` (at 0.3, in 2.0) |
| 2 | 2.6 s | "First, you like pizza…" | `leftTitle` "You" (2.6) + `leftBox0` Pizza (3.3) |
| 4 | 8.1 s | "You also like sweet things… sugar is bad" | `leftBox1` Sweet things (8.1) |
| 5 | 12.9 s | "I like spicy things." | `rightTitle` "Me" (12.9) + `rightBox0` Spicy food (13.5) |
| 6 | 14.3 s | "And I like cheese and crackers." | `rightBox1` Cheese plate (14.3) |
| 7 | 15.9 s | "…what makes us unique." (wrap-up) | none, scene holds |

## Icon choices

Picked from the shared `Icons/` library (business/tech-themed, so food matches are approximate):

- Pizza → `delivery-pizzadelivery-light` (clear pizza slice)
- Sweet things → `goals-for-the-year-nojunkfood-light` (junk-food motif; also nods to "sugar is bad for you")
- Spicy food → `laboratory-flame-light` (flame = heat)
- Cheese plate → `hospitality-food-light` (generic food/groceries)

## Notes

- Fonts (Inter ExtraBold / Satoshi Bold) are not bundled, so text falls back to the system sans-serif; layout is unaffected.
- To re-render: supply this scene as the composition, copy the four icons into `public/icons/` and `narration.mp3` into `public/`, then render at ~20 s.
