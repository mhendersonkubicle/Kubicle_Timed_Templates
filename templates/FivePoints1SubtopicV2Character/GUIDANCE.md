---
template: FivePoints1SubtopicV2Character
title: Roadmap, Vertical Milestones with Character Panel
category: list
useWhen: An ordered roadmap, journey, or sequence of 1-5 milestones revealed top-to-bottom along a spine, fronted by a presenter character in a side panel. Each milestone is a short title plus a one-line description and an icon.
tags:
  - roadmap
  - milestones
  - journey
  - timeline
  - list
  - steps
  - stages
  - character
  - presenter
layout:
  fixed: false                  # spine + card band auto-centre for the milestone count
  milestones: [1, 5]            # 1 to 5 milestones
  panel: character              # left panel hosts a character PNG (decorative scaffolding)
  perMilestone: [icon, title, description]
slots:                          # addressable reveal targets
  - setup                       # Dodger-Blue panel + character fade in, empty dotted spine draws
  - milestone0                  # each milestone = tick + card (icon + title + description), one object
  - milestone1
  - milestone2
  - milestone3                  # only present when there are >= 4 milestones
  - milestone4                  # only present when there are 5 milestones
narration:
  ordering: linear-by-milestone   # introduce milestones strictly top-to-bottom in roadmap order
  comparisonStyle: sequential     # one milestone fully before the next; no jumping down or back
  titleMaxChars: 20
  descriptionMaxChars: 32
  labelStyle: parallel            # parallel phrasing across milestones
timing:
  model: reveal-sequence
  indexedTargets: true            # milestone{i}, i = 0..milestones.length-1
  canonicalRevealOrder: [setup, milestone0, milestone1, milestone2, milestone3, milestone4]
  defaultStepInSeconds: 0.7       # per-milestone entrance (tick pop + card lift)
  defaultDurationSeconds: [10, 15]
assets:
  templateSpecific: Template-Specific-Assets/   # pill / spine / tick PNGs (icon_base.png is unused and dropped)
  iconLibrary: shared                            # milestone glyphs resolve from the shared master Icons/ (-dark)/ set (white)
  character: shared                              # character PNG resolves from characters/<id>.png (not bundled here)
  fonts: [Inter-Bold, Satoshi-Regular]           # falls back to system sans if absent
---

# FivePoints1SubtopicV2Character, Selection & Narration Guidance

## What it is

A vertical roadmap. A Dodger-Blue rounded panel on the left holds a presenter character (framed so the face sits near the panel centre); a dotted spine runs down the right linking 1-5 milestone tick circles. Under the reveal-sequence model the panel + character + empty grey spine come in first (`setup`), then each milestone reveals top-to-bottom: its tick circle pops and its checkmark trims in, its card (icon + title + description) lifts and fades up to full focus, and the blue "lit" spine overlay advances down to that tick.

Despite the "Character" in the name, this is a **roadmap / ordered-list** template, not a character-portrait scene. The portrait is decorative scaffolding, it carries no per-milestone content and folds into `setup`.

## Use it when

- The content is an **ordered roadmap, journey, or sequence** of 1-5 milestones where order matters and they read top-to-bottom.
- Each milestone reduces to a **short title** (≤20 chars) plus a **one-line description** (≤32 chars) and one icon.
- You want a **presenter / character** fronting the roadmap (e.g. a course host walking through a journey).

## Do NOT use it when

- The items are **not ordered** (a flat set of parallel points → use a points/list template).
- There are **more than 5** milestones, or a milestone needs more than a short title + one-line description.
- The relationship is **oppositional** rather than sequential (a two-way contrast → use YinYang2Points).
- Milestones **branch** or loop rather than running straight down (use a diagram/flow template).
- You need the character to *do* or *say* something per item, here the character is static scaffolding, not a per-milestone actor.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Milestones | `milestones` | 1-5 items | ordered top → bottom in roadmap order |
| Milestone title | `milestones[i].title` | ≤20 chars | parallel phrasing across milestones |
| Milestone description | `milestones[i].description` | ≤32 chars | one line, parallel phrasing |
| Milestone icon | `milestones[i].icon` | id from master Icons/ (use a -dark variant) | white glyph on the dodger-blue square |
| Character | `character.id` | PNG id | resolves to `characters/<id>.png` |
| Character framing | `character.characterHeight`, `character.characterY` | optional px | tune so the face lands near the panel centre, nothing clipped |

The milestone count (1-5) is the built-in variation; the spine + card band auto-centre vertically for the count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, Dodger-Blue panel + character fade in; the empty grey dotted spine draws down
2. `milestone0`, tick 0 pops + card 0 (icon + title + description) reveals; blue spine fills to tick 0
3. `milestone1`
4. `milestone2`
5. `milestone3` *(if present)*
6. `milestone4` *(if present)*

Each milestone is one object: the tick, the card, and the blue-spine advance all happen together at that milestone's cue.

## Narration rules

### Rule 1, Linear, top-to-bottom by milestone (MUST)

Introduce the milestones **strictly in roadmap order**, descending the spine, one at a time, matching the reveal order. Deliver one milestone fully, its title, then its short description, before moving to the next. Never jump down the roadmap ahead of the revealed tick, and never go back up once a later milestone has appeared. The visual fills the spine downward and lights each tick as you speak, so "First… then… next…" narration maps directly onto `milestone0, milestone1, milestone2…`.

**GOOD (linear, top-to-bottom):**
> "Here's our product journey. First, **Discovery**, we research what users actually need. Then **Plan**, where we map the scope and the risks. Next we **Build** the first cut. Then **Review** it with real users. And finally we **Launch** and measure the impact."

Maps cleanly: milestone0 → milestone1 → milestone2 → milestone3 → milestone4.

**BAD (jumps down / back up):**
> "By the time we Launch, we've already Built and Reviewed, but it all starts back at Discovery, and somewhere in there we Plan."

This describes Launch (the deepest tick) before its tick exists on screen and then jumps back up to Discovery and Plan. The spine has only lit to the first tick when "Launch" is spoken, so the narration and the build are out of sync.

### Rule 2, Titles and descriptions are short and parallel

Each title is ≤20 chars and each description ≤32 chars, using parallel grammar across milestones, all imperative verbs (Discover, Plan, Build) or all nouns, and descriptions phrased the same way. Avoid full sentences; the longer narration lives in the voiceover, not on the card.

### Rule 3, One icon per milestone

Each milestone's icon should depict its idea concretely (a magnifier for "Discovery", a map marker for "Plan", an upward trend for "Launch"). Icons come from the master Icons/ library (-dark variants) and render white on the dodger-blue square.

### Rule 4, The character is scaffolding, not a speaker

The character fronts the roadmap but has no reveal step of its own, it appears with `setup` and stays. Do not write narration that has the character act per milestone; narrate the milestones themselves.

## Variation, milestone count (1-5)

The milestone count is the built-in variation. Supply 1, 2, 3, 4, or 5 milestones:

- The spine + card band **auto-centre** vertically for the count (3 milestones sit centred in the frame, etc.).
- With a **single milestone** there is no spine to draw, the tick + card carry the scene on their own.
- Schedule one `milestone{i}` per milestone; `milestone{i}` targets beyond `milestones.length` are ignored (mirroring Process5Steps' `step{i}`).

See [`examples/four-milestone/`](examples/four-milestone/) for the 4-milestone variation.

## Narration template (fill-in skeleton)

> "[Name the roadmap in one line.] First, [milestone 1], [its one-line point]. Then, [milestone 2], [its point]. Next, [milestone 3]. [milestone 4]. And finally, [milestone 5]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Here's our product journey." [2.0] "First, Discovery, we research what users need." [4.5] "Then Plan, mapping scope and risks." [7.0] "Next we Build the first cut." [9.5] "Then Review with real users." [12.0] "And finally we Launch and measure."

```tsx
milestones={[
  { title: 'Discovery', description: 'Research user needs',  icon: 'search (1)' },
  { title: 'Plan',     description: 'Map scope and risks',  icon: 'map-marker-plus' },
  { title: 'Build',    description: 'Ship the first cut',   icon: 'layer-plus' },
  { title: 'Review',   description: 'Test with real users', icon: 'ai-assistant' },
  { title: 'Launch',   description: 'Roll out and measure', icon: 'arrow-trend-up' },
]}
character={{ id: 'presenter-red', characterHeight: 950, characterY: 175 }}
timings={{ sequence: [
  { target: 'setup',     at: 0.3, in: 1.7 },
  { target: 'milestone0', at: 2.0 },
  { target: 'milestone1', at: 4.5 },
  { target: 'milestone2', at: 7.0 },
  { target: 'milestone3', at: 9.5 },
  { target: 'milestone4', at: 12.0 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to FivePoints1SubtopicV2Character:

1. **Confirm fit.** Is the segment an ordered roadmap/journey of 1-5 milestones, each reducible to a short title + one-line description? If unordered or >5 items, pick another template.
2. **Extract** the ordered milestones and a ≤20-char title, ≤32-char description, and icon concept for each.
3. **Order-check.** Ensure the narration introduces milestones strictly top-to-bottom, one at a time. If the source jumps to the outcome first or hops around the roadmap, re-sequence it to descend the spine in order. This re-sequencing is the most common edit.
4. **Pick a character** PNG that suits the tone and tune `characterHeight` / `characterY` so the face lands near the panel centre.
5. **Emit the reveal sequence**: a `setup` step, then one `milestone{i}` per milestone, each `at` taken from the start time of the narration line that introduces that milestone.

## Worked examples (rendered)

- [`examples/four-milestone/`](examples/four-milestone/), a 4-milestone roadmap authored with a sample reveal sequence and a presenter character.

## Field / prop reference

- `milestones`: array of **1-5** × `{ title: string (≤20), description: string (≤32), icon: string }`
- `character`: `{ id: string, characterHeight?: number (200-1200, default 950), characterY?: number (default 175) }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `milestone{i}` (`i` = 0-based milestone index); `at`/`in` in seconds; `in` defaults to 0.7
