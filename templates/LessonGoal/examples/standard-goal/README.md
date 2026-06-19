# Example, standard lesson goal opener

Demonstrates the **standard single-goal opener** on the fixed single-instance
layout.

## Files

| File | What it is |
|---|---|
| `StandardGoal.example.tsx` | The authored scene: one goal statement + the reveal sequence. |

## What it shows

The reveal sequence schedules `setup` (the decorative stripe sweeps up from the
bottom-left and fades in), then `heading` (the "Lesson Goal" eyebrow rises and
fades), then `goal` (the measurable goal statement rises and fades). The heading
keeps its default text, so no `heading` prop is passed. The goal is phrased as a
measurable outcome and wraps to 2-3 lines at 72 px.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Narration rules" and "Reveal
order (canonical)".
