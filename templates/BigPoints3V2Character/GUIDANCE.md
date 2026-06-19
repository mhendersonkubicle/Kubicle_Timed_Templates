---
template: BigPoints3V2Character
title: Big Points (3), Character Pillar Cards
category: list
useWhen: Exactly three parallel "big points", pillars, themes, or team members, each anchored by a presenter portrait, a one-word title, and a short supporting line, arriving one card at a time.
tags:
  - list
  - points
  - pillars
  - three-points
  - team
  - people
  - presenter
  - cards
  - waterfall
layout:
  fixed: true               # fixed geometry, exactly three cards
  cards: 3                  # hard-fixed count (not variable)
  perCard: [character, title, number, subtopic]
slots:                      # every addressable element (also the reveal targets)
  - setup                   # OPTIONAL near-no-op: no shared scaffolding to reveal
  - card0
  - card1
  - card2
narration:
  ordering: linear-by-card       # finish one card fully before starting the next
  comparisonStyle: sequential    # parallel members of a set, revealed in order
  titleMaxChars: 25
  subtopicMaxChars: 30
  parallelTitles: true           # the three titles read as members of one set
timing:
  model: reveal-sequence
  fixedCount: 3
  canonicalRevealOrder: [setup, card0, card1, card2]
  defaultStepInSeconds: 2.4      # per-card entrance (full internal cascade + typewriter)
  defaultDurationSeconds: [9, 12]
assets:
  templateSpecific: Template-Specific-Assets/   # base_container.png + pill_and_sphere.png
  characterLibrary: shared                       # portraits resolve from the shared characters/ library
  fonts: [Inter-ExtraBold, Satoshi-Medium]       # falls back to system sans if absent
---

# BigPoints3V2Character, Selection & Narration Guidance

## What it is

Three pillar cards on a static platinum-blue stage. Each card is a dodger-blue gradient panel that pops in, then reveals its content as a single cascade: a presenter **character portrait** clipped to the card body, a one-word **title** (Inter ExtraBold), a numbered **sphere** (1, 2, 3), and a short **subtopic** line that types out beneath it. The three cards arrive one at a time in a left-to-right waterfall, so the trio reads as a team or a set of parallel pillars.

## Use it when

- You have **exactly three** parallel points, pillars, themes, principles, or members of a team.
- Each point is best anchored by a **person** (a presenter head-shot), not an abstract icon.
- Each point reduces to a **one-word/short title** (≤25 chars) plus a **short supporting line** (≤30 chars).
- The three are **parallel members of a set**, not a sequence of process steps or a two-way contrast.

## Do NOT use it when

- There are **more or fewer than three** points (this template is hard-fixed at 3, there is no count variation).
- The relationship is **sequential/causal** (a workflow or pipeline → use Process5Steps).
- The relationship is **oppositional** (an A-vs-B contrast → use YinYang2Points).
- The points are best carried by **abstract icons** rather than people (use the icon variant, BigPoints3V2).
- You only have **full-body or landscape images**, only consistently-framed, roughly-square presenter head-shots align under the fixed framing.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Cards | `cards` | exactly 3 | ordered left → right (card 1, 2, 3) |
| Card title | `cards[i].title` | ≤25 chars | one-word/short, Inter ExtraBold 55 px, wraps to 2 lines if needed |
| Card subtopic | `cards[i].subtopic` | ≤30 chars | Satoshi Medium 33 px, rendered as a typewriter |
| Card character | `cards[i].character.id` | PNG id from `characters/` | the ONLY authorable visual field |
| Card number | (auto) |, | rendered `1 … 3` from position |

The count is **hard-fixed at three** and the card geometry (`CARD_FINAL_CXS = [356, 961, 1566]`) is hardcoded for three cards. There is no min/max count variation, supply exactly three cards.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup` *(optional, near-no-op, see Variation)*
2. `card0`, first pillar: backdrop, character, title, number, typewriter subtopic, all as one object
3. `card1`
4. `card2`

Card 1 is fully on screen (its title and its subtopic typed out) **before** card 2 appears, and likewise card 2 before card 3.

## Narration rules

### Rule 1, Linear, card-complete (MUST)

Deliver the three points **one whole card at a time**, in reveal order. Introduce card 1 completely, its title, then its supporting subtopic line, and only then move to card 2, then card 3. Never jump ahead to a later card or back to an earlier one.

This is not stylistic: the visuals reveal one card at a time, left to right. Narration that previews card 3 while only card 1 is on screen would describe a card the viewer cannot yet see.

**GOOD (linear, card-complete):**
> "Three people drive our delivery. First, Maya, she owns the product vision. Next, Raj, he leads the engineering build. And finally, Sofia, she runs go-to-market."

Maps cleanly: card0 → card1 → card2, each title then its subtopic.

**BAD (jumps ahead / interleaved):**
> "Sofia handles go-to-market at the end, but it all starts with Maya on product, and Raj sits in the middle on engineering, though really Sofia and Maya work most closely."

This previews card 3 before it exists, then ping-pongs back to card 1, so the spoken order no longer matches the left-to-right build.

### Rule 2, Titles are parallel members of a set

Each title is ≤25 chars and reads as a peer of the other two, three names, three pillars, three principles in the **same grammatical form**. Avoid mixing a name with a verb phrase, or a noun with a full sentence. The trio should feel like one set, not a sequence or a contrast.

### Rule 3, Subtopics are short and typewriter-safe

Each subtopic is ≤30 chars and must be a single short phrase the typewriter can finish within the step's `in` window. Keep it to one supporting idea per card; longer explanation lives in the voiceover, not on the card.

### Rule 4, One character per card, head-shots only

Give each card a **different** `character.id` so the trio reads as a team rather than three copies of one person. Use only consistently-framed, roughly-square presenter head-shots (face ~27% from the top), full-body or landscape images will not align under the fixed framing.

## Variation, none (fixed three)

Unlike Process5Steps (2-5 steps), this template has **no count variation**: it is a FIXED-slot template like YinYang2Points, hard-fixed at exactly three cards with hardcoded geometry. Always supply three cards and schedule `card0`, `card1`, `card2`.

The `setup` slot exists only for cross-template parity. This template has **no shared scaffolding to reveal**, each card carries its own backdrop and pill/sphere, and the platinum-blue base is static and always present, so a `setup` step does effectively nothing here and is normally **omitted**. Leaving it out and letting `card0` be the first reveal is the clean default.

## Narration template (fill-in skeleton)

> "[Name the set of three in one line.] First, [card 1 title], [card 1 subtopic]. Next, [card 2 title], [card 2 subtopic]. And finally, [card 3 title], [card 3 subtopic]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Three people drive our delivery." [0.3] "First, Maya, she owns the product vision." [3.4] "Next, Raj, he leads the engineering build." [6.5] "And finally, Sofia, she runs go-to-market."

```tsx
cards={[
  { title: 'Maya', subtopic: 'Owns product vision',  character: { id: 'female_earlycareer_black' } },
  { title: 'Raj',  subtopic: 'Leads engineering',    character: { id: 'male_middleage_white' } },
  { title: 'Sofia', subtopic: 'Runs go-to-market',    character: { id: 'female_middleage_asian' } },
]}
timings={{ sequence: [
  { target: 'card0', at: 0.3 },
  { target: 'card1', at: 3.4 },
  { target: 'card2', at: 6.5 },
] }}
```

(`setup` is omitted, there is no scaffolding to reveal. Each card's default `in` of 2.4 s carries the full internal cascade and lets the typewriter finish.)

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to BigPoints3V2Character:

1. **Confirm fit.** Is the segment **exactly three** parallel points, each anchorable by a person and reducible to a short title + short line? If the count is not three, or the relationship is sequential/oppositional, pick another template.
2. **Extract** the three titles and a ≤30-char supporting line for each, plus a presenter `character.id` per card (different per card).
3. **Order-check.** Ensure the narration introduces the three one at a time, card-complete, left to right. If the source previews a later point or interleaves them, re-sequence it to deliver card 1 fully, then card 2, then card 3. This re-sequencing is the most common edit.
4. **Compress** each title to ≤25 chars (parallel form across all three) and each subtopic to a ≤30-char typewriter-safe phrase.
5. **Emit the reveal sequence**: typically omit `setup`, then one `card{i}` per card, each `at` taken from the start time of the narration line that introduces that card.

## Worked examples (rendered)

- [`examples/three-pillars/`](examples/three-pillars/), the standard three-card team layout: the authored scene + reveal sequence (no MP4; layout reference).

## Field / prop reference

- `cards`: array of **exactly 3** × `{ title: string (≤25), subtopic: string (≤30), character: { id: string } }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above (`setup`, `card0`, `card1`, `card2`); `at`/`in` in seconds; `in` defaults to 2.4 (longer than other templates so the per-card cascade + typewriter keep their pacing)
