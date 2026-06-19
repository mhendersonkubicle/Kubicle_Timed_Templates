---
template: LessonTitle
title: Lesson Title, Opening Card
category: title
useWhen: The opening card of a lesson, naming the course, the lesson number, and the lesson headline on a branded full-bleed background.
tags:
  - title
  - opener
  - lesson-title
  - intro
  - course
  - cover
layout:
  fixed: true                 # single fixed composition, no count variation
  perCard: [courseTitle, lessonNumber, lessonTitle, optional courseIcon, brand badge]
slots:                        # addressable reveal targets
  - setup                     # full-bleed background image fades in
  - logo                      # course logo row (optional icon + course title), drops in
  - label                     # the "Lesson <word>" eyebrow, slides in from the left
  - title                     # the lesson headline, slides in from the left
  - badge                     # bottom-right brand badge, pops in
narration:
  ordering: single-beat        # an opener; usually one welcome/framing line over the whole build
  comparisonStyle: none
  courseTitleMaxChars: 80
  lessonTitleMaxChars: 120
timing:
  model: reveal-sequence
  canonicalRevealOrder: [setup, logo, label, title, badge]
  defaultStepInSeconds: 0.55
  defaultDurationSeconds: [6, 10]
assets:
  templateSpecific: Template-Specific-Assets/   # lesson_title_background.png, logo.png
  iconLibrary: optional                          # courseIconUrl is an optional tinted mask image
  fonts: [Inter-SemiBold, Inter-Bold, Inter-ExtraBold]
---

# LessonTitle, Selection & Narration Guidance

## What it is

The opening card of a lesson. A full-bleed branded background carries a course logo row at top-left (optional tinted course icon + course title), an accent "Lesson <word>" eyebrow, a large lesson headline, and a brand badge bottom-right. Under the reveal-sequence model the background fades in first, then the logo, eyebrow, headline, and badge build in.

## Use it when

- It is the **first scene of a lesson** (or a section opener), announcing the course, the lesson number, and the lesson's headline.
- You have a course name, a lesson number (1 to 99), and a short lesson headline.

## Do NOT use it when

- You need to state a learning **goal/objective** (use LessonGoal).
- You need to **define a term** (use WordDefinition) or list content (use a list/points template).
- The screen is not a lesson opener.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Course name | `courseTitle` | <=80 chars, one line | top-left, next to the optional course icon |
| Lesson number | `lessonNumber` | int 1 to 99 | always rendered "Lesson <word>" (1 -> "Lesson One"); 21+ render as digits |
| Lesson headline | `lessonTitle` | <=120 chars (aim <60) | the big headline; may wrap to two lines |
| Course icon | `courseIconUrl` | optional URL | tinted with the accent; skipped if absent or it fails to load |

## Reveal order (canonical)

1. `setup`, the background image fades in
2. `logo`, course logo row drops in
3. `label`, the "Lesson <word>" eyebrow slides in
4. `title`, the lesson headline slides in
5. `badge`, the brand badge pops in

## Narration rules

### Rule 1, Single framing beat

A title card is an opener, not a content scene. It usually carries one welcome or framing line of voiceover over the whole build (e.g. the course intro), rather than a separate cue per element. Schedule the elements close together so the card assembles as one beat.

### Rule 2, Headline is short and titular

The lesson headline is a short title phrase, not a sentence. Aim under 60 characters so it lands on one or two lines. The course name is one line, under ~35 characters reads best beside the icon.

## Variation

This is a fixed single-card layout, there is **no count variation**. The only optional element is the **course icon** (`courseIconUrl`): supply a transparent mask image to show a brand-tinted icon beside the course title, or omit it and the course title shows alone. The accent colour (Dodger Blue) is locked.

**Course identity must be IDENTICAL across every lesson of a course.** The top-left identifier (the `courseTitle` text and the `courseIconUrl` icon) is the course's identity, not a per-lesson choice. Use the exact same `courseTitle` string verbatim in every lesson (do not paraphrase or re-derive it) and the exact same course icon every lesson. When building a later lesson, copy the course title + icon from an earlier lesson's `LessonTitle`; never let them drift between lessons. (The brand badge bottom-right is fixed `logo.png` and is always consistent.)

## Narration template (fill-in skeleton)

> "[Welcome / one-line framing of the course or lesson.]" (spoken over the whole card build)

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is this the lesson/section opener (a title, not a goal or content)? If it states an objective, route to LessonGoal instead.
2. **Extract** the course name, the lesson number, and a short lesson headline (tighten the headline to a titular phrase under ~60 chars).
3. **Voiceover** is the welcome/framing line, kept as a single beat; no per-element re-sequencing is needed.
4. **Emit the reveal sequence**: setup, logo, label, title, badge, scheduled close together.

## Worked example (rendered)

See [`examples/lesson-opener/`](examples/lesson-opener/) for the authored opener (course "Connecting AI Agents to Systems", Lesson One, "From Map to Connection").

## Field / prop reference

- `courseTitle`: string (1 to 80)
- `lessonNumber`: integer 1 to 99 (rendered "Lesson <word>")
- `lessonTitle`: string (1 to 120)
- `courseIconUrl`: optional URL (tinted mask icon)
- `timings.sequence`: array of `{ target, at, in? }`; `target` is one of setup, logo, label, title, badge; `at`/`in` in seconds; `in` defaults to 0.55

## Timing: front-loaded opener (do NOT anchor to narration)

This is a lesson opener. Its reveals MUST animate in over the first ~2.5 seconds,
regardless of when the voiceover gets to them. `fit-timing.py` front-loads this
automatically when the scene plan carries `template: LessonTitle`: setup at 0.2,
then logo / label / title / badge at roughly 0.7 / 1.3 / 1.9 / 2.5. Never anchor
these reveals to SRT cue times, the opening card should be fully built early.
