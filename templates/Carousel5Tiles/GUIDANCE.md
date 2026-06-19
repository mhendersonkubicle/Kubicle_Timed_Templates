---
template: Carousel5Tiles
title: Coverflow Carousel, Cycling Tiles
category: points
useWhen: A set of 2-5 parallel, related concepts presented one at a time as cycling cards, where each card carries a short title, an icon, and 2-3 supporting bullets, and only one is in focus at any moment.
tags:
  - points
  - list
  - carousel
  - coverflow
  - cards
  - tiles
  - cycle
  - showcase
  - one-at-a-time
layout:
  fixed: false               # coverflow ring auto-sizes to the tile count
  tiles: [2, 5]              # 2 to 5 tiles
  perTile: [icon, title, bullets]
  focus: centre-transient    # only the centred tile + immediate neighbours are visible
slots:                       # addressable reveal targets
  - setup                    # the perspective coverflow stage fades / scales in
  - tile0                    # each tile = icon + title + 2-3 bullets (one object), slid to centre
  - tile1
  - tile2                    # only present when there are >= 3 tiles
  - tile3                    # only present when there are >= 4 tiles
  - tile4                    # only present when there are 5 tiles
narration:
  ordering: linear-by-tile       # introduce tiles strictly in carousel order
  comparisonStyle: sequential    # one tile fully before the next; the ring slides forward only
  titleMaxChars: 28
  bulletMaxChars: 34
  bulletsPerTile: [2, 3]
  titleStyle: parallel           # all verbs or all nouns, not a mix
timing:
  model: reveal-sequence
  indexedTargets: true           # tile{i}, i = 0..tiles.length-1
  canonicalRevealOrder: [setup, tile0, tile1, tile2, tile3, tile4]
  staging: animated              # setup brings the coverflow stage on screen (fade + scale)
  transient: true                # tiles are centre-focused; a tile is in focus only briefly
  defaultStepInSeconds: 0.8      # per-tile entrance = ring slide from previous centre to this tile
  defaultDurationSeconds: [10, 15]
assets:
  templateSpecific: none         # pure code; tiles are drawn, no bundled PNGs
  iconLibrary: shared            # tile icons resolve from the shared Icons/ set
  iconVariant: -dark             # icons render AS-IS (no recolour) on the DARK oxford-blue tile -> use the -dark (light-artwork) variant; -light icons disappear (see README "icon-contrast principle")
  fonts: [Satoshi-Black, Satoshi-Bold, Satoshi-Medium]
---

# Carousel5Tiles, Selection & Narration Guidance

## What it is

A 3D coverflow carousel on a platinum-blue canvas. The perspective stage fades and scales in first, then portrait oxford-blue tiles cycle horizontally: the most-recently-revealed tile sits head-on in the centre while its neighbours rotate to thin slivers and fade toward the background. Each tile carries an icon, a dodger-blue title, a divider, and 2-3 white bullets. Under the reveal-sequence model the stage comes in first, then each tile slides to the centre one at a time, **transient**, only the centre tile (and its immediate neighbours mid-slide) are visible at any moment.

## Use it when

- The content is a **set of 2-5 parallel, related concepts** you want to showcase **one at a time** (a cycling highlight reel of pillars, features, principles, or themes).
- Each item reduces to a **short title** (≤28 chars), one icon, and **2-3 short bullets** (≤34 chars each).
- You want the audience focused on **one card at a time** rather than comparing all items side by side.

## Do NOT use it when

- The items must be **seen together / compared at a glance** (a side-by-side comparison → use a comparison/points template; tiles here are transient and never all on screen at once).
- The items are an **ordered process** whose steps must persist as a visible chain (→ use Process5Steps or a timeline template).
- There are **more than 5 items**, or an item needs more than 2-3 short bullets.
- The relationship is **oppositional** (a two-way contrast → use YinYang2Points).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Tiles | `tiles` | 2-5 items | shown one at a time in carousel order |
| Tile title | `tiles[i].title` | ≤28 chars | dodger-blue Satoshi Black, one line |
| Tile icon | `tiles[i].icon` | id from Icons/ (`-dark`) | sits on the DARK tile, so use a `-dark` (light-artwork) id |
| Tile bullets | `tiles[i].bullets` | 2-3 items, ≤34 chars each | white Satoshi Medium, parallel phrasing |

## Reveal order (canonical)

1. `setup`, the perspective coverflow stage fades + scales in (0.92 → 1.0)
2. `tile0`, the ring slides tile 0 to centre; its icon/title/bullets ride in
3. `tile1`, the ring slides forward so tile 1 is now centre
4. `tile2` *(if present)*
5. `tile3` *(if present)*
6. `tile4` *(if present)*

Each tile is one object: the ring slide and the tile's full content reveal together at that tile's cue. Tiles are **transient**, an already-shown tile slides off to a sliver and out of view as the next one takes the centre.

## Narration rules

### Rule 1, Linear, one tile at a time (MUST)

Introduce the tiles **strictly in carousel order**, one at a time, matching the reveal order. Do not describe a later tile before the ring has slid it to the centre, and do not jump back to an earlier tile (it has already slid off screen). The carousel cycles forward as you speak, so "First… then… then…" narration maps directly onto `tile0, tile1, tile2…`.

**GOOD:** "We work four ways. First, **prompt-first**, describe intent, not steps. Next, **pair programming**, treat the model as a peer. Then **tight loops**, small diffs, fast feedback. And finally, **verify everything**, read every diff."

**BAD:** "We verify everything and keep tight loops, and it all starts with prompting." (Names later tiles before they are centred and jumps back to the first, the visible card never matches the words.)

### Rule 2, Titles are short and parallel

Each title is ≤28 chars and uses parallel grammar across all tiles, all noun phrases or all imperatives, not a mix. The longer explanation lives in the bullets and the voiceover, not the title.

### Rule 3, Bullets are tight and parallel

Each tile carries 2-3 bullets, ≤34 chars each, phrased in parallel within the tile (and ideally across tiles) so each card reads as a clean micro-list.

### Rule 4, One icon per tile, on a dark surface

Each tile's icon should depict the tile's idea concretely. The tile face is **dark oxford-blue**, so the icon renders as-is (no recolour); pick a `-dark`-suffix id (light artwork) so the glyph reads. A `-light` (dark-artwork) icon disappears into the dark tile (see README "icon-contrast principle").

## Variation, tile count (2-5)

The tile count is the built-in variation. Supply 2, 3, 4, or 5 tiles:

- The coverflow **ring auto-sizes** to the count (`slotFor` and the centre-index logic both use `tiles.length`), so fewer tiles simply makes a shorter cycle, the centred tile and its neighbours render identically.
- For **exactly 2 tiles** the ring is linear (no wrap), so the exiting tile slides off one side and stays off rather than ghosting back across screen.
- Schedule one `tile{i}` per tile; `tile{i}` targets beyond `tiles.length` are ignored.

See [`examples/three-tile/`](examples/three-tile/) for the 3-tile variation.

## Narration template (fill-in skeleton)

> "[Name the set in one line.] First, [tile 1 title], [bullet]. Next, [tile 2 title], [bullet]. Then, [tile 3 title], [bullet]. And finally, [tile N title], [bullet]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "We build software three ways." [1.0] "First, prompt-first, describe intent, not steps." [3.6] "Next, pair programming, treat the model as a peer." [6.2] "And finally, tight loops, small diffs, fast feedback."

```tsx
tiles={[
  { title: 'Prompt-First', icon: 'terminal-dark', bullets: ['Describe intent, not steps', 'Let the model draft v1'] },
  { title: 'Pair Programming', icon: 'sparkles-dark', bullets: ['Treat the model as a peer', 'Push back on weak ideas'] },
  { title: 'Tight Loops', icon: 'zap-dark', bullets: ['Small diffs, fast feedback', 'Run, observe, refine'] },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.2, in: 0.8 },
  { target: 'tile0', at: 1.0 },
  { target: 'tile1', at: 3.6 },
  { target: 'tile2', at: 6.2 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a set of 2-5 parallel related concepts that can be shown **one at a time**, each reducible to a short title + one icon + 2-3 short bullets? If the items must be compared side by side, or the count is >5, or the relationship is sequential-with-persistence or oppositional, pick another template.
2. **Extract** the tiles: a ≤28-char title, an icon concept (`-dark` id, dark surface), and 2-3 ≤34-char bullets each.
3. **Order-check.** Ensure the narration introduces tiles in carousel order, one at a time, and never refers back to a tile that has already cycled off. If the source jumps around, re-sequence it to run straight through.
4. **Emit the reveal sequence**: a `setup` step, then one `tile{i}` per tile in order, each `at` taken from the start time of the narration line that introduces that tile; `in` is the slide duration.
5. **Pulses (optional).** If the narration re-mentions a tile while it is (or has just been) the centred card, add a `pulses` entry `{ target: 'tile{i}', at }` at the re-mention's cue time. A pulse only reads while that tile is centred, since tiles are transient, so do not add pulses for tiles that have already cycled off.

## Worked example pointer

- [`examples/three-tile/`](examples/three-tile/), the 2-5 count variation (3 tiles) authored on the reveal-sequence model: realistic content plus the matching reveal sequence (and a sample pulse). No MP4 is rendered.

## Field / prop reference

- `tiles`: array of **2-5** × `{ title: string (≤28), icon: string (`-dark` id), bullets: string[] (2-3, ≤34 each) }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `tile{i}` (`i` = 0-based tile index); `at`/`in` in seconds; `in` defaults to 0.8 (the ring-slide duration from the previous centre to this tile)
- `timings.pulses`: array of `{ target, at }`; `target` is a content tile (`tile{i}`); `at` is the scene-relative second of a re-mention (brief +5% / ~0.45 s brand pulse; only reads while that tile is centred)
