# Example, product team (four members + a re-mention pulse)

Demonstrates the **2-6 member count variation** that is intrinsic to this
template, plus a **re-mention pulse**.

## Files

| File | What it is |
|---|---|
| `CharacterTeamCard.example.tsx` | The authored scene: 4 members + the reveal sequence + one pulse. |

(No MP4 rendered, layout + timing reference only.)

## What it shows

With four members the portrait panel auto-divides into four equal slots filling
its width, and every character is sized identically, so the team reads as one
balanced portrait. The reveal sequence stages `setup` first (the card frame,
portrait panel and the team text chrome, title / badge / bio / stats / Follow,
all stage in together), then `member0…member3` each step into place at their
own cue, one at a time in reading order.

A single `pulses` entry bumps `member0` at 7.4 s, when the team lead is named
again later in the narration, a brief +5% scale pulse that draws the eye back
without re-animating the whole portrait.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, member count (2-6)"
and "Reveal order".
