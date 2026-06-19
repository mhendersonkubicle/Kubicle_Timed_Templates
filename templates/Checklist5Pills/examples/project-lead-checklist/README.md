# Example, project-lead checklist

A 4-item responsibilities checklist with an icon hero, authored on the
reveal-sequence model.

## Files

| File | What it is |
|---|---|
| `ProjectLeadChecklist.example.tsx` | The authored scene: 4 responsibilities + the reveal sequence. |

(No MP4, this folder is a timing/layout reference only.)

## How the sequence maps

`setup` fades in the hero icon on the left (there is no empty-pill scaffold),
then `item0…item3` tick off one pill at a time. Each `item{i}` reveals a pill as
a single object, the pill fades up, its white circle slides left to its anchor,
the tick trim-reveals, and the label fades in, all cascading inside the step's
`in` window (1.7 s by default). Because a checklist is read top to bottom, the
reveal order is simply the list order, sync each `item{i}.at` to the narration
cue that ticks off that item.

The item count (1-6) is the built-in variation; this example uses 4. Drop or add
`item{i}` steps to match your `responsibilities` count.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules.
