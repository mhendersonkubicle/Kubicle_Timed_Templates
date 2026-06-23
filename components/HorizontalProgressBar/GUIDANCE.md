# HorizontalProgressBar

## What it is

A pill-shaped horizontal progress bar with a dark track and an animated dodger-blue fill. Extracted from the BigPoints3V1 loading-bar geometry and colours. Two animation modes: continuous (fills to a given fraction) and segmented (fills in equal steps, one step per reveal cue).

**Build type:** code-first (pure CSS). Fully recolourable and resizable via props. Placement-agnostic: renders in its own box; wrap in `<Place x y>` to position on the canvas.

**Source template:** BigPoints3V1

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame. |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` for entrance + pulse. |
| `width` | `number` | required | Total track width in px. |
| `height` | `number` | `51` | Track height in px. Use `51` for BigPoints3V1 bars, `44` for Timeline5Tiles bars. |
| `fill` | `number` | `1` | Continuous mode only. Target fill fraction (0..1). The bar animates from 0 to this fraction across the reveal entrance. |
| `segmentIndex` | `number` | - | Segmented mode. Zero-based index of the current step. |
| `segmentCount` | `number` | - | Segmented mode. Total number of equal steps (N). |
| `trackColor` | `string` | `#052438` | Track background colour. |
| `fillGradient` | `string` | dodger-blue gradient | CSS `background` value for the fill div. |

## Variants

- **Continuous mode:** pass `fill` (0..1). The bar animates from empty to the given fraction using easeInOutCubic across `reveal.inFrames`. Use this when a single bar advances to a specific progress value.
- **Segmented mode:** pass `segmentIndex` and `segmentCount`. The bar fills in N equal steps. Each step's reveal cue drives the fill from `i/N` to `(i+1)/N` with easeInOutCubic. Pair one bar per cue and increment `segmentIndex` at each step, matching BigPoints3V1's per-column advance pattern.

## Colours

Track: `#052438` (BigPoints3V1 `BAR_TRACK_COLOR`). For a slightly lighter track on a segmented variant, override with `#024B80`.
Fill: `linear-gradient(180deg, #48B2FF 0%, #0496FF 100%)` (BigPoints3V1 `BAR_FILL_GRADIENT`).

## Cap behaviour

The fill `div` has `min-width = height` so the rounded left cap always shows at any nonzero fill value. At exactly 0 the fill `div` is hidden entirely.

## Entrance and pulse

- The whole bar fades in with `appear()` using `easeOutCubic` across `reveal.inFrames`.
- Re-mention pulses are supported via `pulse()`: the bar briefly scales up (+6%) when the narration re-mentions it.
- Transform origin is `left center` so the scale pulse anchors to the left edge.
