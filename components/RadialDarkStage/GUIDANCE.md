# RadialDarkStage

Full-canvas dark radial gradient backdrop that irises in from the centre over a platinum base, establishing the oxford-blue-to-black field used behind any dark-theme content.

Lifted directly from the `AIWorkflowDiagramV1` "setup" beat. Identical geometry, colours, and easing. This component isolates that intro device so any template or composition can reuse it without duplicating the animation logic.

## Build type

**Code-first.** Pure CSS and inline SVG. No PNG dependencies. Fully reusable and resizable.

## Canvas region

This is a **canvas-region component**. It renders at `position: absolute; inset: 0` and covers the full 1920x1080 stage. Render it directly inside an `AbsoluteFill`, not inside a `<Place>` wrapper. Layer content components on top of it.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame (from `useCurrentFrame()`). |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }`. Controls when the iris starts and how long it takes. `inFrames: 18-24` (0.6-0.8 s at 30 fps) matches the source template's pacing. |
| `dotGrid` | `boolean` | `false` | When true, overlays a faint white 32x18 dot matrix (r=1.2 circles, group opacity 6%) that fades in during the back half of the iris window. |

## Animation

1. At `startFrame` the platinum base (`#E6ECF2`) is visible and the radial layer is at `scale(0)`.
2. Over `inFrames` the oxford-blue-to-black radial gradient scales `0 -> 1` via `easeInOutCubic`, centred on `transformOrigin: center center`.
3. When `dotGrid=true` the dot grid opacity ramps from 0 to 6% starting once `bgScale > 0.5`, driven by an `easeOutCubic` ramp, so it appears after the iris is mostly complete.

## Radial gradient stops

```
radial-gradient(ellipse at 50% 50%, #0a3050 0%, #052438 38%, #02101c 72%, #000000 100%)
```

These are the exact stops from `AIWorkflowDiagramV1`.

## Source template

`templates/AIWorkflowDiagramV1/AIWorkflowDiagramV1.tsx` — the `setup` reveal target's background iris and dot-grid logic.

## Typical usage

```tsx
// As a backdrop behind other content, fully revealed at frame 0:
<RadialDarkStage frame={frame} reveal={{ startFrame: 0, inFrames: 18 }} dotGrid />

// Timed to a narration cue via makeCue:
const cue = makeCue(TIMINGS);
<RadialDarkStage frame={frame} reveal={cue('bg')} dotGrid />
```
