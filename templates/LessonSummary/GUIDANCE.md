---
template: LessonSummary
title: Lesson Summary, Recap Pill Stack
category: list
useWhen: A closing recap of a lesson's key takeaways, 1 to 5 short lines stacked under a fixed "Lesson Summary" headline, revealed one at a time top-to-bottom.
tags:
  - summary
  - recap
  - takeaways
  - closing
  - list
  - lesson-end
  - key-points
  - wrap-up
layout:
  fixed: false               # pill stack + title auto-centre for the recap count
  recaps: [1, 5]             # 1 to 5 recap pills
  perPill: [caption]         # pills carry text only, no icons
  autoCentre: true           # title + stack share one vertical offset derived from count
slots:                       # every addressable element (also the reveal targets)
  - setup                    # scaffolding: the full-canvas background PNG fades in
  - title                    # the locked "Lesson Summary" headline (only fixed text)
  - pill0                    # each recap = row PNG + caption (one object)
  - pill1                    # only present when recaps.length >= 2
  - pill2                    # only present when recaps.length >= 3
  - pill3                    # only present when recaps.length >= 4
  - pill4                    # only present when recaps.length >= 5
narration:
  ordering: linear-top-to-bottom   # introduce recaps strictly in stack order
  comparisonStyle: sequential      # one recap before the next; no pre-announcing
  recapCaptionMaxChars: 32
  recapStyle: parallel             # all noun phrases or all verb phrases, not a mix
  titleAuthorable: false           # the headline is always "Lesson Summary"
timing:
  model: reveal-sequence
  indexedTargets: true             # pill{i}, i = 0..recaps.length-1
  canonicalRevealOrder: [setup, title, pill0, pill1, pill2, pill3, pill4]
  defaults:
    titleInSeconds: 0.45           # headline fade + slide-up
    pillInSeconds: 0.55            # per-pill slide-up + fade (also the schema default for `in`)
  defaultDurationSeconds: [7, 12]
assets:
  templateSpecific: Template-Specific-Assets/   # the background + pill-row PNGs
  iconLibrary: none                              # pills carry text only, no icons
  fonts: [Arial, Arial Black]                    # system stack only, no bundled woff2 files
---

# LessonSummary, Selection & Narration Guidance

## What it is

A closing recap screen. A full-canvas background sets the stage, a Dodger Blue "Lesson Summary" headline sits at the top, and below it a column of 1 to 5 recap pills stack vertically. Under the reveal-sequence model the background comes in first, then the headline, then each recap pill slides up and fades in, one at a time, top to bottom. With fewer than 5 pills the whole group (title + stack) auto-centres so it stays balanced rather than clustering at the top.

## Use it when

- You are **closing a lesson** and want to restate its **key takeaways** as a short recap.
- There are **1 to 5 points** to recap, each reducible to a **single short line** (≤32 chars).
- The recap is a **flat list** read top-to-bottom, the points reinforce one lesson, they are not a process or a comparison.

## Do NOT use it when

- There are **more than 5 takeaways**, or a point needs more than a short line (use a different list/points template).
- The points are an **ordered process** where execution order is the message (use Process5Steps).
- The content is a **two-way contrast** (use YinYang2Points).
- You need a **custom headline**, the title is locked to "Lesson Summary" and is not authorable.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Recap lines | `recaps` | 1-5 items | stacked top → bottom in recap order |
| Recap caption | `recaps[i]` | ≤32 chars | parallel phrasing (all noun phrases or all verb phrases) |
| Headline | (locked) |, | always "Lesson Summary", not authorable |

Each recap is a single text caption, there are **no icons**. The pill count (1-5) is the built-in variation; box/pill geometry is fixed regardless of count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the full-canvas background fades in
2. `title`, the locked "Lesson Summary" headline fades + slides up
3. `pill0` (row PNG + caption appear together)
4. `pill1` *(if present)*
5. `pill2` *(if present)*
6. `pill3` *(if present)*
7. `pill4` *(if present)*

Each pill is one object: its row PNG and caption reveal together at that pill's cue.

## Narration rules

### Rule 1, Linear, top-to-bottom recap (MUST)

Introduce the recap lines **strictly in stack order**, one at a time, matching the reveal order. Open with the headline framing ("Here's what we covered…"), then deliver `pill0`, `pill1`, `pill2`… top to bottom. Never reveal a lower pill before the ones above it, and do not pre-announce a later recap before its pill is on screen. The stack builds downward as you speak, so "first… then… finally…" maps directly onto `pill0, pill1, pill2…`.

**GOOD (linear, top-to-bottom):**
> "Let's recap what we covered. First, define your audience. Then, map the user journey. Next, draft the wireframes. And finally, test with real users."

Maps cleanly: title → pill0 → pill1 → pill2 → pill3.

**BAD (out of order / pre-announcing):**
> "By the end we tested with real users, but that only works if you first define your audience and map the journey along the way."

This names the last recap before its pill exists and walks the list out of stack order, so the narration describes pills that are not yet on screen.

### Rule 2, Captions are short and parallel

Each recap caption is ≤32 chars and uses parallel grammar across all lines, all imperative verbs ("Define your audience", "Map the user journey") or all noun phrases. Avoid mixing forms or full sentences. The longer explanation lives in the voiceover, not the pill.

### Rule 3, The headline is fixed

The title is always "Lesson Summary" and is not a prop. Treat it as the recap's opening frame, say it (or paraphrase it) as you reveal the `title` step, before the first pill.

### Rule 4, Schedule only what you narrate

You do not have to use all five pill steps. A two-line recap is valid; only schedule `pill0` and `pill1`. A `pill{i}` target with `i >= recaps.length` has no content and is never rendered, so omit it from the sequence (leaving it in is harmless). The auto-centring offset is driven by `recaps.length`, so the group stays centred for whatever count you supply.

## Variation, recap count (1-5)

The recap count is the built-in variation. Supply 1, 2, 3, 4, or 5 recaps:

- The title + pill stack **auto-centre** as a group: with fewer than 5 pills the group shifts down by `(5 − N) × 59 px` so it stays centred where the 5-pill design sits (0 px shift at 5 pills, +236 px at 1 pill).
- Pill geometry and all caption/title limits are **unchanged** (caption ≤32 chars, fixed pill size). Only the *count and vertical placement* change.
- Schedule one `pill{i}` per recap, in stack order; `pill{i}` targets beyond `recaps.length` are ignored.

See [`examples/three-recap/`](examples/three-recap/) for the 3-pill variation.

## Narration template (fill-in skeleton)

> "[Frame the recap in one line, 'Here's what we covered.'] First, [recap 1]. Then, [recap 2]. Next, [recap 3]. [recap 4]. And finally, [recap 5]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Let's recap what we covered." [1.0] "First, define your audience." [2.2] "Then, map the user journey." [3.4] "And finally, test with real users."

```tsx
recaps={[
  'Define your audience',
  'Map the user journey',
  'Test with real users',
]}
timings={{ sequence: [
  { target: 'setup', at: 0.2, in: 0.6 },
  { target: 'title', at: 0.2 },
  { target: 'pill0', at: 1.0 },
  { target: 'pill1', at: 2.2 },
  { target: 'pill2', at: 3.4 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to LessonSummary:

1. **Confirm fit.** Is the segment a closing recap of a lesson's key takeaways, a flat list of 1-5 short points, not an ordered process or a two-way contrast? If not, reject this template and pick another.
2. **Extract** the recap lines (the lesson's key takeaways) in the order they were taught.
3. **Order-check.** Ensure the narration introduces the recaps in stack order, one at a time. If the source jumps around (e.g. mentions the final takeaway first), re-sequence it to run straight down the list.
4. **Compress** each takeaway to a ≤32-char caption and phrase them in parallel (all verbs or all noun phrases).
5. **Emit the reveal sequence**: a `setup` step, a `title` step, then one `pill{i}` per recap, each `at` taken from the start time of the narration line that introduces that recap.

## Worked example pointer

- [`examples/three-recap/`](examples/three-recap/), a 3-recap summary authored on the reveal-sequence model: realistic content + a sample sequence. No MP4 (timing/layout reference in code only).

## Field / prop reference

- `recaps`: array of **1-5** × `string` (≤32 chars); stacked top → bottom
- The headline is locked to "Lesson Summary" (not a prop)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `title`, or `pill{i}` (`i` = 0-based recap index); `at`/`in` in seconds; `in` defaults to 0.55 (title settles a touch quicker at ~0.45)
