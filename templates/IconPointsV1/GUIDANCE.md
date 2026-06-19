---
template: IconPointsV1
title: Icon Points, Conveyor Walkthrough
category: list
useWhen: A guided walkthrough or agenda of 2-6 ordered points, each a short icon-able label, introduced strictly one at a time and then "filed away" into a growing covered-topics list.
tags:
  - list
  - agenda
  - walkthrough
  - topics
  - overview
  - roadmap
  - curriculum
  - conveyor
  - points
layout:
  fixed: false               # box + left stack auto-size and centre for the pill count
  pills: [2, 6]              # 2 to 6 pills
  perPill: [badge, icon, label]
slots:                       # addressable reveal targets
  - setup                    # empty right-hand container rises up from below
  - pill0                    # each pill = enter -> hold -> exit + persistent left-stack copy (one object)
  - pill1
  - pill2                    # only present when there are >= 3 pills
  - pill3                    # only present when there are >= 4 pills
  - pill4                    # only present when there are >= 5 pills
  - pill5                    # only present when there are 6 pills
narration:
  ordering: linear-by-point      # introduce points strictly in list order
  comparisonStyle: sequential    # one point fully before the next; no jumping ahead
  labelMaxChars: 18
  labelStyle: parallel           # all nouns or all verbs, not a mix
  pointsMustBeIconable: true      # each point maps to one concrete light-mode icon
timing:
  model: reveal-sequence
  indexedTargets: true           # pill{i}, i = 0..pills.length-1
  canonicalRevealOrder: [setup, pill0, pill1, pill2, pill3, pill4, pill5]
  defaultPillInSeconds: 1.8      # per-pill conveyor cycle (enter + hold + exit)
  defaultDurationSeconds: [10, 16]
assets:
  templateSpecific: none         # pure CSS + inline SVG; no bundled PNGs
  iconLibrary: shared            # per-pill large icons resolve from the shared Icons/ library (light-mode ids)
  fonts: [Satoshi-Bold]          # falls back to system sans if absent
---

# IconPointsV1, Selection & Narration Guidance

## What it is

A conveyor walkthrough. An empty rounded container rises up on the right of a platinum-blue stage. Then, one at a time, each point's pill enters the container from the left, holds at centre long enough to read (with its large icon below it), and pans off the right edge. As it exits, a faded copy of the same pill materialises on the left in a growing "covered topics" stack and stays there. By the end the container is empty and every point sits stacked on the left, first point at the top. The content reveals one object at a time under the reveal-sequence timing model.

## Use it when

- The content is an **ordered walkthrough or agenda**, "here's what we'll cover", a roadmap, a curriculum, a list of topics you move through.
- There are **2 to 6 points**.
- Each point reduces to a **single short label** (≤18 chars) plus one icon.
- You want the "moving on / we've covered this" feeling of each topic being filed away as the next arrives.

## Do NOT use it when

- The points are a **comparison or contrast** of two things (use YinYang2Points).
- The points are a **strict cause-and-effect process** where the chain itself is the message (a chevron flow like Process5Steps reads the order more literally).
- There are **more than 6 points**, or a point needs more than a short label.
- All points must remain **on screen together** at the end for side-by-side reference, here the active container ends empty and only the calm left stack persists.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Pills | `pills` | 2-6 items | ordered; first pill ends at the TOP of the left stack |
| Pill label | `pills[i].label` | ≤18 chars | parallel phrasing; font auto-shrinks as a safety net |
| Pill icon | `pills[i].icon` | light-mode id | must end in `-light`; drives the LARGE in-box icon |
| Pill badge | (fixed) |, | a graduation-cap glyph, same on every pill, not configurable |

The pill count is the built-in variation (see "Variation, pill count" below). Box height and left-stack vertical centring adapt to the count at render time.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the empty container rises up from below into its docked position
2. `pill0`, first point enters, holds, exits; its copy files into stack slot 0 (top)
3. `pill1`
4. `pill2` *(if present)*
5. `pill3` *(if present)*
6. `pill4` *(if present)*
7. `pill5` *(if present)*

Each pill is one object: its enter → hold → exit conveyor cycle and the persistent left-stack copy all belong to that one step's cue.

## Narration rules

### Rule 1, Linear, one point at a time (MUST)

Introduce the points **strictly in list order**, one at a time, matching the reveal order. Deliver pill0's topic fully, then pill1, and so on. Never name a later point before its pill has entered the conveyor, and never jump back. The conveyor physically files each topic into the "covered" stack as the next enters, so "First… Next… Then…" agenda narration maps directly onto `pill0, pill1, pill2…`.

Because the first pill ends up at the **top** of the left stack and the last at the bottom, narration order must match list order top-to-bottom.

**GOOD (linear walkthrough / agenda):**
> "Here's what this course covers. First, we'll cover Python basics. Next, data wrangling. Then we move on to visualization. After that, machine learning. And finally, your capstone project."

Maps cleanly: pill0 → pill1 → pill2 → pill3 → pill4, each cue's SRT start time becoming that pill's `at`.

**BAD (out of order / forward reference):**
> "By the end you'll deploy a model and build a capstone, but it all starts with the Python basics we'll get to, and data wrangling somewhere in the middle."

This names the last points before their pills exist on screen and does not introduce topics in list order. The conveyor would still be empty (or showing an earlier pill) while the narration describes a later one.

### Rule 2, Labels are short and parallel

Each label is ≤18 chars and uses parallel grammar across all points, all nouns (Python basics, Data wrangling) or all verbs. Avoid mixing forms or full phrases. The longer explanation lives in the voiceover, not the pill. The component auto-shrinks the font if a label runs long, but short labels keep the cadence clean.

### Rule 3, One concrete light-mode icon per point

Each point's `icon` is a light-mode id from the shared Icons library (it MUST end in `-light`) and should depict the topic concretely, a brain for machine learning, a rocket for deployment, a bar chart for visualization. This is the large icon shown under the pill at centre. The small blue graduation-cap badge is fixed on every pill and is not configurable.

### Rule 4, Give cues room to breathe

Space consecutive pill cues by at least the pill's `in` (default 1.8 s). If two pill `at`s are closer than one conveyor cycle, the pills can visually overlap inside the container. Pace the agenda so each topic gets its hold beat before the next arrives.

## Variation, pill count (2-6)

The pill count is the built-in variation. Supply 2, 3, 4, 5, or 6 points:

- The right-hand box and the left "covered" stack **resize and vertically centre** to suit the count, so fewer points stay balanced rather than stranded at the top.
- The right conveyor mirrors the list exactly, N pills on the left ⇒ N pills panning through on the right.
- Schedule one `pill{i}` per point; `pill{i}` targets beyond `pills.length` are ignored.

See [`examples/four-topic/`](examples/four-topic/) for the count variation in use.

## Narration template (fill-in skeleton)

> "[Name the walkthrough in one line.] First, [point 1]. Next, [point 2]. Then, [point 3]. After that, [point 4]. And finally, [point 5]."

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to IconPointsV1:

1. **Confirm fit.** Is the segment a guided walkthrough / agenda of 2-6 ordered points, each reducible to a short label? If it's a two-way contrast, a branching/causal process, or >6 items, pick another template.
2. **Extract** the ordered points and a ≤18-char label + a concrete light-mode icon concept for each.
3. **Order-check.** Ensure the narration introduces points one at a time in list order. If the source front-loads the outcome or jumps around, re-sequence it to run straight through, top to bottom.
4. **Emit the reveal sequence**: a `setup` step, then one `pill{i}` per point, each `at` taken from the start time of the narration line that introduces that point. Keep consecutive `at`s at least one `in` apart.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Here's what this course covers." [1.5] "First, the Python basics." [3.5] "Next, data wrangling." [5.5] "Then visualization." [7.5] "And finally, machine learning."

```tsx
pills={[
  { label: 'Python basics',   icon: 'big-data-binarycode-light' },
  { label: 'Data wrangling',  icon: 'ai-agent-data-light' },
  { label: 'Visualization',   icon: 'arrows-infographics-elements-barchart-light' },
  { label: 'Machine learning', icon: 'ai-agent-aibrain-light' },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.3, in: 1.0 },
  { target: 'pill0', at: 1.5 },
  { target: 'pill1', at: 3.5 },
  { target: 'pill2', at: 5.5 },
  { target: 'pill3', at: 7.5 },
] }}
```

## Worked examples (rendered)

- [`examples/four-topic/`](examples/four-topic/), a 4-point course agenda: the authored scene + reveal sequence. (No MP4 bundled, layout reference only.)

## Field / prop reference

- `pills`: array of **2-6** × `{ label: string (≤18), icon: string (light-mode id ending in "-light") }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `pill{i}` (`i` = 0-based pill index); `at`/`in` in seconds; `in` defaults to 1.8 (the full enter + hold + exit conveyor cycle)
