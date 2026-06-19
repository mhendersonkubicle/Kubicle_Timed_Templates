---
template: Carousel7PillsHorizontalV1
title: Carousel, Horizontal Pill Conveyor
category: process
useWhen: A linear run of 1-7 items introduced one at a time, left to right, where each item is a single short label (a multi-step workflow, video-module breakdown, or roadmap timeline) and the order matters.
tags:
  - process
  - carousel
  - conveyor
  - sequence
  - steps
  - roadmap
  - agenda
  - module-breakdown
  - timeline
layout:
  fixed: false               # the conveyor sizes to the pill count
  pills: [1, 7]              # 1 to 7 pills
  perPill: [play-signifier, label]
slots:                       # addressable reveal targets
  - setup                    # platinum intro panel slides off left, revealing the empty stage
  - pill0                    # each pill = camera arrival + stamp bob + label fade (one object)
  - pill1
  - pill2
  - pill3                    # only present when there are >= 4 pills
  - pill4                    # only present when there are >= 5 pills
  - pill5                    # only present when there are >= 6 pills
  - pill6                    # only present when there are 7 pills
  - outro                    # platinum closing panel slides in from the right (optional)
narration:
  ordering: linear-by-pill       # introduce pills strictly left → right, one at a time
  comparisonStyle: sequential    # one pill fully before the next; no jumping ahead, no jumping back
  labelMaxChars: 22
  labelStyle: parallel           # short noun phrases or step titles, parallel form
timing:
  model: reveal-sequence
  indexedTargets: true           # pill{i}, i = 0..pills.length-1
  canonicalRevealOrder: [setup, pill0, pill1, pill2, pill3, pill4, pill5, pill6, outro]
  defaultPillInSeconds: 0.8      # per-pill entrance (camera arrival + stamp bob + label fade)
  defaultDurationSeconds: [8, 16]
assets:
  templateSpecific: none         # pure CSS + inline SVG; no bundled PNGs
  iconLibrary: none              # pills carry no icons, only a generic play-circle signifier
  fonts: [Satoshi-Bold]          # falls back to system sans if absent
---

# Carousel7PillsHorizontalV1, Selection & Narration Guidance

## What it is

A horizontal conveyor. The camera pans right → left across a wide oxford-blue world, stopping on each stadium-shaped pill in turn. As the camera lands on a pill, a stamp shell below it bobs up (raise → hold → lower) and the pill's white label inks in, like a part being stamped on a factory belt. Each pill carries a circular play-button signifier on its left and a single short label. A platinum-blue panel frames the intro (exits left) and an optional closing panel masks the world out at the end. Under the reveal-sequence model the intro panel clears first, then each pill reveals one at a time as the camera arrives, in left → right order.

## Use it when

- The content is a **linear run of 1-7 items** introduced in order, a workflow, an agenda, a video-module breakdown, a roadmap, or a timeline where order matters.
- Each item reduces to a **single short label** (≤22 chars) with no supporting sub-points or icon.
- You want a **moving, sequential reveal** where attention lands on one item at a time rather than seeing the whole list at once.

## Do NOT use it when

- The items are **not ordered** (a flat set of parallel points seen together → use a points/list template).
- An item needs **more than a short label**, a caption plus icon, sub-points, or a paragraph.
- The relationship is **oppositional** rather than sequential (a two-way contrast → use YinYang2Points).
- Items **branch** or loop rather than running straight through (use a diagram/flow template).
- You need the audience to **compare items side by side**, the conveyor only ever shows one pill at a time.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Pills | `pills` | 1-7 items | ordered left → right in conveyor order |
| Pill label | `pills[i].label` | ≤22 chars | one line; parallel phrasing (short noun phrases or step titles) |
| Play signifier | (auto) |, | a dodger-blue play-circle inside each pill, left |
| Stamp shell | (auto) |, | bobs against each pill on arrival |

## Reveal order (canonical)

1. `setup`, the platinum intro panel slides off left, exposing the empty oxford-blue stage
2. `pill0`, camera lands on pill 1; stamp bobs, label fades in
3. `pill1`
4. `pill2`
5. `pill3` *(if present)*
6. `pill4` *(if present)*
7. `pill5` *(if present)*
8. `pill6` *(if present)*
9. `outro`, the platinum closing panel slides in from the right *(optional)*

Each pill is one object: the camera arrival, stamp bob, and label fade all happen together at that pill's cue. The camera pans from the previous scheduled pill and parks on this pill exactly at its `at`.

## Narration rules

### Rule 1, Linear, pill-by-pill in conveyor order (MUST)

Introduce the pills **strictly left to right, one at a time**, matching the camera pan. Speak about a pill only once the camera has arrived on it (`pill{i}.at`), and never jump back to an earlier pill or ahead to a later one. The visual is a single continuous sweep that parks on one pill at a time, so "First… then… next…" narration maps directly onto `pill0, pill1, pill2…`.

This is not a stylistic preference: only one pill is framed at any moment. Narration that describes pill 5 while the camera is still on pill 2 would talk about a pill the viewer cannot yet see.

**GOOD (linear, in conveyor order):**
> "This course runs in seven parts. We open with **Foundations**. Then **Core concepts**. Next, **Hands-on practice**. From there, **Case studies**. We move into **Advanced topics**. Then **Review**. And we close with **Certification**."

Maps cleanly: pill0 → pill1 → pill2 → pill3 → pill4 → pill5 → pill6.

**BAD (out of order / jumping ahead):**
> "By the end you'll hit Certification, but it all starts with Foundations, and the Case studies in the middle tie it together."

This names the last pill before the camera has reached it and skips around the conveyor. It cannot be shown on this template, the camera only ever frames one pill at a time, in order.

### Rule 2, Labels are short and parallel

Each label is ≤22 chars and uses parallel grammar across all pills, all short noun phrases or all step titles, not a mix. Longer detail lives in the voiceover, not on the pill. The label is clipped to the pill, so anything past the cap is truncated with an ellipsis.

### Rule 3, One pill per beat

Give each pill its own narration beat synced to its `at`. Do not bundle two pills into one sentence while the camera moves, and do not leave a pill on screen un-narrated. The conveyor's pacing is set by the gaps between consecutive `pill{i}.at` values.

## Variation, pill count (1-7)

The pill count is the built-in variation. Supply anywhere from 1 to 7 pills:

- The conveyor **sizes to the count**, fewer pills just make a shorter sweep. A single pill simply dwells with no pans.
- Schedule one `pill{i}` per pill, in order; `pill{i}` targets beyond `pills.length` are ignored.
- Because the camera is a **continuous pan**, schedule a **contiguous** `pill0..pillN-1` run. Sparse subsets or skipped pills are not supported, the conveyor cannot meaningfully pan past a pill it never reveals.

The `setup` and `outro` panels are independent of the count: include `setup` to open on the platinum intro wipe, and `outro` to close on the platinum mask. Both are optional; omitting them leaves the bare conveyor.

## Narration template (fill-in skeleton)

> "[Name the run in one line, N parts/steps.] First, [pill 1]. Then, [pill 2]. Next, [pill 3]. [pill 4]. … And finally, [pill N]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.0] "Here's how the rollout unfolds." [0.8] "First, we **Discover**." [2.6] "Then we **Design**." [4.4] "Next, we **Build**." [6.2] "We **Test** it." [8.0] "Then **Launch**." [13.5] (music sting, closing wipe)

```tsx
pills={[
  { label: 'Discover' },
  { label: 'Design' },
  { label: 'Build' },
  { label: 'Test' },
  { label: 'Launch' },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.0, in: 0.6 },
  { target: 'pill0', at: 0.8 },
  { target: 'pill1', at: 2.6 },
  { target: 'pill2', at: 4.4 },
  { target: 'pill3', at: 6.2 },
  { target: 'pill4', at: 8.0 },
  { target: 'outro', at: 13.5, in: 1.5 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Carousel7PillsHorizontalV1:

1. **Confirm fit.** Is the segment a linear run of 1-7 ordered items, each reducible to a short label seen one at a time? If unordered, comparative, branching, or >7 items, pick another template.
2. **Extract** the ordered items and a ≤22-char label for each, in conveyor order.
3. **Order-check.** Ensure the narration introduces items strictly left to right, one at a time. If the source jumps around (e.g. mentions the final item first, or compares items), re-sequence it to run straight through in order. This re-sequencing is the most common edit.
4. **Emit the reveal sequence**: a `setup` step, then one **contiguous** `pill{i}` per item (each `at` taken from the start time of the narration line that introduces that pill), then an optional `outro`.

## Worked examples (rendered)

- [`examples/course-modules/`](examples/course-modules/), a 5-pill course-module breakdown: authored scene + reveal sequence (no MP4; layout reference).

## Field / prop reference

- `pills`: array of **1-7** × `{ label: string (≤22) }`, in left → right conveyor order
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `outro`, or `pill{i}` (`i` = 0-based pill index); `at`/`in` in seconds; `in` defaults to 0.8 (use a longer `in`, ~1.5, for the `outro` panel sweep)
