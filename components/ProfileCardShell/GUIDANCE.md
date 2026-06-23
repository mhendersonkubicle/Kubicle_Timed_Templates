# ProfileCardShell

White rounded-rectangle card container with a multi-layer drop shadow. Outer scaffold for any portrait + text + stat card layout (CharacterProfileCard and its derivatives). Pops in with an easeOutBack(1.25) squash-and-stretch entrance.

## Build type

**Code-first.** Pure CSS div, recolourable and resizable. No PNG artwork required. Source template: `CharacterProfileCard`.

## What it is

A single `<div>` with:
- White (`#FFFFFF`) background (overridable via `background` prop)
- Exact two-layer drop shadow from CharacterProfileCard: `0 30px 60px rgba(15,25,45,0.10), 0 10px 25px rgba(15,25,45,0.06)`
- `overflow: hidden` so portrait images and content clip cleanly to the rounded corners
- `position: relative` so children can use absolute positioning inside the card coordinate space

The shell does **not** render any content itself. Compose portrait, name, bio, stats, etc. as children.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `variant` | `'single' \| 'duo' \| 'team'` | `'single'` | Named size preset; overrides explicit w/h/r |
| `width` | `number` | 640 | Ignored when `variant` is set |
| `height` | `number` | 1000 | Ignored when `variant` is set |
| `borderRadius` | `number` | 40 | Ignored when `variant` is set |
| `accentColor` | `string` | `COLORS.blue` | Forwarded context only; not rendered by the shell |
| `background` | `string` | `'#FFFFFF'` | Card face colour |
| `children` | `ReactNode` | — | Card content |

## Variants (exact geometry from CharacterProfileCard)

| Variant | Width | Height | Border-radius | Use case |
|---|---|---|---|---|
| `single` | 640 | 1000 | 40 | One presenter card, centred on a 1920x1080 canvas |
| `duo` | 580 | 920 | 36 | Two cards side by side |
| `team` | 1800 | 920 | 36 | Full-width three-card team row |

## Entrance animation

`easeOutBack(1.25)` scale from 0 at `transformOrigin: center`. During the overshoot peak the card briefly stretches horizontally (+6%) and compresses vertically (-6%), then settles to 1:1. The opacity tracks the same progress via `easeOutCubic`. Re-mention pulses compose into the same transform.

## Canvas background

The source template uses `#EDEFF3` as the canvas background. Place `ProfileCardShell` on an `AbsoluteFill` with `background: #EDEFF3` (or the `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})` used in the component examples) for the white card + shadow to read correctly.

## Usage

```tsx
import { ProfileCardShell } from 'components/ProfileCardShell/ProfileCardShell';
import { Place } from 'components/_lib/kit';

// Single card centred on 1920x1080 canvas (left = 640, top = 40)
<Place x={640} y={40}>
  <ProfileCardShell frame={frame} reveal={cue('card')} variant="single">
    {/* portrait, name, bio, stats go here */}
  </ProfileCardShell>
</Place>
```
