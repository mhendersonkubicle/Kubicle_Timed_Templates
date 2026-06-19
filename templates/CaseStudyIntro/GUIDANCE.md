---
template: CaseStudyIntro
title: Case Study Intro (logo card)
category: case-study
useWhen: The narration introduces a CASE STUDY / worked example about a specific (usually named) company. This is the simple establishing card that lands the company; the case-study detail goes in the NEXT scene.
tags:
  - case-study
  - example
  - company
  - logo
  - establishing
slots:
  - setup          # platinum card + eyebrow fade in
  - eyebrow        # small "CASE STUDY" Dodger-Blue eyebrow
  - logo           # the made-up company logo, dead centre (name is in the artwork)
narration:
  ordering: eyebrow -> logo
timing:
  model: reveal-sequence
  canonicalRevealOrder: [setup, eyebrow, logo]
  staging: animated
  defaultDurationSeconds: [3, 8]
assets:
  templateSpecific: none       # pure code card, no bundled PNGs
  logoLibrary: shared          # logo resolves from Logos/ -> staged to public/logos/<id>.svg
  logoVariant: -light          # the light card -> a -light fictional logo (dark wordmark + blue mark)
  fonts: [Inter-ExtraBold]
---

# CaseStudyIntro, Selection & Narration Guidance

## What it is

A clean establishing card for a case study: a platinum background with a small
Dodger-Blue **CASE STUDY** eyebrow and a **made-up company logo centred dead in
the middle** (the wordmark carries the company name, so there is no other text).
That is the whole scene, it just lands the company.

## Use it when

- The narration introduces a **case study / worked example about a specific
  company** ("we'll follow a fictional firm called FinSage..."). Use this card for
  the **moment the company is named**.
- The case-study **detail** (what the company is, its situation, its points) goes
  in the **NEXT scene**, using an ICON-LEFT / BULLETS-RIGHT single-colour template:
  `Checklist5Pills` (hero icon left + bullet pills right), or `Topic1Subtopics6` if
  not already used. Do NOT use the cycling `IconPointsV1` (a case-study follow-up is
  short, there is no time to cycle through all the points one at a time) or the
  multicoloured `Points3Subtopics2`. Keep this card to just the logo; do not try to
  put the detail on it.

## Do NOT use it when

- The content is a **general concept**, not a company example. A concept wants an
  **icon** (resolve it normally), never a company logo. This is the key
  distinction: a company example shows a **logo**; a concept shows an **icon**.
- A **real named product** (Excel, Power BI, Teams, Claude) is the subject. Use a
  `Logos/Software/` id, not a fictional company.

## The logo, NOT an icon

The image is a **fictional company logo** from `Logos/Fictional-Company-Logos/`
(41 companies, `Company-<Name>-light.svg` / `-dark.svg`). The card is light, so
use the **`-light`** variant. The company name is in the artwork, so do not add it
as text.

- List options: `python script-pipeline/stage-logos.py --list`.
- Stage it: `python script-pipeline/stage-logos.py --dest <public>/logos --ids Company-<Name>-light`.
- For a real product, pass a `Logos/Software/` id.

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Eyebrow | `eyebrow` | <=24 chars | defaults to "Case Study"; Dodger-Blue, uppercased |
| Logo | `logo` | a Logos id WITH variant | e.g. `Company-FinSage-light`; resolves `logos/<id>.svg` |

## Reveal order (canonical)

1. `setup`, the platinum card establishes and the eyebrow fades in.
2. `logo`, the company logo rises + fades in, dead centre.

The narration introduces it simply: name that it's an example, name the company.
The detail follows in the next scene.

## Narration template (fill-in skeleton)

> "Throughout this course we'll follow [Company]."  (the logo lands on the name; the
> next scene then unpacks who [Company] is.)

## Reprocessing directive

1. Use CaseStudyIntro for the **beat where the company is named** (logo only).
2. Pick a fictional `Company-<Name>-light` id (or a `Software/` id for a real
   product). Never resolve the company to an icon.
3. Route the case-study **detail/points to the FOLLOWING scene** with an icon-left /
   bullets-right single-colour template (Checklist5Pills preferred; Topic1Subtopics6 if free), not a cycling or multicoloured
   template; do not put it on this card.
4. Reveal sequence: `setup`, then `logo` on the company's name.

## Field / prop reference

- `eyebrow`: string <=24 (default "Case Study")
- `logo`: string, a Logos id with variant, resolves `logos/<id>.svg`
- `timings.sequence`: `{ target, at, in? }`; targets `setup | eyebrow | logo`
- `timings.pulses`: `{ target, at }`; target `logo`
