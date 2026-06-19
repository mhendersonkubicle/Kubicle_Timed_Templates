---
template: Checklist5Pills
title: Checklist, Ticked-Off Pills
category: list
useWhen: A flat list of 1-6 parallel items that should read as being ticked off one at a time, top to bottom, responsibilities, ownership, must-haves, compliance items, completed deliverables, each reducible to one short single-line label, anchored by a hero icon or character on the left.
tags:
  - list
  - checklist
  - responsibilities
  - ownership
  - must-haves
  - compliance
  - deliverables
  - tick-off
  - top-to-bottom
layout:
  fixed: false               # pill band auto-centres vertically for the count
  items: [1, 6]              # 1 to 6 pills
  hero: [icon, character]    # left-side hero is an icon OR a character panel
  perItem: [pill, circle, tick, label]
slots:                       # addressable reveal targets
  - setup                    # hero (icon or character panel) fades in, NO empty-pill scaffold
  - item0                    # each item = pill + circle-slide + tick + label (one object)
  - item1
  - item2
  - item3                    # only present when there are >= 4 items
  - item4                    # only present when there are >= 5 items
  - item5                    # only present when there are 6 items
narration:
  ordering: linear-top-to-bottom   # tick items off strictly in list order
  comparisonStyle: sequential      # one item fully before the next; no jumping down or back up
  labelMaxChars: 30
  labelStyle: parallel             # parallel imperative phrases, single line
timing:
  model: reveal-sequence
  indexedTargets: true             # item{i}, i = 0..responsibilities.length-1
  canonicalRevealOrder: [setup, item0, item1, item2, item3, item4, item5]
  defaultItemInSeconds: 1.7        # per-item entrance (pill-up -> circle-slide -> tick -> text cascade)
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: Template-Specific-Assets/   # pill_base.png, pill_circle.png, tick.png
  iconLibrary: shared                            # hero icon resolves from the shared Icons/ library (native colours)
  characters: shared                             # character hero resolves from shared characters/
  fonts: [Satoshi-Bold]                          # falls back to system sans if absent
---

# Checklist5Pills, Selection & Narration Guidance

## What it is

A hero anchor on the left (a 520×520 line icon, or a portrait inside a dodger-blue gradient panel) plus a vertical stack of up to six dark pills on the right. Under the reveal-sequence model the hero comes in first, then each pill reveals as a single tick-off object: the pill fades up from below, a white circle slides from the pill's right edge to a left anchor, a tick trim-reveals inside it, and the responsibility text fades in. Items are ticked off one at a time, top to bottom.

## Use it when

- The content is a **flat list of parallel items**, responsibilities, ownership areas, must-haves, compliance points, completed deliverables, that should feel like a checklist being **ticked off**.
- There are **1 to 6 items**.
- Each item reduces to a **single short label** (≤30 chars, one line) and the items belong to one anchoring theme that a hero icon or character represents.

## Do NOT use it when

- The items are **ordered/causal steps** where the sequence itself carries meaning (use Process5Steps, a checklist's items are parallel, not a pipeline).
- The relationship is **oppositional** rather than a single list (a two-way contrast → use YinYang2Points).
- There are **more than 6 items**, or an item needs more than a short single line (it will clip to the pill).
- You need each item richly illustrated, only the hero carries an icon; the pills carry a tick plus text, not per-item icons.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Items | `responsibilities` | 1-6 strings | ordered top → bottom |
| Item label | `responsibilities[i]` | ≤30 chars | single line, clipped/ellipsised to the pill; parallel phrasing |
| Hero | `hero` | one | `{ kind: 'icon', id }` → `icons/<id>.svg` (native colours) OR `{ kind: 'character', id }` → `characters/<id>.png` in a dodger-blue panel |
| Tick / circle | (auto) |, | every pill ticks off the same way; no per-item icon |

The pill band **auto-centres vertically** for the count, so 1, 2, 3, 4, 5, or 6 pills all sit balanced in the frame.

## Reveal order (canonical)

1. `setup`, the hero (icon or character panel) fades in on the left
2. `item0`, first pill: fade-up → circle slide → tick → label
3. `item1`
4. `item2`
5. `item3` *(if present)*
6. `item4` *(if present)*
7. `item5` *(if present)*

Each item is one object: the pill, its sliding circle, the tick, and the label all reveal together at that item's cue. There is **no empty-pill scaffold**, a pill does not exist on screen until its `item{i}` step ticks it in.

## Narration rules

### Rule 1, Linear, top-to-bottom tick-off (MUST)

Introduce the items **strictly in list order**, one at a time, matching the tick-off reveal. Do not name a lower item before its pill is ticked, and do not jump back up. An optional intro line maps to `setup` (the hero); each subsequent narration cue ticks off the next `item{i}`. The visual builds the checklist downward as you speak, so "First… next… then…" narration maps directly onto `item0, item1, item2…`.

**GOOD (linear, top-to-bottom):**
> "As the project lead, you own four things. You **define the scope**. You **lead the stand-ups**. You **review every pull request**. And you **share progress weekly**."

Maps cleanly: setup → item0 → item1 → item2 → item3.

**BAD (out of order / jumps around):**
> "You'll be sharing progress weekly and reviewing pull requests, but it all starts with defining the scope and running the stand-ups."

This names the last items first, then jumps back up. It cannot be shown on this template, the lower pills are not yet ticked when they are spoken, and the spoken order does not match the build.

### Rule 2, Labels are short, single-line, and parallel

Each label is ≤30 chars on one line, clipped to the pill if longer, so keep it summarised. Use parallel grammar across all items, all imperative verbs ("Define project scope", "Lead daily stand-ups") or all nouns. Avoid full sentences; the elaboration lives in the voiceover, not the pill.

### Rule 3, The hero anchors, it does not drive

The left-side hero (icon or character) is scene-establishing scaffolding revealed at `setup`. A character panel does NOT turn this into a portrait/character template, the linear checklist still governs the narration and the reveal. Pick a hero that represents the list's theme (a strategy icon for planning duties, a presenter for a role's responsibilities).

## Variation, item count (1-6)

The item count is the built-in variation and already lives in the content schema (`responsibilities` is 1-6). Supply 1, 2, 3, 4, 5, or 6 items:

- The pill band **auto-centres vertically** on the canvas for the count (3 pills sit centred, etc.).
- Schedule one `item{i}` per item; `item{i}` targets beyond `responsibilities.length` are ignored.
- The hero (icon size, or the fixed character panel) does not change with the count.

See [`examples/project-lead-checklist/`](examples/project-lead-checklist/) for the layout reference.

## Narration template (fill-in skeleton)

> "[Name the theme / role in one line.] First, [item 1]. Then, [item 2]. Next, [item 3]. [item 4]. [item 5]. And finally, [item 6]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a flat list of 1-6 parallel items, each reducible to a short single line, that should read as ticked off? If the items are ordered steps, oppositional, or >6, pick another template.
2. **Extract** the list items and a ≤30-char single-line label for each, plus a hero concept (icon or character) for the theme.
3. **Order-check.** Ensure the narration ticks items off strictly top to bottom, one at a time. If the source jumps around (mentions later items first, or interleaves), re-sequence it to run straight down the list.
4. **Emit the reveal sequence**: a `setup` step (hero), then one `item{i}` per item, each `at` taken from the start time of the narration line that ticks off that item. Keep `in` generous (~1.7 s) so the circle-slide + tick cadence reads.

## Worked examples (rendered)

- [`examples/project-lead-checklist/`](examples/project-lead-checklist/), a 4-item responsibilities checklist with an icon hero, authored on the reveal-sequence model (no MP4; timing/layout reference).

## Field / prop reference

- `responsibilities`: array of **1-6** strings (≤30 chars each), ordered top → bottom
- `hero`: `{ kind: 'icon', id: string }` (renders `icons/<id>.svg`, native colours) OR `{ kind: 'character', id: string }` (renders `characters/<id>.png` in a dodger-blue panel)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `item{i}` (`i` = 0-based item index); `at`/`in` in seconds; `in` defaults to 1.7
