---
template: CirclePoints4Character
title: Circle Points (Character), Flat Row of 1-4 Portrait Circles
category: points
useWhen: A flat set of 1-4 parallel points that are PEOPLE, roles, or personas, where each point is a head-and-shoulders portrait plus a single short noun-phrase label and there is no ordering dependency between them.
tags:
  - points
  - people
  - roles
  - personas
  - team
  - profiles
  - portraits
  - characters
  - flat-list
  - parallel
timing:
  model: reveal-sequence
  staging: animated              # setup scales/fades the platinum background stage in -> safe for a beat with a lead-in before its first content (see README "no-dead-air principle")
  indexedTargets: true           # point{i}, i = 0..points.length-1
  canonicalRevealOrder: [setup, point0, point1, point2, point3]
  defaultStepInSeconds: 0.7      # per-point entrance (pop + pulse + portrait + label fade)
  defaultDurationSeconds: [5, 10]
layout:
  fixed: false                   # circle row auto-centres for the point count
  points: [1, 4]                 # 1 to 4 points
  perPoint: [circle, portrait, label]
slots:                           # addressable reveal targets
  - setup                        # platinum background stage scales/fades in
  - point0                       # each point = circle + character portrait + label (one object)
  - point1                       # only present when there are >= 2 points
  - point2                       # only present when there are >= 3 points
  - point3                       # only present when there are 4 points
narration:
  ordering: linear-by-point      # introduce points one at a time, in reveal order
  comparisonStyle: sequential    # complete one point before the next; no jumping ahead
  labelMaxChars: 20
  labelStyle: parallel           # short noun phrases, 1-3 words; consistent form
assets:
  templateSpecific: Template-Specific-Assets/   # base_circle.png (the dodger-blue disc)
  character: shared                              # portraits resolve from characters/<id>.png (not bundled here)
  iconVariant: n/a (no icons)                    # circles hold character PNGs, not library icons; the icon-contrast principle does not apply
  fonts: [Satoshi-Bold]                          # falls back to system sans if absent
---

# CirclePoints4Character, Selection & Narration Guidance

## What it is

A flat row of 1-4 circles on a light platinum-blue (`#E6ECF2`) background. Each circle is a dodger-blue disc filled with a head-and-shoulders character portrait (clipped to the disc), with a short bold black label beneath it. It is the character-portrait twin of `CirclePoints4`, same layout, same pop-in animation, but each circle holds a face instead of a line-art icon.

Under the reveal-sequence model the platinum stage scales/fades in first (`setup`), then each point pops in one at a time: its disc scales up with an easeOutBack pop, a soft pulse rides the tail, the portrait scales with the disc, and its label fades in with it, all as one object. The row auto-centres for whatever count is supplied.

## Use it when

- You have a **flat set of 1-4 parallel points that are people**, team members, roles, personas, perspectives, that sit at the same level and you want a face on each.
- Each point reduces to a **single short noun-phrase label** (≤20 chars) plus one character portrait.
- The points are **parallel, not sequential**, there is no causal or ordered dependency between them; you simply want to present each in turn.

## Do NOT use it when

- The points are **abstract concepts** with no person attached, use `CirclePoints4` (icon circles) instead.
- The points are an **ordered process** or pipeline where order matters (use Process5Steps).
- The content is an **either/or contrast between two sides** (use YinYang2Points).
- There are **more than 4** points, or a point needs more than a short label (for a fuller team layout use a CharacterTeam template).
- A single person needs a rich profile (title, bio), use CharacterProfileCard.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Points | `points` | 1-4 items | ordered left → right; row auto-centres for the count |
| Point label | `points[i].label` | ≤20 chars | tight noun phrase (1-3 words), parallel form |
| Point portrait | `points[i].characterId` | id, `characters/<id>.png` | head-and-shoulders PNG with proper alpha |
| Portrait height | `points[i].characterHeight` | 200-900 px, default 480 | rendered height inside the disc |
| Portrait offset | `points[i].characterY` | px, default 61 | top offset; tune so the face centres on the disc |

## Reveal order (canonical)

1. `setup`, the platinum background stage scales/fades in
2. `point0`, circle 1 + its portrait + its label
3. `point1` *(if present)*
4. `point2` *(if present)*
5. `point3` *(if present)*

Each point is one object: the circle, its portrait, and its label reveal together at that point's cue. `setup` is the scaffolding reveal (fixed, non-content) and brings the stage on screen before the first portrait lands.

## Narration rules

### Rule 1, Linear, point-by-point (MUST)

Introduce the points **one at a time, in reveal order** (left → right). Complete one point before moving to the next, and never describe a point before its circle is on screen. The visual reveals circles one by one as you speak, so "First… next… also… finally…" narration maps directly onto `point0, point1, point2, point3`.

Because the points are parallel (not sequential or causal), the *order* is a presentation choice rather than a logical dependency, but once chosen, the narration must follow it and must not jump ahead to a point that has not yet appeared.

**GOOD (linear, point-by-point):**
> "Four people drive this work. First, **Amelia** owns strategy. Next, **Ken** leads engineering. **Sarah** runs design. And finally, **Robert** handles operations."

Maps cleanly: point0 → point1 → point2 → point3.

**BAD (jumps ahead / bundles):**
> "Robert and Sarah handle ops and design, and Amelia and Ken cover strategy and engineering."

This names the third and fourth people before their circles exist and bundles all four into one breath, so the spoken order cannot match the build.

### Rule 2, Labels are short and parallel

Each label is ≤20 chars and a tight noun phrase (1-3 words), a name, a role, or a persona. Keep the grammatical form consistent across all points (all names, or all roles, not a mix). Strip verbs: "Leads our strategy" → "Strategy" (or the person's name). Longer explanation lives in the voiceover, not the label.

### Rule 3, One portrait per point

Each point's `characterId` resolves to `characters/<id>.png`, a head-and-shoulders PNG with proper alpha so the dodger-blue disc shows through. Tune `characterHeight` (default 480) and `characterY` (default 61) per PNG so the face's centre lands at the disc's vertical centrepoint (~191 px). Keep framing consistent across the row so the faces read as a set.

### Rule 4, Re-mention pulse (optional)

If the narration names an already-revealed person again more than ~2-3s after their reveal, add a `pulses` entry `{ target: 'point{i}', at }` at the re-mention's SRT time. The circle gives a brief, subtle brand pulse (~+5% over ~0.45s) that draws the eye back without re-animating it. Drive the `at` from the SRT, never invent it. With no `pulses`, the template renders identically.

## Variation, point count (1-4)

The point count is the built-in variation. Supply 1, 2, 3, or 4 points:

- The circle row **auto-centres** on the canvas for the count (`circleCxFor`), so 2 circles sit centred in the frame rather than drifting left.
- Schedule one `point{i}` per point; `point{i}` targets beyond `points.length` are ignored.

See [`examples/team-of-four/`](examples/team-of-four/) for a full 4-point layout.

## Narration template (fill-in skeleton)

> "[Name the set in one line.] First, [point 1]. Next, [point 2]. Also, [point 3]. And finally, [point 4]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a flat set of 1-4 parallel *people/roles*, each reducible to a short noun phrase with a portrait? If the points are abstract (no face), use `CirclePoints4`; if ordered/causal, or there are more than 4, or it is a two-way contrast, pick another template.
2. **Extract** the points and a ≤20-char noun-phrase label + a `characterId` for each.
3. **Order-check.** Pick a presentation order and ensure the narration introduces the points one at a time in that order, never naming a point before its circle appears. If the source bundles points into one breath, split them so each gets its own introducing line.
4. **Emit the reveal sequence**: a `setup` step (background stage), then one `point{i}` per point, each `at` taken from the start time of the narration line that introduces that point. Add `pulses` for any re-mentions.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Four people drive this work." [1.0] "First, Amelia owns strategy." [2.2] "Next, Ken leads engineering." [3.4] "Sarah runs design." [4.6] "And finally, Robert handles operations."

```tsx
points={[
  { characterId: 'presenter-red',    characterHeight: 480, characterY: 30, label: 'Strategy' },
  { characterId: 'presenter-blue',   characterHeight: 480, characterY: 30, label: 'Engineering' },
  { characterId: 'presenter-green',  characterHeight: 480, characterY: 30, label: 'Design' },
  { characterId: 'presenter-yellow', characterHeight: 480, characterY: 30, label: 'Operations' },
]}
timings={{ sequence: [
  { target: 'setup',  at: 0.2, in: 0.8 },
  { target: 'point0', at: 1.0 },
  { target: 'point1', at: 2.2 },
  { target: 'point2', at: 3.4 },
  { target: 'point3', at: 4.6 },
] }}
```

## Worked examples (rendered)

- [`examples/team-of-four/`](examples/team-of-four/), full 4-point layout, authored scene + reveal sequence with a sample re-mention pulse (no MP4 rendered yet, layout reference).

## Field / prop reference

- `points`: array of **1-4** × `{ characterId: string, characterHeight?: number (200-900, default 480), characterY?: number (default 61), label: string (≤20) }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `point{i}` (`i` = 0-based point index); `at`/`in` in seconds; `in` defaults to 0.7
- `timings.pulses`: array of `{ target, at }`; `target` is `point{i}`; `at` in seconds (re-mention brand pulse)
