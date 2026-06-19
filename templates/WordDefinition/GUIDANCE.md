---
template: WordDefinition
title: Word Definition, Vocabulary Card
category: definition
useWhen: Naming and defining a single term, a glossary card, key concept, or jargon-buster, where the screen carries exactly one word and its definition.
tags:
  - definition
  - vocabulary
  - glossary
  - term
  - concept
  - jargon
  - key-word
  - single-subject
layout:
  fixed: true            # fixed geometry, exactly one title + one description
  title: 1
  description: 1
  variation: none        # no count variation; brand-locked colours and background
slots:                   # every addressable element (also the reveal targets)
  - setup                # decorative chrome: banner (drops from top) + icon pill (slides from right), together
  - title                # the word being defined (typewriter character-stagger reveal)
  - description          # the definition text (fade-in below the title)
narration:
  ordering: name-then-define     # say the word first, then deliver its definition
  beats: 2                       # exactly two content beats: title, then description
  termsPerCard: 1                # one term per card; never define more than one
  titleMaxChars: 40
  descriptionMaxChars: 200       # aim under 120 so it fits 2-3 lines
timing:
  model: reveal-sequence
  fixedTargets: true             # named slots, not indexed
  canonicalRevealOrder: [setup, title, description]
  defaultStepInSeconds: 0.6      # entrance duration (slide / type / fade)
  defaultDurationSeconds: [6, 10]
assets:
  templateSpecific: Template-Specific-Assets/   # word_definition_banner.png + icon_pill.png
  iconLibrary: none                              # no shared Icon/Small-Icon library usage
  fonts: [Inter-ExtraBold, Satoshi-Medium]       # falls back to system sans if absent
---

# WordDefinition, Selection & Narration Guidance

## What it is

A single-subject vocabulary card on a platinum-blue gradient stage. Decorative chrome (a top-left banner that drops in from above and a top-right icon pill that slides in from the right) settles first; the word being defined then types out letter-by-letter near-black top-left; and its definition fades in below. The content reveals one object at a time under the reveal-sequence timing model.

## Use it when

- You are **naming and defining exactly one term**, a glossary entry, a key concept, a piece of jargon to unpack.
- The screen carries **one word and one definition**, nothing more.
- The narration follows the natural shape of a definition: say the word, then explain what it means.

## Do NOT use it when

- You have **more than one term** to define (define them on separate cards, or use a list template).
- The content is a **comparison, process, or list** rather than a single definition (use YinYang2Points, Process5Steps, or a points template).
- The definition is **too long to fit 2-3 lines** (≈120 chars), tighten it or move the detail to voiceover.
- You need the term and its definition on screen **before** you narrate them (the model reveals strictly name-then-define).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Word | `title` | ≤40 chars, types in | the term being defined; near-black ink (colour locked) |
| Definition | `description` | ≤200 chars (aim ≤120) | warm-grey, wraps to 2-3 lines |

The layout is fully fixed: one title, one description, single geometry, brand-locked colours and background. Box/text sizes and positions are constant.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, banner drops in from the top and the icon pill slides in from the right, together
2. `title`, the word types out letter-by-letter
3. `description`, the definition fades in below the title

The `setup` chrome carries no narration; the two content beats are `title` then `description`.

## Narration rules

### Rule 1, Name, then define (MUST)

Deliver the card as a **linear two-beat definition**: name the word first (it maps to the `title` reveal), then deliver its meaning (it maps to the `description` reveal). Never explain the definition before naming the word, and keep it to **one term per card**. This specialises the universal "narration order = reveal order" rule into: name, then define.

The visual reveals the word before the definition exists on screen, so describing the meaning first would leave the viewer reading an explanation with no term attached to it.

**GOOD (name, then define):**
> "Serendipity. It's the occurrence of events by chance in a happy or beneficial way."

Maps cleanly: title → description.

**BAD (define before naming / multiple terms):**
> "When good things happen to you by pure chance, and a related idea is fortuity, we call that serendipity."

This delivers the meaning before the word is named, and drags in a second term. The definition is spoken while only the empty stage (or a half-typed word) is visible, and the card has room for just one term.

### Rule 2, The title is a single term

Keep the title to the word (or short phrase) being defined, ≤40 chars. It types out character-by-character, so a tight single term reads best, not a sentence.

### Rule 3, The definition is one tight sentence

State the meaning in one clear sentence, ≤200 chars and ideally under 120 so it fits 2-3 lines without crowding the icon pill. Longer elaboration belongs in the voiceover, not on the card.

### Rule 4, Chrome is silent

The `setup` step (banner + pill) is decorative and carries no narration. Schedule it before the title so the stage is dressed by the time the word types in.

## Variation, none

This template has **no count variation**. There is always exactly one title and one description, with single fixed geometry and brand-locked colours and background. The only optional behaviour is internal to the `title` step: the word reveals via the typewriter character-stagger, whose pace is driven by that step's `in` duration (a longer `in` types more slowly). That is an entrance style, not a count, so the prop surface and layout never change.

## Narration template (fill-in skeleton)

> "[The word.] [One sentence defining what it means.]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.8] "Serendipity." [2.6] "It's the occurrence of events by chance in a happy or beneficial way."

```tsx
title="Serendipity"
description="The occurrence of events by chance in a happy or beneficial way."
timings={{ sequence: [
  { target: 'setup',      at: 0.3, in: 1.4 },
  { target: 'title',      at: 0.8, in: 1.3 },
  { target: 'description', at: 2.6, in: 1.6 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to WordDefinition:

1. **Confirm fit.** Is the segment defining a *single* term? If it compares, lists, or sequences, reject this template and pick another.
2. **Extract** the one word (or short phrase) being defined and its single-sentence meaning.
3. **Re-sequence to name-then-define.** If the source explains the concept before naming it, rewrite so the word is spoken first, then the definition, matching the canonical reveal order. This is the most common edit.
4. **Compress** the title to ≤40 chars and the definition to one tight sentence (≤200 chars, ideally ≤120 for 2-3 lines).
5. **Emit the reveal sequence**: a silent `setup` step for the chrome, then `title` and `description`, each `at` taken from the start time of the narration line that introduces it.

## Worked examples (rendered)

- [`examples/serendipity/`](examples/serendipity/), a glossary card authored from a two-beat definition: the authored scene + reveal sequence (no MP4; layout/timing reference).

## Field / prop reference

- `title`: `string` (1-40 chars), the word being defined; near-black ink (colour locked)
- `description`: `string` (1-200 chars; aim ≤120), warm-grey definition, wraps to 2-3 lines
- `timings.sequence`: array of `{ target, at, in? }`; `target` ∈ the slot list above (`setup`, `title`, `description`); `at`/`in` in seconds; `in` defaults to 0.6
