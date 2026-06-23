# Component library

Reusable building blocks extracted from the templates' visual pieces.
A template is a fixed layout; a **component** is one piece of it (a pill, a tab, an
icon badge, a side panel) that can be placed anywhere and combined with others to
assemble new templates. So "the YinYang left side merged with Splitscreen icon
pills" is just a short layout file that imports both.

## The contract (every component follows it)

- **Hybrid look (PNG where it matters)** , a component is either *code-first*
  (CSS/SVG, fully recolourable and resizable) for simple shapes, or *asset-backed*
  (the template's real PNG artwork) where CSS cannot match it (gradients, bevels,
  the YinYang split-curve). Asset-backed pieces are pixel-faithful but fixed-size
  and limited to the colour variants that ship as artwork. Text, icon, reveal, and
  placement are always props either way.
- **Placement-agnostic** , a component renders inside its own box; the composing
  template positions it on the 1920x1080 canvas (wrap it in `<Place x y>`). A few
  full-frame "canvas-region" components (e.g. `YinYangSide`, whose artwork spans the
  stage) are the exception: render them directly, not inside `<Place>`.
- **Reveal-driven** , a component takes the current `frame` and a `Reveal`
  (`{ startFrame, inFrames, pulseFrames? }`) and animates its own entrance. This is
  the same reveal-sequence model the templates and `fit-timing.py` already use, so
  timing, re-mention pulses, and the producer approval gate all keep working.

## The kit (`_lib/kit.tsx`)

- `COLORS`, `resolveColor`, `shade`, `FONT_HEAD`, `FONT_BODY` , brand palette + fonts.
- `Reveal`, `appear(frame, reveal)`, `pulse(frame, reveal)` , the reveal contract + entrance/pulse helpers.
- `makeCue(timings)` , turns a `timings.sequence` (target/at/in seconds, the fit-timing output) into a `Reveal` per target. A composing template calls `const cue = makeCue(TIMINGS)` then `cue('pill0')`.
- `Icon({ id, size, tint? })` , renders `icons/<id>.svg`; `tint` recolours it via a CSS mask.
- `Place({ x, y, z })` , absolute placement wrapper on the canvas.

## Composing a template

See `_demo/ComposedDemo.tsx` for a full worked example. The shape is always:

```tsx
const TIMINGS = { sequence: [{ target: 'pill0', at: 3.0, in: 0.5 }, ...], pulses: [] };
const cue = makeCue(TIMINGS);
// ...
<Place x={1040} y={360}>
  <IconPill frame={frame} reveal={cue('pill0')} text="Reads the record" icon="science-magnifyingglass-dark" color="pink" />
</Place>
```

The composing template owns the canvas background, the layout coordinates, and the
`timings.sequence`; each component owns its own look and entrance.

## Components

| Component | What it is | Build | From |
|---|---|---|---|
| [`IconPill`](IconPill/) | Caption pill with an optional circular icon badge | asset-backed (blue / pink) | SplitscreenPointsV1 `AnimPill` |
| [`WordTab`](WordTab/) | Top-left tab holding a word/label; slides down | code-first (any colour) | WordDefinition banner |
| [`IconBadge`](IconBadge/) | Icon in a coloured circle inside a white surround | code-first (any colour) | WordDefinition icon pill |
| [`YinYangSide`](YinYangSide/) | One full-frame side of a comparison: title bar over 1-2 icon/caption boxes | asset-backed, canvas-region | YinYang2Points `ContainerGroup` |

This is the proven first set. The rest of the library is extracted from the
remaining templates against this same contract (title bars, checklist pills,
process steps, coverflow tiles, chat bubbles, milestone cards, character cards,
and so on).

## Note on fidelity (the hybrid rule)

Choose per piece: use **asset-backed** when the artwork has gradients, bevels, or
curves CSS cannot match (pixel-faithful, but fixed size and only the colour variants
that ship as PNGs); use **code-first** for simple shapes (plain pills, circles, bars)
that CSS reproduces faithfully and that benefit from free recolouring and resizing.
The wide fan-out follows the same rule, template by template.
