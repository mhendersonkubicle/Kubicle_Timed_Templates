# Example, "Sprint check-in" (two-character text thread)

A worked example of TextThread2Characters authored from a short two-person exchange, on the reveal-sequence model.

## Files

| File | What it is |
|---|---|
| `TextThread2Characters.example.tsx` | The authored scene: content props + the reveal `sequence` + one re-mention pulse. |

No MP4 is rendered for this example.

## Why this fits the template

The script is a **linear, two-person back-and-forth**: one short line per turn, sent in order, alternating between Maya (left) and her lead (right). Each bubble is read in send order, none described before it is on screen. That is exactly the narration shape TextThread2Characters requires (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1), so it needed no reprocessing.

## Narration → reveal sequence

Each step's `at` is the start time of the narration line that delivers that message (scene-relative seconds; the scene starts at t=0, so SRT times map directly).

| Start | Narration | Reveal step |
|---|---|---|
| 0.2 s | "Maya checks in with her lead over text." | `setup` (at 0.2, in 0.9), the thread frame |
| 1.0 s | "Are we still on track for Friday's demo?" | `message0` (left, pink) |
| 2.8 s | "Yep, two stories left, both in QA." | `message1` (right, blue) |
| 4.6 s | "Need anything from me before then?" | `message2` (left) |
| 6.4 s | "Sign-off on the dashboard mockups would help." | `message3` (right) |
| 8.2 s | "On it tonight." | `message4` (left) |
| 10.0 s | "Perfect, thanks Maya." | `message5` (right) |
| 12.5 s | "...the Friday demo is locked in." | pulse on `message0` |

## Re-mention pulse

The opening line (the Friday demo, `message0`) is referenced again at 12.5 s, well after it landed. Instead of re-animating the bubble, `timings.pulses` gives it a brief brand pulse (~+5 % over ~0.45 s) at that timestamp to draw the eye back. With `pulses` empty the scene renders identically.

## Character choices

Picked from the shared `characters/` library:

- Left speaker (Maya) → `female_earlycareer_white`
- Right speaker (her lead) → `male_middleage_black`

Both render at the same fixed framing; swapping a speaker is just changing the id.

## Notes

- Fonts (Satoshi Bold / Medium) are not bundled, so text falls back to the system sans-serif; layout is unaffected.
- To render: supply this scene as the composition and copy the two character PNGs into `public/characters/`, then render at ~15 s.
