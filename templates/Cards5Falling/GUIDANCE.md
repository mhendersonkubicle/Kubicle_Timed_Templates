---
template: Cards5Falling
title: Falling Cards, Single-Focus Card Sequence
category: list
useWhen: A flat, ordered list of 1-5 self-contained point-cards introduced one at a time, where each card is a single short title plus an icon and only one card should hold focus at any moment.
tags:
  - list
  - cards
  - points
  - sequence
  - single-focus
  - one-at-a-time
  - takeaways
  - highlights
  - features
layout:
  fixed: false                 # same centred slot reused; card count drives length, not position
  cards: [1, 5]                # 1 to 5 cards
  perCard: [bookmark, title, icon]
  singleFocus: true            # exactly one card on screen at a time
slots:                         # addressable reveal targets (INDEXED)
  - card0                      # each card = header (bookmark + title) + body icon (one object)
  - card1
  - card2
  - card3                      # only present when there are >= 4 cards
  - card4                      # only present when there are 5 cards
narration:
  ordering: linear-by-card       # introduce cards strictly in array order
  comparisonStyle: sequential    # single-focus; finish one card before the next, no cross-references
  titleMaxChars: 24
  titleStyle: parallel           # tight noun phrases, parallel in form across cards
  iconsMustBeDark: true          # each card needs a distinct "-dark" icon for the Oxford-Blue body
timing:
  model: reveal-sequence
  indexedTargets: true           # card{i}, i = 0..cards.length-1
  canonicalRevealOrder: [card0, card1, card2, card3, card4]
  setup: none                    # no shared scaffolding, the first card IS the first object
  defaultCardInSeconds: 0.9      # per-card slide-in (entrance) duration
  exitModel: derived             # card{i} falls away when card{i+1} fires; the last card persists
  defaultDurationSeconds: [8, 15]
assets:
  templateSpecific: Template-Specific-Assets/   # card_header.png (header gradient + Oxford-Blue body)
  iconLibrary: shared                            # body icons resolve from the shared Icons/ library ("-dark" variants)
  fonts: [Inter-Bold]                            # falls back to system sans if absent
---

# Cards5Falling, Selection & Narration Guidance

## What it is

A single-focus card sequence on a flat platinum (#E6ECF2) background. Each card is a rounded panel with a blue-gradient header (a bookmark glyph + a bold white title) above an Oxford-Blue body that shows one large icon. A card slides down from above the frame, lands at the centre, and later falls through the frame to reveal the next card. Only **one card is on screen at a time**. Under the reveal-sequence model each card is one object that reveals at its own cue, in array order.

## Use it when

- The content is a **flat, ordered list of 1-5 point-cards**, takeaways, highlights, features, tips, introduced one after another.
- Each card reduces to a **single short title** (≤24 chars) plus one icon.
- You want **single-focus** pacing: each point gets the whole frame to itself before the next arrives.

## Do NOT use it when

- The items must be **seen together / compared** side by side (the prior card has already fallen out of frame, use a points/list or comparison template).
- There are **more than 5 items**, or a card needs more than a short title.
- The relationship is a **causal process** where the steps build on each other and the chain should stay visible (use Process5Steps).
- The relationship is **oppositional** rather than a flat list (a two-way contrast → use YinYang2Points).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Cards | `cards` | 1-5 items | ordered; index 0 is shown first |
| Card title | `cards[i].title` | ≤24 chars, one line | tight noun phrase, parallel phrasing; clipped if over-long |
| Card icon | `cards[i].icon` | id from the Icon Library | use the `-dark` variant so it reads on the Oxford-Blue body |
| Bookmark glyph | (auto) |, | inline SVG, identical on every card |

## Reveal order (canonical)

The template reveals cards in array order, and **the narration must follow it**:

1. `card0`, first card slides in (header + title + body icon, together)
2. `card1`
3. `card2`
4. `card3` *(if present)*
5. `card4` *(if present)*

Each card is one object: header, title, and body icon reveal together at that card's cue. There is **no `setup` target**, this template has no shared scaffolding, so the first card sliding in is the first thing on screen.

## Narration rules

### Rule 1, Linear, one-card-at-a-time / single-focus (MUST)

Introduce the cards **strictly in array order**, one at a time, matching the reveal order. Because the layout shows exactly one card at a time (each falls away as the next arrives), you must **fully deliver one card before moving to the next**. Never reference a later card before its cue, and never cross-reference a previous card (e.g. "unlike the last one"), the prior card has already fallen out of frame, so the comparison has nothing to point at.

**GOOD (linear, single-focus):**
> "Here's how to get the most from the course. First, **edit your notes** as you go. Then, **watch each lecture** in order. Next, **track your progress** weekly. And finally, **earn your certificate**."

Maps cleanly: card0 → card1 → card2 → card3, each spoken while that card holds the frame.

**BAD (cross-referencing / out of order):**
> "You'll earn a certificate at the end, but unlike just watching lectures, editing your notes is what really helps, and we'll get to tracking progress too."

This names the last card first, cross-references cards that are no longer on screen, and breaks the one-at-a-time build the visual enforces.

### Rule 2, Titles are short and parallel

Each title is ≤24 chars and uses parallel grammar across all cards, all imperative verb phrases ("Edit notes", "Watch lecture", "Track progress") or all nouns. Over-long titles are clipped with an ellipsis rather than wrapped, so keep them tight. Longer detail lives in the voiceover, not the card.

### Rule 3, One distinct dark-mode icon per card

Each card needs one **distinct** icon that depicts its point concretely. Use the `-dark` suffix variants (platinum-white + dodger-blue): these read on the Oxford-Blue body. `-light` icons have a dark element that disappears against the body. Do not reuse the same icon across cards.

## Variation, card count (1-5)

The card count is the built-in variation. Supply 1, 2, 3, 4, or 5 cards:

- Every card uses the **same centred slot**, so fewer cards simply means a **shorter sequence**, there is no layout reflow.
- Schedule one `card{i}` per card in order; `card{i}` targets beyond `cards.length` are ignored.
- **Exit is derived, not scheduled.** Each card falls away when the next scheduled card fires (`card{i}` exits at `card{i+1}.at`). The **last** scheduled card has no successor, so it persists to the end of the composition, give it tail time.

See [`examples/three-card/`](examples/three-card/) for the count variation.

## Narration template (fill-in skeleton)

> "[Name the list in one line.] First, [card 1]. Then, [card 2]. Next, [card 3]. [card 4]. And finally, [card 5]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a flat, ordered list of 1-5 self-contained points, each reducible to a short title, with no need to see two at once? If items must be compared together, or there are >5, pick another template.
2. **Extract** the ordered points and a ≤24-char title + a distinct `-dark` icon concept for each.
3. **De-cross-reference.** Single-focus means only one card is ever visible. If the source narration says "unlike the first point…" or names a later point early, rewrite it so each point stands alone and is spoken in order.
4. **Emit the reveal sequence**: one `card{i}` per card (no `setup`), each `at` taken from the start time of the narration line that introduces that card. Allow tail time after the last card's `at` so it stays on screen.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.4] "Here's how to get the most from the course." [2.5] "First, edit your notes as you go." [5.0] "Then watch each lecture in order." [7.5] "And finally, track your progress weekly."

```tsx
cards={[
  { title: 'Edit notes',    icon: 'edit-dark' },
  { title: 'Watch lecture', icon: 'video-dark' },
  { title: 'Track progress', icon: 'chart-line-dark' },
]}
timings={{ sequence: [
  { target: 'card0', at: 2.5 },
  { target: 'card1', at: 5.0 },
  { target: 'card2', at: 7.5 },
] }}
```

card0 slides in at 2.5 s and falls out at 5.0 s (card1's cue); card1 falls out at 7.5 s (card2's cue); card2 has no successor, so it persists to the end.

## Worked examples (rendered)

- [`examples/three-card/`](examples/three-card/), the 1-5 count variation (3 cards): the authored scene + reveal sequence (no MP4; layout reference).

## Field / prop reference

- `cards`: array of **1-5** × `{ title: string (≤24), icon: string }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `card{i}` (`i` = 0-based card index, no `setup`); `at`/`in` in seconds; `in` (slide-in duration) defaults to 0.9
- Exit motion is derived: `card{i}` falls out when `card{i+1}` fires; the last scheduled card persists. The fall itself is a fixed 2.0 s easeInOutCubic.
