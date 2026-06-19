# Example, three-tier pyramid (count variation + re-mention pulse)

Demonstrates the **2-5 tier count variation** that is intrinsic to this
template, plus an optional **re-mention pulse**.

## Files

| File | What it is |
|---|---|
| `ThreeTier.example.tsx` | The authored scene: 3 tiers, a reveal sequence, and one pulse. |

## What it shows

With three tiers the fixed triangular envelope divides into three taller,
broader slabs, and the light→dark gradient is re-spread so the apex stays
lightest and the base deepest. The reveal sequence schedules `setup` (the
envelope outline scales in) then `tier0…tier2` from the apex downward;
`tier3`/`tier4` simply have no content and are never rendered.

The narration re-mentions the apex tier a few seconds after its reveal, so a
single `pulse` on `tier0` gives it a brief brand bump at that cue without
re-animating it. Remove the `pulses` array and the scene renders identically.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, tier count (2-5)" and
"Re-mention pulse".
