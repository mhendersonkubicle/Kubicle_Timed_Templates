# InitialsAvatar

A coloured circle showing two-letter initials derived from a person's name. Colour is assigned deterministically from a five-colour tint palette by first-appearance order, matching the GroupChat template's author-tint system exactly.

## Build type

**Code-first.** Pure CSS circle with an inset shadow. No PNG artwork required. Fully recolourable and resizable.

## Source template

`GroupChat` (the `Avatar` sub-component inside `GroupChat.tsx`).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame. |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` entrance timing. |
| `name` | `string` | required | Full name; initials taken from first + last word. |
| `tintIndex` | `number` | `0` | 0-based first-appearance index into the tint palette. |
| `color` | `string` | — | Direct hex or COLORS key override; takes priority over `tintIndex`. |
| `size` | `number` | `64` | Diameter in px. |

## Tint palette (by first-appearance order)

| Index | Hex | Name |
|---|---|---|
| 0 | `#0794FD` | Dodger blue |
| 1 | `#4DD0B6` | Mint teal |
| 2 | `#FBBF24` | Amber |
| 3 | `#FF9A8B` | Salmon |
| 4 | `#A78BFA` | Lavender |

Indices wrap modulo 5 for more than five distinct authors.

## Initials logic

First character of the first word + first character of the last word, both uppercased. A single-word name yields one character.

## Font

Satoshi Bold 700, `fontSize = size * 0.40`.

## Inset shadow

`inset 0 -2px 4px rgba(0,0,0,0.20), inset 0 1px 2px rgba(255,255,255,0.25)` (matches GroupChat exactly).

## Entrance animation

`easeOutBack` scale pop via `appear()`, composes with `pulse()` for re-mention bumps. Returns `null` before `reveal.startFrame` so it never occupies layout space until it enters.

## Usage

```tsx
<Place x={110} y={470}>
  <InitialsAvatar
    frame={frame}
    reveal={cue('avatar0')}
    name="Margaret Cole"
    tintIndex={0}
    size={64}
  />
</Place>
```

Use in chat window headers, member grids, or beside author name labels. Pair `tintIndex` with the same first-appearance counter used to colour the author name label so the circle and the name share the same tint.
