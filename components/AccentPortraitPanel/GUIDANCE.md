# AccentPortraitPanel

## What it is

A solid accent-colour rounded panel that hosts a character portrait PNG. The panel background is one of three brand accent colours; the portrait image is clipped to the panel's rounded bounds via `overflow: hidden`. Extracted from the portrait area of the `CharacterProfileCard` template.

## Build type

**Code-first.** Pure CSS: plain rounded rectangle with a solid fill and an absolutely-positioned `<Img>` inside. No baked PNGs are needed because the shape is a simple rounded card with a flat colour fill.

## Source template

`CharacterProfileCard` (portrait area). Geometry (default): 580 x 620 px, `borderRadius` 28 for single-card, 24 for duo/team rows.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `characterId` | `string` | required | PNG id resolving to `characters/<id>.png` |
| `accentColor` | `'#0496FF' \| '#F865B0' \| '#3AB795' \| string` | `'#0496FF'` | Accent fill; three brand colours recommended |
| `size` | `'single' \| 'duo' \| 'team'` | `'single'` | Controls border-radius: 28 (single), 24 (duo/team) |
| `width` | `number` | `580` | Panel width in px |
| `height` | `number` | `620` | Panel height in px |

## Accent palette

- `#0496FF` — Dodger blue (primary)
- `#F865B0` — Wild strawberry (pink)
- `#3AB795` — Ocean green (teal)

## Entrance animation

Scale 0.92 to 1.0, `easeOutCubic`, `transformOrigin: 50% 100%` (rises from its base). Fades in simultaneously. Re-mention pulse fires on `pulseFrames` in the `reveal` prop.

## Portrait image

`objectFit: cover`, `objectPosition: center top` so the face is always at the top of the frame. Drop-shadow: `drop-shadow(0 16px 22px rgba(2,18,36,0.40)) drop-shadow(0 4px 8px rgba(2,18,36,0.30))`.

## Variants

Three colour variants matching the `CharacterProfileCard` `accentColor` enum. The component is fully recolourable; a raw hex also passes through `resolveColor`.

## Placement

Placement-agnostic. Wrap in `<Place x y>` when composing on a 1920x1080 canvas.
