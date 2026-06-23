# DisplayHeadline

Large primary display headline that rises or fades in as the main title of a scene. Used for lesson titles, section goals, and word-definition headings.

## Build type

**code-first** (pure CSS, no PNGs). Fully recolourable and resizable. Source template: `LessonTitle`.

## What it renders

A single multi-line text block in Inter ExtraBold, animated via opacity + a translate entrance. The component is placement-agnostic: wrap it in `<Place x y>` to position it on the canvas.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` from the kit |
| `text` | `string` | required | Headline copy |
| `variant` | `'white' \| 'blue' \| 'ink'` | `'white'` | Colour + size preset (see Variants below) |
| `color` | `ColorVariant` | — | Override the variant colour entirely (any hex or COLORS key) |
| `entry` | `'slide-x' \| 'slide-y'` | `'slide-x'` | Entrance direction: slide from left or rise up |
| `maxWidth` | `number` | `1702` | Max width in px before the text wraps |
| `style` | `CSSProperties` | — | Extra styles on the outer wrapper |

## Variants

| Variant | Font size | Colour | Letter spacing | Typical use |
|---|---|---|---|---|
| `white` | 78 px | `#FFFFFF` | -0.025em | Lesson title on a dark background |
| `blue` | 116 px | `#0496FF` | -0.030em | Section goal heading on a dark background |
| `ink` | 74 px | `#0B1B2B` | -0.025em | Word-definition heading on a light panel |

All variants use Inter ExtraBold (weight 800), lineHeight 1.05, and bezier(0.2,0.8,0.2,1) entrance easing.

## Entrance

- `slide-x` (default): translateX -36px to 0 + opacity. Matches LessonTitle's headline slide.
- `slide-y`: translateY -24px to 0 + opacity. Use for goal/section beats where the text rises in.

Re-mention pulses (a brief scale bump) fire automatically if `pulseFrames` are present in the `Reveal`.

## Character limits

The `maxWidth` prop controls wrapping. As a guide, at `variant="white"` (78 px):
- One comfortable line: ~40 characters
- Two lines: up to ~80 characters

At `variant="blue"` (116 px) one line fits roughly 25-28 characters before wrapping at the default maxWidth.

## Example usage

```tsx
import { Place, makeCue } from '../_lib/kit';
import { DisplayHeadline } from '../DisplayHeadline/DisplayHeadline';

const cue = makeCue(TIMINGS);

<Place x={58} y={432}>
  <DisplayHeadline
    frame={frame}
    reveal={cue('headline')}
    text="Understanding AI Agents"
    variant="white"
    entry="slide-x"
  />
</Place>
```
