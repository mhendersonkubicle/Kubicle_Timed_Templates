---
template: CharacterTeamCard
title: Character Team Card, Profile Card with a Team
category: character
useWhen: Introducing a small team or group as a unit (2-6 members), where the team has one shared name, one shared blurb, and the members are revealed one at a time in reading order.
tags:
  - character
  - team
  - group
  - people
  - profile-card
  - roster
  - squad
  - introduction
layout:
  fixed: false                # portrait panel auto-divides into N equal slots
  members: [2, 6]             # 2 to 6 members in one row
  perMember: [characterId]    # each member is one fixed-size portrait slot
slots:                        # addressable reveal targets
  - setup                     # card frame + portrait panel + team chrome (title/badge/bio/stats/Follow) stage in
  - member0                   # each member = one character stepping into its slot (one object)
  - member1
  - member2                   # only present when there are >= 3 members
  - member3                   # only present when there are >= 4 members
  - member4                   # only present when there are >= 5 members
  - member5                   # only present when there are 6 members
narration:
  ordering: linear-by-member     # introduce members strictly in reading order
  comparisonStyle: sequential    # one member fully before the next; no jumping ahead
  titleMaxChars: 24
  bioMaxChars: 95
timing:
  model: reveal-sequence
  indexedTargets: true           # member{i}, i = 0..members.length-1
  canonicalRevealOrder: [setup, member0, member1, member2, member3, member4, member5]
  staging: animated              # setup brings the card frame + chrome on screen (not a no-op)
  defaultStepInSeconds: 0.6      # per-member entrance (portrait steps into place)
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: none         # pure code + SVG glyphs; no bundled PNGs
  characterLibrary: shared       # member portraits resolve from characters/<id>.png
  iconVariant: n/a (inline SVG glyphs, no library icons; characters are PNGs)
  fonts: [Satoshi-Bold, Satoshi-Medium]
---

# CharacterTeamCard, Selection & Narration Guidance

## What it is

A single wider Pinterest-style profile card that introduces a **team** as one
unit. Under the reveal-sequence model the card frame stages in first, with the
empty accent-tinted portrait panel and the team's text chrome (title, verified
badge, bio, follower/post stats, the Follow button). Then each team member
steps into their slot inside the portrait panel, one at a time in reading
order, so the team assembles as the narration names each person. The portrait
panel auto-divides into N equal slots for the member count (2-6), every
character sized identically, so any count reads as one balanced team portrait.

## Use it when

- You are introducing a **small team or group as a unit** (2-6 people) that
  shares **one name** (e.g. "Product Team") and **one blurb**.
- The members can be introduced **one at a time in reading order** as the
  narration names them.
- A profile-card / social-card aesthetic fits the beat (a team "page" with a
  title, bio, stats and a Follow button).

## Do NOT use it when

- You need **per-person titles, names, or details** (this card has one shared
  title and bio, not per-member captions). Use a per-character template that
  carries individual labels.
- There are **more than 6** members, or only **one** person (use a single
  profile-card template for one person).
- The people are **contrasted or paired** rather than presented as one team
  (use a comparison template).
- The beat is a **conversation or exchange** between characters (use a chat /
  thread template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Members | `members` | 2-6 items | reading order, left → right; each `{ characterId }` |
| Member portrait | `members[i].characterId` | id | PNG in `characters/<id>.png`; fixed size per slot |
| Team title | `title` | ≤24 chars | one shared name, e.g. "Product Team" |
| Verified badge | `verified` | boolean | optional accent-tinted tick beside the title |
| Bio | `bio` | ≤95 chars | one shared blurb; wraps to ~2 lines |
| Stats | `followersCount`, `postsCount` | ints | rendered in the bottom row |
| Accent | `accentColor` | enum | `#0496FF` / `#F865B0` / `#3AB795` only |

`members` is **2 to 6** items. Size and position are fixed per slot (the panel
divides into N equal slots), so authoring is just picking ids in reading order.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the card frame pops in with the empty portrait panel and the team
   text chrome (title + verified badge + bio + stats + Follow) cascading in.
2. `member0`, the first team member steps into their slot.
3. `member1`
4. `member2` *(if present)*
5. `member3` *(if present)*
6. `member4` *(if present)*
7. `member5` *(if present)*

Each member is one object: that character's portrait reveals at that member's
cue. The team text chrome belongs to `setup` (it describes the team as a whole),
so it is on screen before the first member arrives.

## Narration rules

### Rule 1, Linear, member-by-member (MUST)

Introduce the members **strictly in reading order**, one at a time, matching the
reveal order. Do not describe a later member before their portrait is on screen,
and do not jump back. The portrait panel fills left → right as you speak, so
"This is the team. First, … then … then …" narration maps directly onto
`member0, member1, member2…`.

**GOOD:** "Meet the Product Team. First, our lead designer. Alongside her, two
engineers. And rounding it out, our product manager."

**BAD:** "The PM and the engineers all report to the lead, who you'll meet
last." (Names later members before their portraits exist, and the order spoken
does not match the build.)

### Rule 2, Name the team up front

Open by naming the team and what it is in one line that lands during `setup`
(while the card frame and the title/bio chrome are coming in). This is what the
shared title and bio stand for.

### Rule 3, Title and bio are about the whole team

`title` (≤24 chars) is the team's name, and `bio` (≤95 chars) is one shared
blurb about the team, not about any one member. There are no per-member
captions; keep individual detail in the voiceover, not on the card.

### Rule 4, Members are reveal-able, not describable in bulk

Each member is one concrete person the narration introduces at their own cue.
Phrase the introductions in **parallel** (all roles, or all "this is …") so the
team reads as a cohesive unit.

## Variation, member count (2-6)

The member count is the built-in variation. Supply 2, 3, 4, 5, or 6 members:

- The portrait panel **auto-divides** into N equal slots filling its width, so
  the team always reads centred and balanced.
- Every character is **sized identically** (fixed framing per slot), so heads
  match across the team no matter the count.
- Schedule one `member{i}` per member in reading order; `member{i}` targets
  beyond `members.length` are ignored.

See [`examples/product-team/`](examples/product-team/) for a 4-member layout
with a re-mention pulse.

## Narration template (fill-in skeleton)

> "[Name the team in one line.] First, [member 1]. Then, [member 2]. Next,
> [member 3]. [member 4]. And finally, [member 5/6]."

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to CharacterTeamCard:

1. **Confirm fit.** Is the segment introducing a 2-6 person team as one unit
   with one shared name and blurb, members introducible one at a time? If it
   needs per-person labels, is a 1:1 conversation, or has >6 people, pick
   another template.
2. **Extract** the team name (≤24 chars), one shared blurb (≤95 chars), and the
   ordered list of members (a character id each, in reading order).
3. **Order-check.** Ensure the narration introduces members in reading order,
   one at a time. If the source jumps around, re-sequence it to run straight
   through.
4. **Emit the reveal sequence**: a `setup` step (naming the team, while the card
   frame and chrome come in), then one `member{i}` per member, each `at` taken
   from the start time of the narration line that introduces that person.
5. **Add re-mention pulses** (optional): for any member named again >~2-3s after
   their reveal, add a `pulses` entry at the re-mention's cue time.

## Worked examples (rendered)

- [`examples/product-team/`](examples/product-team/), the 2-6 count variation
  (4 members) with a re-mention pulse, authored scene + reveal sequence. (No MP4
  rendered.)

## Field / prop reference

- `members`: array of **2-6** × `{ characterId: string }` (reading order)
- `title`: string (≤24); `verified`: boolean (optional); `bio`: string (≤95)
- `followersCount`, `postsCount`: non-negative ints
- `accentColor`: one of `#0496FF`, `#F865B0`, `#3AB795`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or
  `member{i}` (`i` = 0-based member index); `at`/`in` in seconds; `in` defaults
  to 0.6
- `timings.pulses`: array of `{ target, at }`; `target` is a `member{i}`; `at`
  in seconds (the re-mention cue time)
