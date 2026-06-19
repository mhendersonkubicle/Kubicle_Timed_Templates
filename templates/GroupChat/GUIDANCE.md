---
template: GroupChat
title: Group Chat, Full-Bleed Conversation Window
category: conversation
useWhen: A multi-voice conversation of 3-8 short messages revealed one at a time in conversation order, dramatising a discussion (manager + team, panel, support thread) inside a chat window.
tags:
  - conversation
  - chat
  - dialogue
  - messages
  - discussion
  - group
  - thread
  - back-and-forth
  - voices
layout:
  fixed: false               # the message feed auto-scrolls for the message count
  messages: [3, 8]           # 3 to 8 messages
  perMessage: [avatar, author, bubble]
slots:                       # addressable reveal targets
  - setup                    # chat frame (window panel + header + footer) bounces up
  - message0                 # each message = avatar/name + optional typing pulse + bubble (one object)
  - message1
  - message2
  - message3                 # only present when there are >= 4 messages
  - message4                 # only present when there are >= 5 messages
  - message5                 # only present when there are >= 6 messages
  - message6                 # only present when there are >= 7 messages
  - message7                 # only present when there are 8 messages
narration:
  ordering: linear-by-message    # introduce messages strictly in conversation order
  comparisonStyle: sequential    # one message fully before the next; no jumping ahead
  textMaxChars: 110
  authorMaxChars: 22
  voiceStyle: distinct           # each speaker is a distinct named voice
timing:
  model: reveal-sequence
  indexedTargets: true           # message{i}, i = 0..messages.length-1
  canonicalRevealOrder: [setup, message0, message1, message2, message3, message4, message5, message6, message7]
  defaultStepInSeconds: 1.0      # per-message entrance (typing pulse -> bubble bounce-in)
  staging: animated              # setup brings the chat frame on screen (bounces up from below)
  defaultDurationSeconds: [9, 16]
assets:
  templateSpecific: none         # pure code + SVG (avatars are generated coloured circles); no bundled PNGs
  iconLibrary: none              # renders no library icons; immune to the icon-contrast principle
  iconVariant: n/a               # no icon slots
  fonts: [Satoshi-Bold, Satoshi-Medium]   # falls back to system sans if absent
---

# GroupChat, Selection & Narration Guidance

## What it is

A full-bleed desktop chat window styled like WhatsApp but recoloured into our oxford-blue palette. The window floats as a high-contrast dark card on a platinum base: a header strip (group name, member count, member avatars), a message feed in the middle, and a faux "Message" input bar at the bottom. Under the reveal-sequence model the whole chat frame bounces up into place first (`setup`), then each message reveals one at a time, its avatar and author name fade in, a typing pulse plays (for "them" messages), and the bubble bounces in. As the feed fills, older messages scroll up so the latest line stays in view.

## Use it when

- The content is a **conversation between named voices**, a manager and their team, a panel, a customer-support thread, a debate.
- There are **3 to 8 short messages**, each reducible to one line (≤110 chars).
- The point of the beat is the **back-and-forth itself**, hearing several distinct people respond to one another, not a single narrator's list.
- You want one voice to read as "you" / the protagonist (right-aligned), optionally.

## Do NOT use it when

- The content is a **monologue** or a flat list of points from one source (use a points/list template).
- The messages are **not ordered** or do not build on each other as a dialogue.
- There are **fewer than 3 or more than 8** messages, or a single message needs more than ~110 chars.
- The relationship is a **process/workflow** (use Process5Steps) or a **two-way contrast** (use YinYang2Points / ComparativePoints2).

## Content model

| Element | Field | Limit | Notes |
|---|---|---|---|
| Messages | `messages` | 3-8 items | in conversation order, top → bottom |
| Author | `messages[i].author` | ≤22 chars | one tint per author, by first appearance |
| Text | `messages[i].text` | ≤110 chars | wraps to 2 lines if long |
| From me | `messages[i].fromMe` | optional bool | right-aligns in a dodger-blue bubble, no avatar/name/typing |
| Typing | `messages[i].showTyping` | optional bool | defaults true for left messages except the first; ignored when `fromMe` |
| Group name | `groupName` | ≤36 chars | header title |
| Member count | `memberCount` | positive int | header subtitle ("N members") |

## Reveal order (canonical)

1. `setup`, the chat frame (window panel + header + footer) bounces up from below the canvas as one unit
2. `message0`, first message (avatar/name + bubble; no typing pulse by default)
3. `message1`
4. `message2`
5. `message3` *(if present)*
6. `message4` *(if present)*
7. `message5` *(if present)*
8. `message6` *(if present)*
9. `message7` *(if present)*

Each message is one object: its avatar, name, optional typing pulse, and bubble reveal together at that message's cue, and the feed scrolls up by a row to make room.

## Narration rules

### Rule 1, Linear, message-by-message (MUST)

Introduce the messages **strictly in conversation order**, one at a time, matching the reveal order. Do not voice a later message before its bubble is on screen, and do not jump back. The feed builds top to bottom as the conversation plays, so a back-and-forth read maps directly onto `message0, message1, message2…`.

**GOOD:** "Robert kicks it off: GPT-4 costs are getting tough. Margaret pushes back, what about quality? Jake adds that Haiku has been great for classification. Kim suggests routing by complexity. And Chloe offers to set up the eval suite."

**BAD:** "Eventually Chloe builds the eval suite, but it all started when Robert raised the cost problem." (Jumps to the last message before the earlier bubbles exist, and the order spoken doesn't match the build.)

### Rule 2, One short line per message

Each message is ≤110 chars and reads as one spoken line. Keep each turn to a single idea; longer context lives in the surrounding voiceover, not the bubble.

### Rule 3, Distinct, consistent voices

Give each speaker a stable `author` name (≤22 chars). Tints are assigned by first appearance, so up to five distinct authors read as clearly separate voices. Mark the protagonist's lines `fromMe: true` for the two-sided look, and keep that voice consistent.

## Variation, message count (3-8)

The message count is the built-in variation. Supply 3 to 8 messages:

- The feed **auto-scrolls** as messages land, so the newest line always sits at the bottom and older lines slide up out of view, reading cleanly at any count.
- Author tints and header avatars are assigned by first appearance, so adding or removing speakers re-flows automatically.
- Schedule one `message{i}` per message; `message{i}` targets beyond `messages.length` are ignored.

See [`examples/cost-debate/`](examples/cost-debate/) for a six-message team discussion.

## Narration template (fill-in skeleton)

> "[Set the scene in one line.] [Speaker 1] says [message 1]. [Speaker 2] replies [message 2]. [Speaker 3] adds [message 3]. … [Final speaker] [message N]."

## Reprocessing directive (adapting an existing script to this template)

1. **Confirm fit.** Is the segment a conversation of 3-8 short turns between named voices, building in order? If it is a monologue, an unordered list, a process, or a contrast, pick another template.
2. **Extract** each turn as `{ author, text (≤110), fromMe? }` in conversation order.
3. **Order-check.** Ensure the narration voices the turns in conversation order, one at a time. If the source summarises out of order (e.g. mentions the conclusion first), re-sequence it to play straight through.
4. **Assign voices.** Give each speaker a stable ≤22-char name; mark the protagonist's lines `fromMe: true`.
5. **Emit the reveal sequence**: a `setup` step, then one `message{i}` per message, each `at` taken from the start time of the narration line that introduces that turn. Add `timings.pulses` entries only where a revealed message is explicitly referred to again later.

## Worked example → sequence + props

Narration (scene-relative seconds from the SRT in brackets):

> [0.2] "The team is weighing model costs." [1.4] "Robert opens: GPT-4 costs are getting tough." [3.0] "Margaret asks about quality." [4.6] "Robert proposes a side-by-side eval." [6.2] "Jake says Haiku works for classification." [7.8] "Kim suggests routing by complexity." [9.4] "Chloe offers to build the eval suite."

```tsx
groupName="AI Discussion"
memberCount={5}
messages={[
  { author: 'Robert',  fromMe: true, text: 'Team, GPT-4 costs are getting tough. Should we test a smaller model?' },
  { author: 'Margaret',              text: 'Cost savings would help, but what about quality?' },
  { author: 'Robert',  fromMe: true, text: 'I am thinking a side-by-side eval on real traffic.' },
  { author: 'Jake',                  text: 'Haiku has been great for our classification tasks.' },
  { author: 'Kim',                   text: 'Could we route by complexity, small for easy, big for hard?' },
  { author: 'Chloe',                 text: 'I will set up the eval suite by Friday.' },
]}
timings={{ sequence: [
  { target: 'setup',   at: 0.2, in: 1.0 },
  { target: 'message0', at: 1.4 },
  { target: 'message1', at: 3.0 },
  { target: 'message2', at: 4.6 },
  { target: 'message3', at: 6.2 },
  { target: 'message4', at: 7.8 },
  { target: 'message5', at: 9.4 },
] }}
```

## Worked example pointer

- [`examples/cost-debate/`](examples/cost-debate/), full example authored on the reveal-sequence model: a realistic six-message team discussion plus the matching reveal sequence (and a sample re-mention pulse). No MP4 is rendered.

## Field / prop reference

- `groupName`: string (≤36), header title
- `memberCount`: positive int, header subtitle
- `messages`: array of **3-8** × `{ author: string (≤22), text: string (≤110), fromMe?: boolean, showTyping?: boolean }`, in conversation order
- `timings.sequence`: array of `{ target, at, in? }`; `target` is `setup` or `message{i}` (`i` = 0-based message index); `at`/`in` in seconds; `in` defaults to 1.0 (the typing pulse fills the first ~55% of the window, then the bubble bounces in)
- `timings.pulses`: array of `{ target, at }`; `target` is a `message{i}` (not `setup`); `at` is the scene-relative second of a re-mention; gives that message a brief brand pulse (~0.45 s, +5 %)
