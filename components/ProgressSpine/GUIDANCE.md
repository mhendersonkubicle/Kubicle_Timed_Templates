# ProgressSpine

Vertical dotted spine rail that tracks milestone reveal progress. Used in
FivePoints1SubtopicV2-style layouts to visually connect milestone ticks down
the right-side column.

## Build type

**Asset-backed, canvas-region.** Renders the real FivePoints1SubtopicV2 PNG
artwork as two overlaid full-canvas (1920x1080) images, each clipped to the
active segment. The dotted pattern is baked into the artwork and cannot be
faithfully reproduced in CSS, so asset-backed is the correct choice. Render
directly on the stage (not inside `<Place>`).

## Source template

`FivePoints1SubtopicV2` — assets at:
- `Template-Specific-Assets/FivePoints1SubtopicV2/dotted_line_base.png` (grey rail)
- `Template-Specific-Assets/FivePoints1SubtopicV2/blue_dotted_line_base.png` (progress overlay)

Both PNGs are 1920x1080 full-canvas frames. Clipping isolates only the spine
segment (from spineTop to spineBottom, derived from tick CYs for the given
milestone count).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | Drives the grey rail draw-in (the 'setup' beat) |
| `milestoneCount` | `number` | required | Total milestones (1-5); determines spineTop, spineBottom, and tick CY values |
| `revealedCount` | `number` | required | How many milestones are revealed (0=none). Blue overlay fills down to tick at index (revealedCount-1) |

## Behaviour

- **Grey rail**: draws from spineTop downward across the `reveal` window,
  easeInOutCubic. Driven by `clipPath: inset(...)` on the full-canvas PNG.
- **Blue overlay**: fills from spineTop down to the CY of the deepest revealed
  tick. Re-derived each frame from `revealedCount`. Zero height when no
  milestones are revealed.
- **Geometry**: tick CYs follow the same auto-centering formula as
  FivePoints1SubtopicV2 (`CANVAS_CY=540`, `CARD_PITCH=200`), so the spine
  aligns exactly with milestone circles placed by the template or by a
  composing template that imports both.

## Variants

No colour variants. The grey and blue colours are baked into the PNGs and
match the FivePoints1SubtopicV2 brand palette (grey rail, dodger blue
`#0496FF` overlay).

## Typical usage

```tsx
// In a composing template, after deriving deepest revealed index:
const revealedCount = milestones.filter((_, i) => frame >= cueFrame(`tick${i}`)).length;

<ProgressSpine
  frame={frame}
  reveal={cue('setup')}
  milestoneCount={milestones.length}
  revealedCount={revealedCount}
/>
```
