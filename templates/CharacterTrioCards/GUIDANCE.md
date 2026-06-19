---
template: CharacterTrioCards
title: Character Trio Cards, Two-to-Three Profile Cards
category: character
useWhen: Introducing a small team, panel, or set of perspectives (2-3 people) as side-by-side profile cards, each reduced to a workplace role, a one-line bio, and a portrait.
tags:
  - character
  - team
  - profiles
  - cards
  - people
  - panel
  - roles
  - introductions
  - trio
layout:
  fixed: false               # card chain auto-centres for the card count (2-3)
  cards: [2, 3]              # 2 to 3 cards (canonical: a trio of 3)
  perCard: [portrait, title, verified-badge, bio, stats, follow-button]
slots:                       # addressable reveal targets
  - setup                    # the empty card shells rise in (scaffolding stage)
  - card0                    # each card = portrait + title + badge + bio + stats + Follow (one object)
  - card1
  - card2                    # only present when there are 3 cards
narration:
  ordering: linear-by-card       # introduce characters strictly left to right
  comparisonStyle: sequential    # one card fully before the next; no jumping ahead
  titleMaxChars: 22              # workplace role, NOT a personal name
  bioMaxChars: 80
  titleStyle: workplace-role     # role/function, not a name; parallel across cards
timing:
  model: reveal-sequence
  indexedTargets: true           # card{i}, i = 0..cards.length-1
  canonicalRevealOrder: [setup, card0, card1, card2]
  staging: animated              # setup rises the empty card shells in (never a blank stage)
  defaultStepInSeconds: 1.4      # per-card entrance (card pop + content cascade)
  defaultDurationSeconds: [7, 12]
assets:
  templateSpecific: none         # pure code + inline SVG glyphs; no bundled PNGs
  characterLibrary: shared       # portraits resolve from the shared character library (characters/<id>.png), copied at render time
  iconVariant: n/a (inline glyphs)  # the verified tick, person, grid and plus marks are inline SVG tinted in code, NOT library icons, so the -dark/-light icon-contrast rule does not apply
  fonts: [Satoshi-Bold, Satoshi-Medium]
---

# CharacterTrioCards, Selection & Narration Guidance

## What it is

Two or three Pinterest-style profile cards stand side by side, each tinted with its own brand accent. Under the reveal-sequence model the empty white card shells rise in first (the staging), then each card fills in one at a time, left to right: the portrait settles into its accent panel, then the workplace title, verified tick, one-line bio, follower/post stats and a Follow button cascade in. Each card is a single revealed object. The canonical layout is a trio of three; a pair of two is supported and auto-centres.

## Use it when

- You are introducing a **small team, panel, or set of perspectives**, 2 to 3 people.
- Each person reduces to a **workplace role** (≤22 chars, NOT a personal name), a **single-line bio** (≤80 chars), and a consistently-framed portrait.
- The people are **parallel** (co-presenters, panellists, a trio of viewpoints) and are introduced one at a time.

## Do NOT use it when

- There are **more than 3 people** (use a larger team layout).
- A person needs **more than a role + one-line bio** (deep profile, multiple stats, quotes).
- The relationship is a **process, comparison, or hierarchy** rather than a flat set of peers (use a process / comparison / org-chart template).
- You want to feature a **single character** (use a single profile template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Cards | `cards` | 2-3 items | ordered left → right in introduction order |
| Character | `cards[i].characterId` | id | PNG in `characters/<id>.png`; consistently-framed presenter portrait (NOT daniel/lena) |
| Title | `cards[i].title` | ≤22 chars | workplace role, NOT a personal name |
| Verified | `cards[i].verified` | bool (optional) | shows the accent verified tick (defaults to shown) |
| Bio | `cards[i].bio` | ≤80 chars | one line, wraps inside the card |
| Followers | `cards[i].followersCount` | int ≥0 | formatted with thousands separators |
| Posts | `cards[i].postsCount` | int ≥0 | formatted with thousands separators |
| Accent | `cards[i].accentColor` | one of 3 | `#0496FF` dodger blue / `#F865B0` wild strawberry / `#3AB795` ocean green; tints panel, tick, Follow button |

Character size + position are **fixed** for every card so all heads match, just pick the id.

## Reveal order (canonical)

1. `setup`, the empty card shells rise in (scaffolding, no content yet)
2. `card0`, card 1 fills in: portrait → title → badge → bio → stats → Follow
3. `card1`
4. `card2` *(if present)*

Each card is one object: the portrait and all its content reveal together at that card's cue, cascading inside the card's own reveal window.

## Narration rules

### Rule 1, Linear, card-by-card (MUST)

Introduce the people **strictly left to right**, one at a time, matching the reveal order. Do not describe a later card before its card is on screen, and do not jump back. The visual fills the cards in order as you speak, so "Meet… Alongside them… And finally…" narration maps directly onto `card0, card1, card2`.

**GOOD (linear, card-by-card):**
> "Three people are shaping this product. First, our **Product Strategist**, keeping the roadmap sharp. Alongside them, the **Head of Design**, building systems people love. And finally, the **Engineering Lead**, shipping it reliably."

Maps cleanly: setup (the shells) → card0 (strategist) → card1 (designer) → card2 (engineer).

**BAD (interleaved / out of order):**
> "Our designer and engineer work closely, but the strategist sets it all up first." (Describes cards 1 and 2 before card 0 exists, and the spoken order doesn't match the build.)

### Rule 2, Titles are roles, short and parallel

Each title is a **workplace role**, not a personal name, ≤22 chars, with parallel phrasing across cards (all role nouns). GOOD: "Product Strategist", "Head of Design", "Engineering Lead". BAD: "Priya Shah" (a name), "Leads our entire design org" (too long, not a tidy role).

### Rule 3, One-line bios

Each bio is a single line (≤80 chars) describing what the person does. Keep them parallel in shape so the trio reads as a set. Longer detail lives in the voiceover, not the card.

## Variation, card count (2-3)

The card count is the built-in variation. Supply 2 or 3 cards:

- The card chain **auto-centres** on the canvas for the count, so a pair sits in the middle rather than drifting left.
- Each card's geometry, portrait framing, and content layout are identical regardless of count.
- Schedule one `card{i}` per card; `card{i}` targets beyond `cards.length` are ignored.

The canonical layout is a **trio of 3**; 2 is the supported lower bound.

## Narration template (fill-in skeleton)

> "[Name the group in one line.] First, the [role 1], [what they do]. Alongside them, the [role 2], [what they do]. And finally, the [role 3], [what they do]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Three people shape this product." [1.2] "First, our Product Strategist." [3.0] "Alongside them, the Head of Design." [4.8] "And the Engineering Lead."

```tsx
cards={[
  { characterId: 'male_middleage_white',    title: 'Product Strategist', bio: 'Helping early-stage teams ship faster and sharper.', followersCount: 1248, postsCount: 86,  accentColor: '#0496FF' },
  { characterId: 'female_earlycareer_black', title: 'Head of Design',     bio: 'Building product systems people actually love to use.', followersCount: 982,  postsCount: 54,  accentColor: '#F865B0' },
  { characterId: 'male_middleage_black',     title: 'Engineering Lead',   bio: 'Shipping reliable, well-tested code without the drama.',  followersCount: 1567, postsCount: 128, accentColor: '#3AB795' },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.2, in: 1.0 },
  { target: 'card0', at: 1.2 },
  { target: 'card1', at: 3.0 },
  { target: 'card2', at: 4.8 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment introducing 2-3 parallel people, each reducible to a role + one-line bio? If it is more than 3, a single profile, or a process/comparison/hierarchy, pick another template.
2. **Extract** each person's workplace role (≤22 chars, not a name), a ≤80-char bio, and pick a consistently-framed portrait id + one of the three accent colours.
3. **Order-check.** Ensure the narration introduces people left to right, one at a time. If the source jumps around, re-sequence it to run straight through.
4. **Emit the reveal sequence**: a `setup` step (shells rise in), then one `card{i}` per person, each `at` taken from the start time of the narration line that introduces that person.
5. **Re-mention pulses.** If a person already revealed is named again >~2-3s later, add `timings.pulses: [{ target: 'card{i}', at }]` at the re-mention's cue time for a brief brand pulse.

## Worked examples (rendered)

- [`examples/meet-the-team/`](examples/meet-the-team/), a worked 3-card example authored from a team-introduction script: content props + reveal sequence, with a couple of re-mention pulses. (No MP4 rendered.)

## Field / prop reference

- `cards`: array of **2-3** × `{ characterId, title (≤22), verified?, bio (≤80), followersCount, postsCount, accentColor }`
- `cards[i].accentColor`: one of `#0496FF` (dodger blue) / `#F865B0` (wild strawberry) / `#3AB795` (ocean green)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `card{i}` (`i` = 0-based card index); `at`/`in` in seconds; `in` defaults to 1.4
- `timings.pulses`: array of `{ target, at }`; `target` is a content `card{i}` (setup is not pulsable); `at` is the re-mention's scene-relative second
