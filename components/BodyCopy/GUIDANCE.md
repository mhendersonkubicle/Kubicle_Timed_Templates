# BodyCopy

Large medium-weight body paragraph used below a display headline for goal statements, lesson summaries, and definition bodies.

## What it is

A placement-agnostic, code-first text block extracted from the `LessonGoal` template's `goal` copy element. It renders a `<p>` tag in Satoshi Medium 500 with a 24 px rise + opacity-fade entrance, re-mention pulse anchored at the left-centre origin, and `text-wrap: pretty` for natural line-break balance.

## Build type

**Code-first** (pure CSS, no PNG assets). Recolourable via props.

## Source template

`templates/LessonGoal` — the `goal` copy element (Satoshi Medium 500, 72px, `#0B1F33`, `letterSpacing -0.015em`, `lineHeight 1.15`). The `light` variant measurements come from `YinYangSide` title-bar geometry (55.5px, `#4A5864`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `text` | `string` | required | Body copy, aim under 120 chars for 2-3 lines at 72px |
| `variant` | `'dark' \| 'light'` | `'dark'` | `dark`: 72px `#0B1F33` for platinum/light surfaces; `light`: 55.5px `#4A5864` for panels |
| `color` | `ColorVariant \| string` | variant default | Override colour (any hex or COLORS key) |
| `maxWidth` | `number` | `1000` | Paragraph width cap in px |
| `style` | `React.CSSProperties` | — | Extra styles on the outer wrapper |

## Variants

- **dark** (default): Satoshi Medium 500, 72px, `#0B1F33`, for use on the platinum (`#E6ECF2`) background of `LessonGoal` and similar light surfaces.
- **light**: Satoshi Medium 500, 55.5px, `#4A5864`, for use on panel surfaces such as `YinYangSide` title bars.

## Entrance animation

24 px rise + opacity fade, `easeOutCubic`, matching `LessonGoal`'s `riseEase` (bezier 0.2, 0.8, 0.2, 1). Re-mention pulse: `+6%` scale bump centred on each `pulseFrames` value, from `left center` origin so left-aligned layouts stay put.

## Placement

Placement-agnostic: wrap in `<Place x y>` from `_lib/kit` when composing on the 1920x1080 canvas, or let a flex/absolute parent control position.

## Character guidance

Aim for under 120 characters for a comfortable 2-3 line fit at 72px dark variant. The `maxWidth` default of 1000px gives roughly 55% of the 1920px canvas width, matching the `LessonGoal` content block.
