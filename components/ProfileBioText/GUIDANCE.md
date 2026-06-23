# ProfileBioText

Muted grey supporting text block for profile card layouts. Sits beneath a role
title (e.g. after `ProfileCardShell` + `VerifiedBadge`) and delivers a short
descriptive sentence, wrapping to two lines.

**Build type:** code-first (pure CSS, fully recolourable and resizable)
**Source template:** `templates/CharacterProfileCard`

---

## Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `text` | `string` | required | Bio copy. Wraps to ~2 lines; honour char limits below |
| `width` | `number` | `580` | Container width in px. Match the card's inner content width |
| `color` | `string` | `#6B7280` | Muted grey default; pass any hex or named brand colour |
| `size` | `'single' \| 'duo'` | `'single'` | Switches font size; see Variants below |

---

## Variants

| Size | Font size | Max chars | Use case |
|------|-----------|-----------|----------|
| `single` (default) | 24 px | 95 chars | Single or team-wide profile card |
| `duo` | 20 px | 80 chars | Two profile cards side-by-side |

---

## Entrance animation

SlideUp 28 px + opacity fade, `easeOutCubic`, duration set by `reveal.inFrames`.
Fully visible by frame `startFrame + inFrames`. Re-mention pulses fire a brief
+6% scale bump via `reveal.pulseFrames`.

---

## Typography (from CharacterProfileCard source)

- Font: Satoshi Medium 500 (`FONT_BODY`)
- Line height: 1.35
- Letter spacing: -0.005em
- `overflowWrap: break-word`

---

## Placement

Placement-agnostic. Wrap in `<Place x y>` from `_lib/kit` to position on the
1920x1080 canvas. In CharacterProfileCard the bio sits at card-local top
`BIO_Y = 752` (= `NAME_Y + 70`), left `CARD_PAD = 30`.
