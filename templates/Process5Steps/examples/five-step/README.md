# Example, five-step process

The full 5-step layout, authored on the reveal-sequence model.

## Files

| File | What it is |
|---|---|
| `FiveStep.example.tsx` | The authored scene: 5 steps + the reveal sequence. |
| `five-step.mp4` | Rendered output, 1920×1080, ~9 s, no audio (timing/layout reference). |

## How the sequence maps

`setup` brings in the oxford-blue stage, then `step0…step4` reveal one chevron
at a time (chevron + icon + number + label as one object). Because a process is
linear, the reveal order is simply the step order, sync each `step{i}.at` to
the narration cue that introduces that step.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for selection and narration rules,
and [`../three-step/`](../three-step/) for the count variation.
