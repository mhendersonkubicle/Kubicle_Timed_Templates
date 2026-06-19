---
template: OrgChart
title: Org Chart, Top-Down Structure Hierarchy
category: structure
useWhen: A hierarchy or structure where one top box branches into 1-5 levels below it of up to 4 boxes each (an org chart, reporting line, taxonomy, or system breakdown), each box reducible to one short label.
tags:
  - structure
  - hierarchy
  - org-chart
  - organisation
  - reporting-line
  - taxonomy
  - breakdown
  - tree
  - top-down
layout:
  fixed: false               # chart auto-centres; row count and per-row box count vary
  top: 1                     # always exactly one top box
  rows: [1, 5]               # 1 to 5 rows below the top
  boxesPerRow: [1, 4]        # each row holds 1 to 4 boxes (rows may be uneven widths)
  perBox: [label]            # each box is a single text label, no icon / avatar
slots:                       # addressable reveal targets
  - setup                    # the central vertical spine draws in (scaffold staging)
  - top                      # the single top box scales in
  - node0_0                  # row 0, box 0 (node{r}_{c}); node{r}_0 also draws row r's connector
  - node0_1                  # ... left-to-right within a row, then down a row
  - node1_0                  # (further node{r}_{c} present per the supplied rows shape)
narration:
  ordering: top-down                 # top box first, then each level downward
  comparisonStyle: level-complete    # left-to-right within a level before the next level
  labelMaxChars: 40
  labelStyle: parallel               # peers on a level share grammar (all nouns / all functions)
timing:
  model: reveal-sequence
  indexedTargets: true               # node{r}_{c}, r = 0..rows.length-1, c = 0..row.length-1
  canonicalRevealOrder: [setup, top, node0_0, node0_1, "...", node1_0, "...", nodeR_C]
  staging: animated                  # setup draws the central spine in (not a blank stage)
  defaultStepInSeconds: 0.6          # per-box entrance (box scale; node{r}_0 also draws the row connector)
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: none             # pure code + SVG connectors; no bundled PNGs
  iconLibrary: none                  # no icons, boxes carry text only
  fonts: [Satoshi-Black, Satoshi-Bold, Satoshi-Medium]
---

# OrgChart, Selection & Narration Guidance

## What it is

A top-down structure chart. One box sits at the top (deep oxford), and 1 to 5 rows of dodger-blue boxes hang below it off a central vertical spine, each row joined to the spine by a horizontal bar with a short drop to every box. Under the reveal-sequence model the spine draws in first as the scaffold, then the top box scales in, then each lower box pops in top-down and left-to-right, the connector for each row arriving with that row's first box. The whole chart auto-centres for whatever shape you supply.

## Use it when

- The content is a **hierarchy or structure**, an org chart, reporting line, taxonomy, or system-into-parts breakdown, where one thing **branches into** several below it.
- There is **exactly one** thing at the top and **1 to 5 levels** beneath it, each with **1 to 4** boxes.
- Each box reduces to a **single short label** (a team, function, or stage), with no icon, avatar, or person.

## Do NOT use it when

- The items are an **ordered sequence** rather than a branching hierarchy (use a process or timeline template).
- The relationship is a **two-way pairing or opposition** (use ComparativePoints2 or YinYang2Points).
- A box needs **people, avatars, or more than a short label**, or there are more than 5 levels / more than 4 boxes on a level.
- The structure is a flat **list of parallel points** with no top-level parent (use a points/list template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Top box | `top` | 1 | a single label, the root of the hierarchy |
| Rows | `rows` | 1-5 rows | each row an array of box labels; rows may be uneven widths |
| Box label | `rows[r][c]` | ≤40 chars | wraps to up to 3 lines; keep short, boxes narrow at 4-per-row |

`top` is always exactly one box. `rows` is 1 to 5 arrays; each holds 1 to 4 labels. A 1-4-3-4 shape is `rows: [[..4..], [..3..], [..4..]]`.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the central vertical spine draws down the middle (the scaffold the rows hang off)
2. `top`, the single top box scales in
3. `node0_0`, `node0_1`, … the first row, left-to-right (node0_0 also draws row 0's bar + drops)
4. `node1_0`, `node1_1`, … the second row, left-to-right
5. … one `node{r}_{c}` per box, continuing top-down then left-to-right

Each box is one object. The first box of a row brings that row's connector with it; the remaining boxes scale in at their own cues.

## Narration rules

### Rule 1, Top-down, level-complete (MUST)

Introduce the structure **from the top down**: name the top box first, then each level beneath it, finishing one whole level (left-to-right across its boxes) before moving down to the next. This matches the build, the spine and top box land first, then each row fills in. Do not describe a lower box before the level above it exists on screen, and do not jump between levels.

**GOOD (top-down, level-complete):** "At the top sits the **Executive Office**. Reporting into it are four functions: **Product**, **Engineering**, **Design**, and **Operations**. Below that, three shared teams: **Research**, **Platform**, and **Brand**."

**BAD (jumps levels / ping-pongs):** "Brand and the AI Lab sit at the bottom, all rolling up through Engineering to the Executive Office at the very top." (Describes lower boxes before their parents are on screen, and the order spoken does not match the top-down build.)

### Rule 2, Labels are short and parallel

Each box label is ≤40 chars and wraps to fit, but keep it to a tight noun phrase (a team, function, or stage). Boxes on the same level should share grammar (all functions, all teams, all stages) so the level reads as a set of peers. Longer explanation lives in the voiceover, not the box.

### Rule 3, One label per box, no people

Boxes carry text only, no icons, avatars, or names. If you need to show people or roles with faces, this is the wrong template.

## Variation, shape (1-5 rows × 1-4 boxes)

The chart shape is the built-in variation. Supply 1 to 5 rows, each 1 to 4 boxes, including uneven widths:

- The stack **auto-centres vertically** and its per-row pitch adapts to the row count (roomier for few rows, tighter for five).
- Each row **auto-centres horizontally** for its own box count, so a 4-row then 3-row then 4-row shape stays balanced.
- Schedule `setup`, then `top`, then one `node{r}_{c}` per box in top-down, left-to-right order. A `node{r}_{c}` whose row/col is out of range for the supplied `rows` is ignored.

See [`examples/department-structure/`](examples/department-structure/) for a worked 1-4-3-4 chart.

## Narration template (fill-in skeleton)

> "[At the top sits / This all rolls up to] [top box]. Below it, [level-1 boxes, listed left to right]. Beneath that, [level-2 boxes, listed left to right]. [… one level at a time, top to bottom.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] (spine draws in) [1.1] "At the top, the Executive Office." [2.0] "Four functions report in: Product, Engineering, Design, Operations." [4.4] "Below them, three shared teams: Research, Platform, Brand."

```tsx
top="Executive Office"
rows={[
  ['Product', 'Engineering', 'Design', 'Operations'],
  ['Research', 'Platform', 'Brand'],
]}
timings={{
  sequence: [
    { target: 'setup',   at: 0.2, in: 0.9 },
    { target: 'top',     at: 1.1 },
    { target: 'node0_0', at: 2.0 },
    { target: 'node0_1', at: 2.5 },
    { target: 'node0_2', at: 3.0 },
    { target: 'node0_3', at: 3.5 },
    { target: 'node1_0', at: 4.4 },
    { target: 'node1_1', at: 4.9 },
    { target: 'node1_2', at: 5.4 },
  ],
  // Re-mention pulse: if "Executive Office" is named again ~7s in.
  pulses: [{ target: 'top', at: 7.0 }],
}}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to OrgChart:

1. **Confirm fit.** Is the segment a branching hierarchy with one top box and 1-5 levels of up to 4 boxes each, each box a short label? If it is a sequence, a pairing, or a flat list, reject this template and pick another.
2. **Extract** the top box and the rows, in top-down order, each box a ≤40-char label.
3. **Re-sequence to top-down, level-complete order.** If the source narration starts at the bottom or jumps between levels, rewrite it so the top box is named first, then each level fully (left-to-right) before the next. This re-sequencing is the most common edit.
4. **Emit the reveal sequence**: a `setup` step (spine), then `top`, then one `node{r}_{c}` per box in reveal order, each `at` taken from the start time of the narration line that introduces that box.
5. **Add pulses** for any box named again >~2-3s after its reveal: a `timings.pulses` entry `{ target, at }` at the re-mention cue.

## Worked examples (rendered)

- [`examples/department-structure/`](examples/department-structure/), a worked 1-4-3-4 chart: the content props and the reveal sequence (with a sample pulse). (No MP4 rendered.)

## Field / prop reference

- `top`: string (≤40), the single top box label
- `rows`: array of **1-5** × (array of **1-4** strings ≤40), the lower rows (uneven widths allowed)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `top`, or `node{r}_{c}` (`r` = 0-based row index, `c` = 0-based box index within the row); `at`/`in` in seconds; `in` defaults to 0.6
- `timings.pulses`: array of `{ target, at }`; `target` is a content box (`top` or `node{r}_{c}`); `at` is the re-mention second (brief +5% brand pulse)
