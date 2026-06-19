---
template: BigPoints3V2
title: Big Points, Three Pillar Takeaways
category: list
useWhen: Exactly three parallel, sequential takeaways, where each point warrants a short headline plus one supporting noun phrase and a single icon (or character portrait).
tags:
  - list
  - points
  - takeaways
  - three-points
  - pillars
  - key-points
  - summary
  - recap
layout:
  fixed: true              # fixed geometry, exactly three cards
  cards: 3                 # always 3; no count variation
  perCard: [title, anchor, number, subtopic]
  anchorKinds: [icon, character]   # each card chooses independently
slots:                     # every addressable element (also the reveal targets)
  - setup                  # OPTIONAL / no-op, no scaffolding to reveal
  - card0                  # pillar card 1 = container + title + anchor + sphere + subtopic (one object)
  - card1                  # pillar card 2, number 2
  - card2                  # pillar card 3, number 3
narration:
  ordering: linear-by-card       # finish one card fully before starting the next
  comparisonStyle: sequential    # NOT a comparison and NOT a causal process, parallel takeaways in order
  titleMaxChars: 25
  subtopicMaxChars: 30
  pointsMustBeAnchorable: true    # each card maps to one concrete icon or one character portrait
timing:
  model: reveal-sequence
  staging: none                  # setup is a no-op (no scaffolding animates in) -> do NOT use for a beat with a lead-in before its first content (see README "no-dead-air principle")
  targets: fixed                 # card0 / card1 / card2 (fixed named slots, not dynamic stepN)
  canonicalRevealOrder: [setup, card0, card1, card2]
  defaultCardInSeconds: 2.0      # per-card entrance (container pop + title/anchor/sphere/typewriter cascade)
  defaultDurationSeconds: [8, 12]
assets:
  templateSpecific: Template-Specific-Assets/   # base_container.png + pill_and_sphere.png
  iconLibrary: shared                            # icons resolve from the shared Icons/ library (forced white)
  characterLibrary: shared                       # character portraits resolve from the shared characters/ folder
  fonts: [Inter-ExtraBold, Satoshi-Medium]       # falls back to system sans if absent
---

# BigPoints3V2, Selection & Narration Guidance

## What it is

A three-card "big points" layout on a flat platinum-blue base. Three blue gradient pillar cards arrive one at a time, left to right. Each card carries a bold white headline, a large white line-art icon (or a character portrait), a numbered sphere accent, and a short subtopic line that types out beside the sphere. Under the reveal-sequence model each card is one object: its container pops in, then its title and anchor fade, then the pill and sphere, then the typewriter subtopic, all inside that card's reveal step.

## Use it when

- You are landing **exactly three** parallel takeaways, pillars, or key points.
- The three points are **peers**, three things the viewer should remember, not two sides of a contrast and not a step-by-step process.
- Each point reduces to a **short headline** (≤25 chars) plus **one supporting noun phrase** (≤30 chars) and can be anchored by a single icon or a character portrait.
- The order you say them in is the order you want them to appear (the cards build left to right as you speak).

## Do NOT use it when

- You have **more or fewer than three** points (the layout is a fixed 3-tuple; use a different points/list template).
- The relationship is **oppositional** (two sides of a contrast → use YinYang2Points).
- The relationship is **sequential/causal**, where each step feeds the next (a workflow or pipeline → use Process5Steps).
- A point needs **more than a short headline plus one supporting line**, there is no room for paragraphs.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Cards | `cards` | exactly 3 | ordered left → right |
| Card title | `cards[i].title` | ≤25 chars | bold white headline (Inter ExtraBold 55 px) |
| Card subtopic | `cards[i].subtopic` | ≤30 chars | typewriter noun phrase (Satoshi Medium 33 px) |
| Card anchor | `cards[i].anchor` | discriminated union | `{ kind: 'icon', id }` or `{ kind: 'character', id }` |
| Card number | (auto) |, | rendered `1…3` from card position |

Each card independently chooses its anchor kind (see "Variation, icon or character anchor" below). Card size, positions, and the numbered sphere are fixed.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, *optional / no-op.* There is no scaffolding to reveal; the platinum-blue fill is always present and each card brings its own container. Schedule it only for cross-template consistency (it draws nothing).
2. `card0`, pillar card 1 (container + title + anchor + sphere + typewriter subtopic appear together)
3. `card1`, pillar card 2
4. `card2`, pillar card 3

Card 0 is fully on screen (headline + subtopic) **before** card 1 appears, and card 1 before card 2.

## Narration rules

### Rule 1, Linear, one card at a time (MUST)

The three points have to be delivered **one whole card at a time**, in reveal order. Deliver card 0, its headline, then its supporting line, and only then move to card 1, then card 2. Never preview a later card's content while only earlier cards are on screen, and never jump back.

This is not a stylistic preference: the visuals reveal each card and its full content before the next card exists on screen. Narration that names point 3 while only card 0 is visible would describe content the viewer cannot see.

**GOOD (linear, one card at a time):**
> "There are three things to take away. First, plan: map the whole project scope. Second, build: ship a working first cut. And third, launch: roll it out and measure the result."

Maps cleanly: card0 (title + subtopic) → card1 (title + subtopic) → card2 (title + subtopic).

**BAD (jumps ahead / interleaves):**
> "The three takeaways are plan, build and launch. Launch is really about measuring, but you can't measure until you've built, and you can't build without a plan."

This names all three points up front and then doubles back. It cannot be shown on this template, cards 1 and 2 are not yet revealed when their content is first spoken, and the narration order no longer matches the left-to-right build.

### Rule 2, Titles are short headlines

Each title names its point in ≤25 chars and reads as a peer of the other two (Plan / Build / Launch). Use parallel phrasing across all three, all verbs or all nouns, not a mix. Avoid full sentences.

### Rule 3, Subtopics are short supporting noun phrases

Each subtopic is ≤30 chars and supports its headline with a concrete noun phrase ("Map the project scope"), not a comma-laden sentence. It types out beside the sphere, so keep it tight.

### Rule 4, Each card anchors to one concrete image

Every card needs one anchor: either a single line-art icon that depicts the point (a folder, a chart, a checkmark) or a character portrait. Choose per card; you can mix kinds across the three cards.

## Variation, icon or character anchor

The built-in per-card variation is the `anchor` discriminated union, each card picks one independently:

- **Icon** (`{ kind: 'icon', id }`) → renders `icons/<id>.svg` at 400×400, forced to pure white line art (`brightness(0) invert(1)`), centred in the upper card.
- **Character** (`{ kind: 'character', id }`) → renders `characters/<id>.png` at 400×720, bottom-anchored so the portrait fills the upper card.

Because each card chooses independently, **mixed** layouts are valid, e.g. two icon cards and one character card. The card count never changes (always 3) and all title/subtopic limits and the sphere geometry stay the same regardless of anchor kind.

Use icon anchors for abstract concepts and character anchors when a point is carried by a person or persona. See [`examples/three-takeaways/`](examples/three-takeaways/) for a worked reference.

## Narration template (fill-in skeleton)

> "[Frame the three takeaways in one line.] First, [card 0 title]: [card 0 supporting line]. Second, [card 1 title]: [card 1 supporting line]. And third, [card 2 title]: [card 2 supporting line]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Three things to take away." [0.5] "First, plan: map the project scope." [3.0] "Then build: ship a working first cut." [5.7] "And finally launch: roll out and measure."

```tsx
cards={[
  { title: 'Plan',  subtopic: 'Map the project scope',  anchor: { kind: 'icon', id: 'document-folder' } },
  { title: 'Build', subtopic: 'Ship a working first cut', anchor: { kind: 'icon', id: 'analytics' } },
  { title: 'Launch', subtopic: 'Roll out and measure',    anchor: { kind: 'icon', id: 'success' } },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.3 },  // optional / no-op, included for consistency
  { target: 'card0', at: 0.5 },
  { target: 'card1', at: 3.0 },
  { target: 'card2', at: 5.7 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to BigPoints3V2:

1. **Confirm fit.** Is the segment a set of *exactly three* parallel takeaways, each reducible to a short headline plus one supporting noun phrase? If it is a contrast, a process, or has a different count, reject this template and pick another.
2. **Extract** the three point headlines and one supporting line per point.
3. **Re-sequence to one-card-at-a-time order.** If the source names all three points up front or doubles back, rewrite it so each card is delivered in full (headline then supporting line) before the next, matching the canonical reveal order. This re-sequencing is the most common edit.
4. **Compress** each headline to ≤25 chars and each supporting line to a ≤30-char noun phrase; assign a concrete icon concept or a character id per card.
5. **Emit the reveal sequence**, taking each `card{i}.at` from the start time of the narration line that introduces that card. Add a no-op `setup` step only if you want it for consistency.

## Worked examples (rendered)

- [`examples/three-takeaways/`](examples/three-takeaways/), full example: three icon-anchored takeaways with the authored reveal sequence (layout reference, no audio).

## Field / prop reference

- `cards`: array of **exactly 3** × `{ title: string (≤25), subtopic: string (≤30), anchor }`
- `cards[i].anchor`: `{ kind: 'icon', id: string }` (→ `icons/<id>.svg`, forced white) OR `{ kind: 'character', id: string }` (→ `characters/<id>.png`, bottom-anchored)
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above (`setup`, `card0`, `card1`, `card2`); `at`/`in` in seconds; `in` defaults to 2.0 (the per-card cascade is longer than other templates, so do not shrink it much or the cards look rushed)
