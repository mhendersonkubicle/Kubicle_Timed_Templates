# Example, department structure (1-4-3-4 shape)

Demonstrates the **shape variation** (1-5 rows × 1-4 boxes, uneven widths) that
is intrinsic to this template, plus a **re-mention pulse**.

## Files

| File | What it is |
|---|---|
| `OrgChart.example.tsx` | The authored scene: a 1-4-3-4 chart + the reveal sequence + one pulse. |

(No MP4 rendered, layout + sequence reference only.)

## What it shows

One top box (Executive Office) over three uneven rows (4, then 3, then 4
boxes). The stack auto-centres vertically and each row auto-centres
horizontally, so the differing row widths stay balanced. The reveal sequence
draws `setup` (the central spine) first as the scaffold, then `top`, then each
`node{r}_{c}` top-down and left-to-right, the per-row connector arriving with
the row's first box. A `pulses` entry gives the top box a brief brand pulse when
it is named again later in the narration; with `pulses` empty the chart renders
identically.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, shape (1-5 rows × 1-4 boxes)".
