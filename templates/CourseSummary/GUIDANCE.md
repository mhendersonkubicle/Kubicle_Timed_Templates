---
template: CourseSummary
title: Course Summary, Stacked Recap Pills
category: list
useWhen: An end-of-lesson or end-of-module recap of 1-6 ordered takeaways, where each takeaway is a single short line and they read top-to-bottom as a flat list.
tags:
  - list
  - recap
  - summary
  - takeaways
  - key-points
  - wrap-up
  - conclusion
  - review
layout:
  fixed: false               # pill band auto-centres vertically for the count
  recaps: [1, 6]             # 1 to 6 recap pills
  perPill: [label]           # one white pill + one bold black label
slots:                       # addressable reveal targets
  - setup                    # banner badge drops into the top-left corner
  - pill0                    # each pill = white pill PNG + bold label (one object)
  - pill1
  - pill2
  - pill3                    # only present when there are >= 4 recaps
  - pill4                    # only present when there are >= 5 recaps
  - pill5                    # only present when there are 6 recaps
narration:
  ordering: linear-top-to-bottom   # introduce recaps strictly in stacking order
  comparisonStyle: sequential      # one recap fully before the next; no jumping down
  recapMaxChars: 40
  recapStyle: parallel             # all noun phrases or all verb phrases, not a mix
timing:
  model: reveal-sequence
  indexedTargets: true             # pill{i}, i = 0..recaps.length-1
  canonicalRevealOrder: [setup, pill0, pill1, pill2, pill3, pill4, pill5]
  defaultPillInSeconds: 1.2        # per-pill roll-in (preserves the slow cascade feel)
  defaultDurationSeconds: [8, 15]
assets:
  templateSpecific: Template-Specific-Assets/   # the banner + pill PNGs
  iconLibrary: none                             # this template uses no shared icons
  fonts: [Satoshi-Bold]                         # falls back to system sans if absent
---

# CourseSummary, Selection & Narration Guidance

## What it is

An end-of-course recap. A banner badge drops down into the top-left corner, then a stack of 1-6 white takeaway pills cascade in from above on the platinum-blue base. Each pill rolls out from under the one above it, carrying a single bold black takeaway line. Under the reveal-sequence model the banner comes in first (`setup`), then each pill reveals one at a time, top to bottom.

## Use it when

- You are **wrapping up** a lesson or module and want to restate its **main takeaways**.
- There are **1 to 6 points**, each reducible to a **single short line** (≤40 chars).
- The points read as a **flat, ordered list** top-to-bottom, no comparison axis, no branching, no causal flow between them.

## Do NOT use it when

- The points are a **sequential process** where order is causal (use Process5Steps, the chevron flow).
- The content is a **two-way contrast** (use YinYang2Points).
- There are **more than 6** points, or a point needs more than a short line (it will wrap awkwardly or overflow the pill).
- The points need **icons, numbers, or grouping** to make sense, this template is text-only pills.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Recaps | `recaps` | 1-6 items | ordered top → bottom |
| Recap line | `recaps[i]` | ≤40 chars | parallel phrasing (all noun phrases or all verb phrases); wraps to a 2nd line inside the pill if longer |
| Banner | (asset) |, | non-narrated badge, revealed at `setup` |

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the banner badge drops into the top-left corner
2. `pill0`, first recap pill rolls in from above
3. `pill1`, rolls out from under pill0
4. `pill2`
5. `pill3` *(if present)*
6. `pill4` *(if present)*
7. `pill5` *(if present)*

Each pill is one object: the white pill and its label reveal together at that pill's cue.

## Narration rules

### Rule 1, Linear, top-to-bottom recap (MUST)

Introduce the recap points **strictly in the order they stack down the frame**, one at a time, matching the reveal order. Do not reference a lower pill before it has rolled in, and do not reorder. The visual builds the stack from the top down as you speak, so "First… then… also… finally…" narration maps directly onto `pill0, pill1, pill2…`.

This is not a stylistic preference: each pill rolls out from under the previous one, so a lower pill literally does not exist on screen until its cue. Narration that jumps to the last takeaway first would describe a pill that has not yet appeared.

**GOOD (linear, top-to-bottom):**
> "Let's recap what we covered. First, **define your audience**. Then, **map their journey**. Next, **set clear goals**. And finally, **measure what matters**."

Maps cleanly: pill0 → pill1 → pill2 → pill3.

**BAD (out of order / jumping ahead):**
> "By the end you'll be measuring what matters, but it all starts with defining your audience and mapping their journey."

This names the bottom pill before the top ones have rolled in, and the spoken order doesn't match the build.

### Rule 2, Recaps are short and parallel

Each recap is ≤40 chars and uses parallel grammar across all pills, all imperative verbs ("Define your audience", "Map the journey") or all noun phrases ("Audience definition", "Journey mapping"). Avoid mixing forms or writing full sentences; the elaboration lives in the voiceover, not the pill.

### Rule 3, The banner is scaffolding, not a point

The top-left banner is a non-narrated badge revealed at `setup`. Do not assign a recap line to it or narrate it as a takeaway.

## Variation, recap count (1-6)

The recap count is the built-in variation. Supply 1, 2, 3, 4, 5, or 6 recaps:

- The pill band **auto-centres** vertically on the canvas for the count, so 3 pills sit centred in the frame rather than clinging to the top.
- Each pill **rolls out from under** the one above it, so the cascade reads as a single growing stack regardless of count.
- Schedule one `pill{i}` per recap; `pill{i}` targets beyond `recaps.length` are ignored.

See [`examples/course-recap/`](examples/course-recap/) for a 4-recap layout.

## Narration template (fill-in skeleton)

> "[Name the recap in one line.] First, [point 1]. Then, [point 2]. Also, [point 3]. … And finally, [last point]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.1] "Let's recap the four things we covered." [1.8] "First, define your audience." [4.0] "Then, map their journey." [6.2] "Next, set clear goals." [8.4] "And finally, measure what matters."

```tsx
recaps={[
  'Define your audience',
  'Map their journey',
  'Set clear goals',
  'Measure what matters',
]}
timings={{ sequence: [
  { target: 'setup', at: 0.1, in: 1.7 },
  { target: 'pill0', at: 1.8 },
  { target: 'pill1', at: 4.0 },
  { target: 'pill2', at: 6.2 },
  { target: 'pill3', at: 8.4 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to CourseSummary:

1. **Confirm fit.** Is the segment a flat recap of 1-6 takeaways, each reducible to a short line, with no comparison or causal sequencing? If not, pick another template.
2. **Extract** the takeaways in the order the narration delivers them.
3. **Order-check.** Ensure the narration introduces them top-to-bottom, one at a time. If the source jumps around (e.g. mentions the final takeaway first), re-sequence it to run straight down the list.
4. **Compress** each takeaway to a ≤40-char line in parallel phrasing.
5. **Emit the reveal sequence**: a `setup` step for the banner, then one `pill{i}` per recap, each `at` taken from the start time of the narration line that introduces that takeaway.

## Worked examples (rendered)

- [`examples/course-recap/`](examples/course-recap/), a 4-recap layout, authored scene + reveal sequence (no MP4; layout reference).

## Field / prop reference

- `recaps`: array of **1-6** × `string` (≤40 chars), ordered top → bottom
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `pill{i}` (`i` = 0-based recap index); `at`/`in` in seconds; `in` defaults to 1.2 (the slow roll-in)
