# FullBleedBackground

## What it is

A full-canvas background image layer that fades in as scene scaffolding. It renders any static asset as an `objectFit: cover` image that fills the entire 1920x1080 stage. This is the "setup" beat of the LessonTitle template extracted as a reusable canvas-region component.

## Build type

**Asset-backed, canvas-region.** Render it directly inside an `<AbsoluteFill>`, not inside a `<Place>` wrapper. It occupies the full stage.

## Source template

`LessonTitle` (the `setup` reveal target). The canonical asset is `Template-Specific-Assets/LessonTitle/lesson_title_background.png`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame. |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` from the kit contract. Controls when and how fast the background fades in. |
| `src` | `string` | `Template-Specific-Assets/LessonTitle/lesson_title_background.png` | Static asset path (relative to public/) passed to `staticFile()`. Any PNG works. |
| `baseFill` | `string` | `#020d18` | Solid colour shown behind the image while it loads. Match to the scene's dark base. |

## Animation

Pure opacity fade: 0 to 1 over `reveal.inFrames` frames starting at `reveal.startFrame`, eased with `easeOutCubic`. No scale, no translate. This matches the LessonTitle `setup` beat exactly.

## Variants

No colour variants. The visual is entirely driven by whichever PNG is supplied via `src`. For LessonTitle scenes, use the default. For other templates, supply their own background asset.

## Usage example

```tsx
<FullBleedBackground
  frame={frame}
  reveal={{ startFrame: 0, inFrames: 17 }}
  src="Template-Specific-Assets/LessonTitle/lesson_title_background.png"
  baseFill="#020d18"
/>
```

Compose it as the bottommost layer, then place other components on top:

```tsx
<AbsoluteFill style={{ backgroundColor: '#020d18' }}>
  <FullBleedBackground frame={frame} reveal={cue('setup')} />
  <Place x={77} y={58}>
    <WordTab frame={frame} reveal={cue('logo')} text="Excel Fundamentals" />
  </Place>
</AbsoluteFill>
```
