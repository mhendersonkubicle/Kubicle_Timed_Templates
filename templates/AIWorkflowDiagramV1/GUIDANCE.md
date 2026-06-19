---
template: AIWorkflowDiagramV1
title: AI Workflow Diagram, Column Fan-Out / Fan-In Flow
category: diagram
useWhen: A staged AI pipeline or multi-agent flow of 1-4 columns laid out left to right, where each column is a stage (source, router, parallel agents, sink) holding 1-3 short node labels and adjacent columns are fully connected.
tags:
  - diagram
  - workflow
  - pipeline
  - flow
  - ai
  - agents
  - routing
  - fan-out
  - fan-in
  - architecture
layout:
  fixed: false               # columns auto-spread across the canvas for the count
  columns: [1, 4]            # 1 to 4 columns, left -> right
  boxesPerColumn: [1, 3]     # each column stacks 1-3 nodes, vertically centred
  perNode: [icon, label]
  connections: complete-bipartite  # every box links to every box in the next column
slots:                       # addressable reveal targets
  - setup                    # oxford-blue background irises in + dot grid; ambient packet loop after the graph is drawn
  - col0                     # each column = its boxes + the connectors feeding into it (one object)
  - col1
  - col2                     # only present when there are >= 3 columns
  - col3                     # only present when there are 4 columns
narration:
  ordering: linear-by-column     # introduce columns strictly in left -> right flow order
  comparisonStyle: sequential    # one stage fully before the next; no jumping ahead
  labelMaxChars: 16
  labelStyle: parallel           # parallel phrasing within a column
timing:
  model: reveal-sequence
  indexedTargets: true           # col{i}, i = 0..columns.length-1
  canonicalRevealOrder: [setup, col0, col1, col2, col3]
  staging: animated              # setup irises the oxford background in + fades the dot grid
  defaultStepInSeconds: 0.8      # per-column entrance (boxes pop + feeding connectors draw)
  defaultDurationSeconds: [10, 15]
assets:
  templateSpecific: none         # pure code + inline SVG; no bundled PNGs
  iconLibrary: none              # node glyphs are inline SVG drawn by the template (NOT the shared library)
  iconVariant: n/a (inline glyphs, white line art on the dodger node body)
  fonts: [Satoshi-Bold]          # falls back to system sans if absent
---

# AIWorkflowDiagramV1, Selection & Narration Guidance

## What it is

An animated AI workflow diagram. Columns of node boxes are laid out left to right; each column is a stage of the pipeline (a source, an intent router, a fan of parallel agents, an output sink) holding 1-3 stacked boxes. Adjacent columns are fully connected, every box links to every box in the next column, so a router fanning out to three agents and those agents converging on one sink both read naturally. Under the reveal-sequence model the oxford-blue background irises in first, then the columns reveal one at a time left to right, each column's boxes popping in with the connectors that feed into it. Once the whole graph is drawn, a bright data packet loops along one path through the graph as ambient decoration.

## Use it when

- The content is a **staged flow or pipeline** that moves left to right, an AI request pipeline, a multi-agent routing diagram, an ETL/inference pipeline, any fan-out / fan-in story.
- There are **1 to 4 stages (columns)**, and each stage holds **1 to 3** parallel nodes.
- Each node reduces to a **single short label** (≤16 chars) plus one of the built-in glyphs.
- Adjacent stages are **fully connected** (every node feeds every node in the next stage). This is the connection model the template draws.

## Do NOT use it when

- The relationship is **not a left-to-right flow** (a flat list of parallel points, a two-way contrast, a hierarchy), use a points / comparison / tree template.
- There are **more than 4 stages**, or a stage needs more than 3 nodes, or a node needs more than a short label.
- The connections are **not** complete-bipartite (selective edges, skip-level links, loops back to an earlier column). This template draws every box to every box in the next column only.
- You need named edges, edge labels, or weighted connectors.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Columns | `columns` | 1-4 | left -> right flow order; last column styled as the sink |
| Column | `columns[c]` | 1-3 nodes | stacked, vertically centred |
| Node label | `columns[c][r].label` | ≤16 chars | parallel phrasing within a column |
| Node icon | `columns[c][r].icon` | one of: chat, router, shield, card, message, brain, gear, spark | inline white line glyph |

The node glyphs are **drawn inline by the template** (not pulled from the shared Icons library), so there is no `-dark`/`-light` variant to pick; they render as white line art on the dodger-blue node body.

## Reveal order (canonical)

1. `setup`, the oxford-blue background irises in over the platinum base and the dot grid fades up
2. `col0`, the first column's boxes pop in (its boxes have no incoming connectors)
3. `col1`, the second column's boxes pop in + the connectors from col0 draw on
4. `col2`, third column + its feeding connectors *(if present)*
5. `col3`, fourth/sink column + its feeding connectors *(if present)*

Each column is one object: the column's boxes and the connectors feeding into it (from the previous column) reveal together at that column's cue. After the last scheduled column finishes, the ambient data packet begins looping along one path; the packet is decoration tied to `setup`, never a reveal object, and never carries narration.

## Narration rules

### Rule 1, Linear, column-by-column, left to right (MUST)

Introduce the stages **strictly in flow order**, one column at a time, matching the reveal order. Do not describe a later stage before its column is on screen, and do not jump back. The diagram builds left to right as you speak, so "A request comes in… the router decides… each agent handles… the model answers" maps directly onto `col0, col1, col2, col3`.

**GOOD:** "Every request starts as a **user query**. An **intent router** reads it and decides where it should go. It fans out to one of three specialist **agents**, refunds, support, or general. Whichever handles it, the answer is composed by the **LLM engine**."

**BAD:** "The LLM engine produces the final answer, drawing on three agents that the router picked from the original query." (Starts at the sink and walks backwards, the opposite of the build order.)

### Rule 2, Labels are short and parallel

Each label is ≤16 chars. Within a column, keep the labels parallel (e.g. all "… Agent", or all noun phrases) since a column reads as a set of peers. Longer explanation lives in the voiceover, not the box.

### Rule 3, One column = one narration beat

Treat each column as a single beat: introduce the whole column (all its boxes) in one stretch of narration, then move to the next. A 3-agent column is named as a group ("three specialist agents: refunds, support, general"), not as three separate reveals, the whole column pops in on its single cue.

### Rule 4, The packet loop is decoration

The looping data packet is ambient motion that starts after the graph is fully drawn. It is not a content beat and needs no narration; do not script around individual packet trips.

## Variation, column x box count

The built-in variation is the **shape of the graph**: 1-4 columns, each with 1-3 boxes.

- Columns **auto-spread** across the canvas width for the count (1 column centres; 4 columns sit at the original 120 / 586 / 1053 / 1520 x-positions).
- Each column's boxes **stack vertically centred**, so 1 box sits on the centre line and 3 boxes spread to 180 / 470 / 760.
- The connectors are **always complete-bipartite** between adjacent columns, recomputed for whatever shape you supply.
- Schedule one `col{i}` per column; `col{i}` targets beyond `columns.length` are ignored.

Example shapes: `[[1],[1],[3],[1]]` (classic source -> router -> 3 agents -> sink), `[[3],[2],[3],[1]]` (uneven fan), `[[1],[2]]` (a single split).

See [`examples/multi-agent-router/`](examples/multi-agent-router/) for the classic 4-column fan-out / fan-in shape.

## Narration template (fill-in skeleton)

> "[Name the flow in one line.] It starts with [col0]. Then [col1] [does X]. That fans out to [col2 nodes]. Finally [col3 / the sink] [produces the result]."

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Here's how a request moves through the system." [1.1] "It starts as a user query." [2.3] "An intent router reads it." [3.5] "It fans out to one of three agents, refunds, support, or general." [5.2] "And the LLM engine composes the answer."

```tsx
columns={[
  [{ label: 'User Query',   icon: 'chat'   }],
  [{ label: 'Intent Router', icon: 'router' }],
  [
    { label: 'Refunds Agent', icon: 'card'    },
    { label: 'Support Agent', icon: 'shield'  },
    { label: 'General Agent', icon: 'message' },
  ],
  [{ label: 'LLM Engine',   icon: 'brain'  }],
]}
timings={{ sequence: [
  { target: 'setup', at: 0.2, in: 0.9 },
  { target: 'col0', at: 1.1 },
  { target: 'col1', at: 2.3 },
  { target: 'col2', at: 3.5, in: 1.1 },
  { target: 'col3', at: 5.2 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a left-to-right flow of 1-4 stages, each holding 1-3 short node labels, with adjacent stages fully connected? If it is a flat list, a contrast, a hierarchy, has selective edges, or has more than 4 stages, pick another template.
2. **Extract** the columns in flow order and a ≤16-char label + glyph for each node.
3. **Order-check.** Ensure the narration introduces stages in flow order, one column at a time. If the source starts at the output or jumps between stages, re-sequence it to run left to right.
4. **Group per column.** Collapse the boxes of one column into a single narration beat, the column pops in on one cue, not box by box.
5. **Emit the reveal sequence**: a `setup` step, then one `col{i}` per column, each `at` taken from the start time of the narration line that introduces that stage.
6. **Pulses (optional).** If the narration names an already-revealed column again later, add a `pulses` entry `{ target: 'col{i}', at }` at the re-mention's cue time for a brief brand pulse.

## Worked example pointer

- [`examples/multi-agent-router/`](examples/multi-agent-router/), full example authored on the reveal-sequence model: the classic 4-column source -> router -> 3 agents -> sink shape plus the matching reveal sequence and a sample re-mention pulse. No MP4 is rendered.

## Field / prop reference

- `columns`: array of **1-4** columns, each an array of **1-3** × `{ label: string (≤16), icon: 'chat'|'router'|'shield'|'card'|'message'|'brain'|'gear'|'spark' }`, in left -> right flow order; the last column is styled as the sink
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `col{i}` (`i` = 0-based column index); `at`/`in` in seconds; `in` defaults to 0.8 (a column's boxes pop in staggered and its feeding connectors draw within that window)
- `timings.pulses`: array of `{ target, at }`; `target` is a content `col{i}`; `at` is the re-mention's scene-relative second; gives a brief (~0.45 s, +5 %) brand pulse on the named column. Empty by default, with no pulses the template renders identically.
