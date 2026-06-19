---
template: CharacterDuoCards
title: Character Duo Cards, Profile Cards Side by Side
category: character
useWhen: Introducing a small set of people (a duo by default, up to four) as parallel profile cards, each reduced to a role title, a one-line bio, two stats and an accent colour, revealed one person at a time left to right.
tags:
  - character
  - people
  - profile
  - duo
  - pair
  - introduction
  - cast
  - panel
  - roster
layout:
  fixed: false             # card geometry is fixed; the ROW auto-centres for the count
  cards: [2, 4]            # 2 to 4 cards (a duo is canonical)
  perCard: [portrait, title, verifiedBadge, bio, followers, posts, followButton]
  arrange: centred-row     # the card row auto-centres and auto-sizes for the count
slots:                     # every addressable element (also the reveal targets)
  - setup                  # the empty white card shells (scaffolding) scale + fade in
  - card0                  # left card: portrait + title + badge + bio + stats + Follow (one object)
  - card1                  # second card
  - card2                  # third card (only present when there are >= 3 cards)
  - card3                  # fourth card (only present when there are 4 cards)
narration:
  ordering: linear-left-to-right   # introduce one person fully before the next
  comparisonStyle: sequential      # NOT interleaved across cards
  cardStyle: one-person-per-card   # each card is one whole person, revealed as a unit
  titleMaxChars: 22
  titleStyle: role-not-name        # the title is a workplace role, not the person's name
  bioMaxChars: 80
timing:
  model: reveal-sequence
  indexedTargets: true             # card{i}, i = 0..cards.length-1
  canonicalRevealOrder: [setup, card0, card1, card2, card3]
  staging: animated                # setup brings the empty card shells on screen (scale + fade)
  defaultStepInSeconds: 1.5        # per-card entrance (portrait scale + content cascade)
  defaultDurationSeconds: [7, 14]
assets:
  templateSpecific: none           # pure code + inline SVG glyphs; no bundled PNGs
  characterLibrary: shared         # portraits resolve from characters/<id>.png at the repo root
  iconVariant: n/a (inline SVG glyphs, not library icons)
  fonts: [Satoshi-Bold, Satoshi-Medium]   # falls back to system sans if absent
---

# CharacterDuoCards, Selection & Narration Guidance

## What it is

A row of Pinterest-style profile cards, horizontally centred in the frame. Each card carries a portrait on an accent-coloured panel, a role title with a verified tick, a one-line bio, two stats (followers / posts), and an accent-coloured Follow button. Under the reveal-sequence model the empty card shells come in first (the staging beat), then each person's card reveals as a single object, one at a time, left to right. A duo (two cards) is the canonical case; the row auto-centres and auto-sizes for three or four.

## Use it when

- You are **introducing a small set of people** (a duo by default, up to four), a host + guest, mentor + mentee, a two- to four-person panel, or a short cast.
- Each person reduces to a **role title** (≤22 chars), a **one-line bio** (≤80 chars), and two simple stats.
- The people are **parallel** (peers in the same frame), introduced **one at a time** in a fixed left-to-right order.

## Do NOT use it when

- There is only **one** person to introduce (use a single profile card).
- There are **more than four** people (the row gets cramped, use a roster/grid template).
- A person needs **more than a one-line bio** or structured sub-points (use a points/subtopics template).
- The relationship is **oppositional or sequential** rather than a parallel set of peers.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Cards | `cards` | 2-4 | revealed left → right; a duo is canonical |
| Card portrait | `cards[i].characterId` | id | PNG in `characters/<id>.png`; NOT daniel/lena (off-scale) |
| Card title | `cards[i].title` | ≤22 chars | a workplace **role**, not the person's name |
| Verified tick | `cards[i].verified` | boolean | defaults on; set `false` to hide |
| Card bio | `cards[i].bio` | ≤80 chars | one line of supporting context |
| Followers | `cards[i].followersCount` | int ≥0 | shown beside the person icon |
| Posts | `cards[i].postsCount` | int ≥0 | shown beside the grid icon |
| Accent | `cards[i].accentColor` | one of 3 | `#0496FF` / `#F865B0` / `#3AB795` |

Character size and position are **fixed** for every card (`CHARACTER_HEIGHT` / `CHARACTER_Y`) so all heads come out the same size and hair-tops align, there is nothing to tune per card beyond the id.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the empty white card shells scale + fade in (the staging beat, no portraits or text yet)
2. `card0`, the left card: portrait scales up, then title + badge + bio + stats + Follow cascade
3. `card1`, the second card (same cascade)
4. `card2`, the third card *(if present)*
5. `card3`, the fourth card *(if present)*

Each person's card is fully on screen **before** the next card appears. Each card is one object: its portrait and all its content reveal together at that card's cue.

## Narration rules

### Rule 1, Linear, one person at a time, left to right (MUST)

Introduce the people **strictly in left-to-right order**, one whole person before the next, matching the reveal order. Deliver the first person fully (their role and what they do) before the second person's card is on screen. Never describe a later card's person before their card is revealed, and never interleave two people in one breath.

This is not a stylistic preference: the visuals reveal the left card and all its content before the next card exists on screen. Interleaved narration would describe a person whose card is not yet visible.

**GOOD (linear, one person at a time):**
> "Meet the two hosts of today's session. First, our product strategist, who helps early-stage teams ship faster. And alongside them, our head of design, who builds systems people love to use."

Maps cleanly: setup (frame the pair) → card0 (product strategist) → card1 (head of design).

**BAD (interleaved):**
> "Our product strategist and head of design run the show together, one drives the roadmap while the other shapes the experience, and both report into the same team."

This blends both people in one breath before the second card is revealed. It cannot be shown on this template, the second card is not yet on screen when its person is first described.

### Rule 2, The title is a role, not a name

Each `title` is the person's workplace **role** (≤22 chars), "Head of Design", "Product Strategist", not their personal name. The portrait carries the identity; the title carries the function.

### Rule 3, The bio is one tight line

Each `bio` is ≤80 chars and gives one line of supporting context (what the person does, their focus). Longer narration lives in the voiceover, not the card. Keep the two-to-four bios parallel in form so the set reads as one coherent panel.

### Rule 4, The shells are scaffolding, not a point

The empty card shells are part of `setup` and carry no content. They exist to bring the frame on screen during the lead-in so the scene never opens on dead air. Schedule `setup` to land under the line that frames the group ("meet the two hosts…"), then reveal each card on the cue that introduces that person.

## Variation, card count (2-4)

The card count is the built-in variation. Supply 2, 3, or 4 cards:

- The card **row auto-centres** on the canvas for the count, so fewer cards sit centred rather than drifting left.
- Card geometry (width, height, portrait framing, fonts) is **fixed**; only the row's horizontal placement changes with the count.
- Schedule one `card{i}` per card in left-to-right order; `card{i}` targets beyond `cards.length` are ignored.

A duo (2 cards) is the canonical case the template is named for; 3 and 4 are supported for a slightly larger panel.

**What stays the same:** card size (580×920), portrait framing, title/bio limits, the two stats, and the Follow button are all fixed. Only the content, the count, and the timing change.

## Narration template (fill-in skeleton)

> "[Frame the group in one line.] First, [card0 role], [what they do]. Next, [card1 role], [what they do]. [Then [card2 role]…] [And finally [card3 role]…]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "Meet the two hosts of today's session." [1.3] "First, our product strategist, who helps early-stage teams ship faster." [4.5] "And alongside them, our head of design, who builds systems people love to use."

```tsx
cards={[
  {
    characterId: 'male_middleage_white',
    title: 'Product Strategist',
    verified: true,
    bio: 'Helping early-stage teams ship faster and sharper.',
    followersCount: 1248,
    postsCount: 86,
    accentColor: '#0496FF',
  },
  {
    characterId: 'female_earlycareer_black',
    title: 'Head of Design',
    verified: true,
    bio: 'Building product systems people actually love to use.',
    followersCount: 982,
    postsCount: 54,
    accentColor: '#F865B0',
  },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.3, in: 1.0 },
  { target: 'card0', at: 1.3 },
  { target: 'card1', at: 4.5 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to CharacterDuoCards:

1. **Confirm fit.** Is the segment an introduction of 2-4 parallel people, each reducible to a role + one-line bio? If there is only one person, more than four, or the relationship is sequential/oppositional, reject this template and pick another.
2. **Extract** each person's role title (≤22 chars), a one-line bio (≤80 chars), the two stats, and pick an accent colour and a consistently-framed library portrait id (NOT daniel/lena).
3. **Re-sequence to one-person-at-a-time order.** If the source narration blends the people (describing two in one breath), rewrite it so each person is delivered fully, in left-to-right order, matching the canonical reveal order. This re-sequencing is the most common edit.
4. **Emit the reveal sequence**: a `setup` step under the line that frames the group, then one `card{i}` per person, each `at` taken from the start time of the narration line that introduces that person. Add a `timings.pulses` entry if a card is named again later.

## Worked example pointer

- [`examples/two-hosts/`](examples/two-hosts/), a worked two-card example authored on the reveal-sequence model: realistic content plus the matching reveal sequence (and a sample re-mention pulse). No MP4 is rendered.

## Field / prop reference

- `cards`: array of **2-4** × `{ characterId, title (≤22), verified?, bio (≤80), followersCount, postsCount, accentColor ∈ {#0496FF,#F865B0,#3AB795} }`, revealed left → right
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `card{i}` (`i` = 0-based card index); `at`/`in` in seconds; `in` defaults to 1.5 (a card step scales its portrait in then cascades its content within that window)
- `timings.pulses`: array of `{ target, at }`; `target` is a content `card{i}`; `at` is the scene-relative second of a re-mention (brief +5% brand pulse, ~0.45 s)
