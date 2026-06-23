# BulletDotRow

A single bullet list row: a small filled square dot left-aligned with wrapped body text.
Extracted from the Carousel5Tiles tile body (bullets section). Use inside card bodies
and content panels wherever a plain-text list item is needed.

## Build type

Code-first. Pure CSS, no PNG artwork. Fully recolourable and resizable via props.

## Source template

Carousel5Tiles (`templates/Carousel5Tiles/Carousel5Tiles.tsx`, `Tile` sub-component,
bullets section).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `text` | `string` | required | The bullet body text; wraps naturally |
| `dotColor` | `ColorVariant` | `'#0794FD'` | Named colour (`'blue'`, `'teal'`, `'pink'`) or any hex |
| `textColor` | `string` | `'#FFFFFF'` | Text colour |
| `fontSize` | `number` | `33` | Body text size in px |
| `dotSize` | `number` | `8` | Square dot side length in px |
| `gap` | `number` | `16` | Gap in px between dot and text |

## Geometry (from Carousel5Tiles source)

- Dot: 8x8px solid square, `marginTop: 16px` to baseline-align with the first text line.
- Text: Satoshi Medium 500, 33px, white, `lineHeight: 1.35`, `letterSpacing: -0.005em`.
- Row: `display: flex`, `alignItems: flex-start`, `gap: 16px`.
- Between consecutive rows in a list: `gap: 16px` on the parent flex column.

## Variants

- Default blue dot: matches Carousel5Tiles tile bodies exactly.
- Teal dot: `dotColor="teal"` for teal-accented panels.
- Pink dot: `dotColor="pink"` for pink-accented panels.
- Any hex: pass an arbitrary hex string to `dotColor` or `textColor`.
- Larger font: increase `fontSize` and `dotSize` proportionally (e.g. 40px / 10px).

## Entrance animation

`appear()` fades/eases the row in from `reveal.startFrame` over `reveal.inFrames`.
Re-mention pulses via `pulse()` give a brief scale bump on `reveal.pulseFrames`.
For a staggered list, increase `startFrame` per row (e.g. +6 frames each).

## Usage example

```tsx
import { BulletDotRow } from '../components/BulletDotRow/BulletDotRow';

<BulletDotRow frame={frame} reveal={{ startFrame: 30, inFrames: 12 }} text="Describe intent, not steps" />
<BulletDotRow frame={frame} reveal={{ startFrame: 36, inFrames: 12 }} text="Let the model draft v1" />
<BulletDotRow frame={frame} reveal={{ startFrame: 42, inFrames: 12 }} text="Edit, don't rewrite" />
```
