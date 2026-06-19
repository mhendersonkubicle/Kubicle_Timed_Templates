---
template: CharacterTeam6Card
title: Character Team Card, Up to Six Members
category: character
useWhen: Introducing a team, squad, founding crew, or advisory board of 2-6 people as one social-style profile card, where each person reduces to a portrait plus a short role label and the group shares one name, bio, and stats.
tags:
  - character
  - team
  - people
  - roster
  - squad
  - profile-card
  - introduction
  - group
  - social-card
layout:
  fixed: false               # portrait row auto-fills the panel for the member count
  members: [2, 6]            # 2 to 6 team members
  perMember: [portrait, title]
slots:                       # addressable reveal targets
  - setup                    # card shell + empty portrait panel + bottom scaffolding pop in (staging)
  - member0                  # each member = cropped portrait + role label (one object)
  - member1
  - member2                  # only present when there are >= 3 members
  - member3                  # only present when there are >= 4 members
  - member4                  # only present when there are >= 5 members
  - member5                  # only present when there are 6 members
  - title                    # team name + optional verified tick
  - bio                      # supporting bio line
  - stats                    # followers + posts counts
  - follow                   # accent-filled Follow button
narration:
  ordering: linear-by-member     # introduce members strictly left -> right (reading order)
  comparisonStyle: sequential    # one member, then the next; group meta after the people
  titleMaxChars: 24
  bioMaxChars: 95
  perMemberLabelMaxChars: 18
timing:
  model: reveal-sequence
  indexedTargets: true           # member{i}, i = 0..characters.length-1
  canonicalRevealOrder: [setup, member0, member1, member2, member3, member4, member5, title, bio, stats, follow]
  staging: animated              # setup brings the card shell + empty portrait panel + bottom row on screen
  defaultStepInSeconds: 0.5      # per-object entrance (portrait scale/fade or text slide-up)
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: none         # pure code + inline SVG glyphs; no bundled PNGs
  characterLibrary: shared       # portraits resolve from the shared character library (characters/<id>.png)
  iconVariant: n/a (inline SVG)  # the verified / person / grid / plus glyphs are inline JSX, recoloured to the accent or grey; no -dark/-light icon assets are referenced
  fonts: [Satoshi-Bold, Satoshi-Medium]
---

# CharacterTeam6Card, Selection & Narration Guidance

## What it is

A single extra-wide, social-style profile card centred on a platinum stage. The card shell pops in first carrying an empty accent-filled portrait panel and an empty bottom scaffolding row (the staging beat), then up to six characters arrive one at a time, left to right, each in their own identically-framed slot with a small role label beneath. After the people, the team name (with an optional verified tick), the bio line, the followers/posts stats, and the Follow button reveal in turn. Under the reveal-sequence model nothing is shown until a step targets it.

## Use it when

- You are introducing a **group of 2-6 people** as a single unit, a team, squad, founding crew, panel, or advisory board.
- Each person reduces to a **portrait plus a short role label** (≤18 chars).
- The group shares **one identity**: one team name, one bio, one set of stats.

## Do NOT use it when

- There is **one person only** (use a single-character profile card).
- There are **more than 6 people**, or each person needs more than a short role label (use a roster/list layout).
- The people are **not a group** but separate, contrasting roles to compare (use a comparison template).
- The content is **not people** at all (use a points/process/diagram template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Members | `characters` | 2-6 items | reading order, left → right |
| Member portrait | `characters[i].characterId` | PNG id | consistently-framed library presenter portrait (NOT daniel/lena) |
| Member role | `characters[i].characterTitle` | ≤18 chars | light-grey label under the portrait |
| Team name | `title` | ≤24 chars | bold, with optional verified tick |
| Bio | `bio` | ≤95 chars | wraps, kept inside the card |
| Followers | `followersCount` | integer ≥0 | rendered with thousands separators |
| Posts | `postsCount` | integer ≥0 | rendered with thousands separators |
| Accent | `accentColor` | one of 3 | `#0496FF` / `#F865B0` / `#3AB795` |

## Reveal order (canonical)

1. `setup`, the card shell + empty portrait panel + bottom scaffolding pop in
2. `member0`, the first portrait slot + its role label
3. `member1` … `member5` *(only those that exist for the count)*
4. `title`, the team name + optional verified tick
5. `bio`, the supporting bio line
6. `stats`, the followers + posts counts
7. `follow`, the Follow button

Each member is one object: the portrait and its role label reveal together at that member's cue.

## Narration rules

### Rule 1, Linear, member-by-member (MUST)

Introduce the members **strictly in reading order**, one at a time, matching the reveal order. Do not name a later member before their portrait is on screen, and do not jump back. The card fills left to right as you speak, so "Meet… and… and…" narration maps directly onto `member0, member1, member2…`.

**GOOD:** "Meet the founding team. **Priya** leads product. **Marcus** runs engineering. **Sofia** owns design. And **Theo** keeps operations on track."

**BAD:** "Operations and design round out a team led by product and engineering." (Names the last members first, and the order spoken doesn't match the left-to-right build.)

### Rule 2, People first, then the group meta

Reveal all the members before the team name, bio, and stats. The card is a portrait of the group, the faces land first, then the shared identity (name, bio, numbers) closes it out. Schedule `title`, `bio`, `stats`, `follow` after the last `member{i}`.

### Rule 3, Role labels are short and parallel

Each `characterTitle` is ≤18 chars and uses parallel phrasing across the team (all roles, all nouns). GOOD: "Product Lead", "Engineer", "Designer". BAD: "Leads our product org day to day" (too long, breaks the row).

### Rule 4, One shared identity

The `title`, `bio`, and stats describe the **group**, not any one person. Keep the bio to one tight line (≤95 chars) about what the team does together.

## Variation, member count (2-6)

The member count is the built-in variation. Supply 2, 3, 4, 5, or 6 members:

- The portrait row **auto-fills** the panel: each slot is `PORTRAIT_W / count` wide, so the row always spans the panel evenly rather than leaving a gap or drifting.
- Head framing is **fixed** per slot, so every face comes out the same size regardless of count.
- Schedule one `member{i}` per member; `member{i}` targets beyond `characters.length` are ignored.

See [`examples/founding-trio/`](examples/founding-trio/) for the 3-member count variation.

## Narration template (fill-in skeleton)

> "[Name the team in one line.] [Member 1] [does X]. [Member 2] [does Y]. [Member 3] [does Z]. [Optional: one line on what they do together / the stats.]"

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment introducing a group of 2-6 people who share one identity, each reducible to a portrait + short role? If one person, >6 people, or a contrast of roles, pick another template.
2. **Extract** the members in reading order, a ≤18-char role label and a portrait id for each, plus the shared team name, a ≤95-char bio, and the two counts.
3. **Order-check.** Ensure the narration introduces members left to right, one at a time, then the group meta. If the source names people out of order or leads with the stats, re-sequence it.
4. **Emit the reveal sequence**: a `setup` step, then one `member{i}` per member in reading order, then `title`, `bio`, `stats`, `follow`, each `at` taken from the start time of the narration line that introduces it.

## Worked examples

- [`examples/founding-trio/`](examples/founding-trio/), the 2-6 count variation (3 members), with content props and the reveal sequence (and a couple of re-mention pulses). No MP4 rendered.

## Field / prop reference

- `characters`: array of **2-6** × `{ characterId: string, characterTitle: string (≤18) }` (reading order)
- `title`: string (≤24); `verified`: boolean (optional, default true); `bio`: string (≤95)
- `followersCount` / `postsCount`: non-negative integers
- `accentColor`: `'#0496FF'` | `'#F865B0'` | `'#3AB795'`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `member{i}` (0-based), `title`, `bio`, `stats`, or `follow`; `at`/`in` in seconds; `in` defaults to 0.5
- `timings.pulses`: array of `{ target, at }`; `target` is any content object (`member{i}`, `title`, `bio`, `stats`, `follow`); `at` is the re-mention time in seconds
