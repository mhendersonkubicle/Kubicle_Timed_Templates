# RecapPillRow

A full-canvas PNG-backed recap pill row carrying a single bold caption overlay.
Slides up and fades in on entrance. Multiple instances stack vertically with
auto-centring. Supports a scale pulse on re-mention.

## Build type

**Asset-backed, canvas-region.** The pill artwork (gradients, bevels, drop
shadows) comes from the source template PNGs and cannot be faithfully reproduced
in CSS. Each instance renders as a full 1920x1080 layer, translated so its pill
row lands at the correct vertical position. Render instances directly inside an
`<AbsoluteFill>`, not inside `<Place>`.

## Source templates

| Variant | Source template | PNG path |
|---------|----------------|----------|
| `white` | CourseSummary | `Template-Specific-Assets/CourseSummary/course_summary_pill.png` |
| `dark`  | LessonSummary | `Template-Specific-Assets/LessonSummary/lesson_summary_pill.png` |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` from kit |
| `text` | `string` | required | Caption to overlay on the pill |
| `rowIndex` | `number` | required | 0-based position within the stacked band |
| `totalRows` | `number` | required | Total pill count in the band (drives auto-centring) |
| `variant` | `'white' \| 'dark'` | `'white'` | Pill artwork and text style |
| `zIndex` | `number` | `totalRows - rowIndex` | CSS stacking order; CourseSummary puts pill 0 on top |

## Variants

### `white` (CourseSummary)

- PNG: `course_summary_pill.png`, pill alpha-bbox x=605..1785, y=116..261
- Caption: Satoshi Bold 37px, `#000000`
- Row pitch: 155px
- Entrance: slide up 130px, opacity fades quickly (easeOutQuad over 60% of
  inFrames), easeOutCubic position
- Best for: end-of-course recap on the platinum-blue (#E6ECF2) background;
  1-6 pills

### `dark` (LessonSummary)

- PNG: `lesson_summary_pill.png`, pill natural top 329, height 93
- Caption: Arial 600 28px, `#FFFFFF`
- Row pitch: 118px
- Entrance: slide up 130px, opacity ramps to 1 in first 25% of progress
  (matching LessonSummary prototype)
- Best for: end-of-lesson recap on the dark (#040d18) background; 1-5 pills

## Auto-centring

Pass consistent `totalRows` to all pills in a band. The component calculates
`firstPillTop` as:

```
CANVAS_CY - ((totalRows - 1) * ROW_PITCH + PILL_HEIGHT) / 2
```

and then adds `rowIndex * ROW_PITCH` for each pill. This mirrors the formula
in CourseSummary exactly.

## Pulse

Pass `pulseFrames` inside the `reveal` object. The pulse fires a +5% scale
half-sine centred on the pill body, composing cleanly with the entrance
translate.

## Usage example

```tsx
const r = { startFrame: 0, inFrames: 18 };
const recaps = ['Define your audience', 'Map the journey', 'Measure results'];

{recaps.map((text, i) => (
  <RecapPillRow
    key={i}
    frame={frame}
    reveal={{ ...r, startFrame: i * 9 }}
    text={text}
    rowIndex={i}
    totalRows={recaps.length}
    variant="white"
    zIndex={recaps.length - i}
  />
))}
```
