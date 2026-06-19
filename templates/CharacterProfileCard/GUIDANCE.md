---
template: CharacterProfileCard
title: Character Profile Card, Social-Style Presenter Introduction
category: character
useWhen: Introducing a single person by their workplace role, a presenter, panellist, author, or expert, with a portrait, a short bio, a few countable stats, and a call to follow, revealed top-to-bottom like a social-profile card.
tags:
  - character
  - profile
  - presenter
  - introduction
  - bio
  - person
  - speaker
  - social-card
  - single
layout:
  fixed: true               # single centred card; one portrait, one role, one bio
  card: vertical-phone       # 640×1000 white rounded card, centred on canvas
  stats: [1, 3]              # 1 to 3 countable stats in the bottom row
  perStat: [icon, value]
slots:                       # every addressable element (also the reveal targets)
  - setup                    # the white card pops in (scaffolding/frame, the staging beat)
  - portrait                 # the portrait settles into the card frame
  - name                     # the workplace-title row slides up
  - badge                    # the verified badge pops in (only if verified)
  - bio                      # the bio slides up + fades in
  - stat0                    # bottom-row stat 0 (icon + value), one object
  - stat1                    # bottom-row stat 1 (only present when there are >= 2 stats)
  - stat2                    # bottom-row stat 2 (only present when there are 3 stats)
  - follow                   # the Follow button bounces in
narration:
  ordering: linear-top-to-bottom   # reveal in reading order down the card
  comparisonStyle: sequential      # introduce one element fully before the next
  titleMaxChars: 30                # workplace role, NOT a personal name
  bioMaxChars: 95
  statCount: [1, 3]
  parallelPhrasing: true           # phrase the stats in parallel
timing:
  model: reveal-sequence
  indexedTargets: true             # stat{i}, i = 0..stats.length-1
  fixedTargets: true               # setup/portrait/name/badge/bio/follow are fixed named slots
  canonicalRevealOrder: [setup, portrait, name, badge, bio, stat0, stat1, stat2, follow]
  staging: animated                # setup brings the white card on screen (pop-in with squash & stretch)
  defaultStepInSeconds: 0.5        # per-object entrance
  defaultDurationSeconds: [5, 10]
assets:
  templateSpecific: none           # pure code + inline SVG; portrait resolves from characters/
  characterLibrary: shared         # portrait resolves from characters/<characterId>.png
  iconLibrary: none                # stat / badge / Follow glyphs are inline SVG, not library icons
  iconVariant: n/a                 # no library icons are rendered, so no -dark/-light choice applies
  fonts: [Satoshi-Bold, Satoshi-Medium]   # falls back to system sans if absent
---

# CharacterProfileCard, Selection & Narration Guidance

## What it is

A modern, Pinterest / social-style profile card that introduces one person. A centred white rounded card pops onto a soft cool-grey stage; inside it a portrait sits on top, the workplace role and a verified tick appear below, then a short bio, a row of one-to-three countable stats (followers / posts / likes), and a Follow pill pinned to the right. Under the reveal-sequence model the card comes in first as scaffolding, then each element reveals one at a time, top to bottom, in reading order.

## Use it when

- You are introducing **one** person by their **workplace role**, a presenter, panellist, author, expert, or guest.
- The introduction reduces to a **portrait + a short role + a short bio + a few numbers**.
- A friendly, social-media framing fits the tone (the Follow pill and verified tick are part of the metaphor).
- You want a single, self-contained "who is this" card rather than a multi-person line-up.

## Do NOT use it when

- You need to introduce **more than one** person at once (use a duo / team card template).
- The person needs **more than a short role and bio**, a full credentials list, multiple quotes, or a timeline (use a different layout).
- There are **no countable stats** and no social framing, and the role/bio would look bare on a profile card (use a plain title or lower-third template).
- The content is a **list of points or a process**, not a person (use a points or process template).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Portrait | `characterId` | id | resolves `characters/<id>.png`; consistently-framed presenter portrait |
| Role | `title` | ≤30 chars | the workplace role (e.g. "Product Strategist"), NOT a personal name |
| Verified | `verified` | bool | shows a dodger-blue tick after the role; default true |
| Bio | `bio` | ≤95 chars | one short sentence, wraps to ~2 lines |
| Stats | `stats` | 1-3 items | each `{ icon: followers \| posts \| likes, value: int }` |
| Accent | `accentColor` | enum | one of three brand colours; tints portrait backing, tick, Follow button |

The card geometry (a single vertical card with one portrait, one role, one bio, one Follow button) is **fixed**. The only count variation is the **number of stats** (1-3) in the bottom row.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the white card pops in (the staging beat, scaffolding/frame on screen)
2. `portrait`, the portrait settles into the card frame
3. `name`, the workplace-role row slides up
4. `badge`, the verified tick pops in beside the role *(only if `verified`)*
5. `bio`, the bio slides up + fades in
6. `stat0`, the first bottom-row stat
7. `stat1` *(if present)*
8. `stat2` *(if present)*
9. `follow`, the Follow button bounces in

Each element is one object: it reveals fully at its own cue before the next is described.

## Narration rules

### Rule 1, Linear, top-to-bottom (MUST)

Introduce the elements **in reading order down the card**, one at a time, matching the reveal order: who they are (role) first, then their bio, then the stats one by one, then the call to follow. Do not describe an element before it is on screen, and do not jump back up the card.

This is not a stylistic preference: the visuals reveal the role before the bio, and each stat before the next. Narration that jumps to the stats before the bio is spoken, or back to the role after the Follow pill, would describe content out of sync with the build.

**GOOD (linear, top-to-bottom):**
> "Meet our presenter. She's a **Product Strategist**, and a verified voice in the field. She helps early-stage teams ship faster and sharper. She's built a following of over twelve thousand, with more than ninety published posts. Follow along to keep up."

Maps cleanly: portrait → name → badge → bio → stat0 → stat1 → follow.

**BAD (out of order):**
> "With twelve thousand followers and ninety posts, this Product Strategist, who you should follow, helps teams ship faster."

This leads with the stats and the Follow call before the role and bio are on screen, so the spoken order does not match the build.

### Rule 2, The role is a role, not a name

`title` is the person's **workplace role** (≤30 chars), e.g. "Product Strategist", "Founder & CEO", "Data Lead". It is not their personal name (the portrait carries identity; the card frames the role). Keep it to one line so the verified tick sits beside it.

### Rule 3, Bio is one short, concrete line

`bio` is ≤95 chars and states one concrete thing the person does or is known for. It wraps to ~2 lines. Avoid lists or multiple clauses; longer detail belongs in the voiceover, not the card.

### Rule 4, Stats are short, countable, and parallel

Each stat is an `{ icon, value }` pair where the value is a single number. Phrase the stats in **parallel** when you narrate them (all "X followers, Y posts"), and introduce them in the same order they sit in the row. Large values format with thousands separators automatically.

## Variation, stat count (1-3)

The stat count is the built-in variation. Supply 1, 2, or 3 stats:

- The stats row is **left-anchored** in the bottom band and spaced by a fixed pitch, so 1, 2, or 3 stats all sit clear of the Follow button pinned to the right.
- Schedule one `stat{i}` per stat in order; `stat{i}` targets beyond `stats.length` are ignored.
- The `followers` / `posts` / `likes` icons let each stat read at a glance regardless of count.

## Narration template (fill-in skeleton)

> "Meet [the person]. [They're a] **[role]**[, a verified voice]. [One-line bio.] [They have N followers, M posts.] Follow along."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Meet our presenter." [1.6] "She's a Product Strategist," [2.0] "a verified voice in the field." [2.5] "She helps early-stage teams ship faster and sharper." [3.2] "With over twelve thousand followers" [3.6] "and ninety published posts." [4.2] "Follow along to keep up."

```tsx
characterId="female_midcareer_white"
title="Product Strategist"
verified={true}
bio="Helping early-stage teams ship faster, sharper, and with confidence."
stats={[
  { icon: 'followers', value: 12480 },
  { icon: 'posts',     value: 96 },
]}
accentColor="#0496FF"
timings={{ sequence: [
  { target: 'setup',    at: 0.2, in: 0.65 },
  { target: 'portrait', at: 0.9, in: 0.65 },
  { target: 'name',     at: 1.6, in: 0.50 },
  { target: 'badge',    at: 2.0, in: 0.40 },
  { target: 'bio',      at: 2.5, in: 0.45 },
  { target: 'stat0',    at: 3.2, in: 0.40 },
  { target: 'stat1',    at: 3.6, in: 0.40 },
  { target: 'follow',   at: 4.2, in: 0.50 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to CharacterProfileCard:

1. **Confirm fit.** Is the segment introducing exactly one person by their role, reducible to a portrait + short role + short bio + a few numbers? If it is multiple people, a points list, or needs richer credentials, reject this template and pick another.
2. **Extract** the role (≤30 chars), one bio line (≤95 chars), 1-3 countable stats, and pick an accent colour.
3. **Re-sequence to top-to-bottom order.** If the source leads with the stats or the call to follow, rewrite it so the role comes first, then the bio, then the stats in row order, then the Follow call, matching the canonical reveal order. This re-sequencing is the most common edit.
4. **Compress** the role and bio to the limits and phrase the stats in parallel.
5. **Emit the reveal sequence**, a `setup` step (the card pop-in), then `portrait`, `name`, `badge` (if verified), `bio`, one `stat{i}` per stat, then `follow`, each `at` taken from the start time of the narration line that introduces that object.
6. **Add re-mention pulses** (optional): if the narration names an already-revealed element again later (e.g. circles back to the role or a stat), add a `pulses` entry `{ target, at }` at the re-mention's cue time for a brief brand pulse.

## Worked example pointer

- [`examples/product-strategist/`](examples/product-strategist/), full example authored on the reveal-sequence model: realistic single-character content plus the matching reveal sequence and a sample re-mention pulse. No MP4 is rendered.

## Field / prop reference

- `characterId`: string, resolves `characters/<characterId>.png`
- `title`: string ≤30 (workplace role, not a personal name)
- `verified`: boolean (default true), shows the accent-coloured tick beside the role
- `bio`: string ≤95 (wraps to ~2 lines)
- `stats`: array of **1-3** × `{ icon: 'followers' | 'posts' | 'likes', value: int ≥ 0 }`
- `accentColor`: one of `#0496FF` (dodger blue), `#F865B0` (wild strawberry), `#3AB795` (ocean green)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `portrait`, `name`, `badge`, `bio`, `follow`, or `stat{i}` (0-based stat index); `at`/`in` in seconds; `in` defaults to 0.5
- `timings.pulses`: array of `{ target, at }`; `target` is any content object (not `setup`); `at` in seconds, the scene-relative time of a re-mention
