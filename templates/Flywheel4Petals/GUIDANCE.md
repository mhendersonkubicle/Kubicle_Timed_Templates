---
template: Flywheel4Petals
title: Flywheel, Petal Cycle (2-6 Stages)
category: cycle
useWhen: A genuine, ongoing SYSTEM that cycles, a real flywheel or feedback loop of 2-6 stages that keeps repeating by design and feeds its last stage back into its first. NOT a one-off chain of events that merely happens to end where it began. Each stage is a short phase name plus a single supporting line and one icon, and the order matters going clockwise.
tags:
  - cycle
  - loop
  - flywheel
  - iterative
  - phases
  - stages
  - process
  - feedback-loop
  - continuous
layout:
  fixed: false               # wheel auto-divides 360° for the petal count
  petals: [2, 6]             # 2 to 6 petals
  perPetal: [number, icon, label, body]
  hub: centre                # central oxford-blue hub holds the title + centre icon
slots:                       # addressable reveal targets
  - setup                    # hub scales in + faint empty donut-ring scaffold scales in
  - petal0                   # each petal = fill + number + icon + label + body (one object); CLOCKWISE FROM TOP
  - petal1
  - petal2                   # only present when there are >= 3 petals
  - petal3                   # only present when there are >= 4 petals
  - petal4                   # only present when there are >= 5 petals
  - petal5                   # only present when there are 6 petals
narration:
  ordering: linear-clockwise     # introduce petals strictly clockwise from the top
  comparisonStyle: sequential    # one stage fully before the next; no jumping across the wheel
  labelMaxChars: 14
  bodyMaxChars: 48
  labelStyle: parallel           # all verbs or all nouns, not a mix
timing:
  model: reveal-sequence
  indexedTargets: true           # petal{i}, i = 0..petals.length-1, clockwise from the top
  canonicalRevealOrder: [setup, petal0, petal1, petal2, petal3, petal4, petal5]
  staging: animated              # setup scales in the hub + an empty donut-ring scaffold (not a no-op)
  defaultStepInSeconds: 1.0      # per-petal entrance (fill + number/icon/label/body cascade)
  defaultDurationSeconds: [8, 14]
assets:
  templateSpecific: none         # pure code + SVG; no bundled PNGs
  iconLibrary: shared            # petal + centre icons resolve from the master Icons/ library; use -dark variants
  iconVariant: petals=force-white, centre=-dark   # PETAL icons are FORCE-RECOLOURED to solid white (contrast on the dodger-blue petals; a two-tone icon's blue accents would vanish), so a petal id/variant is cosmetic. The CENTRE hub icon is a -dark master Icons/ id rendered as-is (light artwork reads on the oxford-blue hub). See README "icon-contrast principle".
  fonts: [Satoshi-Bold, Satoshi-Medium, Inter-ExtraBold]
---

# Flywheel4Petals, Selection & Narration Guidance

## What it is

A canvas-filling petal flywheel. A central oxford-blue hub scales in carrying
the title, a supporting line, and a centre icon, while a faint empty donut-ring
scaffold scales in behind it to establish the wheel. Then 2 to 6 coloured
petals reveal around the hub, lightest dodger-blue at the top running deepest
toward the end, each fading its fill in and cascading a big `01…0N` number, an
icon, a phase name, and a short body line. Under the reveal-sequence model the
hub + scaffold come in first, then each petal reveals one object at a time,
**clockwise from the top**.

## Use it when

- The content is a **genuine ongoing system that cycles**, a feedback loop, a
  growth flywheel, a plan → act → observe → reflect cycle, where the stages
  **keep repeating by design** and the last stage feeds the first on every turn.
  The point is the *recurring mechanism*, not a single run of events.
- There are **2 to 6 stages**, each reducible to a short phase name (≤14 chars)
  plus one supporting line (≤48 chars) and an icon.
- The order matters and reads **clockwise**, and the point is that the stages
  *cycle* (the last feeds back into the first).

## Do NOT use it when

- The steps run **straight through and stop** (a linear pipeline that does not
  loop → use Process5Steps).
- It is a **one-time chain of events**, a story or post-mortem of how a single
  decision played out, *even if the narrative ends back where it started* (e.g.
  "we added staff, pressure dropped, the root cause was ignored, and the problem
  returned"). That is a linear cause-and-effect sequence with an ironic ending,
  **not an ongoing system that cycles**. Use a linear process (**Process5Steps**)
  or a contrast template. Reserve the flywheel for a mechanism that genuinely
  keeps turning (a real feedback loop / growth flywheel), not for any narrative
  that loops back once. If in doubt, ask: *would this keep going round on its own
  if no one intervened?* If no, it is not a flywheel.
- The items are **not ordered** (a flat list of parallel points → use a
  points/list template).
- The relationship is **oppositional** (a two-way contrast → use YinYang2Points)
  or a simple **two-point linkage** (→ ComparativePoints2).
- There are **more than 6 stages**, or a stage needs more than a short label +
  one line.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Title | `title` | ≤28 chars | hub headline, white Satoshi Bold, uppercased |
| Subtitle | `subtitle` | ≤40 chars | supporting line under the title in the hub |
| Centre icon | `centerIcon` | id from Icons (`-dark`) | platinum + Dodger-Blue line art, reads on the hub |
| Petals | `petals` | 2-6 items | ordered CLOCKWISE FROM THE TOP |
| Petal label | `petals[i].label` | ≤14 chars | short phase name, parallel phrasing |
| Petal body | `petals[i].body` | ≤48 chars | one supporting line, wraps inside the petal |
| Petal icon | `petals[i].icon` | id from master Icons/ (use a -dark variant) | white line icon, reads on the petal |
| Petal number | (auto) | , | rendered `01…0N` from clockwise position |

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the hub scales in (back overshoot), a faint empty donut-ring
   scaffold scales in behind it, and the hub's icon/title/subtitle fade in once
   the circle lands
2. `petal0`, the **top** petal: its fill fades/scales in, then its number →
   icon → label → body cascade
3. `petal1`, the next petal **clockwise**
4. `petal2` *(if present)*
5. `petal3` *(if present)*
6. `petal4` *(if present)*
7. `petal5` *(if present)*

Each petal is one object: the fill and all its content reveal together at that
petal's cue, going clockwise from the top.

## Narration rules

### Rule 1, Linear, clockwise, stage-by-stage (MUST)

Introduce the stages **strictly clockwise from the top**, one at a time,
matching the reveal order. Do not describe a later stage before its petal is on
screen, and do not jump across the wheel. The visual builds the loop clockwise
as you speak, so "First… then… then…" narration maps directly onto
`petal0, petal1, petal2…`.

This is not a stylistic preference: the visuals reveal each petal's fill and
content before the next petal exists on screen. Jumping around the wheel would
describe content that is not yet visible.

**GOOD (linear, clockwise):**
> "An agent learns in a loop. First, it **plans** the next move from the goal. Then it **acts**, running a tool or writing code. Next it **observes** the results and any errors. Finally it **reflects**, updating the plan from what it learned, and the loop begins again."

Maps cleanly: setup → petal0 (Plans) → petal1 (Acts) → petal2 (Observes) →
petal3 (Reflects), with the closing "begins again" landing as a re-mention
pulse on petal0.

**BAD (jumping across the wheel):**
> "It reflects and re-plans at the end, but it all starts by acting and observing first."

Jumps to the last petal before the early petals exist, and the order spoken
does not match the clockwise build.

### Rule 2, Labels are short and parallel

Each label is ≤14 chars and uses parallel grammar across all petals, all
imperative verbs (Plan, Act, Observe, Reflect) or all nouns. Avoid mixing forms
or full phrases. The longer explanation lives in the body line (≤48 chars) and
the voiceover, not the label.

### Rule 3, One icon per petal, white line art

Each petal's icon should depict the stage concretely (a clipboard for "Plan", a
lightning bolt for "Act", an eye for "Observe"). Petal icons come from the
master **Icons/** library, force-recoloured to solid white so they read on the dodger-blue
petal). The **centre icon** is a master `Icons/` id and MUST be a `-dark`
variant (platinum + Dodger-Blue line art) so it reads on the oxford-blue hub.

### Rule 4, Close the loop with a re-mention pulse

The defining feature of a flywheel is that the last stage feeds back into the
first. When the narration loops back, naming `petal0` (or any earlier petal)
again, add a `pulses` entry at that re-mention's cue time so the petal gives a
brief, subtle brand pulse rather than re-animating. The pulse comes from the
SRT, never invented.

## Variation, petal count (2-6)

The petal count is the built-in variation. Supply 2, 3, 4, 5, or 6 petals:

- The wheel **auto-divides** 360° by the count, so petals always tile the full
  ring (2 → top/bottom semicircles, 3 → top/lower-right/lower-left, 4 →
  top/right/bottom/left, and so on).
- The light→dark gradient is **re-spread** across whatever count is supplied, so
  the lightest-at-top → deepest-toward-the-end progression still reads.
- Content sits at each petal's centroid as a vertical stack, so left/right
  petals never suffer horizontal cramming regardless of count.
- Schedule one `petal{i}` per petal; `petal{i}` targets beyond `petals.length`
  are ignored.

See [`examples/agentic-loop/`](examples/agentic-loop/) for the 4-petal layout.

## Narration template (fill-in skeleton)

> "[Name the loop in one line.] First, [stage 1]. Then, [stage 2]. Next, [stage 3]. … And finally, [stage N], and the cycle begins again."

(The closing "begins again" is where a re-mention pulse on `petal0` fires.)

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.3] "An agent learns in a loop." [1.6] "First, it plans the next move." [3.0] "Then it acts, running a tool or writing code." [4.4] "Next it observes the results and any errors." [5.8] "Finally it reflects, updating the plan." [7.4] "And then it plans again."

```tsx
title="Agentic Loop"
subtitle="How a machine learns from its own actions"
centerIcon="bot"
petals={[
  { label: 'Plans',    body: 'Draft the next move from the goal',     icon: 'clipboard' },
  { label: 'Acts',     body: 'Run a tool, write code, send a call',   icon: 'zap'       },
  { label: 'Observes', body: 'Capture results, errors, side effects', icon: 'eye'       },
  { label: 'Reflects', body: 'Update the plan from what was learned', icon: 'refresh'   },
]}
timings={{
  sequence: [
    { target: 'setup',  at: 0.3, in: 1.2 },
    { target: 'petal0', at: 1.6 },
    { target: 'petal1', at: 3.0 },
    { target: 'petal2', at: 4.4 },
    { target: 'petal3', at: 5.8 },
  ],
  pulses: [{ target: 'petal0', at: 7.4 }],
}}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to Flywheel4Petals:

1. **Confirm fit.** Is the segment a genuine ongoing system that *cycles*, a
   real feedback loop or flywheel of 2-6 stages that keeps repeating by design,
   each reducible to a short label + one line? Apply the test: *would it keep
   going round on its own if no one intervened?* If it is a **one-time chain of
   events that merely ends where it began** (a single fix that failed, a
   story/post-mortem), reject this template, that is a linear sequence
   (→ Process5Steps), not a flywheel. Also reject a linear pipeline that does not
   loop (→ Process5Steps), an unordered list, an opposition (→ YinYang2Points),
   or more than 6 stages, and pick another template.
2. **Extract** the ordered stages and a ≤14-char label, a ≤48-char body, and an
   icon concept for each.
3. **Order-check, clockwise.** Ensure the narration introduces stages clockwise
   from the top, one at a time. If the source jumps around the wheel (e.g.
   mentions the outcome first), re-sequence it to run clockwise.
4. **Identify the loop-back.** Find where the narration returns to the first
   stage to close the cycle; that re-mention becomes a `pulses` entry.
5. **Emit the reveal sequence**: a `setup` step, then one `petal{i}` per stage,
   each `at` taken from the start time of the narration line that introduces
   that stage; add `pulses` for any re-mentions.

## Worked example pointer

- [`examples/agentic-loop/`](examples/agentic-loop/), a four-stage loop authored
  on the reveal-sequence model: realistic content, the matching reveal sequence,
  and one re-mention pulse. No MP4 is rendered.

## Field / prop reference

- `title`: string ≤28 chars (hub headline)
- `subtitle`: string ≤40 chars (hub supporting line)
- `centerIcon`: string, a master `Icons/` id ending `-dark` (resolves `icons/{id}.svg`)
- `petals`: array of **2-6** × `{ label: string (≤14), body: string (≤48), icon: string (master Icons/ -dark id) }`, in clockwise-from-top order
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `petal{i}` (`i` = 0-based clockwise index); `at`/`in` in seconds; `in` defaults to 1.0
- `timings.pulses`: array of `{ target, at }`; `target` is a `petal{i}`; `at` is the re-mention's scene-relative second (brief +5 % brand pulse, ~0.45 s). Empty by default; an empty array renders identically.
