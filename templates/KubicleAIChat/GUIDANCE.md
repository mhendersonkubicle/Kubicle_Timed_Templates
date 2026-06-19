---
template: KubicleAIChat
title: AI Chat, Gemini-Style Prompt and Answer
category: narrative
useWhen: A single question-and-answer exchange with an AI assistant, where a user prompt is asked and the assistant replies with a short intro plus 2-4 numbered points, and you want the on-screen chat to build like a live conversation.
tags:
  - chat
  - ai
  - conversation
  - question-answer
  - assistant
  - prompt
  - gemini
  - transcript
  - dialogue
layout:
  fixed: false               # the answer section count varies (2-4)
  shell: chat-window         # oxford-blue window: header + feed + input bar
  sections: [2, 4]           # 2 to 4 numbered answer sections
  perSection: [heading, body]
slots:                       # addressable reveal targets
  - setup                    # chat shell slides up + centred greeting fades in
  - prompt                   # user prompt types into the bar, then morphs to the user bubble
  - intro                    # AI typing pulse, then brand badge + intro paragraph
  - message0                 # numbered answer section 0 (heading + body, one object)
  - message1
  - message2                 # only present when there are >= 3 sections
  - message3                 # only present when there are 4 sections
narration:
  ordering: linear-transcript    # prompt first, then answer intro-first, section by section
  comparisonStyle: sequential    # one turn fully before the next; never out of order
  greetingMaxChars: 56
  promptMaxChars: 140
  headingStyle: numbered         # "1. ", "2. " for the Gemini list look
  bodyMaxChars: 220
timing:
  model: reveal-sequence
  indexedTargets: true           # message{i}, i = 0..sections.length-1
  canonicalRevealOrder: [setup, prompt, intro, message0, message1, message2, message3]
  staging: animated              # setup slides the whole chat shell up + greeting fades in
  defaultStepInSeconds: 0.6      # per-section entrance (pop-in); prompt needs ~3.0 for type+morph; intro ~1.2 for pulse+fade
  defaultDurationSeconds: [12, 16]
assets:
  templateSpecific: Template-Specific-Assets/   # the white Kubicle logo PNG (header + AI badge)
  iconLibrary: none              # no shared-library icons; brand mark is the one bundled PNG
  iconVariant: n/a               # no library icons rendered; the bundled logo is white artwork on dark, no -dark/-light selection
  fonts: [Satoshi-Bold, Satoshi-Medium]   # falls back to system sans if absent
---

# KubicleAIChat, Selection & Narration Guidance

## What it is

A Gemini-style AI chat scene. The whole chat UI shell (an oxford-blue window with a header, feed, and input bar) slides up from below the canvas with a back-overshoot, and a large centred greeting fades in over the splash. The user's prompt then types into the input bar character by character and morphs (squash & stretch) into a right-aligned blue user bubble at the top of the feed. The Kubicle AI then "thinks" (a three-dot typing pulse), the intro paragraph fades in beneath the bubble, and 2 to 4 numbered answer sections pop in one at a time. Under the reveal-sequence model the chat builds exactly like a live conversation: scaffolding first, then the question, then the answer, point by point.

## Use it when

- The beat is a **single question-and-answer exchange** with an AI assistant (or any chat-style speaker), framed as a prompt and a structured reply.
- The reply reduces to a **short intro sentence plus 2 to 4 numbered points**, each a bold heading and a short body.
- You want the on-screen content to read as a **live, building conversation** (typing, a thinking pulse, answer landing piece by piece).

## Do NOT use it when

- The content is **not conversational**, a flat list of parallel points, a process, or a comparison reads better on a dedicated points/process/comparison template.
- The answer has **more than 4 sections**, or a section cannot be reduced to a heading + short body.
- There is **no question/prompt** to anchor the exchange (use a points or summary template instead).
- The exchange is **multi-turn** (several back-and-forth messages between two speakers); this template is one prompt and one structured answer.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Brand | `brand` | ≤24 chars | header name, defaults to "Kubicle AI" |
| Greeting | `greeting` | ≤56 chars | big centred splash greeting |
| Subline | `subline` | ≤72 chars | optional dim line under the greeting |
| Input placeholder | `inputPlaceholder` | ≤40 chars | shown in the empty bar, defaults to "Ask Kubicle AI" |
| User prompt | `userPrompt` | ≤140 chars | the question that types in and becomes the bubble |
| Answer intro | `response.intro` | ≤200 chars | one or two sentences framing the answer |
| Answer sections | `response.sections` | 2-4 items | each `{ heading (≤48), body (≤220) }` |

## Reveal order (canonical)

1. `setup`, the chat shell slides up and the centred greeting fades in (scaffolding + greeting)
2. `prompt`, the user prompt types into the bar, then morphs into the user bubble
3. `intro`, the AI typing pulse plays, then the brand badge + intro paragraph fade in
4. `message0`, the first numbered answer section (heading + body)
5. `message1`
6. `message2` *(if present)*
7. `message3` *(if present)*

Each step is one object: the prompt step types AND morphs as a unit; the intro step plays the pulse AND fades the paragraph; each `message{i}` reveals its whole section together.

## Narration rules

### Rule 1, Linear transcript order (MUST)

Narration must follow the conversation as it builds: greet, ask the prompt, then deliver the answer intro-first and section by section, in order. Do not describe section 3 before sections 1 and 2 are on screen, and do not deliver the answer before the prompt has been asked. The visual builds the transcript top to bottom as you speak.

**GOOD:** "Let's ask Kubicle AI how to write a clear lesson script. It starts with the essentials: a strong opening, tight structure, and reading it aloud. **First**, open with the why. **Then**, chunk the body into a few beats. **And finally**, read it aloud before recording."

**BAD:** "The answer ends on reading it aloud, but it opens with the why, and somewhere in the middle it says to chunk things." (Jumps to the last section first, and the order spoken does not match the build.)

### Rule 2, The prompt is one tight question

`userPrompt` is a single realistic question (≤140 chars), ideally how-to or advice-seeking. It types in, so keep it to one line of intent, not a paragraph.

### Rule 3, Headings are numbered and parallel

Start each section heading with a number ("1. ", "2. ") for the Gemini list look, and keep the headings parallel (all imperative verbs, or all noun phrases). The body carries the detail; keep it to one or two sentences.

### Rule 4, The greeting and shell are scaffolding, not a point

The greeting, subline, and input placeholder are part of `setup`/the splash and carry no answer content. Use the greeting to set the scene ("Hey Matthew, what should we work on?"), not to deliver a point.

## Variation, section count (2-4)

The answer section count is the built-in variation. Supply 2, 3, or 4 sections:

- The answer feed **auto-stacks** the sections below the intro paragraph, and each section is positioned below the estimated height of the ones above it, so taller bodies still clear.
- The AI response block sits below whatever height the user bubble grows to, so a long multi-line prompt never overlaps the answer.
- Schedule one `message{i}` per section; `message{i}` targets beyond `response.sections.length` are ignored.

See [`examples/lesson-script-tips/`](examples/lesson-script-tips/) for a worked 3-section example.

## Narration template (fill-in skeleton)

> "[Greeting / set the scene.] [Ask the prompt as one question.] [Intro sentence framing the answer.] First, [section 1 heading]: [section 1 detail]. Then, [section 2 heading]: [section 2 detail]. [And finally, [section 3 heading]: [section 3 detail].]"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Let's open Kubicle AI." [1.8] "How do I write a clear lesson script?" [5.2] "It comes down to three things." [6.6] "First, open with the why." [8.2] "Then chunk it into a few beats." [9.8] "And finally, read it aloud before recording."

```tsx
greeting="Hey User, what's on your mind?"
userPrompt="How do I write a clear lesson script?"
response={{
  intro: 'It comes down to three things: a strong opening, tight structure, and reading it aloud.',
  sections: [
    { heading: '1. Open with the why', body: 'Start with a single sentence that tells the learner what they will be able to do.' },
    { heading: '2. Chunk into a few beats', body: 'Break the body into a small number of clear sections, each making one point.' },
    { heading: '3. Read it aloud', body: 'Speak it through once; anywhere you stumble is a sentence that needs rewriting.' },
  ],
}}
timings={{ sequence: [
  { target: 'setup',    at: 0.2, in: 1.4 },
  { target: 'prompt',   at: 1.8, in: 3.0 },
  { target: 'intro',    at: 5.2, in: 1.2 },
  { target: 'message0', at: 6.6 },
  { target: 'message1', at: 8.2 },
  { target: 'message2', at: 9.8 },
] }}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to KubicleAIChat:

1. **Confirm fit.** Is the segment a single question with a structured answer of 2-4 points? If it is a flat list, a process, a comparison, or multi-turn dialogue, pick another template.
2. **Extract** the question (the `userPrompt`), a one-or-two-sentence intro, and 2-4 sections (a numbered heading + a short body each).
3. **Order-check.** Ensure the narration asks the prompt before delivering the answer, and delivers the answer intro-first then section by section. If the source jumps to a later point first, re-sequence it to run straight through.
4. **Compress** the prompt to ≤140 chars, the intro to ≤200, each heading to ≤48 (number-prefixed), each body to ≤220.
5. **Emit the reveal sequence**: a `setup` step, a `prompt` step (give it a longer `in`, ~3.0, to cover typing + morph), an `intro` step (~1.2 for the pulse + paragraph fade), then one `message{i}` per section, each `at` taken from the start time of the narration line that introduces it.

## Worked example pointer

- [`examples/lesson-script-tips/`](examples/lesson-script-tips/), full example authored on the reveal-sequence model: a realistic prompt + 3-section answer plus the matching reveal sequence and a couple of re-mention pulses. No MP4 is rendered.

## Field / prop reference

- `brand`: string (≤24), optional, defaults to "Kubicle AI"
- `greeting`: string (≤56)
- `subline`: string (≤72), optional
- `inputPlaceholder`: string (≤40), optional, defaults to "Ask Kubicle AI"
- `userPrompt`: string (≤140)
- `response`: `{ intro: string (≤200), sections: array of 2-4 × { heading: string (≤48), body: string (≤220) } }`
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup`, `prompt`, `intro`, or `message{i}` (`i` = 0-based section index); `at`/`in` in seconds; `in` defaults to 0.6 (give `prompt` ~3.0 and `intro` ~1.2)
- `timings.pulses`: array of `{ target, at }`; `target` is a content object (`prompt`, `intro`, or `message{i}`, never `setup`); `at` is the scene-relative second of a re-mention. Empty by default (renders identically with no pulses)
