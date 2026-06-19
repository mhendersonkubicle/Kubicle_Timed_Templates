---
template: Timeline5TilesCharacter
title: Timeline, Presenter-Led Step List (1-5)
category: process
useWhen: A short sequential process or checklist of 1-5 ordered steps that you want a named presenter to walk through, where each step is a single short phrase and the order matters.
tags:
  - process
  - workflow
  - steps
  - sequence
  - checklist
  - timeline
  - presenter
  - character
  - first-person
  - how-to
layout:
  fixed: false               # right container auto-sizes + vertically centres for the step count
  sides: 2                   # static left presenter panel + right step list
  steps: [1, 5]              # 1 to 5 steps
  perStep: [number, phrase, progressSegment]
slots:                       # addressable reveal targets
  - setup                    # left character panel slides in + right empty container (with empty bar track) fades/slides up; sized to N
  - step0                    # each step = numbered circle + typewritten phrase + 1/N progress-bar segment (one object)
  - step1
  - step2                    # only present when there are >= 3 steps
  - step3                    # only present when there are >= 4 steps
  - step4                    # only present when there are 5 steps
narration:
  ordering: linear-by-step       # introduce steps strictly in top-to-bottom execution order
  comparisonStyle: sequential    # one step fully before the next; no jumping ahead or back
  voice: presenter-led           # portrait present -> first-person / presenter framing reads naturally
  phraseMaxChars: 30
  phraseStyle: parallel          # parallel imperative phrasing across steps
  portraitNotNarrated: true      # the presenter portrait is set once at setup, never a separate step
timing:
  model: reveal-sequence
  indexedTargets: true           # step{i}, i = 0..steps.length-1
  canonicalRevealOrder: [setup, step0, step1, step2, step3, step4]
  defaultStepInSeconds: 0.7      # per-step entrance (circle pop + typewriter + bar segment)
  defaultDurationSeconds: [9, 15]
assets:
  templateSpecific: Template-Specific-Assets/   # icon_base.png (the left panel art + portrait alpha mask)
  iconLibrary: none                              # no per-step icons on this template
  characterLibrary: shared                       # portraits resolve from the shared CHARACTER LIBRARY (PNG) set
  fonts: [Inter-ExtraBold, Satoshi-Bold]         # falls back to system sans if absent
---

# Timeline5TilesCharacter, Selection & Narration Guidance

## What it is

A split-screen process list. On the left, a blue panel hosts a character portrait matted to the panel's exact shape (head-to-chest framing), a "presenter" beside the content. On the right, an oxford-blue rounded container auto-sizes to the number of steps and stays vertically centred. Each step reveals as a numbered circle that pops in, a single phrase that typewrites beside it, and a progress bar beneath that advances one 1/N segment. Under the reveal-sequence model the whole split-screen scaffolding (panel + portrait + empty container + empty bar track) comes in first at `setup`, then each step reveals one at a time.

## Use it when

- The content is a **sequence of ordered steps**, a workflow, checklist, or how-to where order matters.
- There are **1 to 5 steps**.
- Each step reduces to a **single short phrase** (≤30 chars).
- You want a **presenter beside the process**, a person walking the viewer through it (the portrait reads as first-person / "here is how I do this").

## Do NOT use it when

- The items are **not ordered** (a flat list of parallel points → use a points/list template).
- There are **more than 5 steps**, or a step needs more than a short phrase.
- The relationship is **oppositional** rather than sequential (a two-way contrast → use YinYang2Points).
- You need a **per-step icon** or visual symbol, this template carries only a number + phrase per step (use Process5Steps for an icon-per-step chevron flow).
- A presenter portrait would be **out of place** (an abstract or product-only process → use Process5Steps or a timeline without a character).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Steps | `steps` | 1-5 items | ordered top → bottom in execution order |
| Step phrase | `steps[i]` | ≤30 chars | parallel imperative phrasing; typewrites in |
| Step number | (auto) |, | rendered `1…5` from position, inside the circle |
| Presenter | `character` | a `CHARACTER_IDS` value | static portrait, set once at `setup` |

The right container resizes and re-centres for the step count, and the progress bar segments are 1/N. Box/circle/bar geometry is fixed regardless of count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the left character panel slides in from off-canvas left; the right oxford-blue container (sized to N, empty progress-bar track, no circles or text) fades and slides up. The portrait appears here as part of the scaffolding.
2. `step0`, circle 1 pops in, phrase 1 typewrites, the bar fills its first 1/N segment
3. `step1`
4. `step2` *(if present)*
5. `step3` *(if present)*
6. `step4` *(if present)*

Each step is one object: its circle, its phrase, and its progress-bar segment all reveal together at that step's cue.

## Narration rules

### Rule 1, Linear, step-by-step (MUST)

Introduce the steps **strictly in execution order**, one at a time, top to bottom, matching the reveal order. Do not describe a later step before its circle is on screen, and do not jump back. The visual builds the list downward and fills the progress bar as you speak, so "First… then… next…" narration maps directly onto `step0, step1, step2…`.

Because a presenter portrait is present, the narration is naturally **first-person / presenter-led** ("First, I plan the scope. Then I draft the proposal…"). That voice is optional; the binding rule is **reveal order == step order**. The portrait is set once at `setup` and is never separately narrated.

**GOOD (linear, presenter-led):**
> "Here's how I run a project. First, I **plan the scope**. Then I **draft the proposal**. Next, I **get stakeholder sign-off**. After that I **build the first version**. And finally I **ship and review**."

Maps cleanly: setup → step0 → step1 → step2 → step3 → step4, in order.

**BAD (out of order / jumps ahead):**
> "It all ends with shipping and review, but before that there's sign-off and the proposal, and of course you start by planning the scope."

This names the last step first and walks the list backwards. It cannot be shown on this template, the later circles and progress-bar segments do not exist on screen when their steps are spoken, and the bar would have to fill in reverse.

### Rule 2, Phrases are short and parallel

Each phrase is ≤30 chars and uses parallel grammar across all steps, all imperative verbs ("Plan the scope", "Draft the proposal", "Get sign-off") or all the same form. Avoid mixing forms or full sentences. Longer explanation lives in the voiceover, not in the step line.

### Rule 3, The portrait is scaffolding, not a step

Pick a `character` that suits the presenter voice, but do not write a separate beat for "the presenter appears". The portrait comes in with `setup` and is never its own reveal step. Narration time is spent on the steps.

## Variation, step count (1-5)

The step count is the built-in variation. Supply 1, 2, 3, 4, or 5 steps:

- The right oxford-blue container **auto-sizes** (`containerHeight`) and **vertically re-centres** (`containerTop`) for the count, so there is no empty space below the last step.
- The progress bar is split into **1/N segments**, one per step, so the fill still reads as "N of N done" regardless of count.
- Schedule one `step{i}` per step; `step{i}` targets beyond `steps.length` are simply **ignored** (matching Process5Steps).

See [`examples/three-step/`](examples/three-step/) for the 3-step variation.

## Narration template (fill-in skeleton)

> "[Name the process in one line, presenter voice.] First, [step 1]. Then, [step 2]. Next, [step 3]. [step 4]. And finally, [step 5]."

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Timeline5TilesCharacter:

1. **Confirm fit.** Is the segment a sequence of 1-5 ordered steps, each reducible to a short phrase, that a presenter can walk through? If unordered, >5 items, or it needs per-step icons, pick another template.
2. **Extract** the ordered steps and a ≤30-char phrase for each, in parallel imperative form.
3. **Order-check.** Ensure the narration introduces steps in execution order, one at a time, top to bottom. If the source jumps around (e.g. mentions the outcome first), re-sequence it to run straight through. This re-sequencing is the most common edit.
4. **Pick a presenter.** Choose a `character` id that fits the voice; do not add a narration beat for the portrait itself.
5. **Emit the reveal sequence**: a `setup` step, then one `step{i}` per step, each `at` taken from the start time of the narration line that introduces that step.

## Worked examples (rendered)

- [`examples/three-step/`](examples/three-step/), the 1-5 count variation (3 steps): the authored scene + reveal sequence. (No MP4 bundled; layout/timing reference in source.)

## Field / prop reference

- `steps`: array of **1-5** × `string` (≤30 chars), ordered top → bottom
- `character`: one of the `CHARACTER_IDS` enum values (shared character library)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `step{i}` (`i` = 0-based step index); `at`/`in` in seconds; `in` defaults to 0.7
