---
template: Timeline6Checkpoints
title: Timeline, Horizontal Checkpoint Track
category: timeline
useWhen: A chronological timeline, roadmap, or schedule of 1-6 ordered milestones, where each milestone is a date plus a short title and one supporting line, and time order matters.
tags:
  - timeline
  - roadmap
  - milestones
  - chronology
  - schedule
  - launch-plan
  - history
  - phases
  - dates
layout:
  fixed: false               # panel + track auto-shrink and re-centre for the checkpoint count
  checkpoints: [1, 6]        # 1 to 6 checkpoints
  perCheckpoint: [date, title, description]
slots:                       # addressable reveal targets
  - setup                    # oxford-blue panel scales in, muted track + empty circles appear
  - checkpoint0              # each checkpoint = circle activates + date + title + description (one object)
  - checkpoint1              # only present when there are >= 2 checkpoints
  - checkpoint2              # only present when there are >= 3 checkpoints
  - checkpoint3              # only present when there are >= 4 checkpoints
  - checkpoint4              # only present when there are >= 5 checkpoints
  - checkpoint5              # only present when there are 6 checkpoints
narration:
  ordering: linear-by-checkpoint   # introduce checkpoints strictly in chronological order
  comparisonStyle: sequential      # one milestone fully before the next; no jumping ahead or back
  dateMaxChars: 14
  titleMaxChars: 18
  descriptionMaxChars: 54
  titleStyle: parallel             # parallel phrasing across checkpoints
timing:
  model: reveal-sequence
  indexedTargets: true             # checkpoint{i}, i = 0..checkpoints.length-1
  canonicalRevealOrder: [setup, checkpoint0, checkpoint1, checkpoint2, checkpoint3, checkpoint4, checkpoint5]
  defaultStepInSeconds: 0.6        # per-checkpoint entrance (fill growth + activation cascade)
  defaultDurationSeconds: [7, 13]
assets:
  templateSpecific: none           # pure code + CSS; no bundled PNGs
  iconLibrary: shared              # one shared icon: icons/check.svg (dropped into each activated circle)
  fonts: [Satoshi-Black, Satoshi-Bold, Satoshi-Medium]
---

# Timeline6Checkpoints, Selection & Narration Guidance

## What it is

A horizontal timeline track on an oxford-blue rounded panel. The track starts muted/grey with empty checkpoint circles. A dodger-blue fill then grows from the left, and as it reaches each checkpoint that circle pulses, recolors, drops in a check icon, and its date (above), title (above the circle), and description (below) cascade in. Under the reveal-sequence model the panel and track come in first via `setup`, then each checkpoint activates in chronological order, one at a time.

## Use it when

- The content is a **chronological sequence of milestones**, a project timeline, roadmap, launch plan, release schedule, or history where time order matters.
- There are **1 to 6 checkpoints**.
- Each checkpoint reduces to a **date** (≤14 chars), a **short title** (≤18 chars), and **one supporting line** (≤54 chars).

## Do NOT use it when

- The items are **not chronological / not ordered** (a flat list of parallel points → use a points/list template).
- There are **more than 6 milestones**, or a milestone needs more than a date + short title + one line.
- The relationship is **oppositional** rather than a progression in time (a two-way contrast → use YinYang2Points).
- The steps are a **non-dated process** where the action matters more than the calendar (use Process5Steps, chevron flow).
- The timeline **branches** or has parallel tracks rather than running straight through.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Checkpoints | `checkpoints` | 1-6 items | ordered left → right in chronological order |
| Checkpoint date | `checkpoints[i].date` | ≤14 chars | marker copy above the circle ("Q1 2025", "Day 3", "Apr 2026") |
| Checkpoint title | `checkpoints[i].title` | ≤18 chars | bold name, parallel phrasing; wraps to 2 lines max |
| Checkpoint description | `checkpoints[i].description` | ≤54 chars | one supporting line below; wraps within the column |

All three text fields wrap inside the column (`TEXT_MAX_WIDTH` = 280 px) and never spill onto the platinum background. The title is bottom-anchored just above the circle and capped at 2 lines.

## Reveal order (canonical)

1. `setup`, the oxford-blue panel scales in; the muted track and empty checkpoint circles appear
2. `checkpoint0`, fill reaches circle 0; it activates; its date/title/description cascade
3. `checkpoint1` *(if present)*
4. `checkpoint2` *(if present)*
5. `checkpoint3` *(if present)*
6. `checkpoint4` *(if present)*
7. `checkpoint5` *(if present)*

Each checkpoint is one object: the fill growth to its x, the circle activation, and all its text reveal together at that checkpoint's cue.

## Narration rules

### Rule 1, Linear, chronological-by-checkpoint (MUST)

Introduce the checkpoints **strictly in chronological order**, one at a time, matching the reveal order. Complete one checkpoint (its date, title, and supporting line) before moving to the next. Do not describe a later milestone before its circle has activated, and do not jump back. The fill grows left to right as you speak, so "First… then… next… finally…" narration maps directly onto `checkpoint0, checkpoint1, checkpoint2…`.

This is the timeline specialisation of the universal "narration order = reveal order" rule. Because the visual fills the track to checkpoint i exactly as you introduce it, narrating the milestones out of time order would describe a circle that has not yet activated.

**GOOD (linear, chronological):**
> "Here's our launch roadmap. In **January** we **research** the problem and the users. Then in **February** we build the **prototype**. By **April** we run **evaluation** and red teaming. We open a **beta** in **June**. And in **August** we hit **general availability**."

Maps cleanly: checkpoint0 → checkpoint1 → checkpoint2 → checkpoint3 → checkpoint4.

**BAD (out of order / jumping):**
> "We launch to everyone in August, but before that there's a beta in June. It all kicks off back in January with research, and somewhere in the middle we evaluate."

This jumps to the end before the early circles exist and the order spoken does not match the left-to-right fill. The fill cannot reach August before January.

### Rule 2, Dates are real and short

Each date is ≤14 chars and is the actual calendar marker ("Q1 2025", "Apr 2026", "Day 3", "Week 1"). Keep it skimmable, the date is the anchor, not a sentence.

### Rule 3, Titles are short and parallel

Each title is ≤18 chars and uses parallel grammar across all checkpoints, all nouns ("Kickoff", "Beta launch", "GA release") or all verb phrases. Avoid full sentences; push the detail into the description line.

### Rule 4, One supporting line per checkpoint

The description is ≤54 chars and gives one concrete supporting detail. Longer narration lives in the voiceover, not on the panel.

## Variation, checkpoint count (1-6)

The checkpoint count is the built-in variation. Supply 1, 2, 3, 4, 5, or 6 checkpoints:

- The panel and track **auto-shrink and re-centre** on the canvas for the count via `layoutFor(N)`, so fewer checkpoints wrap snugly with no empty space rather than drifting left.
- Checkpoint spacing is **fixed** (296 px), so a full 6-up timeline reproduces the original layout exactly and smaller counts keep the same rhythm.
- Schedule one `checkpoint{i}` per checkpoint; `checkpoint{i}` targets beyond `checkpoints.length` are ignored.

A single-checkpoint timeline (N = 1) is valid, the panel wraps one circle. See the worked example for the typical multi-checkpoint case.

## Narration template (fill-in skeleton)

> "[Name the timeline in one line.] [In date 1], [milestone 1]. Then [in date 2], [milestone 2]. Next, [in date 3], [milestone 3]. [date 4], [milestone 4]. And finally, [in date N], [milestone N]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a chronological run of 1-6 dated milestones, each reducible to a date + short title + one line? If unordered, undated, or >6 items, pick another template.
2. **Extract** the ordered milestones and a date (≤14), a ≤18-char title, and a ≤54-char description for each.
3. **Order-check.** Ensure the narration introduces milestones in chronological order, one at a time. If the source jumps around (e.g. mentions the launch first, then backfills), re-sequence it to run straight through in time order. This re-sequencing is the most common edit.
4. **Emit the reveal sequence**: a `setup` step, then one `checkpoint{i}` per milestone, each `at` taken from the start time of the narration line that introduces that milestone.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.4] "Here's our roadmap." [1.4] "In January we research the problem." [3.0] "In March we build the prototype." [4.6] "And by June we launch to everyone."

```tsx
checkpoints={[
  { date: 'Jan', title: 'Research', description: 'Identify model & user needs' },
  { date: 'Mar', title: 'Prototype', description: 'Build the first model + UX' },
  { date: 'Jun', title: 'Launch',   description: 'General availability rollout' },
]}
timings={{ sequence: [
  { target: 'setup',      at: 0.4, in: 0.9 },
  { target: 'checkpoint0', at: 1.4 },
  { target: 'checkpoint1', at: 3.0 },
  { target: 'checkpoint2', at: 4.6 },
] }}
```

## Worked examples (rendered)

- [`examples/three-milestone/`](examples/three-milestone/), the 1-6 count variation (3 checkpoints), authored scene + reveal sequence.

## Field / prop reference

- `checkpoints`: array of **1-6** × `{ date: string (≤14), title: string (≤18), description: string (≤54) }`, in chronological order
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `checkpoint{i}` (`i` = 0-based checkpoint index); `at`/`in` in seconds; `in` defaults to 0.6
