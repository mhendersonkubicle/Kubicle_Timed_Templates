# Example, plan / build / launch

A three-band overview (Plan → Build → Launch), authored on the reveal-sequence model.

## Files

| File | What it is |
|---|---|
| `Points3Subtopics2.example.tsx` | The authored scene: 3 sections + the reveal sequence. |

## How the sequence maps

`setup` pans the Oxford-Blue panel in and fades in the left anchor icon. Then the
three bands reveal strictly top-to-bottom and band-complete: `title0` → `detail0a`
→ `detail0b` (blue), then `title1` → `detail1a` → `detail1b` (pink), then `title2`
→ `detail2a` → `detail2b` (yellow). Each title pill scales in; each detail shell
scales in and then types its line out within its own `in` window. Because the
content is a flat top-to-bottom list, the reveal order is simply the reading
order, sync each `at` to the narration cue that introduces that object.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules.
