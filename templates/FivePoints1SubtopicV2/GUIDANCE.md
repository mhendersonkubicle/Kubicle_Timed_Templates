---
template: FivePoints1SubtopicV2
title: Roadmap, Vertical Milestone Spine
category: list
useWhen: A vertical roadmap, journey, or staged plan of 1-5 milestones revealed top-to-bottom, where each milestone is a short title plus a one-line description and an icon, anchored by a single illustrative icon or character on the left.
tags:
  - list
  - roadmap
  - journey
  - milestones
  - timeline
  - stages
  - steps
  - vertical
  - top-to-bottom
layout:
  fixed: false                 # the card/tick column auto-centres for the count
  milestones: [1, 5]           # 1 to 5 milestones
  anchor: [icon, character]    # left panel anchor: line-art icon OR character portrait
  perMilestone: [icon, title, description]
slots:                         # addressable reveal targets
  - setup                      # dark left panel + anchor + grey dotted spine
  - card0                      # each milestone's card = icon square + title + description (one object)
  - tick0                      # each milestone's circle + check (one object); fills the blue spine to it
  - card1
  - tick1
  - card2                      # only present when there are >= 3 milestones
  - tick2
  - card3                      # only present when there are >= 4 milestones
  - tick3
  - card4                      # only present when there are 5 milestones
  - tick4
narration:
  ordering: linear-top-to-bottom   # introduce milestones strictly in roadmap order
  comparisonStyle: sequential      # one milestone fully before the next; no jumping ahead
  titleMaxChars: 20
  descriptionMaxChars: 32
  milestonesMustBeIconable: true   # each milestone maps to one concrete master Icons/ (-dark) glyph
timing:
  model: reveal-sequence
  indexedTargets: true             # card{i} / tick{i}, i = 0..milestones.length-1
  canonicalRevealOrder: [setup, card0, tick0, card1, tick1, card2, tick2, card3, tick3, card4, tick4]
  defaultStepInSeconds: 0.7        # per-object entrance (card scale/fade, tick pop + check wipe)
  defaultDurationSeconds: [10, 15]
assets:
  templateSpecific: Template-Specific-Assets/   # panel, card, spine, tick PNGs
  iconLibrary: shared                            # per-card glyphs from master Icons/ (-dark)/; anchor from Icons/ or characters/
  fonts: [Inter-Bold, Satoshi-Regular]           # falls back to system sans if absent
---

# FivePoints1SubtopicV2, Selection & Narration Guidance

## What it is

A vertical milestone roadmap. A dark panel on the left holds an anchor, either a line-art icon or a character portrait. On the right, a grey dotted spine connects up to five milestone circles, each paired with a card carrying a blue icon square, an Inter Bold title, and a Satoshi description. Under the reveal-sequence model the scaffolding (panel, anchor, spine) comes in first, then each milestone reveals top-to-bottom: its card scales/fades up, then its tick circle pops and its check wipes in, and a blue dotted overlay fills the spine down to that milestone.

## Use it when

- The content is a **roadmap, journey, or staged plan** that reads **downward**, order matters and progresses top to bottom.
- There are **1 to 5 milestones**.
- Each milestone reduces to a **short title** (≤20 chars) plus a **one-line description** (≤32 chars) and one icon.
- A single **anchor** (an icon, or a presenter/character) frames the whole roadmap on the left.

## Do NOT use it when

- The items are an **unordered** flat list (use a points/list template that does not imply progression).
- There are **more than 5 milestones**, or a milestone needs more than a short title + one line.
- The relationship is **oppositional** (a two-way contrast → use YinYang2Points) or a **left-to-right** process chain (use Process5Steps).
- Milestones **branch** or loop rather than running straight down (use a diagram/flow template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Milestones | `milestones` | 1-5 items | ordered top → bottom in roadmap order |
| Milestone title | `milestones[i].title` | ≤20 chars | short, parallel phrasing |
| Milestone description | `milestones[i].description` | ≤32 chars | one line, no wrap |
| Milestone icon | `milestones[i].icon` | id from master Icons/ (use a -dark variant) | white glyph in the blue square |
| Anchor | `anchor` | `{ kind: 'icon', id }` or `{ kind: 'character', id }` | icon = `icons/<id>.svg` (use a `-dark` icon); character = `characters/<id>.png` |

The card/tick column auto-centres vertically for the count (see "Variation, milestone count" below). Card geometry is fixed regardless of count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, dark left panel + anchor fade in; the grey dotted spine draws from the first tick to the last
2. `card0`, milestone 1's card (icon + title + description) scales/fades up
3. `tick0`, milestone 1's circle pops + check wipes; blue spine fills down to it
4. `card1`
5. `tick1`
6. `card2` *(if present)*
7. `tick2`
8. … through `card4` / `tick4` as the count requires

Each milestone reveals its card, then completes its tick, before the next milestone begins. The blue spine fill always tracks the deepest revealed tick, so the active segment grows downward as you speak.

## Narration rules

### Rule 1, Linear, top-to-bottom by milestone (MUST)

Introduce the milestones **strictly in roadmap order**, one at a time, matching the downward reveal. Deliver milestone 1 in full, its title then its description, before milestone 2 appears, and never jump back up the spine. The visual fills the blue spine downward as you speak, so "First… then… then…" narration maps directly onto `card0/tick0, card1/tick1, …`.

This is not a stylistic preference: the spine reveals and fills top to bottom, and a milestone's card and tick are not on screen until their step fires. Out-of-order narration would describe a milestone the spine has not yet reached.

**GOOD (linear, top-to-bottom):**
> "Our roadmap has four milestones. First, **Discovery**, we research what users actually need. Then **Plan**, where we map the scope and the risks. Next we **Build** the first working cut. And finally we **Launch**, rolling it out and measuring the impact."

Maps cleanly: card0/tick0 (Discovery) → card1/tick1 (Plan) → card2/tick2 (Build) → card3/tick3 (Launch).

**BAD (out of order / jumps the spine):**
> "By Launch we're measuring impact, but that only works because Discovery did the research up front, and somewhere in the middle we Build and Plan."

This names the last milestone first and scrambles the middle. The blue spine fills strictly downward, so the narration would describe Launch while only the top of the spine is filled, and Build/Plan in the wrong order.

### Rule 2, Titles and descriptions are short and parallel

Each title is ≤20 chars and each description ≤32 chars on one line. Use parallel grammar across milestones, all imperative verbs (Discovery, Plan, Build) or all nouns. Longer narration lives in the voiceover, not the card.

### Rule 3, One icon per milestone

Each milestone's icon should depict its idea concretely (a magnifier for "Discovery", a map marker for "Plan", a layer for "Build", an upward trend for "Launch"). Icons come from the master Icons/ library (-dark variants) and render white inside the blue square.

### Rule 4, The anchor frames the whole roadmap

The left anchor names or personifies the roadmap as a whole, not any single milestone. Use a `-dark` icon (platinum + dodger-blue strokes read on the Oxford-Blue panel) or a pre-cut character PNG with a transparent background.

## Variation, milestone count (1-5)

The milestone count is the built-in variation. Supply 1, 2, 3, 4, or 5 milestones:

- The card/tick column **auto-centres** vertically on the canvas for the count, so 3 milestones sit centred in the frame rather than clustering at the top.
- The dotted spine **spans first tick to last tick** for whatever count is supplied.
- Schedule one `card{i}` and one `tick{i}` per milestone; `card{i}`/`tick{i}` targets beyond `milestones.length` are ignored.

See [`examples/three-milestone/`](examples/three-milestone/) for the 3-milestone variation.

## Narration template (fill-in skeleton)

> "[Name the roadmap in one line.] First, [milestone 1], [its one-line description]. Then [milestone 2], [description]. Next [milestone 3], [description]. And finally [milestone 5], [description]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Our product roadmap runs in three phases." [2.0] "First, Discovery, we research what users need." [5.0] "Then we Plan, mapping scope and risks." [8.0] "And finally we Launch, rolling it out."

```tsx
milestones={[
  { title: 'Discovery', description: 'Research user needs', icon: 'search (1)' },
  { title: 'Plan',     description: 'Map scope and risks', icon: 'map-marker-plus' },
  { title: 'Launch',   description: 'Roll out and measure', icon: 'arrow-trend-up' },
]}
anchor={{ kind: 'icon', id: 'graphic' }}
timings={{ sequence: [
  { target: 'setup', at: 0.3, in: 1.6 },
  { target: 'card0', at: 2.0 },
  { target: 'tick0', at: 2.7 },
  { target: 'card1', at: 5.0 },
  { target: 'tick1', at: 5.7 },
  { target: 'card2', at: 8.0 },
  { target: 'tick2', at: 8.7 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to FivePoints1SubtopicV2:

1. **Confirm fit.** Is the segment a roadmap/journey of 1-5 ordered milestones, each reducible to a short title + one-line description? If unordered, oppositional, or >5 items, pick another template.
2. **Extract** the ordered milestones, a ≤20-char title and ≤32-char description for each, plus one icon concept. Choose a single anchor (icon or character) for the whole roadmap.
3. **Order-check.** Ensure the narration introduces milestones strictly top-to-bottom, one at a time. If the source jumps around (e.g. mentions the outcome first), re-sequence it to run straight down the spine.
4. **Emit the reveal sequence**: a `setup` step, then a `card{i}` followed by its `tick{i}` per milestone, each `at` taken from the start time of the narration line that introduces that milestone (the card on the line, the tick a beat later).

## Worked examples (rendered)

- [`examples/three-milestone/`](examples/three-milestone/), the 1-5 count variation (3 milestones): the authored scene + reveal sequence. (No MP4 committed; layout reference only.)

## Field / prop reference

- `milestones`: array of **1-5** × `{ title: string (≤20), description: string (≤32), icon: string }`
- `anchor`: `{ kind: 'icon', id: string }` (renders `icons/<id>.svg`, 500×500, use a `-dark` icon) **or** `{ kind: 'character', id: string }` (renders `characters/<id>.png`, fitted to the panel)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `card{i}`, or `tick{i}` (`i` = 0-based milestone index); `at`/`in` in seconds; `in` defaults to 0.7
