# DarkRoundedPanel

## What it is

A general-purpose dark content stage: an oxford-blue rounded rectangle with the
exact gradient, shadow, and entrance animation from BigPoints3V1. Drop it onto
any canvas to host point lists, step lists, quiz panels, or any content that
needs a dark raised surface. Children render inside the panel with `overflow: hidden`.

## Build type

**Code-first.** Pure CSS: gradient, shadow, border-radius, and scale/opacity
animation. No PNG assets. Fully resizable and reusable anywhere on the canvas.

## Source template

`templates/BigPoints3V1/BigPoints3V1.tsx` (panel constants `PANEL_GRADIENT`,
`PANEL_SHADOW`, `PANEL_RADIUS`, `PANEL_HEIGHT`). The Timeline5Tiles and
Timeline6Checkpoints templates use the same surface pattern (auto-height and
360 px tall respectively).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `width` | `number` | `1804` | Panel width in px |
| `height` | `number` | `733` | Panel height in px |
| `borderRadius` | `number` | `40` | Corner radius in px |
| `top` | `number` | `274` | Top edge position in px (canvas-relative) |
| `children` | `ReactNode` | none | Content rendered inside the panel |

The panel is always centred horizontally on a 1920 px canvas
(`left = (1920 - width) / 2`).

## Entrance animation

Scale 0.93 to 1.0 (easeOutCubic) combined with opacity 0 to 1, over
`reveal.inFrames` frames. Re-mention pulses (`reveal.pulseFrames`) apply a
brief scale bump to the whole panel via the kit's `pulse()` helper.

## Typical usage

```tsx
import { DarkRoundedPanel } from '../components/DarkRoundedPanel/DarkRoundedPanel';

// In a template, after makeCue(TIMINGS):
<DarkRoundedPanel
  frame={frame}
  reveal={cue('panel')}
  width={1600}
  height={500}
  borderRadius={40}
  top={290}
>
  {/* place content here; position children absolutely within the panel */}
</DarkRoundedPanel>
```

## Variants

There are no discrete named variants. All dimensions (width, height, radius,
top) are numeric props, so any geometry is supported. The gradient and shadow
are fixed to the BigPoints3V1 brand values and are not overridable (keep the
visual language consistent).
