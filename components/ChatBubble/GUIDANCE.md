# ChatBubble

A rounded speech bubble for a single chat message. Two core visual variants: a dark mid-blue **received** bubble (left-aligned, tail on top-left) and a dodger-blue **sent** bubble (right-aligned, tail on top-right). A third **accent** variant (wild-strawberry) supports TextThread2Characters-style exchanges. The bubble pops in from its anchored tail corner with an `easeOutBack` scale and a short upward slide, matching the GroupChat template's `easeOutBackBouncy` entrance exactly.

## Build type

**Code-first.** Pure CSS, fully recolourable via the `variant` prop, freely resizable. No PNG assets required.

## Source template

`GroupChat` (`templates/GroupChat/GroupChat.tsx`). Geometry is lifted verbatim from the `MessageRow` sub-component:

- `maxWidth` 760 px
- Horizontal padding 26 px, vertical padding 16 px
- `borderRadius` 22 px; tail corner `borderTopLeftRadius`/`borderTopRightRadius` 8 px
- Received background: `linear-gradient(180deg, #1c3c5c 0%, #122c46 100%)`, border `rgba(255,255,255,0.06)`
- Sent background: `linear-gradient(180deg, #1A9CFE 0%, #0686EE 100%)`, border `rgba(255,255,255,0.10)`
- Accent background: `linear-gradient(180deg, #F865B0 0%, #d94d96 100%)`, border `rgba(255,255,255,0.10)`
- Font: Satoshi Medium 28 px, line-height 1.30, letter-spacing -0.005 em

## Props

| Prop          | Type            | Default        | Notes |
|---------------|-----------------|----------------|-------|
| `frame`       | `number`        | required       | Current Remotion frame. |
| `reveal`      | `Reveal`        | required       | `{ startFrame, inFrames, pulseFrames? }` from the kit contract. |
| `text`        | `string`        | required       | The message text. Up to ~110 chars before it risks wrapping beyond two lines at default width. |
| `variant`     | `'received' \| 'sent' \| 'accent'` | `'received'` | Visual variant and alignment. |
| `fontSize`    | `number`        | `28`           | Message text size in px. |
| `author`      | `string`        | `undefined`    | Author label shown above received bubbles only. |
| `authorColor` | `ColorVariant`  | `'#0794FD'`    | Tint for the author name. Named variant or hex. |
| `maxWidth`    | `number`        | `760`          | Maximum bubble width in px. |

## Variants

- `received`: dark mid-blue gradient, left-aligned, tail on top-left. Used for all speakers except the protagonist ("me" voice).
- `sent`: dodger-blue gradient, right-aligned, tail on top-right. Used for the protagonist's messages.
- `accent`: wild-strawberry gradient, right-aligned, tail on top-right. Used in TextThread2Characters two-character threads.

## Entrance animation

- Scale: `easeOutBack` (overshoot factor 1.6 from kit default), 0.82 to 1.0 over `inFrames`. Transform origin anchored at the tail corner (`top left` for received, `top right` for sent/accent).
- Translate Y: 18 px to 0 px, same easing.
- Opacity: `easeOutQuad` over the first 55% of `inFrames`.
- Re-mention pulse: `+6%` scale bump via the kit `pulse()` helper when `pulseFrames` are supplied.

## Placement

Placement-agnostic. Use inside a flex column or `<Place x y>`. It is not a canvas-region component. To reproduce the GroupChat layout, set the outer flex item to `justify-content: flex-start` for received and `justify-content: flex-end` for sent/accent.

## Usage

```tsx
// Received message, left-aligned:
<Place x={194} y={320}>
  <ChatBubble
    frame={frame}
    reveal={cue('msg0')}
    variant="received"
    author="Margaret"
    authorColor="#4DD0B6"
    text="Cost savings would help, but what about quality?"
  />
</Place>

// Sent message, right-aligned (wrap in a right-anchored container):
<div style={{ position: 'absolute', right: 36, top: 480 }}>
  <ChatBubble
    frame={frame}
    reveal={cue('msg1')}
    variant="sent"
    text="I am thinking a side-by-side eval on real traffic."
  />
</div>
```
