# InfoBanner

Oxford-blue rounded banner that pairs a short accent-coloured title on the left with multi-line body copy on the right. Slides in from the side to annotate a diagram or visual element.

## Build type

**Code-first.** Pure CSS/Flexbox, fully recolourable via `accentColor`, resizable via `width`. No PNG artwork required.

## Source template

**Pyramid5Tiers** (`templates/Pyramid5Tiers/Pyramid5Tiers.tsx`). Geometry and colours lifted directly from the `Banner` sub-component in that template:

- Background: `linear-gradient(180deg, #0a3050 0%, #052438 60%, #02101c 100%)`
- Border radius: 18px
- Border: `1px solid rgba(255,255,255,0.06)`
- Box shadow: `0 10px 28px rgba(5,36,56,0.22)`
- Inner layout: flex row, `alignItems: center`, `paddingX: 32px`, `gap: 28px`
- Title slot: `flex 0 0 200px`, `#0794FD` (dodger blue), Satoshi Black 900, `fontSize: 32`
- Body slot: `flex: 1`, `rgba(255,255,255,0.82)`, Satoshi Medium 500, `fontSize: 20`, `lineHeight: 1.40`

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `title` | `string` | required | Short accent label (left column). Keep to 1-3 words, ~22 chars max |
| `body` | `string` | required | Multi-line body copy (right column). Up to ~180 chars |
| `accentColor` | `ColorVariant` | `'blue'` | Title text colour: `'blue'`, `'pink'`, `'teal'`, or any hex |
| `width` | `number` | `860` | Banner width in px. Height is content-driven |
| `minHeight` | `number` | `100` | Minimum banner height in px |
| `titleWidth` | `number` | `200` | Reserved width for the title column in px |
| `from` | `'right' \| 'left'` | `'right'` | Slide-in direction for the entrance |

## Entrance animation

`translateX(+/-60 -> 0)` with `easeOutBack(1.70158)` + opacity fade, matching the Pyramid5Tiers banner entrance. Title and body sub-stagger slightly after the shell appears (30% and 45% through the entrance window respectively). Re-mention pulses apply a brief +6% scale bump to the whole banner.

## Variants

Three accent colours shown in the catalog example: `blue` (#0794FD), `pink` (#FF3D8A), `teal` (#33CCCC). Any hex value also works.

## Placement

Placement-agnostic. Wrap in `<Place x={...} y={...}>` to position on the 1920x1080 canvas. Width is a prop; height adapts to content. Typical use: placed to the right of a diagram or pyramid to annotate individual tiers as they are narrated.

## Character limits

- `title`: 22 chars (fits the 200px column at Satoshi Black 32px without wrapping)
- `body`: 180 chars (wraps to 3-4 lines in an 860px banner; allow more on wider banners)
