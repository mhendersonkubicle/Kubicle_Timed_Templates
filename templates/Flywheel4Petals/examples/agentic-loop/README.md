# Example, agentic loop (4-petal flywheel)

A worked example authored on the reveal-sequence model: a four-stage iterative
loop with realistic content plus the matching reveal sequence and one
re-mention pulse.

## Files

| File | What it is |
|---|---|
| `Flywheel4Petals.example.tsx` | The authored scene: 4 petals, a reveal sequence, and a pulse. |

## What it shows

The hub and a faint empty donut-ring scaffold scale in on `setup`, establishing
the wheel with motion before the first stage is narrated. The four petals then
reveal one at a time **clockwise from the top**, `petal0` (top) → `petal1`
(right) → `petal2` (bottom) → `petal3` (left), each fading its coloured fill in
and cascading its number → icon → label → body.

The `pulses` field carries one re-mention: when the narration loops back to
"Plans" to close the cycle (at 7.4 s), `petal0` gives a brief, subtle brand
pulse without re-animating. With an empty `pulses` array the scene renders
identically.

The count is variable (2-6); see [`../../GUIDANCE.md`](../../GUIDANCE.md) →
"Variation, petal count (2-6)". No MP4 is rendered.
