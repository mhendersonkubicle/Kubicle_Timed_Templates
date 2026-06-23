# EyebrowLabel

Small all-caps accent-coloured eyebrow text, used above a headline as a
category signifier or ordinal marker (e.g. "Lesson Three", "Case Study",
"Module Overview"). Extracted from two source templates: LessonTitle (the
`label` beat) and CaseStudyIntro (the `eyebrow` beat).

## Build type

**Code-first.** Pure CSS text, fully recolourable via the `color` prop, freely
resizable via `fontSize`. No PNG assets required.

## Source templates

- `LessonTitle` — `label` beat: left-aligned, slides in translateX from -28 px
  + opacity fade, Inter Bold 700, 32 px, #0496FF, letterSpacing 0.01em.
- `CaseStudyIntro` — `eyebrow` beat: centred, fades opacity only (no slide),
  Inter ExtraBold 800, 34 px, #0496FF, letterSpacing 0.18em.

## Props

| Prop            | Type           | Default    | Notes |
|-----------------|----------------|------------|-------|
| `frame`         | `number`       | required   | Current Remotion frame. |
| `reveal`        | `Reveal`       | required   | `{ startFrame, inFrames, pulseFrames? }` from the kit contract. |
| `text`          | `string`       | required   | Displayed text; always uppercased by CSS. |
| `color`         | `ColorVariant` | `'blue'`   | Named variant (`'blue'`, `'pink'`, `'teal'`) or any hex. |
| `align`         | `'left' \| 'center'` | `'left'` | Controls text-align and entrance animation. |
| `fontSize`      | `number`       | `32`       | Px. Use 32 for LessonTitle, 34 for CaseStudyIntro. |
| `letterSpacing` | `string`       | `'0.01em'` | Em string. Use `'0.18em'` for the wide centred variant. |
| `fontWeight`    | `700 \| 800`   | `700`      | 700 = Inter Bold (LessonTitle), 800 = Inter ExtraBold (CaseStudyIntro). |

## Variants

### Left-aligned (LessonTitle)
- Entrance: translateX -28 px to 0 + opacity 0 to 1, easeOutCubic.
- Defaults: fontSize 32, letterSpacing 0.01em, fontWeight 700.
- Render inside `<Place x y>` at the label coordinates.

### Centred (CaseStudyIntro)
- Entrance: opacity 0 to 1 only (no translateX), easeOutCubic.
- Defaults: fontSize 34, letterSpacing 0.18em, fontWeight 800.
- Wrap in a full-width container and set `align="center"`.

## Entrance animation

Both variants use `appear(frame, reveal, easeOutCubic)` over `inFrames`.
Re-mention pulse: `+6%` scale bump via the kit `pulse()` helper when
`pulseFrames` are supplied. `transformOrigin` is `left center` for `left` and
`center center` for `center`.

## Placement

Placement-agnostic. Render inside `<Place x y>` for the left variant, or in
a full-width `<div>` for the centred variant. Not a canvas-region component.

## Usage

```tsx
// LessonTitle style (left-aligned eyebrow)
<Place x={59} y={390}>
  <EyebrowLabel
    frame={frame}
    reveal={cue('label')}
    text="Lesson Three"
    color="blue"
    align="left"
    fontSize={32}
    letterSpacing="0.01em"
    fontWeight={700}
  />
</Place>

// CaseStudyIntro style (centred eyebrow)
<div style={{ position: 'absolute', left: 0, top: 372, width: 1920, textAlign: 'center' }}>
  <EyebrowLabel
    frame={frame}
    reveal={cue('eyebrow')}
    text="Case Study"
    color="blue"
    align="center"
    fontSize={34}
    letterSpacing="0.18em"
    fontWeight={800}
  />
</div>
```
