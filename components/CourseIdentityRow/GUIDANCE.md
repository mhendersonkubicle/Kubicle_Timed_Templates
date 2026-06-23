# CourseIdentityRow

Top-left course lockup combining an optional CSS-mask-tinted icon and a course title
text label. Drops in from above and remains constant across all lessons in a course.

## What it is

Extracted directly from LessonTitle's "logo row" beat. When you place it at `x=77, y=58`
inside a `<Place>` wrapper, it reproduces the exact geometry of the LessonTitle top-left
lockup. Because it is a standalone component you can also reuse it in other templates
that need a persistent course identity mark.

## Build type

**Code-first.** Pure CSS with the icon rendered via the CSS mask technique (identical to
LessonTitle). Fully recolourable via the `tint` prop; resizable via future props if needed.
No PNG artwork required.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `courseTitle` | `string` | required | One line; keep under ~35 chars |
| `iconId` | `string` | `undefined` | Icon id from the icons/ library. Omit to show text only. |
| `tint` | `string` | `#0794FD` | CSS colour for the icon mask. Accepts a hex or any CSS colour. |

## Variants

- **Blue tint (default):** `tint="#0794FD"` matches LessonTitle's accent.
- **Pink tint:** `tint="#FF3D8A"` for right-side or alternate lessons.
- **Text-only:** omit `iconId` entirely; the text label renders alone.

## Placement

Place at `x=77, y=58` on the 1920x1080 canvas to match LessonTitle exactly:

```tsx
<Place x={77} y={58}>
  <CourseIdentityRow
    frame={frame}
    reveal={cue('logo')}
    courseTitle="Connecting AI Agents to Systems"
    iconId="science-magnifyingglass-dark"
  />
</Place>
```

## Entrance animation

`translateY(-14 → 0) + opacity(0 → 1)` over `inFrames`, easeOutCubic.
Re-mention pulses fire a brief `+6%` scale bump centred on each `pulseFrames` entry,
with `transformOrigin: center center` so the lockup pulses in place.

## Course identity consistency rule

Pass identical `courseTitle` and `iconId` in every lesson of the same course.
Reference `projects/<courseId>/course.json` to avoid re-deriving these values.

## Source template

`templates/LessonTitle/LessonTitle.tsx`, logo row section.
Geometry constants: `LOGO_X=77`, `LOGO_Y=58`, `LOGO_ICON_DISPLAY=65`, `LOGO_GAP=14`,
`COURSE_TITLE_SIZE=28`, `DEFAULT_ACCENT=#0794FD`.
