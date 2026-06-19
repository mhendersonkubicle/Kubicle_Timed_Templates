# Example, three-step process (count variation)

Demonstrates the **2-5 step count variation** that is intrinsic to this
template.

## Files

| File | What it is |
|---|---|
| `ThreeStep.example.tsx` | The authored scene: 3 steps + the reveal sequence. |
| `three-step.mp4` | Rendered output, 1920×1080, ~6 s, no audio (layout reference). |

## What it shows

With three steps the chevron chain auto-centres on the canvas and the
light→dark gradient is re-spread across the three chevrons, so the "process
advances" reading still holds. The reveal sequence schedules `setup` then
`step0…step2`; `step3`/`step4` simply have no content and are never rendered.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, step count (2-5)".
