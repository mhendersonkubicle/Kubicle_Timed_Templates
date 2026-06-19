---
template: SplitscreenPointsV1
title: Splitscreen Points, Two-Column Comparison Lists
category: comparison
useWhen: A comparison of two things or two states where each side carries a short bulleted list of 1-4 points, each reducible to a short caption plus an optional icon.
tags:
  - comparison
  - contrast
  - two-column
  - splitscreen
  - pros-cons
  - before-after
  - do-dont
  - points-list
  - versus
layout:
  fixed: false                 # pill rows auto-fill top-down for each side's count
  sides: 2
  pillsPerSide: [1, 4]         # each side carries 1 to 4 pills
  asymmetricAllowed: true      # sides choose independently (e.g. 1 left, 4 right)
  perPill: [icon, caption]     # icon is optional
  alignment: top-anchored      # pills fill from row 0 down; no auto-centring
slots:                         # every addressable element (also the reveal targets)
  - setup                      # scaffolding: dark right panel pans in
  - leftTitle
  - leftPill0
  - leftPill1                  # only present when the left side has >= 2 pills
  - leftPill2                  # only present when the left side has >= 3 pills
  - leftPill3                  # only present when the left side has 4 pills
  - rightTitle
  - rightPill0
  - rightPill1                 # only present when the right side has >= 2 pills
  - rightPill2                 # only present when the right side has >= 3 pills
  - rightPill3                 # only present when the right side has 4 pills
narration:
  ordering: linear-by-side       # finish one side fully before starting the other
  comparisonStyle: sequential    # NOT interleaved / point-by-point across sides
  withinSide: top-to-bottom      # pills introduced strictly in row order (row 0 first)
  titleMaxChars: 40
  pillCaptionMaxChars: 22
  pillsIconableOptional: true    # each pill MAY carry one concrete icon
  parallelCadenceAllowed: true   # equal `at` on left/right targets reveals sides in step
timing:
  model: reveal-sequence
  indexedTargets: true           # {side}Pill{i}, i = 0..side.pills.length-1
  canonicalRevealOrder: [setup, leftTitle, leftPill0, leftPill1, leftPill2, leftPill3, rightTitle, rightPill0, rightPill1, rightPill2, rightPill3]
  defaultStepInSeconds: 0.75     # per-pill entrance (scale-in + caption cascade)
  defaultDurationSeconds: [8, 16]
assets:
  templateSpecific: Template-Specific-Assets/   # splitscreen BG + the two pill PNGs
  iconLibrary: shared-master-icons               # icons resolve from Icons/ but are FORCE-RECOLOURED to solid white (the pills sit in saturated blue/pink circles; a two-tone icon's blue accents vanish on blue and clash on pink). The id/variant is cosmetic.
  fonts: [Satoshi-Black, Satoshi-Medium]        # falls back to system sans if absent
---

# SplitscreenPointsV1, Selection & Narration Guidance

## What it is

A two-column comparison. The platinum-blue left half is always part of the canvas; a dark Oxford-blue right panel pans in from off-canvas right to establish the splitscreen frame. Each side then carries a section title and a vertical list of 1-4 pills, blue pills with white captions on the left, pink pills with dark captions on the right. Each pill can hold an optional icon in its circle. Under the reveal-sequence timing model the frame establishes first, then each title and each pill reveals one object at a time.

## Use it when

- You are drawing a **comparison between exactly two** things, states, approaches, or eras, and **each side is a short list**.
- Each side has **one to four points**, and each point can be summarised in a very short caption (≤22 chars) plus an optional single icon.
- The two sides are **parallel**, they answer the same question from opposite positions (pros vs cons, before vs after, manual vs automated, do-this vs not-that, old way vs new way).

## Do NOT use it when

- There are **more than two** things to compare (use a 3+ point or process template instead).
- A side has **more than four** points, or its points cannot be reduced to a short caption.
- The two sides are **not parallel** (e.g. one is a definition and the other is a list), the symmetry will read as forced.
- The relationship is sequential/causal rather than oppositional (use a process or timeline template).
- The two sides each carry only a single headline idea with no supporting list, a tighter dichotomy template (e.g. YinYang2Points) reads better.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Left side title | `left.title` | ≤40 chars, one line | Names side A |
| Left points | `left.pills` | 1-4 | each `{ text, icon? }`, caption ≤22 chars |
| Right side title | `right.title` | ≤40 chars, one line | Names side B |
| Right points | `right.pills` | 1-4 | each `{ text, icon? }`, caption ≤22 chars |
| Pill icon | `pills[i].icon` | optional, id from Icons/ | force-recoloured to solid WHITE for contrast on the blue/pink circle |

Each side independently carries **one to four** pills (see "Variation" below). Pills are **top-aligned from row 0 downward**; a side with fewer pills simply leaves the lower rows empty (there is no auto-centring), so always introduce pills top-to-bottom.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the dark right panel pans in, establishing the splitscreen frame
2. `leftTitle`
3. `leftPill0` (pill + caption + optional icon appear together)
4. `leftPill1`
5. `leftPill2`
6. `leftPill3`
7. `rightTitle`
8. `rightPill0`
9. `rightPill1`
10. `rightPill2`
11. `rightPill3`

Side A is fully on screen (title + all its pills) **before** side B appears at all. Within a side, pills reveal strictly in row order because the geometry reads top-to-bottom.

## Narration rules

### Rule 1, Linear, side-complete comparison (MUST)

The comparison has to be delivered **one whole side at a time**, in reveal order. Complete side A, its title, then its pills top to bottom, and only then move to side B. Never jump back to side A once side B has started, and never pair a side-A pill against a side-B pill in the same breath.

This is not a stylistic preference: the visuals reveal side A's title and all its pills before side B exists on screen. Point-by-point cross-comparison narration would describe side B content while only side A is visible.

**GOOD (linear, side-complete):**
> "Compare the manual and automated ways of working. First, the manual approach. You copy the data by hand. Then you check it twice. And you file it yourself. Now the automated approach. It ingests the data for you. It validates everything instantly. And it archives automatically."

Maps cleanly: leftTitle → leftPill0 → leftPill1 → leftPill2 → rightTitle → rightPill0 → rightPill1 → rightPill2.

**BAD (interleaved / ping-pong):**
> "Let's compare manual and automated. When it comes to copying data, the manual way is by hand but automation does it for you. When it comes to checking, manual checks twice while automation validates instantly."

This walks point-by-point across both sides. It cannot be shown on this template, side B's pills are not yet revealed when its first point is spoken.

### Rule 2, Within a side, top-to-bottom (MUST)

Pills are top-anchored from row 0, so introduce each side's pills **strictly in row order** (row 0 first, then row 1, …). Do not narrate a lower pill before a higher one; the build reads downward.

### Rule 3, Titles set up the opposition

Each title names its side in ≤40 chars and reads as a counterpart to the other (Manual / Automated, Before / After, Pros / Cons). Avoid full sentences.

### Rule 4, Pills are short and parallel

Each pill caption is ≤22 chars and names a concrete idea. Phrase the two sides in **parallel** so the contrast is legible (e.g. left captions are actions a person does; right captions are actions the system does). An optional icon can depict each point concretely (a document, a clock, a checkmark, a robot); icons come from the master Icons/ library (-dark variants) and are optional per pill.

### Rule 5, Optional staggering / parallel cadence

You do not have to use all the reveal steps. A bare two-title comparison (just `leftTitle` + `rightTitle`) is valid; so is one pill per side. Only schedule the objects you actually narrate. The **default cadence is side-complete linear**. A **parallel cadence**, both titles together, then alternating rows together, is a permitted variant: give the matching left/right targets equal `at` values. Use the parallel cadence only when the narration genuinely speaks the two sides in lockstep; otherwise prefer side-complete.

## Variation, pill count (1-4 per side, independent)

The per-side pill count is the built-in variation. Supply 1, 2, 3, or 4 pills on each side, chosen independently:

- Pills **always anchor at row 0 and fill downward**, there is no auto-centring, so a 1-pill side leaves rows 1-3 empty.
- Because each side is independent, **asymmetric** layouts are valid, e.g. one pill on the left and four on the right.
- Schedule one `{side}Pill{i}` per pill; a `{side}Pill{i}` target with `i` beyond that side's pill count is ignored (mirrors the indexed-target rule).

**What stays the same:** pill geometry, all caption/title limits, and row positions are unchanged. Only the *count* changes; lower rows are simply left blank.

## Narration template (fill-in skeleton)

> "[Frame the comparison in one line.] First, [side A]. [A point 1.] [A point 2.] [A point 3.] Now, [side B]. [B point 1.] [B point 2.] [B point 3.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Let's compare two ways of working." [1.6] "First, the manual approach." [2.9] "You copy the data by hand." [4.0] "Then you check it twice." [5.1] "Now, automation." [6.4] "It ingests the data for you." [7.5] "And it validates instantly."

```tsx
left={{
  title: 'Manual',
  pills: [
    { text: 'Copy data', icon: 'add-document' },
    { text: 'Verify twice', icon: 'search' },
  ],
}}
right={{
  title: 'Automated',
  pills: [
    { text: 'Ingest data', icon: 'auto-update' },
    { text: 'Validate', icon: 'ai-assistant' },
  ],
}}
timings={{ sequence: [
  { target: 'setup',     at: 0.3, in: 0.6 },
  { target: 'leftTitle', at: 1.6 },
  { target: 'leftPill0', at: 2.9 },
  { target: 'leftPill1', at: 4.0 },
  { target: 'rightTitle', at: 5.1 },
  { target: 'rightPill0', at: 6.4 },
  { target: 'rightPill1', at: 7.5 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to SplitscreenPointsV1:

1. **Confirm fit.** Is the segment a comparison of *exactly two* parallel things, each with a short list of ≤4 reducible points? If not, reject this template and pick another.
2. **Extract** the two side labels and up to four points per side.
3. **Re-sequence to side-complete, top-to-bottom order.** If the source narration interleaves the comparison (A-point-1 vs B-point-1, then A-point-2 vs B-point-2), rewrite it so side A is delivered in full (pills top to bottom), then side B, matching the canonical reveal order. This re-sequencing is the most common edit. Only keep a parallel cadence if the narration truly speaks the sides in lockstep.
4. **Compress** each point to a ≤22-char caption and assign an optional concrete icon concept; tighten each title to ≤40 chars.
5. **Emit the reveal sequence**, taking each `at` from the start time of the narration line that introduces that object.

## Worked examples (rendered)

- [`examples/pros-cons/`](examples/pros-cons/), full example authored on the reveal-sequence model: a two-sided pros-vs-cons comparison with three pills per side, side-complete linear cadence.

## Field / prop reference

- `left`, `right`: each `{ title: string (1-40 chars), pills: array of 1-4 × { text: string (≤22), icon?: string } }`
- `pills[i].icon`: optional master Icons/ -dark id (`icons/<id>.svg`; use a -dark variant so the light artwork reads on the dark surface)
- Section accent colours are fixed: left Dodger Blue `#0496FF`, right pink `#FF3D8A`
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above (`setup`, `leftTitle`, `rightTitle`, `leftPill{i}`, `rightPill{i}` with `i` = 0-based row index); `at`/`in` in seconds; `in` defaults to 0.75
