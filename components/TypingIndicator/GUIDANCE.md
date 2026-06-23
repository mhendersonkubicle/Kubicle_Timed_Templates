# TypingIndicator

A three-dot animated bubble indicating that a chat participant is composing a reply.
Shown before a message bubble appears and fades out as the real bubble lands.

## What it is

A 96x50 px rounded pill (borderRadius 22, top-left corner 8 to match the WhatsApp-style
tail) in the GroupChat received-bubble gradient (`linear-gradient(180deg, #1c3c5c,
#122c46)`). Three white dots (11-12 px) breathe on a 30-frame cycle with a 5-frame
per-dot stagger, oscillating opacity 0.30 to 1.0.

## Build type

**Code-first.** Pure CSS/SVG, no PNGs. The bubble shape and gradient are reproduced
faithfully in CSS because the geometry is simple (a pill with a gradient). The
TypingDots animation is pure frame math.

## Source template

`GroupChat` (`templates/GroupChat/GroupChat.tsx`): the `TypingDots` sub-component and
the typing-pulse bubble inside `MessageRow`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `fadeOutAtFrame` | `number` | undefined | Frame at which the indicator begins fading out (when the real bubble lands). Omit for a persistent indicator. |
| `fadeOutDur` | `number` | 4 | Duration of the fade-out in frames. Matches GroupChat's 4-frame fade. |

## Variants

No colour variants. The bubble is always the GroupChat received-bubble gradient to
signal "someone else is typing". This matches the semantic: you never show a typing
indicator for your own ("fromMe") messages.

## Usage

```tsx
// Before the real bubble reveal:
<Place x={194} y={bubbleTopY}>
  <TypingIndicator
    frame={frame}
    reveal={{ startFrame: typingStartF, inFrames: 8 }}
    fadeOutAtFrame={bubbleStartF}
    fadeOutDur={4}
  />
</Place>
```

Place it at the same position as the bubble it precedes. Pass `fadeOutAtFrame` equal
to the bubble's own `startFrame` so the two handoff cleanly.
