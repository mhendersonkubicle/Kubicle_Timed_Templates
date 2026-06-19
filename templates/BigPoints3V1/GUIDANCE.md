---
template: BigPoints3V1
title: Big Points, Icon + Pill Recap (2-3)
category: points
useWhen: A flat recap of two or three top-level takeaways or features, where each point is a single icon plus a short pill caption and the points are surfaced one at a time, left to right.
tags:
  - points
  - list
  - recap
  - takeaways
  - features
  - highlights
  - summary
  - key-points
layout:
  fixed: false               # panel + bar auto-size and centre for the point count
  points: [2, 3]             # 2 or 3 points
  perPoint: [icon, pill]
slots:                       # addressable reveal targets
  - setup                    # oxford-blue panel + empty loading bar fade/scale in
  - point0                   # each point = icon + pill (one object); bar advances to it
  - point1
  - point2                   # only present when there are 3 points
narration:
  ordering: linear-by-point      # introduce points strictly left → right
  comparisonStyle: sequential    # one point fully before the next; no cross-point comparison
  labelMaxChars: 25
  labelStyle: parallel           # short noun phrases, 2-4 words, parallel phrasing
  pointsMustBeIconable: true      # each point maps to one concrete icon
timing:
  model: reveal-sequence
  indexedTargets: true           # point{i}, i = 0..points.length-1
  canonicalRevealOrder: [setup, point0, point1, point2]
  defaultStepInSeconds: 0.8      # per-point entrance (icon scale + pulse + pill pop)
  defaultDurationSeconds: [6, 11]
assets:
  templateSpecific: Template-Specific-Assets/   # pill_box.png (the caption pill graphic)
  iconLibrary: shared                            # icons resolve from the shared Icons/ library
  fonts: [Satoshi-Black, Inter-ExtraBold]        # falls back to system sans if absent
---

# BigPoints3V1, Selection & Narration Guidance

## What it is

A row of two or three columns on an oxford-blue panel. Each column carries a single bold icon and a coloured pill caption beneath it. A loading bar floats above the panel and sweeps left → right, advancing to each column as that point is revealed: the icon pops in (with a soft sine pulse) and its caption pill pops up. Under the reveal-sequence model the panel and empty bar come in first (`setup`), then each point reveals one at a time and the bar fill arrives at its column on its cue. The last scheduled point completes the bar to 100 %.

## Use it when

- You are surfacing **two or three top-level takeaways**, features, or highlights as a quick visual recap.
- Each point reduces to a **single short caption** (≤25 chars) plus one concrete icon.
- The points are a **flat, parallel set**, they answer the same question and carry equal weight (not a sequence of dependent steps).

## Do NOT use it when

- There are **more than three** points (use a list/process template that scales further).
- A point needs more than a short caption, or cannot be summarised with a single icon.
- The items are an **ordered process** where each step depends on the previous one (use Process5Steps).
- The content is an **either/or contrast** between two opposing sides (use YinYang2Points).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Points | `points` | 2-3 items | ordered left → right |
| Point caption | `points[i].label` | ≤25 chars | short noun phrase (2-4 words), parallel phrasing |
| Point icon | `points[i].icon` | id from Icons | recoloured white body + Dodger Blue accents |

The panel and loading bar auto-size and stay centred for the supplied count (see "Variation, point count (2-3)" below). The pill graphic, icon size, and caption size are fixed regardless of count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, oxford-blue panel fades + scales in, empty loading bar appears
2. `point0`, leftmost column: icon pops + pulses, caption pill pops, bar advances to it
3. `point1`, middle (3-pt) or right (2-pt) column: same icon + pill unit, bar advances
4. `point2`, rightmost column *(only when there are 3 points)*: same unit, bar completes to 100 %

Each point is one object: the icon and its caption pill reveal together at that point's cue, and the bar fill arrives at that column.

## Narration rules

### Rule 1, Linear, point-by-point (MUST)

Introduce the points **strictly left to right, one at a time**, matching the reveal order. Deliver one takeaway fully before moving to the next. Do not describe a later point before its column is revealed, and do not jump back to an earlier one. The loading bar sweeping to column `i` is the visual commitment that point `i` is "now", so "First… then… and finally…" narration maps directly onto `point0, point1, point2`.

This is not a stylistic preference: the bar fill arriving at a column is bound to that point's cue. Jumping ahead would describe a point whose icon and pill are not yet on screen.

**GOOD (linear, point-by-point):**
> "Here are the three wins. First, **faster processing**. Then, **real-time sync**. And finally, **zero downtime**."

Maps cleanly: point0 → point1 → point2, with the bar arriving at each column as it is named.

**BAD (ping-pong / out of order):**
> "We get zero downtime and faster processing, and somewhere in the middle there's real-time sync too."

This names the third point first and scrambles the order. It cannot be shown on this template, the bar has not yet reached the later columns when their points are spoken.

### Rule 2, Captions are short and parallel

Each caption is ≤25 chars and uses parallel grammar across all points, all short noun phrases of 2-4 words (Faster processing / Real-time sync / Zero downtime), not a mix of phrasings or full sentences. Longer narration lives in the voiceover, not the pill.

### Rule 3, One icon per point

Each point's icon should depict the point concretely (a rocket for speed, a refresh loop for sync, a shield for reliability). Icons come from the shared Icons library and are recoloured to a white body with Dodger Blue accents at render time.

### Rule 4, Only schedule what you narrate

You do not have to use all reveal steps. A bare two-point recap (`setup` + `point0` + `point1`) is valid. Only schedule the points you actually narrate; a `point{i}` beyond `points.length` is ignored.

## Variation, point count (2-3)

The point count is the built-in variation. Supply 2 or 3 points:

- The oxford-blue panel and the loading bar **auto-size and stay centred** for the count, so the 2-point case has no empty negative space drifting to one side.
- The loading bar **advances column-by-column** on point cues regardless of count, and the last scheduled point completes the fill to 100 %.
- Schedule one `point{i}` per point; `point{i}` targets beyond `points.length` are ignored.

See [`examples/two-point/`](examples/two-point/) for the 2-point variation.

## Narration template (fill-in skeleton)

> "[Name the recap in one line.] First, [point 1]. Then, [point 2]. And finally, [point 3]."

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to BigPoints3V1:

1. **Confirm fit.** Is the segment a flat recap of *2 or 3* parallel takeaways, each reducible to a short icon-able caption? If ordered/dependent, >3 items, or oppositional, pick another template.
2. **Extract** the 2-3 points and a ≤25-char caption + icon concept for each.
3. **Order-check.** Ensure the narration introduces the points one at a time, left to right. If the source mentions a later point first or jumps around, re-sequence it to run straight through.
4. **Compress** each point to a ≤25-char caption (short noun phrase) and assign a concrete icon concept; keep phrasing parallel across points.
5. **Emit the reveal sequence**: a `setup` step, then one `point{i}` per point, each `at` taken from the start time of the narration line that introduces that point.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Here's what the new release gives you." [1.4] "First, faster processing." [3.0] "Then, real-time sync." [4.6] "And finally, zero downtime."

```tsx
points={[
  { icon: 'rocket',     label: 'Faster processing' },
  { icon: 'auto-update', label: 'Real-time sync' },
  { icon: 'shield',     label: 'Zero downtime' },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.3, in: 0.9 },
  { target: 'point0', at: 1.4 },
  { target: 'point1', at: 3.0 },
  { target: 'point2', at: 4.6 },
] }}
```

## Worked examples (rendered)

- [`examples/two-point/`](examples/two-point/), the 2-3 count variation (2 points), with the authored scene + reveal sequence.

## Field / prop reference

- `points`: array of **2-3** × `{ icon: string, label: string (≤25) }`, ordered left → right
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `point{i}` (`i` = 0-based point index); `at`/`in` in seconds; `in` defaults to 0.8
