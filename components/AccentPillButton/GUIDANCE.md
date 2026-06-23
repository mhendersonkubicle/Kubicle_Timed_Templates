# AccentPillButton

## What it is

A full-radius pill-shaped call-to-action button filled with an accent colour,
carrying a white bold label and an inline plus-icon glyph. It is the Follow /
CTA control at the foot of profile cards (CharacterProfileCard bottom-row).

The button is code-first: pure CSS layout with an inline SVG plus glyph. It is
fully recolourable via the `accentColor` prop and resizable via the `height` prop.
Font size, icon size, padding, and border-radius all scale proportionally with
`height`, so the pill always looks correct at both the single-card (56 px) and
duo/team-card (48 px) sizes.

## Build type

**Code-first** (CSS/SVG). No PNG artwork required; the shape is a simple filled
rounded pill that CSS reproduces faithfully.

## Source template

`CharacterProfileCard` Follow button (`FOLLOW_H = 56`, `borderRadius = FOLLOW_H / 2`,
`background: accentColor`, Satoshi Bold 700, 22 px label, 20 px PlusIcon glyph,
shadow `0 6px 14px rgba(15,25,45,0.08), 0 2px 4px rgba(15,25,45,0.06)`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `label` | `string` | `'Follow'` | Button label text |
| `accentColor` | `ColorVariant` | `'blue'` | Named variant or hex; fills the pill |
| `height` | `number` | `56` | Pill height in px; use 56 for single-card, 48 for duo/team |
| `showIcon` | `boolean` | `true` | Render the inline plus glyph beside the label |

## Variants

- **Blue** (`accentColor="blue"`, `#0496FF`): primary brand CTA
- **Pink** (`accentColor="pink"`, `#FF3D8A`): secondary / alternative accent
- **Teal** (`accentColor="teal"`, `#33CCCC`): third brand accent
- **Any hex**: pass a literal hex string for custom accent colours (e.g. `#3AB795`)

## Entrance animation

`easeOutBack` scale pop (overshoot factor 2.6, matching the source template's
`easeOutBackButton`). During the overshoot the button briefly squash-and-stretches:
scaleX widens and scaleY narrows by up to 8%, then both settle to 1:1. A
re-mention pulse composes on top via the kit `pulse()` helper.

## Placement

Placement-agnostic. Wrap in `<Place x y>` to position on the 1920x1080 canvas:

```tsx
<Place x={FOLLOW_LEFT + CARD_LEFT} y={BOTTOM_ROW_Y + CARD_TOP}>
  <AccentPillButton frame={frame} reveal={cue('follow')} accentColor={accentColor} />
</Place>
```

Or render directly inside a card's bottom-row container as the CharacterProfileCard
does (absolutely positioned within the card).
