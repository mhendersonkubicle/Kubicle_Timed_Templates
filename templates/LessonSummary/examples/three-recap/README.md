# Example, three-recap summary

A 3-recap lesson summary, authored on the reveal-sequence model (the 1-5 count
variation, here at 3 pills).

## Files

| File | What it is |
|---|---|
| `ThreeRecap.example.tsx` | The authored scene: 3 recaps + the reveal sequence. |

## How the sequence maps

`setup` fades in the background, `title` brings in the locked "Lesson Summary"
headline, then `pill0…pill2` reveal one recap row at a time (row PNG + caption
as one object). Because a recap is read top-to-bottom, the reveal order is
simply the stack order, sync each `pill{i}.at` to the narration cue that
introduces that takeaway. With 3 of 5 pills the title + stack auto-centre as a
group.

No MP4 is rendered for this example, it is a timing/layout reference in code.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules.
