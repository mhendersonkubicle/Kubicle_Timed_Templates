---
template: Pyramid5Tiers
title: Pyramid, Tiered Hierarchy with Banners
category: hierarchy
useWhen: A layered hierarchy or stack of 2-5 tiers where each tier is one short title plus a sentence of body copy and an icon, and the tiers read from a broad foundation to a narrow apex (or apex down to base).
tags:
  - hierarchy
  - pyramid
  - tiers
  - layers
  - stack
  - levels
  - foundation
  - maslow
  - layered-concept
layout:
  fixed: false               # triangular envelope auto-divides for the tier count
  tiers: [2, 5]              # 2 to 5 tiers
  perTier: [slab, icon, banner, title, body]
slots:                       # addressable reveal targets
  - setup                    # triangular pyramid envelope outline scales in
  - tier0                    # each tier = slab + icon + banner (title + body), one object
  - tier1
  - tier2                    # only present when there are >= 3 tiers
  - tier3                    # only present when there are >= 4 tiers
  - tier4                    # only present when there are 5 tiers
narration:
  ordering: linear-by-tier       # introduce tiers strictly top → bottom (apex first)
  comparisonStyle: sequential    # one tier fully before the next; no jumping levels
  titleMaxChars: 22
  bodyMaxChars: 180
  titleStyle: parallel           # short noun labels, parallel across tiers
timing:
  model: reveal-sequence
  indexedTargets: true           # tier{i}, i = 0..tiers.length-1
  canonicalRevealOrder: [setup, tier0, tier1, tier2, tier3, tier4]
  staging: animated              # setup scales the triangular envelope outline in
  defaultStepInSeconds: 1.0      # per-tier entrance (slab + icon + banner/title/body cascade)
  defaultDurationSeconds: [8, 13]
assets:
  templateSpecific: none         # pure code + SVG; no bundled PNGs
  iconLibrary: shared            # icons resolve from the shared master Icons/ (-dark)/ set (white line icons)
  iconVariant: as-is-white       # master Icons/ (-dark) render AS-IS, pre-coloured WHITE on the dodger-blue slab (no -dark/-light suffix, no runtime recolour); see README "icon-contrast principle"
  fonts: [Satoshi-Black, Satoshi-Bold, Satoshi-Medium]
---

# Pyramid5Tiers, Selection & Narration Guidance

## What it is

A left-aligned pyramid of 2-5 stacked dodger-blue trapezoid slabs, lightest at the apex deepening to the base, each carrying a white icon, paired with an oxford-blue banner on the right that holds the tier's title (dodger-blue) and a sentence of body copy (white). Under the reveal-sequence model the triangular envelope outline scales in first (the setup scaffolding), then each tier reveals one at a time from the apex downward, its slab settling, its icon popping, and its banner sliding in with a title then body sub-stagger.

## Use it when

- The content is a **layered hierarchy or stack** of 2-5 levels (a foundation-to-apex model, a maturity stack, a needs pyramid, a product-layer diagram).
- Each tier reduces to a **short title** (≤22 chars) plus a **sentence of body copy** (≤180 chars) and one icon.
- The levels have a **clear vertical order** (broad base to narrow apex, or apex down to base) and you want that order to read as you narrate.

## Do NOT use it when

- The items are **not layered/ranked** (a flat list of parallel points, use a points/list template).
- There are **more than 5 tiers**, or a tier needs more than a title + one sentence.
- The relationship is **sequential as a left-to-right process** rather than a vertical stack (use Process5Steps).
- The relationship is a **two-way opposition** (use YinYang2Points) or a **two-point linkage** (use ComparativePoints2).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Tiers | `tiers` | 2-5 items | top → bottom (apex first) |
| Tier title | `tiers[i].title` | ≤22 chars | dodger-blue Satoshi Black inside the banner |
| Tier body | `tiers[i].body` | ≤180 chars | white Satoshi Medium; wraps to 2-4 lines |
| Tier icon | `tiers[i].icon` | id from master Icons/ (use a -dark variant) | white line icon, renders as-is on the slab |

## Reveal order (canonical)

1. `setup`, the triangular pyramid envelope outline scales in
2. `tier0`, apex slab + its icon + its banner (title then body)
3. `tier1`
4. `tier2` *(if present)*
5. `tier3` *(if present)*
6. `tier4` *(if present)*

Each tier is one object: its slab, icon, banner, title, and body all reveal together at that tier's cue, cascading internally within the object's own `in` window. Reveal runs strictly **top to bottom**.

## Narration rules

### Rule 1, Linear, top-to-bottom (MUST)

Introduce the tiers **strictly in vertical order, apex first**, one at a time, matching the reveal order. Do not describe a lower tier before its slab is on screen, and do not jump levels. The visual builds the pyramid from the top down as you speak, so "At the top… below that… and at the base…" narration maps directly onto `tier0, tier1, tier2…`.

**GOOD:** "Our model has three layers. At the top sit the **outcomes** we want. Beneath them, the **reasoning** that produces those outcomes. And at the foundation, the **data** everything is built on."

**BAD:** "It all rests on data, but the outcomes at the top are what matter, with reasoning somewhere in the middle." (Jumps to the base before the apex exists, and the order spoken doesn't match the build.)

### Rule 2, Titles are short and parallel

Each title is ≤22 chars and uses parallel phrasing across tiers (all nouns reads best). The sentence of context lives in `body` (≤180 chars), not the title. GOOD title: "Strategy", "Tools", "Data". BAD title: "Strategic planning layer that governs everything" (too long).

### Rule 3, One icon per tier

Each tier's icon should depict the tier's idea concretely. Icons come from the master **Icons/** library (-dark variants) and render **as-is** (they are pre-coloured white and read on the dodger-blue slab, no `-dark`/`-light` suffix and no recolour). See the README icon-contrast principle.

### Rule 4, Body length by tier width

The top banner is the widest and the bottom banner the narrowest (each butts against the pyramid's diagonal). Put longer copy on the upper tiers and tighter copy on the lower ones so nothing clips.

## Variation, tier count (2-5)

The tier count is the built-in variation. Supply 2, 3, 4, or 5 tiers:

- The **triangular envelope is fixed** and auto-divides evenly across whatever count is supplied, so fewer tiers simply means taller, broader slabs and the slope never changes.
- The light→dark slab gradient is **re-spread** across the count, so tier 0 is always lightest and the base tier always deepest.
- The icon size and banner widths **auto-size** per tier so every count reads cleanly.
- Schedule one `tier{i}` per tier; `tier{i}` targets beyond `tiers.length` are ignored.

See [`examples/three-tier/`](examples/three-tier/) for the count variation.

## Re-mention pulse

When the narration **names an already-revealed tier again** more than ~2-3s after its reveal, add a `pulse` at the re-mention's cue time so that tier gives a brief brand pulse (a ~+5% scale bump over ~0.45s) without re-animating. Pulses target the content tiers only (`tier{i}`), never `setup`. With no pulses scheduled the scene renders identically.

## Narration template (fill-in skeleton)

> "[Name the model/hierarchy in one line.] At the top, [tier 0 title], [body]. Below that, [tier 1 title], [body]. [tier 2…]. And at the base, [bottom tier], [body]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Think of an AI product as three layers." [1.3] "At the top, the outcomes the user receives." [3.0] "Beneath that, the reasoning that produces them." [4.7] "And at the base, the data it all rests on." [7.2] "Everything serves those outcomes."

```tsx
tiers={[
  { title: 'Outcomes',  body: 'What the user receives, value and results.', icon: 'high-five-celebration-yes' },
  { title: 'Reasoning', body: 'Models and prompts that turn inputs into outputs.', icon: 'auto-update' },
  { title: 'Data',      body: 'Documents and embeddings, the foundation.', icon: 'add-document' },
]}
timings={{
  sequence: [
    { target: 'setup', at: 0.2, in: 1.0 },
    { target: 'tier0', at: 1.3 },
    { target: 'tier1', at: 3.0 },
    { target: 'tier2', at: 4.7 },
  ],
  pulses: [
    { target: 'tier0', at: 7.2 },   // "Everything serves those outcomes" re-mentions the apex
  ],
}}
```

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a vertical hierarchy of 2-5 layers, each reducible to a short title + one sentence? If unordered, >5 levels, sequential left-to-right, or oppositional, pick another template.
2. **Extract** the ordered tiers (apex first) and a ≤22-char title, ≤180-char body, and icon concept for each.
3. **Order-check.** Ensure the narration introduces tiers top to bottom, one at a time. If the source jumps levels (e.g. starts at the base), re-sequence it to run apex → base.
4. **Emit the reveal sequence**: a `setup` step, then one `tier{i}` per tier in top-to-bottom order, each `at` taken from the start time of the narration line that introduces that tier.
5. **Add pulses** for any tier the narration re-mentions later (the re-mention's cue time).

## Worked examples (rendered)

- [`examples/three-tier/`](examples/three-tier/), the 2-5 count variation (3 tiers) with a sample reveal sequence and a re-mention pulse. (No MP4 rendered.)

## Field / prop reference

- `tiers`: array of **2-5** × `{ title: string (≤22), body: string (≤180), icon: string }` (top → bottom)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `tier{i}` (`i` = 0-based tier index); `at`/`in` in seconds; `in` defaults to 1.0
- `timings.pulses`: array of `{ target, at }`; `target` is a content `tier{i}`; `at` is the re-mention's scene-relative second
