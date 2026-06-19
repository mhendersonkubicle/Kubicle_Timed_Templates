---
template: CirclePoints4
title: Circle Points, Flat Row of 1-4 Points
category: points
useWhen: A flat set of 1-4 parallel points (features, benefits, qualities), where each point is a single short noun-phrase label plus an icon and there is no ordering dependency between them.
tags:
  - points
  - features
  - benefits
  - qualities
  - highlights
  - icons
  - flat-list
  - parallel
timing:
  model: reveal-sequence
  staging: none                  # no setup step (no scaffolding animates in) -> do NOT use for a beat with a lead-in before its first content (see README "no-dead-air principle")
  indexedTargets: true           # point{i}, i = 0..points.length-1
  canonicalRevealOrder: [point0, point1, point2, point3]
  defaultStepInSeconds: 0.7      # per-point entrance (pop + pulse + label fade)
  defaultDurationSeconds: [5, 10]
layout:
  fixed: false                   # circle row auto-centres for the point count
  points: [1, 4]                 # 1 to 4 points
  perPoint: [circle, icon, label]
slots:                           # addressable reveal targets
  - point0                       # each point = circle + white icon + label (one object)
  - point1                       # only present when there are >= 2 points
  - point2                       # only present when there are >= 3 points
  - point3                       # only present when there are 4 points
narration:
  ordering: linear-by-point      # introduce points one at a time, in reveal order
  comparisonStyle: sequential    # complete one point before the next; no jumping ahead
  labelMaxChars: 20
  labelStyle: parallel           # short noun phrases, 1-3 words; consistent form
assets:
  templateSpecific: Template-Specific-Assets/   # base_circle.png (the blue disc)
  iconLibrary: shared                            # icons resolve from the shared library; forced solid white
  fonts: [Satoshi-Bold]                          # falls back to system sans if absent
---

# CirclePoints4, Selection & Narration Guidance

## What it is

A flat row of 1-4 circles on a light platinum-blue (`#E6ECF2`) background. Each circle is a blue disc holding a white icon, with a short bold black label beneath it. Under the reveal-sequence model each point pops in one at a time: its circle scales up with an easeOutBack pop, a soft pulse rides the tail, and its label fades in with it, all as one object. The row auto-centres for whatever count is supplied.

## Use it when

- You have a **flat set of 1-4 parallel points**, features, benefits, qualities, highlights, that sit at the same level.
- Each point reduces to a **single short noun-phrase label** (≤20 chars) plus one icon.
- The points are **parallel, not sequential**, there is no causal or ordered dependency between them; you simply want to present each in turn.

## Do NOT use it when

- The points are an **ordered process** or pipeline where order matters (use Process5Steps).
- The content is an **either/or contrast between two sides** (use YinYang2Points).
- There are **more than 4** points, or a point needs more than a short label.
- A point cannot be reduced to a concrete, icon-able noun phrase.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Points | `points` | 1-4 items | ordered left → right; row auto-centres for the count |
| Point label | `points[i].label` | ≤20 chars | tight noun phrase (1-3 words), parallel form |
| Point icon | `points[i].icon` | id from icon library | forced solid white to read on the blue disc |

## Reveal order (canonical)

1. `point0`, circle 1 + its white icon + its label
2. `point1` *(if present)*
3. `point2` *(if present)*
4. `point3` *(if present)*

Each point is one object: the circle, its icon, and its label reveal together at that point's cue. There is **no `setup` step**, this template has no scaffolding to stage in, so the blank canvas is simply the flat fill.

## Narration rules

### Rule 1, Linear, point-by-point (MUST)

Introduce the points **one at a time, in reveal order** (left → right). Complete one point before moving to the next, and never describe a point before its circle is on screen. The visual reveals circles one by one as you speak, so "First… next… also… finally…" narration maps directly onto `point0, point1, point2, point3`.

Because the points are parallel (not sequential or causal), the *order* is a presentation choice rather than a logical dependency, but once chosen, the narration must follow it and must not jump ahead to a point that has not yet appeared.

**GOOD (linear, point-by-point):**
> "Our platform gives you four things. First, **data quality** you can trust. Next, **fast queries** that return in seconds. There's **low cost** at any scale. And finally, **easy setup** in minutes."

Maps cleanly: point0 → point1 → point2 → point3.

**BAD (jumps ahead / bundles):**
> "It's cheap and easy to set up, and on top of that you get great data quality and fast queries."

This names the fourth and third points before their circles exist and bundles all four into one breath, so the spoken order cannot match the build.

### Rule 2, Labels are short and parallel

Each label is ≤20 chars and a tight noun phrase (1-3 words). Keep the grammatical form consistent across all points (all noun phrases, not a mix of nouns and imperative sentences). Strip verbs: "Improve data quality" → "Data quality". Longer explanation lives in the voiceover, not the label.

### Rule 3, One icon per point

Each point's icon should depict its idea concretely (a shield for "Data quality", a lightning bolt for "Fast queries", a coin for "Low cost"). Any icon works, it is forced solid white so it reads on the blue disc.

## Variation, point count (1-4)

The point count is the built-in variation. Supply 1, 2, 3, or 4 points:

- The circle row **auto-centres** on the canvas for the count (`circleCxFor`), so 2 circles sit centred in the frame rather than drifting left.
- Schedule one `point{i}` per point; `point{i}` targets beyond `points.length` are ignored.

See [`examples/four-features/`](examples/four-features/) for a full 4-point layout.

## Narration template (fill-in skeleton)

> "[Name the set in one line.] First, [point 1]. Next, [point 2]. Also, [point 3]. And finally, [point 4]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a flat set of 1-4 parallel points, each reducible to a short noun phrase? If the points are ordered/causal, or there are more than 4, or it is a two-way contrast, pick another template.
2. **Extract** the points and a ≤20-char noun-phrase label + icon concept for each.
3. **Order-check.** Pick a presentation order and ensure the narration introduces the points one at a time in that order, never naming a point before its circle appears. If the source bundles points into one breath, split them so each gets its own introducing line.
4. **Emit the reveal sequence**: one `point{i}` per point, each `at` taken from the start time of the narration line that introduces that point. There is no `setup` step.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.4] "Our platform gives you four things." [1.2] "First, data quality you can trust." [2.4] "Next, fast queries in seconds." [3.6] "There's low cost at any scale." [4.8] "And finally, easy setup in minutes."

```tsx
points={[
  { icon: 'shield',        label: 'Data quality' },
  { icon: 'lightning-bolt', label: 'Fast queries' },
  { icon: 'coin',          label: 'Low cost' },
  { icon: 'rocket',        label: 'Easy setup' },
]}
timings={{ sequence: [
  { target: 'point0', at: 1.2 },
  { target: 'point1', at: 2.4 },
  { target: 'point2', at: 3.6 },
  { target: 'point3', at: 4.8 },
] }}
```

## Worked examples (rendered)

- [`examples/four-features/`](examples/four-features/), full 4-point layout, authored scene + reveal sequence (no MP4 rendered yet, layout reference).

## Field / prop reference

- `points`: array of **1-4** × `{ icon: string, label: string (≤20) }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `point{i}` (`i` = 0-based point index); `at`/`in` in seconds; `in` defaults to 0.7
