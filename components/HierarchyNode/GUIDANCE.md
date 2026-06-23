# HierarchyNode

A rounded label card for a single box in any hierarchy or org-chart layout.
Place one of these wherever a node is needed; the composing template positions
it on the canvas with `<Place x y>`.

## Build type

**Code-first.** Pure CSS (no PNG assets). The two gradient variants are
reproduced exactly in CSS because they are simple linear gradients. The card is
freely resizable via the `width` and `height` props.

## Source template

`OrgChart` (`templates/OrgChart/OrgChart.tsx`), specifically the internal
`LabelBox` component (lines ~222-317). Geometry, gradients, border, shadow,
typography, border-radius, and entrance animation are all lifted verbatim from
that source.

## Variants

| Variant | Background | Font weight | Font size | Border radius |
|---------|-----------|-------------|-----------|---------------|
| `top`   | `linear-gradient(135deg, #0a3050 0%, #052438 50%, #02101c 100%)` | Satoshi Black 900 | 30 px | 20 px |
| `child` | `linear-gradient(135deg, #38AEFF 0%, #1A9CFE 50%, #0686EE 100%)` | Satoshi Bold 700 | 26 px | 18 px |

Both variants use white text, `1px solid rgba(255,255,255,0.08)` border, and
`0 10px 26px rgba(5,36,56,0.20)` shadow.

## Props

| Prop      | Type                     | Default   | Notes |
|-----------|--------------------------|-----------|-------|
| `frame`   | `number`                 | required  | Current Remotion frame. |
| `reveal`  | `Reveal`                 | required  | `{ startFrame, inFrames, pulseFrames? }` from the kit contract. |
| `label`   | `string`                 | required  | Text label. Wraps to up to three lines; keep short. |
| `variant` | `'top' \| 'child'`       | `'child'` | Card visual variant (oxford dark or dodger blue). |
| `width`   | `number`                 | 440 (top) or 400 (child) | Override card width in px. |
| `height`  | `number`                 | `104`     | Override card height in px. |

## Entrance animation

Scale `0.88 -> 1.0` with `easeOutBack(1.3)`, opacity `0 -> 1` with
`easeOutCubic` over the first 60% of `inFrames`, and `translateY -10 -> 0`
with `easeOutCubic`. Re-mention pulse applies a brief +6% scale bump via the
kit `pulse()` helper when `pulseFrames` are supplied. All values match the
OrgChart source exactly.

## Usage

```tsx
// Top node, centred at x=960
<Place x={960 - 220} y={topY}>
  <HierarchyNode frame={frame} reveal={cue('top')} label="Executive Office" variant="top" />
</Place>

// Child node
<Place x={cx - 200} y={rowY}>
  <HierarchyNode frame={frame} reveal={cue('node0_1')} label="Engineering" variant="child" />
</Place>
```

Text wraps to up to three lines (clamped with `-webkit-line-clamp: 3`).
Keep labels short: at 4 boxes per row, each box is 400 px wide.
