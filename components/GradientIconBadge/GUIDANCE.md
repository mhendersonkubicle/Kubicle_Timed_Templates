# GradientIconBadge

A compact icon accent block: dodger-blue gradient container (rounded square or circle) with a CSS-masked white icon centred inside. Used as the icon accent inside pills, cards, and conveyor items wherever a coloured badge is needed.

## Build type

Code-first. Pure CSS/SVG, no PNG dependencies. The gradient and border-radius are reproduced exactly in CSS from BulletList6Pills' chevron block constants.

## Source template

BulletList6Pills (`templates/BulletList6Pills/BulletList6Pills.tsx`) chevron block:

- Gradient: `linear-gradient(180deg, #5DBDFF 0%, #1A9CFE 55%, #0A8FEE 100%)`
- `square` border-radius: `22` (ChevronAccentBlock)
- `circle` border-radius: `50%` (PlayCircle)
- `small-square` border-radius: `18` (GradientIconSquare)
- Icon size: ~61% of badge side (matching BulletList6Pills' `CHEVRON_SIZE - 28` / `CHEVRON_SIZE` ratio)

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | Entrance timing from the kit reveal contract |
| `icon` | `string` | required | Icon id resolved via `script-pipeline/icons`; never guess |
| `size` | `number` | `120` | Container side length in px; icon scales proportionally at ~61% |
| `shape` | `'square' \| 'circle' \| 'small-square'` | `'square'` | Controls border-radius |
| `shadow` | `boolean` | `true` | Applies a blue-tinted drop shadow |

## Variants

Three shape variants cover all badge contexts:

- `square` (radius 22): default, matches BulletList6Pills chevron block exactly
- `circle` (radius 50%): for play buttons or circular accent marks
- `small-square` (radius 18): for smaller inline uses inside pills or cards

## Animation

Entrance: `easeOutBack` scale pop (same as IconPill circle badge). Opacity rides `easeOutCubic` on the same window. Re-mention pulses via the standard `pulse()` helper.

## Usage

```tsx
import { GradientIconBadge } from '../GradientIconBadge/GradientIconBadge';

// Inside a composing template, wrap in <Place> for canvas positioning:
<Place x={160} y={470}>
  <GradientIconBadge
    frame={frame}
    reveal={cue('badge0')}
    icon="science-magnifyingglass-dark"
    shape="square"
    size={120}
  />
</Place>
```
