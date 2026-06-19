---
template: YinYang2Points
title: Yin/Yang, Two-Sided Comparison
category: comparison
useWhen: A distinct comparison of two things or two states, where each side has up to two reinforcing sub-points that can be carried by a short caption plus an icon.
tags:
  - comparison
  - contrast
  - dichotomy
  - two-state
  - before-after
  - problem-solution
  - manual-vs-automated
  - do-vs-dont
  - versus
layout:
  fixed: true            # fixed geometry, exactly two sides
  sides: 2
  subPointsPerSide: [1, 2]   # each side carries 1 OR 2 sub-points
  asymmetricAllowed: true    # sides choose independently (e.g. 1 left, 2 right)
slots:                   # every addressable element (also the reveal targets)
  - setup                # scaffolding: both panels + empty title bars + empty boxes
  - leftTitle
  - leftBox0
  - leftBox1             # only present when the left side has 2 sub-points
  - rightTitle
  - rightBox0
  - rightBox1            # only present when the right side has 2 sub-points
narration:
  ordering: linear-by-side       # finish one side fully before starting the other
  comparisonStyle: sequential    # NOT interleaved / point-by-point across sides
  titleMaxChars: 18
  subPointCaptionMaxChars: 16
  subPointsMustBeIconable: true   # each sub-point maps to one concrete icon
timing:
  model: reveal-sequence
  canonicalRevealOrder: [setup, leftTitle, leftBox0, leftBox1, rightTitle, rightBox0, rightBox1]
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: Template-Specific-Assets/   # the panel/bar/box PNGs
  iconLibrary: shared                            # icons resolve from the shared Icons/ library
  fonts: [Inter-ExtraBold, Satoshi-Bold]         # falls back to system sans if absent
---

# YinYang2Points, Selection & Narration Guidance

## What it is

A two-pane comparison. A navy panel with a **blue** accent bar slides up from below on the left; a mirrored navy panel with a **pink** accent bar slides down from above on the right. Each panel holds a title and two icon-and-caption boxes. The content reveals one object at a time under the reveal-sequence timing model.

## Use it when

- You are drawing a **clear comparison between exactly two** things, states, approaches, or eras.
- Each side has **one or two sub-points** that reinforce it, and each sub-point can be summarised in a very short caption (≤16 chars) plus a single icon.
- The two sides are **parallel**, they answer the same question from opposite positions (manual vs automated, before vs after, problem vs solution, do-this vs not-that, old way vs new way).

## Do NOT use it when

- There are **more than two** things to compare (use a 3+ point or process template instead).
- A side has **more than two** sub-points, or its sub-points cannot be reduced to a short icon-able caption.
- The two sides are **not parallel** (e.g. one is a definition and the other is a list), the symmetry will read as forced.
- The relationship is sequential/causal rather than oppositional (use a process or timeline template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Left side title | `leftTitle` | ≤18 chars, one line | Names side A |
| Right side title | `rightTitle` | ≤18 chars, one line | Names side B |
| Left sub-points | `leftBoxes` | 1 or 2 | each `{ icon, text }`, caption ≤16 chars |
| Right sub-points | `rightBoxes` | 1 or 2 | each `{ icon, text }`, caption ≤16 chars |

Each side independently carries **one or two** sub-points (see "Variation, one sub-point per side" below). Box size is fixed regardless of count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, both panels, empty bars and empty boxes, slide in
2. `leftTitle`
3. `leftBox0` (icon + caption appear together)
4. `leftBox1`
5. `rightTitle`
6. `rightBox0`
7. `rightBox1`

Side A is fully on screen (title + both sub-points) **before** side B appears at all.

## Narration rules

### Rule 1, Linear, side-complete comparison (MUST)

The comparison has to be delivered **one whole side at a time**, in reveal order. Complete side A, its title, then its first sub-point, then its second, and only then move to side B. Never jump back to side A once side B has started, and never pair a side-A sub-point against a side-B sub-point in the same breath.

This is not a stylistic preference: the visuals reveal side A's title and both boxes before side B exists on screen. Point-by-point cross-comparison narration would describe side B content while only side A is visible.

**GOOD (linear, side-complete):**
> "Compare the manual and automated ways of working. First, the manual approach. You copy the data by hand. Then you check it twice. Now the automated approach. It ingests the data for you. And it validates everything instantly."

Maps cleanly: leftTitle → leftBox0 → leftBox1 → rightTitle → rightBox0 → rightBox1.

**BAD (interleaved / ping-pong):**
> "Let's compare manual and automated. When it comes to copying data, the manual way is by hand but automation does it for you. When it comes to checking, manual checks twice while automation validates instantly."

This walks sub-point-by-sub-point across both sides. It cannot be shown on this template, side B's boxes are not yet revealed when its first sub-point is spoken.

### Rule 2, Titles set up the opposition

Each title names its side in ≤18 chars and reads as a counterpart to the other (Manual / Automated, Before / After). Use a **single word or a short 2-4 word phrase**, never a full sentence: the limit is sized to the fixed coloured title bar (735px), and anything longer overflows it.

### Rule 3, Sub-points are short and icon-able

Each sub-point caption is ≤16 chars: a **single word or 2-4 words**, naming a concrete idea a single icon can depict (a document, a clock, a checkmark, a robot). The limit is sized to the fixed white footer box (354px); longer captions spill past the box edge. Phrase the two sides in **parallel** so the contrast is legible (e.g. left captions are actions a person does; right captions are actions the system does).

### Rule 4, Optional staggering

You do not have to use all six reveal steps. A bare two-title comparison (just `leftTitle` + `rightTitle`) is valid; so is one sub-point per side. Only schedule the objects you actually narrate.

## Variation, one sub-point per side

Each side carries **one or two** sub-points, chosen independently:

- **Two sub-points** (`leftBoxes`/`rightBoxes` length 2) → the side uses the baked two-box scaffolding, exactly as in the main example.
- **One sub-point** (length 1) → the template centres a **single fixed-size box** under that side's title (same width, height, corner radius, and shadow as a paired box). The icon and caption centre over it.

Because each side is independent, **asymmetric** layouts are valid too, e.g. one sub-point on the left and two on the right.

**What stays the same:** box size and all caption/title limits are unchanged (caption ≤16 chars, title ≤18, fixed box geometry). Only the *count and placement* change.

**Sequence implication:** with one sub-point, only that side's `box0` step is meaningful. The `box1` target has no content and is never rendered, so it can be omitted from the sequence (leaving it in is harmless).

Use the single-sub-point layout when a side's point is strong enough to stand alone, or when the two sides naturally have a different number of reinforcing points. See [`examples/one-per-side/`](examples/one-per-side/) for a rendered reference.

## Narration template (fill-in skeleton)

> "[Frame the comparison in one line.] First, [side A]. [A sub-point 1.] [A sub-point 2.] Now, [side B]. [B sub-point 1.] [B sub-point 2.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.5] "Let's compare two ways of working." [2.2] "First, the manual approach." [4.0] "You copy the data by hand." [5.4] "Then you check it twice." [6.8] "Now, automation." [8.2] "It ingests the data for you." [9.6] "And validates instantly."

```tsx
leftTitle="Manual"
rightTitle="Automated"
leftBoxes={[
  { icon: 'edit-by-hand', text: 'Copy data' },
  { icon: 'double-check', text: 'Verify twice' },
]}
rightBoxes={[
  { icon: 'data-ingest', text: 'Ingest data' },
  { icon: 'validate',   text: 'Validate' },
]}
timings={{ sequence: [
  { target: 'setup',     at: 0.5, in: 2.5 },
  { target: 'leftTitle', at: 2.2 },
  { target: 'leftBox0',  at: 4.0 },
  { target: 'leftBox1',  at: 5.4 },
  { target: 'rightTitle', at: 6.8 },
  { target: 'rightBox0', at: 8.2 },
  { target: 'rightBox1', at: 9.6 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to YinYang2Points:

1. **Confirm fit.** Is the segment a comparison of *exactly two* parallel things, each with ≤2 reducible sub-points? If not, reject this template and pick another.
2. **Extract** the two side labels and up to two sub-points per side.
3. **Re-sequence to side-complete order.** If the source narration interleaves the comparison (A-point-1 vs B-point-1, then A-point-2 vs B-point-2), rewrite it so side A is delivered in full, then side B, matching the canonical reveal order. This re-sequencing is the most common edit.
4. **Compress** each sub-point to a ≤16-char caption and assign a concrete icon concept; tighten each title to ≤18 chars.
5. **Emit the reveal sequence**, taking each `at` from the start time of the narration line that introduces that object.

## Worked examples (rendered)

- [`examples/you-vs-me/`](examples/you-vs-me/), full example authored from a real SRT: the source narration, the authored scene + reveal sequence, and the rendered MP4 with audio (two sub-points per side).
- [`examples/one-per-side/`](examples/one-per-side/), the single-sub-point-per-side variation, with a rendered MP4 reference.

## Field / prop reference

- `leftTitle`, `rightTitle`: `string` (1-18 chars)
- `leftBoxes`, `rightBoxes`: array of **1 or 2** × `{ icon: string, text: string (≤16) }`
- `leftAccent`, `rightAccent`: optional `#RRGGBB` (default blue `#0496FF` / pink `#F865B0`)
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above; `at`/`in` in seconds; `in` defaults to 0.5
