# Example, three-tile carousel (count variation)

Demonstrates the **2-5 tile count variation** that is intrinsic to this
template, on the reveal-sequence timing model.

## Files

| File | What it is |
|---|---|
| `ThreeTile.example.tsx` | The authored scene: 3 tiles + the reveal sequence (and a sample pulse). |

No MP4 is rendered (layout / timing reference only).

## What it shows

With three tiles the coverflow ring auto-sizes to the count and the centre-index
logic cycles through `tile0 → tile1 → tile2`, one at a time. The reveal sequence
schedules `setup` (the perspective stage fades + scales in) then `tile0…tile2`;
`tile3`/`tile4` simply have no content and are never rendered. Because the tiles
are **transient** (centre-focused), only the centred card and its immediate
neighbours mid-slide are ever on screen.

The `pulses` entry illustrates the re-mention-pulse field shape. With an empty
`pulses` array the template renders identically; a pulse only reads while its
tile is the centred card.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, tile count (2-5)".
