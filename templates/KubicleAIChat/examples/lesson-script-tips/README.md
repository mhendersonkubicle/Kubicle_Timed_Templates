# Example, lesson-script-tips (prompt + 3-section answer)

A worked KubicleAIChat scene on the reveal-sequence model: a single
question-and-answer exchange with a 3-section answer (the 2-4 section count
variation, shown at 3).

## Files

| File | What it is |
|---|---|
| `KubicleAIChat.example.tsx` | The authored scene: greeting + prompt + 3-section answer, with the reveal sequence and two re-mention pulses. |

No MP4 is rendered for this example (layout/sequence reference only).

## What it shows

- **Linear transcript build.** `setup` slides the chat shell up and fades the
  greeting in, `prompt` types the question and morphs it into the user bubble,
  `intro` plays the AI typing pulse then fades in the framing paragraph, and
  `message0…message2` pop in one numbered section at a time. Narration order
  matches reveal order (see [`../../GUIDANCE.md`](../../GUIDANCE.md), Rule 1).
- **Count variation (2-4).** Three sections are scheduled; a 4th `message3`
  would simply add a section, and with only two sections you would schedule
  `message0`/`message1` and stop. The feed auto-stacks sections below the intro.
- **Re-mention pulse.** Two pulses are scheduled: `message0` bumps at 12.0s when
  the narration circles back to the opening point, and `prompt` bumps at 13.2s
  when the original question is re-named. With an empty `pulses` array the scene
  renders identically.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) for full selection and narration
rules.
