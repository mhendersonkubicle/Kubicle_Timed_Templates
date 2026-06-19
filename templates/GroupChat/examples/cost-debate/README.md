# Example, cost-debate (six-message conversation + pulse)

Demonstrates a realistic **3-8 message conversation** with the reveal-sequence
timing model, the two-sided `fromMe` look, and a **re-mention pulse**.

## Files

| File | What it is |
|---|---|
| `GroupChat.example.tsx` | The authored scene: six messages + the reveal sequence + one pulse. |

No MP4 is rendered here (layout reference only).

## What it shows

A five-person team weighs swapping to a smaller AI model. `setup` bounces the
chat frame up from below; then `message0…message5` reveal one at a time in
conversation order. Two of Robert's lines are `fromMe: true`, so they
right-align in dodger-blue bubbles with no avatar or typing pulse, while the
other speakers' lines come in left-aligned with a typing pulse first. As each
new message lands the feed scrolls up a row so the latest line stays in view.

The `pulses` entry gives `message1` (Margaret's quality concern) a brief brand
pulse at 10.2 s, the moment the narration circles back to it. With an empty
`pulses` array the scene renders identically minus that bump.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, message count (3-8)"
and "Re-mention pulse".
