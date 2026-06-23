# CheckTickNode

A circular milestone node extracted from `FivePoints1SubtopicV2`. Two full-frame
(1920x1080) PNGs are layered: a base circle that pops in with an easeOutBack
overshoot, and a white checkmark glyph that wipes in left-to-right. Re-mention
pulse is supported via the `Reveal.pulseFrames` field.

## Build type

Asset-backed, canvas-region. The artwork cannot be reproduced in CSS (the circle
has a gradient and bevel baked into the PNG). The component occupies the full
1920x1080 stage: render it directly (not inside `<Place>`).

## Source template

`FivePoints1SubtopicV2` (`Milestone` inner component). Assets:

- `Template-Specific-Assets/FivePoints1SubtopicV2/tick_base.png`
- `Template-Specific-Assets/FivePoints1SubtopicV2/tick.png`

The character-variant path is `FivePoints1SubtopicV2Character/` but uses the same
two PNG filenames; swap the path prefix if you need the character variant's ticks.

## Props

| Prop     | Type     | Default | Description |
|----------|----------|---------|-------------|
| `frame`  | `number` | (required) | Current Remotion frame |
| `reveal` | `Reveal` | (required) | `{ startFrame, inFrames, pulseFrames? }` |
| `cy`     | `number` | `141`   | Canvas Y of the node centre (px). Use `cardCyFor(count, i)` from the source template to align with a FivePoints1SubtopicV2 layout. |

## Animation

- Circle layer: scale 0 to 1 with `easeOutBack` over the first 90% of `inFrames`,
  `transformOrigin` pinned at the node centre `(995px, 141px)` in the full-frame
  coordinate space (translated by `cy - 141`).
- Tick layer: left-to-right clipPath wipe over 30% to 100% of `inFrames`, eased
  with `easeInOutQuad`.
- Re-mention pulse: +5% scale half-sine over 0.45 s (13-14 frames at 30 fps),
  fires for each frame in `reveal.pulseFrames`.

## Variants

No colour variants. The artwork ships in one colour (dodger-blue circle, white
tick). To show multiple nodes at different vertical positions, render the component
once per node, each with a different `cy`.

## Usage example

```tsx
// Three nodes at the 3-milestone vertical centres used by FivePoints1SubtopicV2.
<CheckTickNode frame={frame} reveal={cue('tick0')} cy={340} />
<CheckTickNode frame={frame} reveal={cue('tick1')} cy={540} />
<CheckTickNode frame={frame} reveal={cue('tick2')} cy={740} />
```
