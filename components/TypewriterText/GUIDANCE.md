# TypewriterText

A text span that reveals characters one-by-one across a defined frame window, with an optional blinking cursor that disappears once typing is complete.

## Build type

**Code-first.** Pure CSS/inline layout, fully recolourable via `color` prop, size-agnostic. No PNG dependencies.

## Source template

Extracted from `BulletList6Pills` (`templates/BulletList6Pills/BulletList6Pills.tsx`). The typewriter mechanic, cursor geometry, and blink cadence are lifted directly from that template's per-pill typing logic.

## What it is

`TypewriterText` decouples the character-reveal mechanic from any particular pill or layout. Drop it anywhere you need text to type on, at any size or colour. A 4 px vertical bar cursor blinks beside the typed substring while typing is in progress (toggling every 15 frames at 30 fps, 2 Hz), then disappears once all characters are shown.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` drives the entrance animation |
| `text` | `string` | required | Full string to type out |
| `typeStartFrame` | `number` | `reveal.startFrame` | Frame at which typing begins |
| `typeEndFrame` | `number` | `reveal.startFrame + reveal.inFrames` | Frame at which all characters are shown |
| `fontFamily` | `string` | `FONT_BODY` (Satoshi) | Any CSS font-family string |
| `fontWeight` | `number \| string` | `700` | CSS font weight |
| `fontSize` | `number` | `60` | px |
| `color` | `string` | `'#FFFFFF'` | CSS color for the text |
| `animateEntrance` | `boolean` | `true` | When true, fades + translates in via `appear()` over `reveal.inFrames` |

## Known usages

| Template | fontSize | fontWeight | color |
|---|---|---|---|
| BulletList6Pills | 60 | 700 (Satoshi Bold) | `#FFFFFF` |
| Timeline5Tiles | 37 | 700 (Satoshi Bold) | `#FFFFFF` |
| BigPoints3V2 | 33 | 500 (Satoshi Medium) | `#0B1E33` |

## Cursor spec

- Width: 4 px
- Height: `fontSize * 1.2` (line height)
- Color: `#0496FF` (COLORS.blue)
- Opacity: 0.95
- Blink: toggles every 15 frames at 30 fps (2 Hz duty cycle)
- Hidden once typing is complete (`charsShow >= text.length`)

## Placement

Placement-agnostic. Wrap in `<Place x={...} y={...}>` from kit when composing on the 1920x1080 canvas, or use inside a flex/absolute container.

## Re-mention pulse

Supports `reveal.pulseFrames` via `pulse()` from kit: a brief +6% scale bump, centred on each pulse frame.

## Decoupling typeStartFrame from typeEndFrame

By default both windows mirror the reveal window, matching the BulletList6Pills approach where typing fills the full entrance. Pass explicit `typeStartFrame`/`typeEndFrame` to offset typing after the entrance (for example, when a `setup` scaffold has already revealed the container and only the typing needs its own window).
