# SlideWipeTransitionPanel

A full-screen flat-colour panel that slides in from one edge to mask a scene
(outro) or slides off one edge to reveal a scene (intro), creating a hard-cut
wipe transition. This is the same mechanic used by the setup and outro panels
in `Carousel7PillsHorizontalV1`.

## Build type

Code-first (pure CSS transform). Fully recolourable via a `color` prop. No
PNG dependencies.

## Source template

`Carousel7PillsHorizontalV1` (the `introPanelX` / `outroPanelX` panels).

## Canvas behaviour

This is a **canvas-region component**: it covers the full 1920x1080 stage
(`position: absolute; left: 0; top: 0; width: 1920px; height: 1080px`).
Render it directly inside an `AbsoluteFill`, not inside a `<Place>` wrapper.
`pointerEvents` is `none` so it never blocks interaction.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames }` drives the wipe duration |
| `mode` | `'intro' \| 'outro'` | `'outro'` | Outro: panel slides IN to cover the canvas. Intro: panel slides OFF to reveal the canvas. |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'right'` | Edge the panel enters from (outro) or exits toward (intro) |
| `color` | `ColorVariant \| string` | `'#E6ECF2'` | Panel fill. Accepts COLORS keys (`'blue'`, `'pink'`, `'teal'`, etc.) or any hex. Default is PLATINUM_BLUE, matching the source template. |

## Variants

| mode | direction | What happens |
|---|---|---|
| `outro` | `right` | Panel enters from the right edge, slides left to cover the full canvas (matches Carousel7PillsHorizontalV1 outro) |
| `outro` | `left` | Panel enters from the left edge, slides right to cover the full canvas |
| `outro` | `down` | Panel enters from the bottom, slides up to cover |
| `outro` | `up` | Panel enters from the top, slides down to cover |
| `intro` | `right` | Panel starts covering the canvas, slides right to reveal the scene (matches Carousel7PillsHorizontalV1 setup) |
| `intro` | `left` | Panel starts covering, slides left to reveal |
| `intro` | `down` | Panel starts covering, slides downward to reveal |
| `intro` | `up` | Panel starts covering, slides upward to reveal |

## Animation

Uses `easeInOutCubic` (`Easing.inOut(Easing.cubic)`) matching the source
template exactly. The wipe duration is controlled by `reveal.inFrames`.

## Typical usage

```tsx
// Outro wipe: at the end of a scene, drop a platinum panel over the canvas.
<SlideWipeTransitionPanel
  frame={frame}
  reveal={{ startFrame: f(outroAt), inFrames: f(0.8) }}
  mode="outro"
  direction="right"
  color="#E6ECF2"
/>

// Intro wipe: at the start of a scene, slide the platinum panel off to reveal.
<SlideWipeTransitionPanel
  frame={frame}
  reveal={{ startFrame: f(setupAt), inFrames: f(0.6) }}
  mode="intro"
  direction="right"
  color="#E6ECF2"
/>
```
