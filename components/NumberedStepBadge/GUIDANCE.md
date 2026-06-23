# NumberedStepBadge

A circular dodger-blue gradient badge carrying a zero-padded ordinal integer (01, 02, ...). Extracted from Timeline5Tiles' numbered step circles. Sized via a prop so it works at any scale.

## Build type

Code-first. Pure CSS circle with an SVG-free inline gradient. No PNG assets required. Fully recolourable (gradient is a constant lifted from Timeline5Tiles; swap `CIRCLE_BG` to retint). Placement-agnostic: renders in its own box, wrap in `<Place>` to position on canvas.

## Source template

Timeline5Tiles (`CIRCLE_BG`, `CIRCLE_R = 63`, `fontWeight 800`, `fontSize 60`, `letterSpacing` from the Step sub-component).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame. |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` — the kit reveal contract. |
| `step` | `number` | required | The ordinal integer to display. Rendered zero-padded to 2 digits when < 10 (01, 02, ..., 09, 10, 11, ...). |
| `diameter` | `number` | `126` | Outer circle diameter in px. 126 matches Timeline5Tiles. 140 matches Flywheel petal circles. |

## Entrance animation

- Circle: scale 0 to 1 over the first ~35% of `inFrames`, using `easeOutBack(1.05)` for a subtle overshoot pop.
- Number: fades in (`easeOutQuad`) starting ~36% into the circle phase and completing near the end of the circle phase. The number appears to settle into the circle rather than pre-empting it.

## Re-mention pulse

Pass `pulseFrames` in the `Reveal` to trigger a brief +5% scale half-sine (0.45 s) via the kit `pulse()` helper. Matches Timeline5Tiles' `PULSE_AMP = 0.05` and `PULSE_DUR_S = 0.45`.

## Variants

No colour variants. The gradient is a brand constant. Resize freely via `diameter`.

## Example usage

```tsx
<Place x={996} y={400}>
  <NumberedStepBadge
    frame={frame}
    reveal={cue('step0')}
    step={1}
    diameter={126}
  />
</Place>
```
