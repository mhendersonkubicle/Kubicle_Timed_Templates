# AnimatedConnectorLine

A self-drawing SVG connector line (straight or cubic-bezier curve) with a
two-layer stroke: a soft outer glow and a crisp inner line. Both layers share
the same path and animate together using `pathLength=1` + `strokeDashoffset`
driven by the standard `appear()` helper.

Extracted from the `Connector` component inside `AIWorkflowDiagramV1`.

---

## Build type

**Code-first.** Pure inline SVG, no PNG dependencies. Fully recolourable via
the `color` prop. Placement-agnostic: renders inside its own `<div>` wrapper;
position it with `<Place>` or absolute CSS in the composing template.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `from` | `Point` | required | Start endpoint in SVG user-space `{ x, y }` |
| `to` | `Point` | required | End endpoint in SVG user-space `{ x, y }` |
| `cp1` | `Point` | auto | Cubic-bezier control point 1 (only when `curve=true`). Omit to use auto S-curve. |
| `cp2` | `Point` | auto | Cubic-bezier control point 2 (only when `curve=true`). Omit to use auto S-curve. |
| `curve` | `boolean` | `false` | `false` = straight line; `true` = cubic-bezier path |
| `svgWidth` | `number` | auto | SVG element width. Pass the canvas width (1920) when embedding inside a full-frame layout. |
| `svgHeight` | `number` | auto | SVG element height. Pass the canvas height (1080) when inside a full-frame layout. |
| `color` | `ColorVariant` | `'blue'` | Stroke colour. Named brand variant (`'blue'`, `'pink'`, `'teal'`) or any hex. |
| `strokeWidth` | `number` | `3` | Inner path stroke width in px |
| `glowWidth` | `number` | `10` | Outer glow stroke width in px |
| `glowOpacity` | `number` | `0.18` | Glow opacity at full draw (matches AIWorkflowDiagramV1 source) |
| `easing` | `(t) => number` | `easeInOutCubic` | Easing function for the draw animation |

---

## Variants

| Variant | How |
|---|---|
| Straight line | `curve={false}` (default). Both endpoints define a straight path via a degenerate cubic bezier so `pathLength=1` works identically. |
| Cubic-bezier curve | `curve={true}`. Omit `cp1`/`cp2` for an auto horizontal S-curve (matching AIWorkflowDiagramV1's node-to-node shape). Pass explicit control points for custom arcs. |
| Colour | Any named brand variant or hex via the `color` prop. |
| Weight | `strokeWidth` (inner) and `glowWidth` (outer glow). |

---

## Sizing

When embedding inside a full-frame AbsoluteFill (as in a composing template),
pass `svgWidth={1920}` and `svgHeight={1080}` and set `from`/`to` in canvas
coordinates. The component will render an SVG that fills the specified box, and
you can position the `<div>` wrapper with `position: absolute; inset: 0`.

When using the component standalone (auto-size), omit `svgWidth`/`svgHeight`.
The component derives a tight bounding box from the endpoints plus a 20 px glow
padding, so the SVG is only as large as needed.

---

## Source template

`AIWorkflowDiagramV1` (`templates/AIWorkflowDiagramV1/AIWorkflowDiagramV1.tsx`),
the inner `Connector` component (lines 476-514).

Key geometry lifted directly:
- Outer glow: `stroke #0496FF`, `strokeWidth 10`, `opacity 0.18`
- Inner stroke: `stroke #0496FF`, `strokeWidth 3`
- Both: `pathLength={1}`, `strokeDasharray={1}`, `strokeDashoffset` animated 1->0
- Curve shape: `makeHCurve` (horizontal S-curve with mid-x control points)
- Default easing: `easeInOutCubic` (same as the source template's connector draw)
