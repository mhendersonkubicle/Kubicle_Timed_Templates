# Example, course-module breakdown (5-pill count variation)

Demonstrates the **1-7 pill count variation** that is intrinsic to this
template, plus the full `setup → pill0..pillN-1 → outro` lifecycle.

## Files

| File | What it is |
|---|---|
| `Carousel7PillsHorizontalV1.example.tsx` | The authored scene: 5 pills + the reveal sequence. |

(No MP4 is bundled, this is a layout / sequence reference only.)

## What it shows

With five pills the conveyor sweeps across five stops rather than the full
seven, so the run is shorter but reads identically. The reveal sequence opens
on the platinum intro wipe (`setup`), then reveals `pill0…pill4` **contiguously**
in conveyor order, the camera parks on each pill at its `at` and the stamp bobs
as the label inks in, then closes on the platinum mask (`outro`). Because the
camera is a continuous pan, the pills are scheduled as a contiguous run with no
gaps; `pill5`/`pill6` simply have no content and are never rendered.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, pill count (1-7)".
