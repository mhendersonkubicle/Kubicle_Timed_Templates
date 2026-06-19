---
template: Process5Steps
title: Process, Horizontal Chevron Flow
category: process
useWhen: A sequential process, workflow, or pipeline of 2-5 ordered steps, where each step is a single short label plus an icon and the order matters.
tags:
  - process
  - workflow
  - pipeline
  - sequence
  - steps
  - stages
  - how-to
  - lifecycle
layout:
  fixed: false               # chevron chain auto-centres for the step count
  steps: [2, 5]              # 2 to 5 steps
  perStep: [icon, number, label]
slots:                       # addressable reveal targets
  - setup                    # oxford-blue background stage scales in
  - step0                    # each step = chevron + icon + number + label (one object)
  - step1
  - step2
  - step3                    # only present when there are >= 4 steps
  - step4                    # only present when there are 5 steps
narration:
  ordering: linear-by-step       # introduce steps strictly in execution order
  comparisonStyle: sequential    # one step fully before the next; no jumping ahead
  labelMaxChars: 14
  labelStyle: parallel           # all verbs or all nouns, not a mix
timing:
  model: reveal-sequence
  indexedTargets: true           # step{i}, i = 0..steps.length-1
  canonicalRevealOrder: [setup, step0, step1, step2, step3, step4]
  defaultStepInSeconds: 0.8      # per-step entrance (chevron + icon/number/label cascade)
  defaultDurationSeconds: [7, 12]
assets:
  templateSpecific: none         # pure code + SVG; no bundled PNGs
  iconLibrary: shared            # icons resolve from Icons/ but are FORCE-RECOLOURED to solid white (contrast on the dodger-blue chevrons; a two-tone icon's blue accents would vanish). The -light/-dark variant is cosmetic here.
  fonts: [Satoshi-Black, Satoshi-Bold, Satoshi-Medium, Inter-ExtraBold]
---

# Process5Steps, Selection & Narration Guidance

## What it is

A horizontal chain of right-pointing chevrons on an oxford-blue gradient stage. The chevrons run lightest → deepest blue so the "process advances" left to right. Each chevron carries a white icon, a big `01…05` number, and a short label. Under the reveal-sequence model the stage comes in first, then each step's chevron pops in and its icon → number → label cascade, one step at a time.

## Use it when

- The content is a **sequence of ordered steps**, a workflow, pipeline, lifecycle, or how-to where order matters.
- There are **2 to 5 steps**.
- Each step reduces to a **single short label** (≤14 chars) plus one icon.

## Do NOT use it when

- The items are **not ordered** (a flat list of parallel points → use a points/list template).
- There are **more than 5 steps**, or a step needs more than a short label.
- The relationship is **oppositional** rather than sequential (a two-way contrast → use YinYang2Points).
- Steps **branch** or loop rather than running straight through (use a diagram/flow template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Steps | `steps` | 2-5 items | ordered left → right in execution order |
| Step label | `steps[i].label` | ≤14 chars | parallel phrasing (all verbs or all nouns) |
| Step icon | `steps[i].icon` | id from master Icons/ (use a -dark variant) | white line icon |
| Step number | (auto) |, | rendered `01…0N` from position |

## Reveal order (canonical)

1. `setup`, the oxford-blue stage scales in
2. `step0`, chevron 1 + its icon/number/label
3. `step1`
4. `step2`
5. `step3` *(if present)*
6. `step4` *(if present)*

Each step is one object: the chevron and all its content reveal together at that step's cue.

## Narration rules

### Rule 1, Linear, step-by-step (MUST)

Introduce the steps **strictly in execution order**, one at a time, matching the reveal order. Do not describe a later step before its chevron is on screen, and do not jump back. The visual builds the chain left to right as you speak, so "First… then… then…" narration maps directly onto `step0, step1, step2…`.

**GOOD:** "Our workflow has five stages. First, we **define** the problem. Then we **collect** the data. Next, we **train** the model. We **deploy** it. And finally we **iterate**."

**BAD:** "We deploy and iterate at the end, but it all starts with defining and collecting." (Jumps to the end before the early chevrons exist, and the order spoken doesn't match the build.)

### Rule 2, Labels are short and parallel

Each label is ≤14 chars and uses parallel grammar across all steps, all imperative verbs (Define, Collect, Train) or all nouns. Avoid mixing forms or full phrases. Longer narration lives in the voiceover, not the chevron.

### Rule 3, One icon per step

Each step's icon should depict the step's action concretely (a magnifier for "Define/Search", a document for "Collect", an upward trend for "Deploy/Grow"). Icons come from the master Icons/ library (-dark variants).

## Variation, step count (2-5)

The step count is the built-in variation. Supply 2, 3, 4, or 5 steps:

- The chevron chain **auto-centres** on the canvas for the count, so fewer steps sit in the middle rather than drifting left.
- The light→dark gradient is **re-spread** across whatever count is supplied, so the progression still reads.
- Schedule one `step{i}` per step; `step{i}` targets beyond `steps.length` are ignored.

See [`examples/three-step/`](examples/three-step/) for the 3-step variation and [`examples/five-step/`](examples/five-step/) for the full 5-step layout.

## Narration template (fill-in skeleton)

> "[Name the process in one line.] First, [step 1]. Then, [step 2]. Next, [step 3]. [step 4]. And finally, [step 5]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a sequence of 2-5 ordered steps, each reducible to a short label? If unordered or >5 items, pick another template.
2. **Extract** the ordered steps and a ≤14-char label + icon concept for each.
3. **Order-check.** Ensure the narration introduces steps in execution order, one at a time. If the source jumps around (e.g. mentions the outcome first), re-sequence it to run straight through.
4. **Emit the reveal sequence**: a `setup` step, then one `step{i}` per step, each `at` taken from the start time of the narration line that introduces that step.

## Worked examples (rendered)

- [`examples/five-step/`](examples/five-step/), full 5-step layout, authored scene + rendered MP4.
- [`examples/three-step/`](examples/three-step/), the 2-5 count variation (3 steps), with a rendered MP4.

## Field / prop reference

- `steps`: array of **2-5** × `{ label: string (≤14), icon: string }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `step{i}` (`i` = 0-based step index); `at`/`in` in seconds; `in` defaults to 0.8
