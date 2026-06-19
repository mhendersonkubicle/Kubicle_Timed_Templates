---
template: Topic1Subtopics6Character
title: Topic + Subtopics, Character Split-Screen List
category: list
useWhen: One core topic broken into 1-6 short detail subtopics that reveal as a top-to-bottom waterfall, presented beside a fixed character portrait for a human, briefing-style feel.
tags:
  - list
  - topic-subtopics
  - waterfall
  - vertical-list
  - character
  - presenter
  - split-screen
  - overview
  - agenda
layout:
  fixed: false               # row band auto-centres for the detail count
  sides: 2                   # character panel (left) + content panel (right)
  details: [1, 6]            # 1 to 6 detail rows
  perRow: [pill, caption]
  character: backdrop         # left-panel portrait is fixed decoration, not a reveal beat
slots:                       # addressable reveal targets
  - setup                    # background slide-in + dodger-blue character panel/portrait fade (one unit)
  - title                    # header pill: title icon + mainTitle phrase
  - row0                     # each detail = pill outline scales in, then caption types (one object)
  - row1                     # only present when there are >= 2 details
  - row2                     # only present when there are >= 3 details
  - row3                     # only present when there are >= 4 details
  - row4                     # only present when there are >= 5 details
  - row5                     # only present at 6 details
narration:
  ordering: linear-top-to-bottom   # introduce details strictly in row order
  comparisonStyle: sequential      # one detail fully before the next; never jump down or back up
  titleMaxWords: 3                 # mainTitle is 3 words or fewer
  titleMaxChars: 30
  detailMaxChars: 38
  characterIsSilent: true          # the portrait is scaffolding, NOT a narrated beat
timing:
  model: reveal-sequence
  indexedTargets: true             # row{i}, i = 0..details.length-1
  canonicalRevealOrder: [setup, title, row0, row1, row2, row3, row4, row5]
  defaultRowInSeconds: 1.4         # per-row entrance covers outline scale + caption typewriter
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: Template-Specific-Assets/   # the background, title-pill, and pill-outline PNGs
  iconLibrary: shared                            # title icon resolves from the master Icons/ library (-dark variants); character from the shared characters/ set
  fonts: [Satoshi-Bold, Satoshi-Black]           # falls back to system sans if absent
---

# Topic1Subtopics6Character, Selection & Narration Guidance

## What it is

A split-screen overview. A dodger-blue rounded panel on the left holds a character portrait (face landing at the panel's vertical centre); an oxford-blue panel on the right carries a bold header pill announcing one core topic, with 1-6 detail pills that type in one at a time as a top-to-bottom waterfall. Under the reveal-sequence model the background and character come in together first (silent scaffolding), then the header pill, then each detail row in turn.

The character is a **presence anchor**, not narrated content: it makes the scene feel like a person briefing the viewer. It animates in once with the background and never gets its own reveal beat.

## Use it when

- You are introducing **one core topic** and breaking it into a handful of **short detail subtopics** (an agenda, a set of features, the components of a concept).
- There are **1 to 6 details**, each reducible to a short caption (≤38 chars).
- You want a **human, presenter-led** feel, a person on the left, the points building beside them.
- The details are a **flat list** read top to bottom; order is presentational, not strictly causal.

## Do NOT use it when

- There are **more than 6 details**, or a detail needs more than a short caption.
- The relationship is **oppositional** (a two-way contrast → use YinYang2Points) or a **strict ordered process / pipeline** where each step feeds the next (→ use Process5Steps).
- You need the character to **speak, change, or be referenced** as content, here it is fixed decoration.
- There is no single unifying topic for the header pill (the pill must name one tight ≤3-word phrase).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Header title | `mainTitle` | ≤30 chars, **≤3 words** | one tight phrase; fits the pill on one line |
| Title icon | `titleIcon` | id from master Icons/ (use a -dark variant) | white pre-coloured icon in the header pill |
| Details | `details` | 1-6 items | each a caption ≤38 chars, one per pill row |
| Character | `character.id` | id from characters/ | portrait PNG; silent backdrop |
| Character framing | `character.characterHeight`, `character.characterY` | optional px | layout tuning of the face position, **not timing** |

The detail count (1-6) is the built-in variation. The title pill and row band auto-centre vertically together for the count. Box/pill geometry is fixed regardless of count.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, oxford-blue background slides in from the right; the dodger-blue character panel + portrait fade in (one unit)
2. `title`, header pill slides in (icon + mainTitle)
3. `row0`, first detail pill (outline scales in, then caption types)
4. `row1` *(if present)*
5. `row2` *(if present)*
6. `row3` *(if present)*
7. `row4` *(if present)*
8. `row5` *(if present)*

The character appears with `setup` and stays put; it is never a separate reveal beat.

## Narration rules

### Rule 1, Linear, top-to-bottom list (MUST)

Name the core topic first (the header pill), then deliver each detail **strictly in row order**, one at a time, matching the waterfall. Do not describe a lower pill's content before it has typed in, and do not jump back up to an earlier row. The visual builds the list top to bottom as you speak, so "This topic. First… next… then…" narration maps directly onto `title, row0, row1, row2…`.

**GOOD (linear, top-to-bottom):**
> "Let's look at data modelling. First, you define your entities and their relationships. Next, you choose a normalisation level. Then you map your primary and foreign keys. After that, validate against the business rules. Finally, document the schema."

Maps cleanly: title → row0 → row1 → row2 → row3 → row4.

**BAD (out of order / jumping):**
> "The last thing is documenting the schema, but before any of that you'd define entities, and we also normalise somewhere in the middle."

This names the bottom row before it exists on screen and skips around the band, so the spoken order no longer matches the build.

### Rule 2, Title names one topic in ≤3 words

`mainTitle` is one tight phrase (≤3 words, ≤30 chars) that names the unifying concept, "Data Modelling", "Cost Drivers", "Risk Factors". Avoid full sentences; the detail lines carry the substance.

### Rule 3, Details are short and parallel

Each detail caption is ≤38 chars and reads as a peer of the others. Prefer parallel phrasing (all imperative verbs, or all noun phrases) so the list scans cleanly. Longer explanation lives in the voiceover, not the pill.

### Rule 4, The character is silent scaffolding

Do not write a narration beat for the character. It is a fixed backdrop that comes in with `setup`; it carries no content and never reveals separately. Authors expecting the portrait to be a talking beat should pick a dialogue/character template instead.

### Rule 5, Optional staggering

You do not have to use all six row steps. A bare topic with one or two details is valid, only schedule the rows you actually narrate. `row{i}` targets beyond `details.length` are ignored.

## Variation, detail count (1-6)

The detail count is the built-in variation. Supply 1 to 6 details:

- The row band **auto-centres** vertically for the count, and the title pill follows it so the composition stays grouped.
- Pill geometry, fonts, and caption limits are unchanged across counts, only the number and placement of rows change.
- Schedule one `row{i}` per detail; `row{i}` targets beyond `details.length` are ignored (harmless if left in).

See [`examples/six-detail/`](examples/six-detail/) for the full 6-row layout.

## Narration template (fill-in skeleton)

> "[Name the topic in one tight phrase.] First, [detail 1]. Next, [detail 2]. Then, [detail 3]. [detail 4]. [detail 5]. And finally, [detail 6]."

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Topic1Subtopics6Character:

1. **Confirm fit.** Is the segment one topic broken into 1-6 short, parallel subtopics read as a flat list? If it is a two-way contrast, a strict pipeline, or has >6 items, pick another template.
2. **Extract** the unifying topic (→ `mainTitle`, ≤3 words) and each subtopic (→ a ≤38-char caption).
3. **Order-check.** Ensure the narration introduces the details top to bottom, one at a time. If the source jumps around (e.g. mentions the conclusion first), re-sequence it to run straight down the band.
4. **Confirm the character is silent.** If the script references the person as a speaker or actor, this template's portrait will not carry that, either drop the reference or pick a character-dialogue template.
5. **Emit the reveal sequence**: a `setup` step, a `title` step, then one `row{i}` per detail, each `at` taken from the start time of the narration line that introduces that row. Give each row enough `in` (~1.4 s default) to cover its outline scale AND caption typewriter.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.5] "Let's look at data modelling." [1.3] "First, define your entities and relationships." [2.7] "Then choose a normalisation level." [4.1] "Map your primary and foreign keys." [5.5] "Validate against the business rules." [6.9] "Review with stakeholders." [8.3] "And document the final schema."

```tsx
mainTitle="Data Modelling"
titleIcon="ai-assistant"
character={{ id: 'presenter-grey', characterHeight: 850, characterY: 163 }}
details={[
  'Define entities and relationships',
  'Choose a normalisation level',
  'Map primary and foreign keys',
  'Validate against business rules',
  'Review with stakeholders',
  'Document the final schema',
]}
timings={{ sequence: [
  { target: 'setup', at: 0.2, in: 0.8 },
  { target: 'title', at: 0.5, in: 0.8 },
  { target: 'row0', at: 1.3 },
  { target: 'row1', at: 2.7 },
  { target: 'row2', at: 4.1 },
  { target: 'row3', at: 5.5 },
  { target: 'row4', at: 6.9 },
  { target: 'row5', at: 8.3 },
] }}
```

## Worked examples (rendered)

- [`examples/six-detail/`](examples/six-detail/), the full 6-row layout, authored scene + reveal sequence (no MP4; timing/layout reference).

## Field / prop reference

- `mainTitle`: `string` (1-30 chars, **≤3 words**)
- `titleIcon`: `string`, a master Icons/ -dark id (resolves to `icons/<id>.svg`)
- `details`: array of **1-6** × `string` (≤38 chars each)
- `character`: `{ id: string, characterHeight?: number (200-1500), characterY?: number }`, `id` resolves to `characters/<id>.png`; height/Y are layout tuning, **not** timing
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `title`, or `row{i}` (`i` = 0-based detail index); `at`/`in` in seconds; `in` defaults to 1.4 (a row needs time for its outline scale AND caption type)
