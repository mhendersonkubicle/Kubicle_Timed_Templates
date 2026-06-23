# RoleTitleRow

## What it is

A flex row that pairs a bold role or name headline with an inline `VerifiedBadge`. Extracted from the `name` + `badge` beat in `CharacterProfileCard`. The title slides up 32 px with easeOutCubic and fades in; the badge pops in on its own `badgeReveal` (or the same cue as the title when no separate reveal is supplied). Re-mention pulses are supported via `reveal.pulseFrames`.

Use it at the top of any profile card content block, below a portrait and above a bio. It is placement-agnostic: wrap it in `<Place x y>` in the composing template.

## Build type

**Code-first.** Pure CSS flex row. No baked PNGs. Fully recolourable via `color` + `textColor` props.

## Source template

`CharacterProfileCard` (the `name` + `badge` reveal beat).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame. |
| `reveal` | `Reveal` | required | Entrance reveal for the title text (startFrame, inFrames, pulseFrames?). |
| `badgeReveal` | `Reveal` | same as `reveal` | Separate entrance reveal for the badge. Use to stagger the badge ~0.4 s after the title, matching CharacterProfileCard. |
| `title` | `string` | required | Role or name string. Max chars: 30 (single-card), 22 (duo), 24 (team). |
| `verified` | `boolean` | `true` | Show the VerifiedBadge when true. |
| `color` | `ColorVariant` | `'blue'` | Badge accent color. Named variant or any hex. |
| `fontSize` | `number` | `42` | Headline font size in px. Use 42 (single-card), 32 (duo), 40 (team). |
| `badgeSize` | `number` | `32` | Badge diameter in px. Use 32 (single-card), 26 (duo/compact). |
| `textColor` | `string` | `'#0A0F18'` | Headline text color. Use `COLORS.white` on a dark card surface. |

## Variants

Three accent colors are shown in the example: `blue` (default), `pink`, `teal`. Any `ColorVariant` hex works. The `verified={false}` variant renders the headline only (no badge).

## Character limits

| Context | Max chars |
|---|---|
| Single-card | 30 |
| Duo layout | 22 |
| Team layout | 24 |

## Usage example

```tsx
// In a composing template:
const cue = makeCue(TIMINGS);

<Place x={640} y={682}>
  <RoleTitleRow
    frame={frame}
    reveal={cue('name')}
    badgeReveal={cue('badge')}
    title="Product Strategist"
    verified={true}
    color="blue"
    fontSize={42}
    badgeSize={32}
    textColor="#0A0F18"
  />
</Place>
```
