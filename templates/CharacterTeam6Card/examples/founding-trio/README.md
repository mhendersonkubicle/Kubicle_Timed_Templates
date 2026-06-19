# Example, "Founding Trio" (3-member count variation)

A worked example of CharacterTeam6Card authored from a short team-introduction script, showing the 2-6 member count variation at 3 members.

## Files

| File | What it is |
|---|---|
| `CharacterTeam6Card.example.tsx` | The authored scene: content props + the reveal `sequence` (and two re-mention pulses). |

No MP4 is rendered for this example.

## Why this fits the template

The script introduces a **group of three people who share one identity** (one team name, one bio, one set of stats), each reducible to a portrait + a short role label. It names them in **reading order, one at a time**, then closes with the shared group meta. That is exactly the linear, member-by-member shape CharacterTeam6Card requires (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1), so it needed no reprocessing.

With only 3 members the portrait row auto-fills the panel (each slot is `PORTRAIT_W / 3` wide), so the team still reads as one centred, balanced unit.

## Narration → reveal sequence

Each step's `at` is the start time of the narration line that introduces it (scene-relative seconds; the scene starts at t=0, so SRT times map directly).

| Start | Narration | Reveal step |
|---|---|---|
| 0.3 s | (card stages in) | `setup` (at 0.3, in 0.6) |
| 1.2 s | "Priya leads product." | `member0` |
| 2.2 s | "Marcus runs engineering." | `member1` |
| 3.2 s | "And Sofia owns design." | `member2` |
| 4.4 s | "They are our founding trio," | `title` |
| 5.2 s | "three of us shipping the whole product." | `bio` |
| 6.2 s | (followers / posts land) | `stats` |
| 7.0 s | (Follow button lands) | `follow` |

## Re-mention pulses

The closing line names two already-revealed members again, each gets a brief brand bump:

| Time | Re-mention | Pulse target |
|---|---|---|
| 8.4 s | "…Priya's roadmap…" | `member0` |
| 9.0 s | "…the design work…" | `member2` |

## Notes

- Fonts (Satoshi) are not bundled, so text falls back to the system sans-serif; layout is unaffected.
- To render: supply this scene as the composition and copy the three character PNGs into `public/characters/`, then render at ~10 s.
