# Example, Cloud cost drivers (4 details)

A worked authoring of **Topic1Subtopics6**: the concept "Cost drivers" fanned
out into four supporting drivers, revealed top-to-bottom in the waterfall.

## Source narration (scene-relative seconds)

> [0.4] "Cloud costs come down to four drivers."
> [2.4] "The first is compute, the hours your instances run."
> [4.2] "The second is storage you keep over time."
> [6.0] "The third is data transfer between regions."
> [7.8] "And the fourth is the managed services on top."

## How it maps

- The header announces the umbrella concept once (`header` at the same cue as
  `setup`, since the opening line names the topic).
- Each driver gets one `detail{i}`, with its `at` taken from the start of the
  line that introduces it.
- Reveal count = `details.length` = 4. The layout centres the row band on the
  full detail count, so **every** supplied detail is scheduled (see Rule 4 in
  `../../GUIDANCE.md`).
- The default `in` of 1.4 s on each detail covers the pill scale-in plus the
  character-by-character typewriter.

See [`Topic1Subtopics6.example.tsx`](./Topic1Subtopics6.example.tsx) for the
authored scene. No MP4 is rendered here.
