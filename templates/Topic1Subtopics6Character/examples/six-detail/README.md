# Example, six-detail topic list

The full 6-row layout, authored on the reveal-sequence model.

## Files

| File | What it is |
|---|---|
| `SixDetail.example.tsx` | The authored scene: one topic, six details + the reveal sequence. |

## How the sequence maps

`setup` slides in the oxford-blue background and fades in the dodger-blue
character panel + portrait as one unit (the character is silent scaffolding,
not a narrated beat). `title` slides the header pill in. Then `row0…row5`
reveal one detail pill at a time, each pill's outline scales in, then its
caption types out. Because the list is a linear top-to-bottom waterfall, the
reveal order is simply the row order; sync each `row{i}.at` to the narration
cue that introduces that detail, and keep each row's `in` (~1.4 s) long enough
to cover both the scale and the typewriter.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules.
