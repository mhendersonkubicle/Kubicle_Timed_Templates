---
template: Points3Subtopics2
title: Three Points, Stacked Bands with Two Sub-topics Each
category: points
useWhen: Exactly three parallel main ideas, each carrying a short title plus one or two supporting detail POINTS (each a complete, independent point), revealed strictly top-to-bottom on a split-screen panel with a left anchor visual.
tags:
  - points
  - list
  - three-points
  - stacked
  - sub-topics
  - hierarchy
  - split-screen
  - overview
  - agenda
layout:
  fixed: true              # fixed geometry, exactly three colour bands
  sections: 3              # blue, pink, yellow, baked colours and y-positions
  subTopicsPerSection: [1, 2]   # 1 or 2 detail points per band; a lone point centres in the band
  anchor: left-panel       # icon or character on the left split-screen panel
slots:                     # every addressable element (also the reveal targets)
  - setup                  # split-screen panel pans in + left anchor frame fades in
  - title0                 # blue band title pill (+ arrow + caption)
  - detail0a               # blue band detail shell 0 (typewriter)
  - detail0b               # blue band detail shell 1 (typewriter)
  - title1                 # pink band title pill
  - detail1a               # pink band detail shell 0
  - detail1b               # pink band detail shell 1
  - title2                 # yellow band title pill
  - detail2a               # yellow band detail shell 0
  - detail2b               # yellow band detail shell 1
narration:
  ordering: linear-top-to-bottom     # finish one band fully before the next
  comparisonStyle: sequential        # NOT interleaved across bands
  bandStyle: title-then-details      # title first, then its 1-2 independent detail points
  mainTextMaxWords: 3
  mainTextMaxChars: 30
  detailMaxChars: 45
  parallelPhrasing: true             # parallel structure across all three bands
timing:
  model: reveal-sequence
  fixedTargets: true                 # FIXED named slots (band identity is baked)
  canonicalRevealOrder: [setup, title0, detail0a, detail0b, title1, detail1a, detail1b, title2, detail2a, detail2b]
  defaultStepInSeconds: 0.7          # per-object entrance (pill scale; or shell scale + typewriter)
  defaultDurationSeconds: [12, 16]
assets:
  templateSpecific: Template-Specific-Assets/   # the split-screen panel, icon base, and per-colour pill/shell PNGs
  iconLibrary: shared                            # anchor icon resolves from the shared Icons/ catalogue (-dark id)
  characterLibrary: shared                       # character anchor resolves from characters/
  fonts: [Satoshi-Black, Satoshi-Bold]           # falls back to system sans if absent
---

# Points3Subtopics2, Selection & Narration Guidance

## What it is

A split-screen overview. An Oxford-Blue panel pans in from the right and a large anchor visual (an icon or a character portrait) fades in on the left. Three colour bands then stack down the right side, **blue**, then **pink**, then **yellow**, each with a title pill and one or two supporting detail shells. Under the reveal-sequence model the scaffolding comes in first, then each band reveals one object at a time: its title pill, then its detail point(s), each of which types out. A band with a single point shows one centred shell.

**Each detail shell holds ONE complete, independent point** (<=45 chars) that fits in a single shell. NEVER split one sentence across the two shells (e.g. NOT "In advisory work the people are" + "the service itself"). If a section has one point, give one detail (it centres in the band); if it has two distinct points, give two. So `detailTexts` is 1 or 2 entries, each a standalone point.

## Use it when

- You are presenting **exactly three** parallel main ideas, themes, pillars, or agenda items.
- Each idea carries **two** short supporting points that can each be summarised in a single line (≤45 chars).
- The three ideas are **parallel and hierarchical**, same level of abstraction, no branching, no cross-references, no oppositional pairing.
- You want a left-hand anchor visual (an icon or a presenter) to ground the section.

## Do NOT use it when

- There are **not exactly three** main ideas (use a different points or process template).
- An idea needs **more or fewer than two** sub-points, or its sub-points cannot be reduced to a short line.
- The relationship is **sequential/causal** (a workflow → use a process template) or **oppositional** (a two-way contrast → use YinYang2Points).
- The ideas **branch** or cross-reference each other rather than stacking as a flat list.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Sections | `sections` | exactly 3 | colour order is fixed: blue → pink → yellow |
| Section title | `sections[i].mainText` | ≤3 words, ≤30 chars | one tight phrase per pill, one line |
| Section details | `sections[i].detailTexts` | exactly 2 | each ≤45 chars, types out in its shell |
| Anchor | `anchor` | `{ kind: 'icon', id }` or `{ kind: 'character', id }` | icon id MUST end `-dark`; character id picks a PNG |

The section count (3) and the two-details-per-section count are **hard-fixed** by the schema and the baked colours/positions. There is no count variation to model.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the split-screen panel pans in and the left anchor frame fades in
2. `title0`, blue band title pill (+ arrow + caption)
3. `detail0a`, blue band detail 1 (scales in, then types out)
4. `detail0b`, blue band detail 2
5. `title1`, pink band title pill
6. `detail1a`, pink band detail 1
7. `detail1b`, pink band detail 2
8. `title2`, yellow band title pill
9. `detail2a`, yellow band detail 1
10. `detail2b`, yellow band detail 2

Each band is fully on screen (title + both details) **before** the next band's title appears.

## Narration rules

### Rule 1, Linear, band-complete, top-to-bottom (MUST)

Deliver the content **one whole colour band at a time**, in reveal order. Complete the blue band, its title, then its first detail, then its second, and only then move to pink, then yellow. Within a band, always introduce the title before its two details, and the two details in order. Never reveal a later band's title before the current band's details are spoken, and never interleave details across bands.

This is not a stylistic preference: the visuals reveal each band's title and both detail shells before the next band exists on screen. Jumping between bands would describe content that is not yet visible.

**GOOD (linear, band-complete, top-to-bottom):**
> "Our plan has three phases. First, we **plan**. We define the project scope. Then we list the major risks early. Next, we **build**. We ship the first version fast. And we iterate with real feedback. Finally, we **launch**. We roll out to all users. Then we track adoption and outcomes."

Maps cleanly: title0 → detail0a → detail0b → title1 → detail1a → detail1b → title2 → detail2a → detail2b.

**BAD (interleaved across bands):**
> "All three phases start with one key action: plan defines scope, build ships fast, launch rolls out. Then each has a follow-up: list risks, gather feedback, track outcomes."

This walks the first sub-point across all three bands, then the second across all three. It cannot be shown on this template, the pink and yellow bands are not yet revealed when their first details are spoken.

### Rule 2, Titles are tight, parallel phrases

Each `mainText` is ≤3 words and ≤30 chars and reads as a counterpart to the other two (Plan / Build / Launch, or three parallel noun phrases). Avoid full sentences, they will be clipped to one line.

### Rule 3, Details are short and parallel

Each detail line is ≤45 chars and names one concrete supporting point. Phrase the two details within a band, and across all three bands, in **parallel** form (e.g. all imperative verbs, or all noun phrases) so the stack reads as one coherent list.

### Rule 4, The anchor is scaffolding, not a point

The left-panel visual (icon or character) is part of `setup` and carries no text. Choose it to ground the topic, not to convey a sub-point. An icon anchor MUST use a `-dark`-suffix id so its platinum + Dodger-Blue line art reads on the Oxford-Blue panel.

## Variation, none (fixed 3 × 2)

This template has **no count variation**. The schema hard-fixes exactly 3 sections (`z.array(sectionSchema).length(3)`) and exactly 2 detail lines per section (`.length(2)`), and the three colours and y-bands are baked into the assets and the `TITLE_SRC_CY` / `SHELL_SRC_CY` maps. The geometry is fully fixed, which is exactly why FIXED named slots fit: each slot name encodes a specific band and row, so slots cannot be reordered or recoloured.

The only optional variation is which anchor you mount on the left (icon vs character) and how much of the sequence you schedule, a bare three-title overview (just `title0` / `title1` / `title2`) is valid; only schedule the objects you actually narrate.

## Narration template (fill-in skeleton)

> "[Name the three ideas in one line.] First, [blue title]. [blue detail 1.] [blue detail 2.] Next, [pink title]. [pink detail 1.] [pink detail 2.] Finally, [yellow title]. [yellow detail 1.] [yellow detail 2.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Our plan has three phases." [1.6] "First, plan." [2.8] "Define the project scope." [4.0] "List the major risks early." [5.4] "Next, build." [6.6] "Ship the first version fast." [7.8] "Iterate with real feedback." [9.2] "Finally, launch." [10.4] "Roll out to all users." [11.6] "Track adoption and outcomes."

```tsx
sections={[
  { mainText: 'Plan',  detailTexts: ['Define the project scope', 'List the major risks early'] },
  { mainText: 'Build', detailTexts: ['Ship the first version fast', 'Iterate with real feedback'] },
  { mainText: 'Launch', detailTexts: ['Roll out to all users', 'Track adoption and outcomes'] },
]}
anchor={{ kind: 'icon', id: 'business-success-path-dark' }}
timings={{ sequence: [
  { target: 'setup',   at: 0.2, in: 1.4 },
  { target: 'title0',  at: 1.6 },
  { target: 'detail0a', at: 2.8 },
  { target: 'detail0b', at: 4.0 },
  { target: 'title1',  at: 5.4 },
  { target: 'detail1a', at: 6.6 },
  { target: 'detail1b', at: 7.8 },
  { target: 'title2',  at: 9.2 },
  { target: 'detail2a', at: 10.4 },
  { target: 'detail2b', at: 11.6 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Points3Subtopics2:

1. **Confirm fit.** Is the segment exactly three parallel ideas, each with exactly two reducible sub-points? If the count is off, or the relationship is sequential/oppositional/branching, reject this template and pick another.
2. **Extract** the three section titles and two detail lines per section.
3. **Re-sequence to band-complete, top-to-bottom order.** If the source narration walks sub-points across the three ideas (idea-1-point-1, idea-2-point-1, idea-3-point-1…), rewrite it so the blue band is delivered in full, then pink, then yellow, matching the canonical reveal order. This re-sequencing is the most common edit.
4. **Compress** each title to ≤3 words / ≤30 chars and each detail to ≤45 chars; keep phrasing parallel across all three bands.
5. **Emit the reveal sequence**, taking each `at` from the start time of the narration line that introduces that object.

## Worked example pointer

- [`examples/plan-build-launch/`](examples/plan-build-launch/), full example authored on the reveal-sequence model: realistic three-band content plus the matching reveal sequence. No MP4 is rendered.

## Field / prop reference

- `sections`: array of **exactly 3** × `{ mainText: string (≤3 words, ≤30 chars), detailTexts: [string (≤45), string (≤45)] }`, in fixed colour order blue → pink → yellow
- `anchor`: `{ kind: 'icon', id }` where `id` ends `-dark` (resolves `icons/{id}.svg`), or `{ kind: 'character', id }` (resolves `characters/{id}.png`)
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above; `at`/`in` in seconds; `in` defaults to 0.7 (a detail step scales its shell in then types its line out within that window)
