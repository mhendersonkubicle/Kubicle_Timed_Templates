---
template: Topic1Subtopics6
title: Topic → Subtopics, Split-Screen Detail Waterfall
category: list
useWhen: Unpacking one core concept into 1-6 supporting points (facts, drivers, dimensions, examples), each a short line that reveals top-to-bottom in a vertical waterfall beneath a header pill.
tags:
  - list
  - elaboration
  - breakdown
  - subtopics
  - drivers
  - factors
  - dimensions
  - one-to-many
  - waterfall
  - split-screen
layout:
  fixed: false               # row band + header pill auto-centre vertically for the detail count
  details: [1, 6]            # 1 to 6 detail pills
  perDetail: [pill, text]
  panels: split-screen       # anchor icon (left) + header + details (right)
slots:                       # addressable reveal targets
  - setup                    # oxford-blue right panel pans in + left-panel anchor icon fades in
  - header                   # header pill + titleIcon + mainTitle (one always-present unit)
  - detail0                  # each detail = pill outline scales in + text types out (one object)
  - detail1
  - detail2
  - detail3                  # only present when there are >= 4 details
  - detail4                  # only present when there are >= 5 details
  - detail5                  # only present when there are 6 details
narration:
  ordering: linear-top-to-bottom   # header first, then each detail in waterfall order
  comparisonStyle: sequential      # one detail fully before the next; never skip down the list
  mainTitleMaxWords: 3
  mainTitleMaxChars: 30
  detailMaxChars: 38
  detailStyle: parallel            # noun phrases or short sentences, consistent across rows
timing:
  model: reveal-sequence
  indexedTargets: true             # detail{i}, i = 0..details.length-1
  canonicalRevealOrder: [setup, header, detail0, detail1, detail2, detail3, detail4, detail5]
  defaultStepInSeconds: 1.4        # per-detail entrance covers BOTH scale-in AND typewriter
  mustRevealAllDetails: true       # vertical layout centres on details.length, reveal every detail
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: Template-Specific-Assets/   # oxford_blue_splitscreen_bg, title_pill, pill_outline PNGs
  iconLibrary: shared                            # titleIcon from master Icons/ (-dark) (white), anchor from Icons/ (-light suffix)
  fonts: [Satoshi-Bold, Satoshi-Black]           # falls back to system sans if absent
---

# Topic1Subtopics6, Selection & Narration Guidance

## What it is

A split-screen elaboration. The left, platinum-blue panel carries a large line-art anchor icon; the oxford-blue right panel holds a bold **header pill** announcing one core concept, with up to six **detail pills** stacked beneath it. Under the reveal-sequence model the scaffolding pans in first (right panel + anchor icon), then the header pill slides in, then each detail pill scales in and its text types out one row at a time, top to bottom, one idea fanning out into its supporting points.

For the character-anchor variant of this same layout, use the sibling template **Topic1Subtopics6Character**.

## Use it when

- You are **unpacking a single concept** into its supporting **facts, drivers, dimensions, or examples**.
- There are **1 to 6** supporting points, and each reduces to a **single short line** (≤38 chars).
- The points are **homogeneous**, they sit at the same level under the one header, rather than being a sequence of steps or a two-way contrast.

## Do NOT use it when

- The content is a **sequence of ordered steps** where order is causal (use Process5Steps).
- It is a **two-way contrast** between opposite states (use YinYang2Points).
- There are **more than 6** supporting points, or a point cannot be reduced to one short line.
- There is **no single unifying header**, the items belong to several different topics.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Header title | `mainTitle` | ≤3 words, ≤30 chars | the core concept, one tight phrase in the pill |
| Header icon | `titleIcon` | id from master Icons/ (use a -dark variant) | white pre-coloured glyph, left of the title |
| Details | `details` | 1-6 items | ordered top → bottom in the waterfall |
| Detail line | `details[i]` | ≤38 chars | parallel phrasing (noun phrases or short sentences) |
| Anchor icon | `anchor.id` | `-light`-suffix id from Icons/ | large left-panel illustration |

The detail count is the built-in variation (see "Variation" below). The row band and header pill auto-centre vertically together for whatever count you supply.

## Reveal order (canonical)

1. `setup`, the oxford-blue right panel pans in and the left-panel anchor icon fades in
2. `header`, the header pill slides in carrying its icon + `mainTitle`
3. `detail0`, first detail pill (outline scales in, then text types out)
4. `detail1`
5. `detail2`
6. `detail3` *(if present)*
7. `detail4` *(if present)*
8. `detail5` *(if present)*

Each detail is one object: the pill outline and its typed text reveal together at that detail's cue.

## Narration rules

### Rule 1, Linear top-to-bottom elaboration (MUST)

State the **core concept first** (the header), then deliver each supporting detail **in the order it appears in the waterfall**, one at a time. Never jump to a lower pill before the ones above it have been spoken, and never reorder. The visual builds the list strictly downward as you speak, so "The concept is X. First… then… then…" narration maps directly onto `header, detail0, detail1, detail2…`.

**GOOD (linear, header-then-down):**
> "Cloud costs come down to four drivers. The first is compute, the hours your instances run. The second is storage, how much data you keep, and for how long. The third is data transfer between regions. And the fourth is the managed services you layer on top."

Maps cleanly: header → detail0 → detail1 → detail2 → detail3.

**BAD (out of order / jumping the list):**
> "Cloud costs are mostly about managed services and data transfer, though of course compute matters too, which is really the first thing. Storage is in there somewhere as well."

This names the fourth and third points before the first, and leaves the order ambiguous. It cannot be shown on this template, the lower pills are not yet revealed when their points are spoken, and the waterfall builds downward regardless.

### Rule 2, The header is one tight phrase

`mainTitle` names the single concept in **≤3 words and ≤30 chars** so it fits the pill on one line (Manual validation fails on a 4th word). It is the umbrella the details hang from, not a sentence.

### Rule 3, Details are short and parallel

Each detail line is **≤38 chars** and uses parallel grammar across all rows, all noun phrases, or all short sentences, not a mix. The line carries just enough to anchor the spoken point; the fuller explanation lives in the voiceover, not the pill.

### Rule 4, Reveal every detail you supply (MUST)

Unlike the chevron template, this layout centres the row band on `details.length`, reserving a vertical slot for **every** supplied detail. If the sequence reveals fewer detail steps than there are details, the unrevealed rows leave **blank gaps** in the centred band. So the sequence must schedule one `detail{i}` for **each** detail in `details` (i.e. reveal count = `details.length`).

## Variation, detail count (1-6)

The detail count is the built-in variation. Supply 1, 2, 3, 4, 5, or 6 details:

- The row band **auto-centres vertically** on the canvas for the count (3 rows sit centred with the header pill directly above them, etc.).
- The **header pill follows the band**, it keeps a constant gap above the first row, shifting down for fewer rows so the composition stays together.
- Schedule one `detail{i}` per detail; the layout reserves a slot for every supplied detail, so reveal **all** of them (see Rule 4). A `detail{i}` target beyond `details.length` has no content and is ignored.

See [`examples/cloud-cost-drivers/`](examples/cloud-cost-drivers/) for an authored 4-detail reference.

## Narration template (fill-in skeleton)

> "[Name the core concept in one line, this is the header.] [Detail 1.] [Detail 2.] [Detail 3.] [… up to 6, in order.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.4] "Cloud costs come down to four drivers." [2.4] "The first is compute, the hours your instances run." [4.2] "The second is storage you keep over time." [6.0] "The third is data transfer between regions." [7.8] "And the fourth is the managed services on top."

```tsx
mainTitle="Cost drivers"
titleIcon="arrow-trend-up"
anchor={{ id: 'business-strategy-checklist-light' }}
details={[
  'Compute hours',
  'Storage over time',
  'Cross-region transfer',
  'Managed services',
]}
timings={{ sequence: [
  { target: 'setup',  at: 0.4, in: 1.2 },
  { target: 'header', at: 0.4, in: 0.8 },
  { target: 'detail0', at: 2.4 },
  { target: 'detail1', at: 4.2 },
  { target: 'detail2', at: 6.0 },
  { target: 'detail3', at: 7.8 },
] }}
```

(Reveal count = `details.length` = 4, as Rule 4 requires.)

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Topic1Subtopics6:

1. **Confirm fit.** Is the segment one concept broken into 1-6 homogeneous supporting points, each reducible to a short line? If it is a sequence of steps, a two-way contrast, or >6 items, pick another template.
2. **Extract** the umbrella concept (the header, ≤3 words) and the supporting points in the order they are spoken.
3. **Order-check.** Ensure the narration states the header first, then the points strictly top-to-bottom. If the source mentions a later point before an earlier one, re-sequence it to run straight down the list.
4. **Compress** the header to ≤3 words / ≤30 chars and each detail to ≤38 chars with parallel phrasing; pick a `titleIcon` (master Icons/ (-dark)) and a `-light` `anchor` id (Icons/).
5. **Emit the reveal sequence**: a `setup` step, a `header` step, then one `detail{i}` per detail (reveal them all), each `at` taken from the start time of the narration line that introduces that element.

## Worked examples (rendered)

- [`examples/cloud-cost-drivers/`](examples/cloud-cost-drivers/), authored 4-detail breakdown: realistic content + the reveal sequence.

## Field / prop reference

- `mainTitle`: `string` (≤3 words, ≤30 chars)
- `titleIcon`: `string`, master Icons/ -dark id (pre-coloured white)
- `details`: array of **1-6** × `string` (≤38 chars)
- `anchor`: `{ id: string }`, Icons/ catalogue id ending in `-light`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `header`, or `detail{i}` (`i` = 0-based detail index); `at`/`in` in seconds; `in` defaults to **1.4** (covers the pill scale-in plus the typewriter)
