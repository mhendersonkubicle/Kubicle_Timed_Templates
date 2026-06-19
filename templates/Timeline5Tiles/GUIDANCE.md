---
template: Timeline5Tiles
title: Timeline, Vertical Numbered Step List with Anchor
category: process
useWhen: A short sequential process of 1-5 ordered steps, each a single short phrase, beside a fixed anchor (a topic icon or a presenter portrait), with a progress bar that advances as the steps build.
tags:
  - process
  - workflow
  - steps
  - sequence
  - checklist
  - timeline
  - how-to
  - numbered-list
  - progress
layout:
  fixed: false               # right container auto-sizes + stays centred for the step count
  steps: [1, 5]              # 1 to 5 steps
  anchor: [icon, character]  # one fixed left-panel anchor (decorative scaffolding)
  perStep: [number, phrase, progressSegment]
slots:                       # addressable reveal targets
  - setup                    # left panel slides in + anchor fades in + right container + empty progress-bar track
  - step0                    # each step = circle + typewritten phrase + bar advance to (i+1)/N (one object)
  - step1
  - step2
  - step3                    # only present when there are >= 4 steps
  - step4                    # only present when there are 5 steps
narration:
  ordering: linear-by-step       # introduce steps strictly in execution order
  comparisonStyle: sequential    # one step fully before the next; no jumping ahead
  stepMaxChars: 30
  stepStyle: parallel            # all imperative phrases or all nouns, not a mix
  anchorIsNarrated: false        # the anchor icon/character is decorative scaffolding, not a content beat
timing:
  model: reveal-sequence
  indexedTargets: true           # step{i}, i = 0..steps.length-1
  canonicalRevealOrder: [setup, step0, step1, step2, step3, step4]
  defaultStepInSeconds: 1.8      # per-step entrance (circle pop + typewriter + bar advance), kept high so the type completes
  defaultDurationSeconds: [8, 15]
assets:
  templateSpecific: Template-Specific-Assets/   # icon_base.png (the blue left panel + the character alpha mask)
  iconLibrary: shared                            # anchor icons resolve from the shared Icons/ catalogue (auto-whitened)
  characterLibrary: shared                       # anchor characters resolve from the shared character library (16-id enum)
  fonts: [Inter-ExtraBold, Satoshi-Bold]         # falls back to system sans if absent
---

# Timeline5Tiles, Selection & Narration Guidance

## What it is

A split-screen step list. On the left, a blue panel carries a single fixed **anchor**, either a large white line-art icon or a full-bleed character portrait matted to the panel shape. On the right, an oxford-blue rounded container **auto-sizes** to the number of steps and stays vertically centred. Each step reveals with a numbered circle pop-in and a single **typewritten** phrase, while a progress bar beneath the steps advances `1/N` per step. Under the reveal-sequence model the scaffolding comes in first (`setup`), then each step builds top to bottom, one at a time.

## Use it when

- The content is a **sequence of ordered steps**, a workflow, checklist, or how-to where order matters.
- There are **1 to 5 steps**.
- Each step reduces to a **single short phrase** (≤30 chars) on one line.
- You want a **persistent topic anchor** (a subject icon) or a **presenter portrait** alongside the list, and a visible **progress bar** that tracks how far through the steps you are.

## Do NOT use it when

- The items are **not ordered** (a flat list of parallel points → use a points/list template).
- There are **more than 5 steps**, or a step needs more than one short line.
- The relationship is **oppositional** rather than sequential (a two-way contrast → use YinYang2Points).
- Steps **branch** or loop rather than running straight through (use a diagram/flow template).
- The anchor portrait/icon is meant to be a **content beat in its own right**, here it is decorative scaffolding, not a narrated reveal.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Steps | `steps` | 1-5 items | ordered top → bottom in execution order |
| Step phrase | `steps[i]` | ≤30 chars, one line | parallel phrasing; typewritten in |
| Step number | (auto) |, | rendered `1…N` from position |
| Anchor (icon) | `anchor` | `{ kind: 'icon', id }` | any line-art catalogue id; auto-whitened |
| Anchor (character) | `anchor` | `{ kind: 'character', id }` | a `CHARACTER_IDS` value; large, bottom-anchored |
| Progress bar | (auto) |, | fills to `(i+1)/N` as `step{i}` reveals |

The step count is the built-in variation (see "Variation" below). The anchor is **one** fixed decoration, chosen once; it is not a per-step element.

## Reveal order (canonical)

1. `setup`, left panel slides in, the anchor fades in, the right container fades + slides up with its **empty** progress-bar track at 0 %
2. `step0`, row 1: circle + typewritten phrase, bar advances to `1/N`
3. `step1`, row 2, bar → `2/N`
4. `step2`, row 3, bar → `3/N`
5. `step3` *(if present)*, row 4, bar → `4/N`
6. `step4` *(if present)*, row 5, bar fills to `5/5`

Each step is one object: its circle, its phrase, and its slice of the progress bar reveal together at that step's cue.

## Narration rules

### Rule 1, Linear, step-by-step (MUST)

Introduce the steps **strictly in execution order**, one at a time, matching the top-to-bottom reveal. Do not describe a later step before its row is on screen, and do not jump back. The progress bar visibly advances `1/N` as each step is spoken, so "First… then… then…" narration maps directly onto `step0, step1, step2…`.

**GOOD:** "Getting a project off the ground takes five moves. First, **plan the scope**. Then **draft the proposal**. Next, **get stakeholder sign-off**. **Build the first version**. And finally, **ship and review**."

Maps cleanly: step0 → step1 → step2 → step3 → step4, with the bar advancing one fifth at each beat.

**BAD:** "By the end you'll ship and review, but it all starts with planning the scope and drafting a proposal." (Names the final step before its row exists, and the spoken order does not match the top-to-bottom build, the progress bar would lurch instead of advancing one step at a time.)

### Rule 2, Phrases are short and parallel

Each step phrase is ≤30 chars and uses parallel grammar across all steps, all imperative phrases (Plan…, Draft…, Build…) or all nouns. Avoid mixing forms or full sentences. The phrase is typewritten, so keep it to one line; longer narration lives in the voiceover, not the tile.

### Rule 3, The anchor is scaffolding, not a beat

The left anchor (icon or character) is set once at `setup` and never narrated as a step. Choose an icon that depicts the **whole process topic**, or a presenter character for a talking-head feel. Do not write a narration line that "introduces" the anchor as if it were a reveal.

## Variation, step count (1-5)

The step count is the built-in variation. Supply 1, 2, 3, 4, or 5 steps:

- The oxford-blue container **auto-sizes** (height derived from the count) and stays vertically centred, so there is never empty space below the last step.
- The progress bar segments are **`1/N`**, so the fill still reads as "one step done" regardless of count.
- Schedule one `step{i}` per step; `step{i}` targets beyond `steps.length` are ignored.

**Anchor variation:** the anchor is independent of the step count, `{ kind: 'icon', id }` for a topic icon (auto-whitened from any catalogue line-art id) or `{ kind: 'character', id }` for a presenter portrait (a `CHARACTER_IDS` value, matted to the panel shape). See [`examples/five-step-icon/`](examples/five-step-icon/) for the full layout.

## Narration template (fill-in skeleton)

> "[Name the process in one line.] First, [step 1]. Then, [step 2]. Next, [step 3]. [step 4]. And finally, [step 5]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Getting a project off the ground takes five moves." [2.2] "First, plan the scope." [4.4] "Then draft the proposal." [6.6] "Next, get stakeholder sign-off." [8.8] "Build the first version." [11.0] "And finally, ship and review."

```tsx
steps={[
  'Plan the project scope',
  'Draft the proposal',
  'Get stakeholder sign-off',
  'Build the first version',
  'Ship and review',
]}
anchor={{ kind: 'icon', id: 'arrows-infographics-elements-steps-light' }}
timings={{ sequence: [
  { target: 'setup', at: 0.3, in: 1.2 },
  { target: 'step0', at: 2.2 },
  { target: 'step1', at: 4.4 },
  { target: 'step2', at: 6.6 },
  { target: 'step3', at: 8.8 },
  { target: 'step4', at: 11.0 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Timeline5Tiles:

1. **Confirm fit.** Is the segment a sequence of 1-5 ordered steps, each reducible to a short one-line phrase? If unordered or >5 items, pick another template.
2. **Extract** the ordered steps and a ≤30-char phrase for each, in parallel grammar.
3. **Order-check.** Ensure the narration introduces steps in execution order, one at a time. If the source jumps around (e.g. mentions the outcome first), re-sequence it to run straight through, top to bottom, so the progress bar advances one step per beat.
4. **Pick the anchor**, a topic icon or a presenter character, but do **not** add a narration beat for it.
5. **Emit the reveal sequence**: a `setup` step, then one `step{i}` per step, each `at` taken from the start time of the narration line that introduces that step. Keep each step's `in` high enough (default 1.8 s) for the typewriter to finish.

## Worked examples (rendered)

- [`examples/five-step-icon/`](examples/five-step-icon/), the full 5-step layout with an icon anchor, authored on the reveal-sequence model (no MP4, timing/layout reference).

## Field / prop reference

- `steps`: array of **1-5** × `string` (≤30 chars), ordered top → bottom
- `anchor`: discriminated union, `{ kind: 'icon', id: string }` (catalogue line-art, auto-whitened) **or** `{ kind: 'character', id: CHARACTER_IDS }` (portrait PNG)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `step{i}` (`i` = 0-based step index); `at`/`in` in seconds; `in` defaults to 1.8
