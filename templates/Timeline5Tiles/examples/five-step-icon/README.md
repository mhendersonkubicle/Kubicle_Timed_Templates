# Example, five-step process (icon anchor)

The full 5-step layout, authored on the reveal-sequence model with an icon
anchor on the left panel.

## Files

| File | What it is |
|---|---|
| `FiveStepIcon.example.tsx` | The authored scene: 5 steps + an icon anchor + the reveal sequence. |

## How the sequence maps

`setup` brings in the scaffolding (left panel slides in, the anchor icon fades
in, the right container fades up with its empty progress-bar track), then
`step0…step4` reveal one row at a time, numbered circle + typewritten phrase as
one object, and the progress bar advances `1/5` at each step. Because a process
is linear, the reveal order is simply the step order: sync each `step{i}.at` to
the narration cue that introduces that step, keeping `in` high enough (default
1.8 s) for the typewriter to finish.

The anchor (icon here) is decorative scaffolding set at `setup`; swap to a
character portrait with `anchor={{ kind: 'character', id }}` for a presenter
framing. It is never a narrated reveal beat.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules.
