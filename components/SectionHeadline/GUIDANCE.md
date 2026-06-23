# SectionHeadline

Bold section-title heading that slides up and fades in to head a content group.
Used in lesson summary screens (as the locked "Lesson Summary" title) and as a
splitscreen column-header label.

## Build type

**Code-first.** Pure CSS/Satoshi Black type, fully recolourable, placement-agnostic.
No PNG artwork required.

## Source template

`LessonSummary` — lifted from the locked "Lesson Summary" title block (Arial Black /
Satoshi Black 900, 62 px, Dodger Blue #0496FF, -0.5 px letterSpacing, 1.1 lineHeight,
+28 px slide-up + fade entrance).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `text` | `string` | required | The heading text to display |
| `color` | `ColorVariant` | `'blue'` | Accent colour: `'blue'` (#0496FF), `'pink'` (#FF3D8A), `'teal'` (#33CCCC), or any hex |
| `size` | `'large' \| 'medium'` | `'large'` | `'large'` = 62 px (LessonSummary headline); `'medium'` = 58 px (column-header label) |
| `maxWidth` | `number` | none | Optional max-width in px; shrink-to-fit by default |
| `style` | `React.CSSProperties` | — | Optional overrides for the outer wrapper |

## Entrance animation

- **Opacity:** `easeOutQuad` over `inFrames`
- **TranslateY:** starts +28 px below, rises to 0 with `easeOutExpo` over `inFrames`
- **Re-mention pulse:** +5% scale over 0.45 s around `left center` origin (via kit `pulse()`)

## Variants

- `color="blue"` (default) — Dodger Blue, lesson summary headline
- `color="pink"` — Pink, right-column header in splitscreen layouts
- `color="teal"` — Teal, secondary section label
- Any hex is accepted for one-off accent colours

## Usage example

```tsx
<Place x={133} y={219}>
  <SectionHeadline
    frame={frame}
    reveal={cue('title')}
    text="Lesson Summary"
    color="blue"
    size="large"
  />
</Place>
```
