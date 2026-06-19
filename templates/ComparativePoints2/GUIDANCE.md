---
template: ComparativePoints2
title: Comparative Points, Two Linked Points
category: comparison
useWhen: A pairing of exactly two parallel concepts joined by a relationship of linkage or association, where each side reduces to one short caption plus a single icon.
tags:
  - comparison
  - pairing
  - linkage
  - association
  - two-point
  - cause-effect
  - input-output
  - complementary
  - connection
layout:
  fixed: true            # fixed geometry, exactly two points, one per side
  sides: 2
  pointsPerSide: 1       # each side carries exactly one icon + caption
  connector: chain-link  # baked centre decoration reading "these belong together"
slots:                   # every addressable element (also the reveal targets)
  - setup                # scaffolding: bg scale-in + centre chain-link connector scale/rotate
  - leftPoint            # left shell + left icon + left pill caption (one unit)
  - rightPoint           # right shell + right icon + right pill caption (one unit)
narration:
  ordering: linear-by-side       # finish the left point fully before the right
  comparisonStyle: sequential    # NOT interleaved / point-by-point across sides
  captionMaxChars: 30
  pointsMustBeIconable: true     # each point maps to one concrete icon
timing:
  model: reveal-sequence
  canonicalRevealOrder: [setup, leftPoint, rightPoint]
  defaultStepInSeconds: 1.2      # per-side entrance (shell slide + icon + caption sub-stagger)
  defaultDurationSeconds: [7, 11]
assets:
  templateSpecific: Template-Specific-Assets/   # bg, centre plate, and the two side shells
  iconLibrary: shared                            # side icons resolve from the shared Icons/ library
  iconVariant: -dark                             # icons render AS-IS (no recolour) on DARK shells -> use the -dark (light-artwork) variant; -light icons disappear (see README "icon-contrast principle")
  fonts: [Satoshi-Bold]                          # falls back to system sans if absent
---

# ComparativePoints2, Selection & Narration Guidance

## What it is

A two-point pairing. A background scales in from the centre, a chain-link connector scales and rotates into place in the middle, then a shell slides in from the left carrying an icon and a pill caption, mirrored by a shell sliding in from the right. The chain-link icon in the centre reads visually as "these belong together". The content reveals one side at a time under the reveal-sequence timing model.

## Use it when

- You are pairing **exactly two** parallel concepts whose relationship is one of **linkage or association**, cause and effect, input and output, two complementary skills, two halves of the same idea.
- Each side reduces to **one short caption** (≤30 chars) plus a **single icon**.
- The two sides are **parallel** and the point is that they *connect* (not that they oppose). The centre chain icon makes "these go together" the headline.

## Do NOT use it when

- There are **more than two** points to pair (use a 3+ point template).
- A side needs **more than one** caption or its idea cannot be reduced to a short icon-able label.
- The relationship is a **stark either/or opposition** with internal sub-points per side (use YinYang2Points, which carries up to two sub-points per side).
- The relationship is **sequential/causal as a chain of steps** rather than a single two-way link (use a process or timeline template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Left point | `points[0]` | 1 | `{ icon, label }`, caption ≤30 chars |
| Right point | `points[1]` | 1 | `{ icon, label }`, caption ≤30 chars |

`points` is **exactly 2** items (zod `.length(2)`), one per side. Geometry is strictly fixed, there is no count variation. Box/pill size and icon size are fixed regardless of content.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, background scales in, then the centre chain-link connector scales and rotates into place
2. `leftPoint`, left shell slides in, its icon and pill caption appear together
3. `rightPoint`, right shell slides in, its icon and pill caption appear together

The left point is fully on screen **before** the right point appears at all.

## Narration rules

### Rule 1, Linear, two-point linkage (MUST)

Name the relationship in one line first (the chain icon reads "these belong together"), then deliver the **left point fully**, its concept and caption, and only then the right point. Never interleave the two captions in one breath, and never describe the right point before its shell is on screen.

This is not a stylistic preference: the visuals reveal the left shell, icon, and caption before the right shell exists on screen. Interleaved narration would describe the right point while only the left is visible.

**GOOD (linear, two-point linkage):**
> "These two skills go hand in hand. First, word recognition, knowing each word on sight. And it links directly to working memory, holding those words in mind as you read."

Maps cleanly: setup (the relationship) → leftPoint (word recognition) → rightPoint (working memory).

**BAD (interleaved / ping-pong):**
> "Word recognition and working memory work together. One lets you read each word, the other lets you hold them; the first feeds the second, which in turn supports the first."

This blends both points in one breath before the right shell is revealed. It cannot be shown on this template, the right point is not yet on screen when it is first described.

### Rule 2, Name the link up front

Open by naming the relationship the chain stands for (these connect / one drives the other / two halves of one idea) in a single line that lands during `setup`. This is what justifies the centre connector.

### Rule 3, Captions are short and icon-able

Each caption is ≤30 chars and names a concrete idea a single icon can depict (a brain, a clock, a document, a target). Phrase the two sides in **parallel** so the pairing is legible (e.g. both are skills, both are stages, both are halves of a whole). Captions that exceed the pill width are ellipsis-clipped, so keep them tight.

### Rule 4, Optional staggering

You do not have to reveal both sides at separate cues if the narration genuinely introduces them together, but the standard, and the shape the template is built for, is `setup → leftPoint → rightPoint`. Only schedule the objects you actually narrate; a `setup`-only scene (just the connector) is valid.

## Variation, none (fixed two-point geometry)

Unlike count-variable templates, ComparativePoints2 is **strictly two points**, one per side, locked by the schema (`points` length 2). There is no count to vary: both shells, both icon positions, and both pill bboxes are fixed. The only authoring choices are the two icons, the two captions, and the reveal timing.

**What stays the same:** shell geometry, icon size (380 px), pill bbox, caption limit (≤30 chars), and the centre chain connector are all fixed. Only the content and the timing change.

## Narration template (fill-in skeleton)

> "[Name the link between the two points in one line.] First, [left point], [what it is]. And it links to [right point], [what it is]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.4] "Two reading skills that work together." [2.8] "First, word recognition, reading each word on sight." [6.0] "And it links to working memory, holding those words in mind."

```tsx
points={[
  { icon: 'vocabulary',  label: 'Word recognition' },
  { icon: 'strong-mind', label: 'Working memory' },
]}
timings={{ sequence: [
  { target: 'setup',     at: 0.4, in: 2.4 },
  { target: 'leftPoint', at: 2.8, in: 1.4 },
  { target: 'rightPoint', at: 6.0, in: 1.4 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to ComparativePoints2:

1. **Confirm fit.** Is the segment a pairing of *exactly two* parallel concepts joined by a relationship of linkage or association, each reducible to one short caption? If it is a stark either/or with sub-points (→ YinYang2Points), a sequence (→ a process template), or has more than two points, reject this template and pick another.
2. **Extract** the two point labels and a concrete icon concept for each.
3. **Re-sequence to side-complete order.** If the source narration blends the two points (describing both in one breath), rewrite it so the left point is delivered in full, then the right, matching the canonical reveal order. This re-sequencing is the most common edit.
4. **Compress** each point to a ≤30-char caption and assign a concrete icon concept.
5. **Emit the reveal sequence**: a `setup` step naming the link, then `leftPoint`, then `rightPoint`, each `at` taken from the start time of the narration line that introduces that object.

## Worked examples (rendered)

- [`examples/cause-and-effect/`](examples/cause-and-effect/), a worked example authored from a two-point linkage script: the content props and the reveal sequence. (No MP4 rendered.)

## Field / prop reference

- `points`: array of **exactly 2** × `{ icon: string, label: string (≤30) }` (left, right)
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above (`setup`, `leftPoint`, `rightPoint`); `at`/`in` in seconds; `in` defaults to 1.2
