# CharacterGradientPanel

**What it is:** A tall full-height rounded panel with a three-stop vertical gradient (lighter top, mid-accent, darker bottom) that clips a character portrait PNG. Used as the left-panel anchor on split-screen layouts where a presenter figure grounds the scene visually.

**Build type:** Code-first. The gradient is generated in CSS from a single `color` prop using `resolveColor` + `shade`, so the panel is fully recolourable and resizable without any baked artwork.

**Source template:** `Topic1Subtopics6Character` (the `CharacterAnchor` sub-component).

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame (passed from `useCurrentFrame()`). |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` entrance timing. |
| `characterId` | `string` | required | Portrait PNG id. Resolves to `characters/<characterId>.png`. |
| `characterHeight` | `number` | `850` | Rendered height of the portrait in px (width is auto/aspect-preserved). |
| `characterY` | `number` | `163` | Top offset of the portrait inside the panel in px. Negative values crop the top of the image. At the default values (height=850, Y=163) a typical presenter PNG with the face ~35% from the top lands the face near the panel's vertical centre. |
| `color` | `ColorVariant` | `'blue'` | Gradient accent colour. Accepts a named variant (`'blue'`, `'pink'`, `'teal'`) or any hex string. The gradient is built as `shade(base, +22)` top, `base` mid, `shade(base, -28)` bottom. |
| `width` | `number` | `660` | Panel width in px. |
| `height` | `number` | `920` | Panel height in px. |
| `borderRadius` | `number` | `40` | Corner radius in px. |

---

## Variants

- **`color='blue'`** (default): dodger-blue gradient (`#38B0FF` -> `#0496FF` -> `#0274C9`), matches the source template exactly.
- **`color='teal'`**, **`color='pink'`**, or any hex: gradient scales proportionally via `shade`.

---

## Placement

This component is placement-agnostic. Wrap it in `<Place x={100} y={60}>` to position it on the 1920x1080 canvas, matching the source template's `PANEL_LEFT=100`, `PANEL_TOP=60` geometry.

---

## Animation

The panel and portrait fade in together as a single unit (opacity 0 to 1) across the reveal window using `easeOutCubic`. The `pulse` helper fires a brief scale bump on each `pulseFrames` entry. This matches the `setup` cue behaviour in `Topic1Subtopics6Character`, where the character panel is silent scaffolding.

---

## Drop shadow

The portrait carries a two-layer CSS `filter: drop-shadow` that lifts the figure off the coloured panel background. Values are taken verbatim from the source template:

```
drop-shadow(0 18px 24px rgba(2, 18, 36, 0.45))
drop-shadow(0 4px 8px rgba(2, 18, 36, 0.35))
```
