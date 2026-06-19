---
template: TreeDiagram4x2
title: Tree Diagram, Root Panel with Branching Points
category: diagram
useWhen: A single root topic that fans out into 2-5 named branches, each carrying 1-3 short icon-labelled points, where the hierarchy (one parent, several children) is the point.
tags:
  - tree
  - hierarchy
  - taxonomy
  - branching
  - decision-tree
  - breakdown
  - categories
  - pros-cons
  - mind-map
layout:
  fixed: false               # branch count + per-branch leaf count both vary; rows/trunk/leaf size auto-layout
  branches: [2, 5]           # 2 to 5 branches
  leavesPerBranch: [1, 3]    # 1 to 3 leaves per branch
  root: [heroIcon, title]    # left hero panel: large white icon + dark title pill
  perBranch: [caption, leaves]
  perLeaf: [icon, text]
slots:                       # addressable reveal targets
  - setup                    # oxford-blue stage scales in + hero panel (root) slides in + title pill + panel→trunk stub draws
  - branch0                  # each branch = trunk segment + caption pill + connectors + 1-3 leaves (one object)
  - branch1
  - branch2                  # only present when there are >= 3 branches
  - branch3                  # only present when there are >= 4 branches
  - branch4                  # only present when there are 5 branches
narration:
  ordering: linear-top-down      # introduce branches strictly top-to-bottom (branch0 is the topmost row)
  comparisonStyle: branch-complete # one branch fully (caption then its leaves) before the next; never interleave leaves across branches
  captionMaxChars: 22
  leafTextMaxChars: 60
  titleMaxWords: 3
  labelStyle: parallel           # branch captions parallel (all noun phrases); leaf points parallel within a branch
timing:
  model: reveal-sequence
  indexedTargets: true           # branch{i}, i = 0..branches.length-1
  canonicalRevealOrder: [setup, branch0, branch1, branch2, branch3, branch4]
  staging: animated              # setup brings the oxford-blue stage, the hero root panel and the panel→trunk stub on screen
  defaultStepInSeconds: 1.6      # per-branch entrance (trunk segment + connectors + pill + leaf cascade)
  defaultDurationSeconds: [10, 16]
assets:
  templateSpecific: none         # pure code + CSS gradients + SVG connectors; no bundled PNGs
  iconLibrary: shared            # heroIcon + leaf icons resolve from the shared icons/ set
  iconVariant: n/a (recoloured)  # icons are masked to SOLID WHITE at render time (Pattern B), so the -dark/-light suffix is cosmetic here; any source SVG works
  fonts: [Satoshi-Bold, Satoshi-Medium]   # falls back to system sans if absent
---

# TreeDiagram4x2, Selection & Narration Guidance

## What it is

A tree diagram. A large hero panel on the left is the **root**: it holds a big white icon and a dark title pill naming the topic. A vertical trunk runs out of the panel and fans into 2-5 **caption pills** (the branches), each splitting into 1-3 **leaves**, small dodger spheres with a white icon and a short line of body text. Under the reveal-sequence model the oxford-blue stage, the root panel and the trunk stub come in first (`setup`), then each branch reveals one at a time, top to bottom, with its connectors, pill and leaves cascading in together.

## Use it when

- You have **one root topic** that fans out into **2-5 named branches**, and the **hierarchy** (one parent, several children) is the point.
- Each branch reduces to a **short caption** (≤22 chars) plus **1-3 short points** (leaves), each point mappable to one fast-read icon (check/x, up/down, plus/minus).
- The structure is a **breakdown / taxonomy / decision tree / pros-and-cons map**, not a linear sequence.

## Do NOT use it when

- The content is a **sequence of ordered steps** (use Process5Steps).
- The items are a **flat list** with no parent topic (use a points/list template).
- There are **more than 5 branches**, or a branch needs more than 3 points, or a point needs more than ~2 short lines.
- The relationship is a **two-way opposition** (use YinYang2Points) or a simple **two-point linkage** (use ComparativePoints2).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Root title | `title` | ≤3 words, ≤30 chars | dark title pill at the bottom of the hero panel; wraps inside the pill |
| Root icon | `heroIcon` | id from icons/ | large white silhouette inside the panel (any SVG; masked solid white) |
| Branches | `branches` | 2-5 items | revealed top → bottom; `branch0` is the topmost row |
| Branch caption | `branches[i].caption` | ≤22 chars | pill label, ideally ≤20 for headroom; one line |
| Leaves | `branches[i].leaves` | 1-3 items | per-branch points, revealed within the branch |
| Leaf icon | `branches[i].leaves[j].icon` | id from icons/ | masked solid white; pick a fast-read glyph |
| Leaf text | `branches[i].leaves[j].text` | ≤60 chars | wraps to up to 2 lines |

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the oxford-blue stage scales in, the hero panel (root) slides in from the left with its big icon and title pill, and the panel→trunk stub draws.
2. `branch0`, the topmost branch: its trunk segment reaches the row, the caption pill slides in, the pill→junction and per-leaf connectors draw, and its leaves cascade in (sphere → icon → text).
3. `branch1`
4. `branch2` *(if present)*
5. `branch3` *(if present)*
6. `branch4` *(if present)*

Each branch is one object: the whole branch (connectors, pill, all its leaves) reveals together at that branch's cue. The tree builds **root-outward, top-down**.

## Narration rules

### Rule 1, Linear, root-outward, branch-complete (MUST)

Name the **root topic** first (it lands during `setup`, when the panel and title are coming in). Then deliver each branch **fully**, its caption and then its leaves in order, before moving to the next branch. Introduce branches strictly **top-to-bottom** (matching `branch0, branch1, branch2…`). Never interleave leaves across branches, and never describe a branch before its row exists on screen.

**GOOD (root, then branch-complete, top-down):**
> "When you pick a model, weigh three things. First, **cost**, it's cheaper per token at scale, but watch hidden context costs. Second, **latency**, you get a faster first-token response. And third, **quality**, it's stronger on hard reasoning, weaker on niche domains, and it improves with good prompts."

Maps cleanly: setup (the root, "pick a model") → branch0 (Cost + its leaves) → branch1 (Latency) → branch2 (Quality + its leaves).

**BAD (interleaved / out of order):**
> "Cost and quality both matter, and latency too, the cheap option is fast but weak on reasoning, while the strong one costs more."

This blends leaves across three branches in one breath and jumps around, none of the branches is delivered as a unit, and the spoken order does not match the top-down build.

### Rule 2, Name the root up front

Open by naming the root topic, the thing the hero panel stands for, in a line that lands during `setup`. The branches are children **of that topic**; the narration should make the parent explicit before the first branch.

### Rule 3, Captions short, leaves parallel and icon-able

Each branch caption is ≤22 chars (one tight noun phrase). Within a branch, phrase the leaves in **parallel** (e.g. all pros then all cons, or all "do/don't" pairs) and give each a concrete fast-read icon: `check`/`x` for yes/no, `arrow-up`/`arrow-down` for more/less, `plus`/`minus` for add/cut, `info`/`alert-triangle` for note/warning.

### Rule 4, Optional re-mention pulse

If the narration **names an already-revealed branch again** later (more than ~2-3s after its reveal), add a `pulses` entry `{ target: branch{i}, at }` at the re-mention's cue time so that branch gives a brief, subtle brand pulse, drawing the eye back without re-animating it. Only pulse branches that are genuinely re-mentioned in the SRT; do not invent pulses.

## Variation, branch + leaf count (2-5 × 1-3)

Two independent counts are the built-in variation:

- **Branch count (2-5):** branch rows are distributed evenly down a fixed vertical band and auto-centre for the count, so 2, 3, 4 or 5 branches all read cleanly. The trunk reaches each row as that branch appears.
- **Leaves per branch (1-3):** the leaf radius, vertical pitch, and font size are solved from the densest branch so the tallest cluster fits its row slot with no overlap; a single-leaf branch draws no vertical junction.

Schedule one `branch{i}` per branch; `branch{i}` targets beyond `branches.length` are ignored.

See [`examples/decision-tree/`](examples/decision-tree/) for the 3-branch variation (with branches of 2, 1 and 3 leaves) plus a re-mention pulse.

## Narration template (fill-in skeleton)

> "[Name the root topic in one line.] First, [branch 1 caption], [its point(s)]. Second, [branch 2 caption], [its point(s)]. [Third, branch 3 …]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "When you pick a model, weigh three things." [2.4] "First, cost, cheaper per token at scale, but watch hidden context costs." [5.0] "Second, latency, a faster first-token response." [7.6] "And third, quality, stronger on hard reasoning, weaker on niche domains, and it improves with good prompts." [11.0] "…so cost stays the deciding factor."

```tsx
title="Choosing a Model"
heroIcon="git-branch"
branches={[
  { caption: 'Cost', leaves: [
    { icon: 'arrow-down', text: 'Cheaper per token at scale' },
    { icon: 'info',       text: 'Watch hidden context costs' },
  ] },
  { caption: 'Latency', leaves: [
    { icon: 'arrow-up', text: 'Faster first-token response' },
  ] },
  { caption: 'Quality', leaves: [
    { icon: 'check', text: 'Stronger on hard reasoning' },
    { icon: 'x',     text: 'Weaker on niche domains' },
    { icon: 'plus',  text: 'Improves with good prompts' },
  ] },
]}
timings={{
  sequence: [
    { target: 'setup',   at: 0.2, in: 2.0 },
    { target: 'branch0', at: 2.4 },
    { target: 'branch1', at: 5.0 },
    { target: 'branch2', at: 7.6 },
  ],
  pulses: [
    { target: 'branch0', at: 11.0 },
  ],
}}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to TreeDiagram4x2:

1. **Confirm fit.** Is the segment one root topic fanning into 2-5 named branches, each with 1-3 short icon-able points, where the hierarchy is the point? If it is an ordered sequence (→ Process5Steps), a flat list (→ a points template), or a two-way contrast (→ YinYang2Points / ComparativePoints2), reject this template.
2. **Extract** the root topic (→ `title`, ≤3 words, + a `heroIcon` concept), then the branch captions (≤22 chars) and, under each, its 1-3 leaf points (≤60 chars each + an icon concept).
3. **Re-sequence to branch-complete, top-down order.** If the source jumps between branches, rewrite it so the root is named first, then each branch is delivered fully (caption then leaves) before the next, top to bottom. This re-sequencing is the most common edit.
4. **Emit the reveal sequence**: a `setup` step (named when the root topic is introduced), then one `branch{i}` per branch, each `at` taken from the start time of the narration line that introduces that branch.
5. **Add pulses only for genuine re-mentions**: if a branch is named again >~2-3s after its reveal, add `{ target: branch{i}, at }` at that cue.

## Worked examples (rendered)

- [`examples/decision-tree/`](examples/decision-tree/), a 3-branch decision tree authored from a top-down script: the content props, the reveal sequence, and one re-mention pulse. (No MP4 rendered.)

## Field / prop reference

- `title`: string, **≤3 words** and ≤30 chars (root title pill; wraps inside the pill)
- `heroIcon`: string, an id from the shared `icons/` library (masked solid white)
- `branches`: array of **2-5** × `{ caption: string (≤22), leaves: Array<{ icon: string, text: string (≤60) }> }` with **1-3** leaves each
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `branch{i}` (`i` = 0-based branch index, top → bottom); `at`/`in` in seconds; `in` defaults to 1.6
- `timings.pulses`: array of `{ target, at }`; `target` is a content `branch{i}` (setup is not pulsable); `at` in seconds (the re-mention cue). Empty by default, an empty list renders identically.
