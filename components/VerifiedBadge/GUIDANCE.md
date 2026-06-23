# VerifiedBadge

A serrated 16-point starburst badge filled with an accent colour and carrying a
white checkmark stroke. Rendered inline beside a role or name label to indicate
verified status.

## Build type

**Code-first.** Pure SVG, fully recolourable via the `color` prop and freely
resizable via `size`. No PNG assets required.

## Source template

`CharacterProfileCard` (the inline `VerifiedBadge` function, lines 269-288).
The starburst path and tick path are lifted verbatim from that source. The
entrance animation matches the `badge` reveal step in that template exactly:
`easeOutBack(2.4)` scale pop with `easeOutCubic` opacity.

## Props

| Prop     | Type           | Default   | Notes |
|----------|----------------|-----------|-------|
| `frame`  | `number`       | required  | Current Remotion frame. |
| `reveal` | `Reveal`       | required  | `{ startFrame, inFrames, pulseFrames? }` from the kit contract. |
| `color`  | `ColorVariant` | `'blue'`  | Named variant (`'blue'`, `'pink'`, `'teal'`) or any hex. |
| `size`   | `number`       | `32`      | Width and height in px. Use `32` for standard single-card, `26` for duo or compact layouts. |

## Variants

- `blue` (#0496FF): matches CharacterProfileCard default accent (dodger blue).
- `pink` (#FF3D8A): wild strawberry accent.
- `teal` (#33CCCC): ocean/teal accent.
- Any hex string is accepted directly.

## Entrance animation

- Scale: `easeOutBack` with overshoot factor `2.4`, from 0 to 1 over `inFrames`.
- Opacity: `easeOutCubic`, from 0 to 1 over `inFrames`.
- Re-mention pulse: `+6%` scale bump via the kit `pulse()` helper when
  `pulseFrames` are supplied.

## Placement

Placement-agnostic. Render inside `<Place x y>` or in any flex row directly
beside a label. It is not a canvas-region component.

## Usage

```tsx
<Place x={672} y={682}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 42, color: '#0A0F18' }}>
      Product Strategist
    </span>
    <VerifiedBadge frame={frame} reveal={cue('badge')} color="#0496FF" size={32} />
  </div>
</Place>
```

Or in isolation as a standalone element on any layout.
