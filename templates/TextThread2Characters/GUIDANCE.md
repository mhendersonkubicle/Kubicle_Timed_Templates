---
template: TextThread2Characters
title: Text Thread, Two Characters Either Side
category: dialogue
useWhen: A short back-and-forth conversation between exactly two people, shown as an SMS/iMessage thread, where each line is a single bubble and the order it is sent matters.
tags:
  - dialogue
  - conversation
  - text-thread
  - sms
  - imessage
  - chat
  - two-person
  - back-and-forth
  - exchange
  - q-and-a
layout:
  fixed: false               # bubble stack auto-lays-out for the message count
  columns: 3                 # left character panel | phone | right character panel
  messages: [3, 6]           # 3 to 6 message bubbles
  perMessage: [side, text]   # side picks the speaker/colour; text is the bubble body
slots:                       # addressable reveal targets
  - setup                    # thread frame: phone card scales/fades in + both character panels fade in
  - message0                 # each message = one chat bubble (one object), in send order
  - message1
  - message2
  - message3                 # only present when there are >= 4 messages
  - message4                 # only present when there are >= 5 messages
  - message5                 # only present when there are 6 messages
narration:
  ordering: linear-by-send-order   # bubbles land strictly in the order they are sent
  comparisonStyle: sequential      # one bubble fully before the next; never read ahead
  textMaxChars: 80
  twoSpeakersOnly: true            # exactly two participants, left and right
timing:
  model: reveal-sequence
  indexedTargets: true             # message{i}, i = 0..messages.length-1
  canonicalRevealOrder: [setup, message0, message1, message2, message3, message4, message5]
  staging: animated                # setup brings the phone card + both character panels on screen
  defaultStepInSeconds: 0.6        # per-bubble entrance (scale-pop + fade)
  defaultDurationSeconds: [10, 15]
assets:
  templateSpecific: none           # pure code + inline SVG glyphs; no bundled PNGs
  characterLibrary: shared         # leftCharacter / rightCharacter resolve from characters/
  fonts: [Satoshi-Bold, Satoshi-Medium]   # falls back to system sans if absent
---

# TextThread2Characters, Selection & Narration Guidance

## What it is

Three balanced columns on a soft platinum-blue canvas: the left speaker sits in a wild-strawberry panel, a clean white iMessage-style phone holds the thread in the middle, and the right speaker sits in a dodger-blue panel. Each speaker's panel colour matches their bubble colour, so it always reads who said which line. Under the reveal-sequence model the thread frame (the phone card and both character panels) stages in first, then each chat bubble pops in one at a time in send order, alternating sides as the conversation goes back and forth.

## Use it when

- The content is a **conversation between exactly two people**, a dialogue, a Q&A, a coaching exchange, a customer/agent back-and-forth.
- There are **3 to 6 messages** total, each reducible to a **single short line** (≤80 chars).
- The **order the messages are sent matters** (it is a thread, not a flat list of quotes).
- You want the two participants visibly **on screen** flanking the thread.

## Do NOT use it when

- There are **more than two participants** (a group chat → use a group-chat template).
- It is a **monologue** or a single quote, not a back-and-forth.
- A line cannot be reduced to a short bubble (long paragraphs → use a points/quote template).
- The relationship is a **structured comparison or process**, not a conversation (→ ComparativePoints2 / Process5Steps).
- There are **more than 6 exchanges** (trim, or split into two scenes).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Contact name | `contactName` | ≤22 chars | bold black in the phone header |
| Left speaker | `leftCharacter` | character id | renders in the wild-strawberry panel |
| Right speaker | `rightCharacter` | character id | renders in the dodger-blue panel |
| Messages | `messages` | 3-6 items | in send order; order is the reveal order |
| Message side | `messages[i].side` | `left` \| `right` | `left` ⇒ pink received bubble; `right` ⇒ blue sent bubble |
| Message text | `messages[i].text` | ≤80 chars | one or two wrapped lines in the bubble |

`side` is doubly meaningful: it picks **which on-canvas character "sent" the line** and **which colour/alignment the bubble takes**. A natural conversation alternates sides, but consecutive same-side messages are allowed.

## Reveal order (canonical)

The template reveals objects in this order, and **the narration must follow it**:

1. `setup`, the thread frame: the phone card scales up and fades in, then both character panels fade in
2. `message0`, the first bubble pops in
3. `message1`
4. `message2`
5. `message3` *(if present)*
6. `message4` *(if present)*
7. `message5` *(if present)*

Each message is one object: the whole bubble pops in at that message's cue. A bubble never appears before the one before it.

## Narration rules

### Rule 1, Linear, in send order (MUST)

Deliver the conversation **strictly in send order**, one message at a time, matching the reveal order. Do not read a later line before its bubble is on screen, and do not jump back. Because the thread is inherently sequential, "she asks… he replies… she follows up…" narration maps directly onto `message0, message1, message2…`.

**GOOD (linear, in send order):**
> "Maya pings the lead: are we still on track for Friday's demo? He replies, yep, two stories left and both in QA. She asks if he needs anything from her. Sign-off on the dashboard mockups, he says. She's on it tonight."

Maps cleanly: message0 → message1 → message2 → message3 → message4.

**BAD (reads ahead / out of order):**
> "He confirms they're on track and asks for mockup sign-off, after she opens by checking on the demo and offering help."

This describes the fourth bubble before the second exists on screen, and the order spoken does not match the build.

### Rule 2, One line per bubble, short

Each `text` is ≤80 chars, one spoken line. Keep messages to a sentence or a short question/answer so the bubble stays one or two lines. Longer context lives in the voiceover, not the bubble.

### Rule 3, Side = speaker, and alternate naturally

`side: 'left'` is the wild-strawberry speaker; `side: 'right'` is the dodger-blue speaker. A two-person exchange usually alternates, but a quick double-message from one side is fine. Keep each speaker on a consistent side for the whole thread.

### Rule 4, The frame is scaffolding, not a line

The phone card and the two character panels are part of `setup` and carry no spoken content. They stage in to establish "two people are texting" before the first bubble lands; do not treat the panels as points to narrate.

## Variation, message count (3-6)

The message count is the built-in variation. Supply 3, 4, 5, or 6 messages:

- The bubble stack **auto-lays-out** down the feed for whatever count is supplied (each bubble's height is estimated from its text and the next bubble stacks below it).
- Each bubble's colour and alignment follow its `side`, independent of count.
- Schedule one `message{i}` per message; `message{i}` targets beyond `messages.length` are ignored.

See [`examples/sprint-check-in/`](examples/sprint-check-in/) for a full six-message thread with a re-mention pulse.

## Narration template (fill-in skeleton)

> "[Set the scene: who is texting whom, in one line.] [Speaker A] says, [message 0]. [Speaker B] replies, [message 1]. [Speaker A], [message 2]. [Speaker B], [message 3]. …"

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "Maya checks in with her lead over text." [1.0] "Are we still on track for Friday's demo?" [2.8] "Yep, two stories left, both in QA." [4.6] "Need anything from me before then?" [6.4] "Sign-off on the dashboard mockups would help." [8.2] "On it tonight." [10.0] "Perfect, thanks Maya." [12.5] "...the Friday demo is locked in."

```tsx
contactName="Maya"
leftCharacter="female_earlycareer_white"
rightCharacter="male_middleage_black"
messages={[
  { side: 'left',  text: 'Quick check, are we still on track for sprint demo Friday?' },
  { side: 'right', text: 'Yep. Two stories left, both in QA.' },
  { side: 'left',  text: 'Nice. Need anything from me before then?' },
  { side: 'right', text: 'Sign-off on the new dashboard mockups would help.' },
  { side: 'left',  text: 'On it tonight. Feedback by EOD tomorrow.' },
  { side: 'right', text: 'Perfect, thanks Maya.' },
]}
timings={{
  sequence: [
    { target: 'setup',    at: 0.2, in: 0.9 },
    { target: 'message0', at: 1.0 },
    { target: 'message1', at: 2.8 },
    { target: 'message2', at: 4.6 },
    { target: 'message3', at: 6.4 },
    { target: 'message4', at: 8.2 },
    { target: 'message5', at: 10.0 },
  ],
  // The first message (the Friday demo) is referenced again at 12.5 s, so it
  // gives a brief brand pulse without re-animating.
  pulses: [{ target: 'message0', at: 12.5 }],
}}
```

## Reprocessing directive (adapting an existing script to this template)

When fitting a script segment to TextThread2Characters:

1. **Confirm fit.** Is the segment a back-and-forth between *exactly two* people, 3-6 exchanges, each reducible to a short line? If there are more participants, it is a monologue, or the lines are long, reject this template and pick another.
2. **Extract** the messages in send order, assign each to a `side` (one speaker per side), and pick `leftCharacter` / `rightCharacter` + a `contactName`.
3. **Order-check.** Ensure the narration introduces the messages strictly in send order, one at a time. If the source summarises both speakers at once, re-sequence it to walk the thread line by line. This re-sequencing is the most common edit.
4. **Compress** each line to a ≤80-char bubble.
5. **Emit the reveal sequence**: a `setup` step (the thread frame), then one `message{i}` per message, each `at` taken from the start time of the narration line that delivers that message.
6. **Add re-mention pulses** (optional): if a line already on screen is referenced again later, add `{ target: message{i}, at }` to `timings.pulses` at the re-mention's cue time.

## Worked example pointer

- [`examples/sprint-check-in/`](examples/sprint-check-in/), a full six-message thread authored on the reveal-sequence model: realistic content, the matching reveal sequence, and one re-mention pulse. No MP4 is rendered.

## Field / prop reference

- `contactName`: string (≤22) shown bold-black in the phone header
- `leftCharacter` / `rightCharacter`: character ids (resolve `characters/{id}.png`); both render at one fixed framing
- `messages`: array of **3-6** × `{ side: 'left' | 'right', text: string (≤80) }`, in send order
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `message{i}` (`i` = 0-based message index); `at`/`in` in seconds; `in` defaults to 0.6
- `timings.pulses`: array of `{ target, at }`; `target` is a `message{i}` (setup is not pulsable); `at` is the re-mention cue time in seconds
