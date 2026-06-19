---
template: BulletList6Pills
title: Bullet List, Chevron Pills
category: list
useWhen: A flat, ordered list of 1-6 short bullet points read one at a time, an agenda, key takeaways, talking points, or syllabus rows, where each item is a single short label and the items are parallel peers rather than causal stages.
tags:
  - list
  - points
  - bullets
  - agenda
  - takeaways
  - talking-points
  - syllabus
  - checklist
  - key-points
layout:
  fixed: false               # the stack auto-centres vertically for the bullet count
  bullets: [1, 6]            # 1 to 6 bullets
  perBullet: [chevron, label]
slots:                       # addressable reveal targets
  - setup                    # OPTIONAL: all N empty pill bodies + chevron blocks scale/fade in
  - pill0                    # each pill = body + chevron + typed label (one object)
  - pill1
  - pill2
  - pill3                    # only present when there are >= 4 bullets
  - pill4                    # only present when there are >= 5 bullets
  - pill5                    # only present when there are 6 bullets
narration:
  ordering: linear-by-item       # introduce bullets strictly top-to-bottom
  comparisonStyle: sequential    # one bullet at a time; no jumping back up the list
  labelMaxChars: 40
  labelStyle: parallel           # all verbs or all nouns, not a mix
timing:
  model: reveal-sequence
  indexedTargets: true           # pill{i}, i = 0..bullets.length-1
  canonicalRevealOrder: [setup, pill0, pill1, pill2, pill3, pill4, pill5]
  defaultPillInSeconds: 0.8      # per-pill entrance (scale-in + label typewriter)
  defaultDurationSeconds: [8, 15]
assets:
  templateSpecific: none         # pure code + inline SVG; no bundled PNGs
  iconLibrary: none              # the chevron glyph is drawn inline, not pulled from the library
  fonts: [Satoshi-Bold]          # falls back to system sans if absent
designatedUse:
  role: course-outline           # the CEMENTED standard template for the course-outline / course-intro beat
  appearsIn: first-lesson-only   # the course-outline scene appears only in the first lesson of a course
---

# BulletList6Pills, Selection & Narration Guidance

## Designated use: the course outline (standard)

**This is the cemented standard template for the course-outline / course-intro beat** (the "in this course we'll cover…" agenda). It was chosen for that role because it is quick and simple: a clean flat list that reveals fast, with none of the conveyor/animation overhead of busier list templates. The course-outline scene **appears only in the first lesson of a course**; in later lessons this template is still available for ordinary bullet-list content, but the course-outline scene itself should not reappear.

## What it is

A vertical stack of up to six dark-navy pills, each with a dodger-blue chevron block on the left. Under the reveal-sequence model each pill reveals as one object at its own cue: the pill body scales up from its own centre, then its label types on character-by-character with a blinking cursor that disappears when the label is complete. The stack auto-centres vertically on the canvas for whatever count is supplied.

## Use it when

- The content is a **flat list of 1-6 short points**, an agenda, key takeaways, talking points, syllabus rows, a checklist.
- The items are **parallel peers** read **one at a time**, in a natural top-to-bottom order.
- Each item reduces to a **single short label** (≤40 chars) that reads on one line.

## Do NOT use it when

- The items are a **causal or ordered process** where order is the point (use Process5Steps, the chevron-flow template, instead).
- The relationship is **oppositional**, a two-way contrast (use YinYang2Points).
- There are **more than 6 points**, or an item needs more than a short label (split into multiple scenes, or move the detail to the voiceover).
- The items need **icons, numbers, or sub-points** per row, this template carries only a label per pill.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Bullets | `bullets` | 1-6 items | ordered top → bottom in reading order |
| Bullet label | `bullets[i].label` | ≤40 chars | parallel phrasing (all verbs or all nouns); one line of Satoshi Bold 60 px |
| Chevron block | (auto) |, | dodger-blue »-glyph drawn on every pill |

## Reveal order (canonical)

1. `setup` *(optional)*, all N empty pill bodies + chevron blocks scale/fade in together
2. `pill0`, first bullet (body + chevron + typed label)
3. `pill1`
4. `pill2`
5. `pill3` *(if present)*
6. `pill4` *(if present)*
7. `pill5` *(if present)*

Each `pill{i}` is one object: the pill body scales in (skipped if `setup` already brought the empty pills on) and its label types on at that pill's cue.

## Narration rules

### Rule 1, Linear, top-to-bottom (MUST)

Introduce the bullets **strictly in list order**, one at a time, matching the reveal order. Do not describe a later bullet before its pill is on screen, and do not jump back up the list. The stack builds top to bottom as you speak, so "First… next… then…" narration maps directly onto `pill0, pill1, pill2…`. Because the items are parallel peers (not causal stages), the framing is "here are the N things, said one at a time" rather than "this leads to that."

**GOOD (linear, parallel, one at a time):**
> "Here's what we'll cover today. First, **define the brief**. Next, **research the audience**. Then, **sketch the structure**. And finally, **draft the storyboard**."

Maps cleanly: pill0 → pill1 → pill2 → pill3.

**BAD (out of order / interleaved):**
> "We'll end by drafting the storyboard, but before that there's the brief and the audience research, though really the structure comes after both of those."

This names the last bullet before its pill exists and circles back up the list, so the spoken order never matches the top-to-bottom build.

### Rule 2, Labels are short and parallel

Each label is ≤40 chars and uses parallel grammar across all rows, all imperative verbs ("Define the brief", "Sketch the structure") or all nouns. Avoid mixing forms or writing a full sentence per pill. The fuller thought belongs in the voiceover, not on the pill.

### Rule 3, One label per pill

Each pill carries exactly one short label and the shared chevron glyph, no per-row icons, numbers, or sub-points. If a point needs more than a label, it is too big for this template.

## Variation, bullet count (1-6)

The bullet count is the built-in variation. Supply 1, 2, 3, 4, 5, or 6 bullets:

- The stack **auto-centres vertically** on the canvas for the count (via `firstPillTopFor`), so 3 bullets sit centred rather than top-anchored.
- Schedule one `pill{i}` per bullet in top-to-bottom order; `pill{i}` targets beyond `bullets.length` are ignored.
- The optional `setup` step scaffolds **all** supplied pills as empty bodies; with no `setup`, each pill (body + chevron + typed label) reveals wholesale at its own cue, the cleaner mapping and the recommended default.

See [`examples/agenda-four/`](examples/agenda-four/) for the count variation (4 bullets).

## Narration template (fill-in skeleton)

> "[Name the list in one line.] First, [bullet 1]. Next, [bullet 2]. Then, [bullet 3]. … And finally, [bullet N]."

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to BulletList6Pills:

1. **Confirm fit.** Is the segment a flat list of 1-6 parallel points, each reducible to a short label? If the items are an ordered process, an opposition, or more than 6, pick another template.
2. **Extract** the bullets and a ≤40-char parallel-phrased label for each, top to bottom.
3. **Order-check.** Ensure the narration introduces bullets in list order, one at a time. If the source jumps around (e.g. mentions the last point first), re-sequence it to run straight down the list.
4. **Emit the reveal sequence**: optionally a `setup` step, then one `pill{i}` per bullet, each `at` taken from the start time of the narration line that introduces that bullet.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.4] "Here's what we'll cover today." [1.6] "First, define the brief." [3.8] "Next, research the audience." [6.0] "Then, sketch the structure." [8.2] "And finally, draft the storyboard."

```tsx
bullets={[
  { label: 'Define the brief' },
  { label: 'Research the audience' },
  { label: 'Sketch the structure' },
  { label: 'Draft the storyboard' },
]}
timings={{ sequence: [
  { target: 'setup', at: 0.4, in: 0.9 },
  { target: 'pill0', at: 1.6, in: 2.0 },
  { target: 'pill1', at: 3.8, in: 2.0 },
  { target: 'pill2', at: 6.0, in: 2.0 },
  { target: 'pill3', at: 8.2, in: 2.0 },
] }}
```

## Worked examples (rendered)

- [`examples/agenda-four/`](examples/agenda-four/), the 1-6 count variation (4 bullets): the authored scene + reveal sequence. No MP4 (layout reference is the source).

## Field / prop reference

- `bullets`: array of **1-6** × `{ label: string (≤40) }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `pill{i}` (`i` = 0-based bullet index); `at`/`in` in seconds; `in` defaults to 0.8 (give pills with a typewriter entrance ~2.0 s so the label finishes typing comfortably)
