---
template: LessonGoal
title: Lesson Goal, Single-Screen Opener
category: single
useWhen: A lesson or module opener that states one clear learning goal, an eyebrow heading plus a single goal statement, on a fixed single-screen layout.
tags:
  - opener
  - title-card
  - lesson-goal
  - objective
  - intro
  - single
  - statement
  - outcome
layout:
  fixed: true            # fixed geometry, exactly one heading + one goal block
  instances: 1           # single-instance, no count variation
  contentBlock: [heading, goal]
slots:                   # every addressable element (also the reveal targets)
  - setup                # scaffolding: decorative stripe sweeps in (background)
  - heading              # the "Lesson Goal" eyebrow headline
  - goal                 # the lesson-goal body copy
narration:
  ordering: linear-single        # heading framing beat, then the spoken goal
  comparisonStyle: none          # not a comparison, a single statement
  headingMaxChars: 40
  goalMaxChars: 160
  goalIsMeasurable: true         # phrase the goal as a measurable outcome
timing:
  model: reveal-sequence
  targets: [setup, heading, goal]
  canonicalRevealOrder: [setup, heading, goal]
  defaults:
    in: 0.7                      # default per-step entrance / slide duration (seconds)
    durationSeconds: [6, 10]
assets:
  templateSpecific: Template-Specific-Assets/   # the decorative stripe PNG
  iconLibrary: none                              # no icons in this template
  fonts: [Inter-ExtraBold, Satoshi-Medium]       # falls back to system sans if absent
---

# LessonGoal, Selection & Narration Guidance

## What it is

A single-screen lesson opener. A decorative diagonal stripe sweeps up from the bottom-left and fades in as the background scaffolding; then a Dodger Blue "Lesson Goal" eyebrow heading rises and fades in, and the goal statement rises and fades in beneath it. The content reveals one object at a time under the reveal-sequence timing model.

## Use it when

- You are **opening a lesson or module** and want to state its single learning goal up front.
- The goal can be expressed as **one statement**, a measurable outcome the learner will reach.
- You want a **calm, fixed, text-only opener** rather than a comparison, list, or process build.

## Do NOT use it when

- There is **more than one goal** to present, or the goals form a list (use a points/list template).
- The content is a **comparison** (use YinYang2Points) or a **sequence of steps** (use Process5Steps).
- The screen needs **icons, imagery, or multiple content blocks**, this template is intentionally a single heading + statement.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Eyebrow heading | `heading` | ≤40 chars, optional | Defaults to "Lesson Goal"; override only for different course terminology |
| Goal statement | `goal` | ≤160 chars (aim <120) | One measurable outcome; wraps to 2-3 lines at 72 px |

This is a **strictly fixed-slot, single-instance** template: exactly one heading and one goal block. There is no count variation and no array content.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the decorative stripe sweeps up from bottom-left and fades in
2. `heading`, the "Lesson Goal" eyebrow rises + fades in
3. `goal`, the goal statement rises + fades in

The heading is on screen before the goal appears.

## Narration rules

### Rule 1, Linear single-statement (MUST)

State the goal in reveal order: a short **framing beat** as the heading appears, then the **spoken goal** as the goal copy reveals. Never describe the goal before the heading beat, and never read the goal while only the stripe is on screen. The `setup` stripe carries no narration of its own.

With only two content slots, narration is simply title-then-statement.

**GOOD (linear single-statement):**
> "Here's the goal for this lesson. By the end, you'll be able to identify three risks in a project plan and propose a mitigation for each."

Maps cleanly: heading (framing beat) → goal (the spoken outcome).

**BAD (goal stated before the heading beat / out of order):**
> "You'll identify three risks and propose mitigations, and that's the goal of this lesson."

This delivers the goal content before the heading beat has framed it, so the spoken outcome lands while only the heading (or nothing) is on screen. State the framing beat first, then the goal as it reveals.

### Rule 2, The goal is a measurable outcome

Phrase the goal as something the learner can **do and measure** ("Identify three risks…", "Build a pivot table that…"), not a vague topic ("Learn about risks"). Keep it under ~120 chars so it sits cleanly on 2-3 lines.

### Rule 3, Heading stays an eyebrow

The heading is a short label (≤40 chars), defaulting to "Lesson Goal". Override only when a course uses different terminology (e.g. "Module Objective"). It frames the goal; it is not a sentence.

## Variation

**None.** The layout is fixed and single-instance: exactly one heading and one goal block, with no count variation and no array content. The only optional content is the `heading` override (defaults to "Lesson Goal"). Because the model is blank-by-default, you may also omit the `setup` step to render without the decorative stripe (heading + goal on the bare platinum stage), but the standard opener schedules all three slots.

## Narration template (fill-in skeleton)

> "[Short framing beat as the heading appears, e.g. 'Here's the goal for this lesson.'] [The measurable goal statement, spoken as the goal copy reveals.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.8] *(stripe sweeps in, no narration)* [2.0] "Here's the goal for this lesson." [2.8] "By the end, you'll be able to identify three risks in a project plan and propose a mitigation for each."

```tsx
goal="Identify three risks in a project plan and propose a mitigation for each."
timings={{ sequence: [
  { target: 'setup',  at: 0.8, in: 2.3 },
  { target: 'heading', at: 2.0, in: 1.4 },
  { target: 'goal',   at: 2.8, in: 1.4 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to LessonGoal:

1. **Confirm fit.** Is the segment a **single** lesson/module goal expressible in one statement? If it is a list, comparison, or process, reject this template and pick another.
2. **Extract** the one goal and rewrite it as a measurable outcome (≤160 chars, aim <120).
3. **Set the heading**, keep the default "Lesson Goal" unless the course uses different terminology.
4. **Order-check.** Ensure narration delivers a framing beat first, then the goal, never the goal before the heading beat.
5. **Emit the reveal sequence**: a `setup` step (stripe), then `heading`, then `goal`, taking each `at` from the start time of the narration line that introduces that object.

## Worked example (rendered)

- [`examples/standard-goal/`](examples/standard-goal/), the standard single-goal opener: authored scene + reveal sequence (layout reference, no MP4 bundled here).

## Field / prop reference

- `goal`: `string` (1-160 chars; aim <120)
- `heading`: optional `string` (1-40 chars; defaults to "Lesson Goal")
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above (`setup`, `heading`, `goal`); `at`/`in` in seconds; `in` defaults to 0.7
