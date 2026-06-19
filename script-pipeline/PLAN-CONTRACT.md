# Plan contract (Fleet to engine)

This is the hand-off between the brain (Fleet, which decides) and the hands (the
deterministic engine `build-lesson.js`, which builds). Fleet produces ONE
`plan.json` per lesson. The engine consumes it and produces the exact same kind
of `lessonScenes.ts` + `Root.tsx` we build by hand today, using the same Python
tools for timing, pulses, icons, and staging. Nothing about the existing local
process changes; this is an additive second entry point.

## Division of labour

**Fleet decides (creative, goes in the plan):**
- Which template each beat uses.
- The on-screen text for each field.
- The icon CONCEPTS (plain words like "handshake", not resolved ids).
- The case-study company logo name.
- Which narration cue (and optional sub-phrase) introduces each revealed element.

**The engine derives (deterministic, NOT in the plan):**
- Real icon ids, via the existing `icons/` resolver (search + validate + stage).
- Scene spans and every reveal `at`, via `fit-timing.py` from the SRT.
- Re-mention pulses, via `detect-rementions.py`.
- Character-limit enforcement, by validating against each template's own zod schema.
- The serialized `lessonScenes.ts` + `Root.tsx`, and the asset staging.

This is why timing and quality cannot drift: the engine runs the identical tools
on the identical SRT, just driven from the plan instead of by hand.

## plan.json shape

```jsonc
{
  "course": "Marketing in Professional Services",   // verbatim, every lesson
  "courseId": "marketing-in-professional-services",  // slug; keys the memory
  "courseIcon": "marketing-automation-megaphone-dark", // frozen from course.json
  "lessonNumber": 4,
  "lessonTitle": "Core Principles of Marketing",
  "srt": "inputs/marketing-in-professional-services-l4/lesson.srt",
  "audio": "inputs/marketing-in-professional-services-l4/narration.mp3",

  "scenes": [
    {
      "template": "LessonTitle",
      "span": { "fromCue": 1, "toCue": 5 },   // SRT cue numbers; engine reads boundaries
      "content": {                              // creative fields, exactly the template's prop names
        "courseTitle": "Marketing in Professional Services",
        "lessonNumber": 4,
        "lessonTitle": "Core Principles of Marketing",
        "courseIcon": "marketing-automation-megaphone"  // CONCEPT; engine resolves + suffixes
      },
      "reveals": [                              // editorial: what narration introduces each target
        { "target": "setup", "atFixed": 0.2 }, // staging offset (template convention)
        { "target": "logo",  "cue": 4 },        // engine computes `at` from cue 4 start
        { "target": "label", "cue": 4, "phrase": "explain" },  // sub-phrase = finer timing
        { "target": "title", "cue": 4 },
        { "target": "badge", "cue": 4 }
      ]
    }
  ]
}
```

## How the L4 plan maps to the known-good output

Using the real `prof-services-marketing-l4` as the reference:

- **Scene spans** in the plan are cue numbers; the engine turns them into the
  `SCENE_SPANS` seconds we already have (for example scene 2 = cues 5 to 8, which
  is `[13.935, 29.798]`).
- **`reveals[].cue` (+ optional `phrase`)** is what the engine feeds to
  `fit-timing.py` to get each `at`. Example: scene 3 `card0` anchored to cue 9 at
  the phrase "the decision" yields `at: 0.887`, exactly the value in L4. `card2`
  at cue 10 yields `at: 5.027`. No hand numbers; the SRT decides.
- **Icon concepts** like `"handshake"`, `"crossroad"`, `"shield"`, `"target"`
  resolve to the same `-dark` / `-light` ids already in L4 via the resolver, with
  the suffix chosen by the surface rule.
- **Pulses** are not in the plan. The engine runs `detect-rementions.py` and
  produces them. Example: scene 5 header re-mention pulse at `at: 9.134` is found
  automatically, never hand-placed.

## Engine output (identical structure to today)

For each lesson the engine writes, into `projects/<courseId>-l<n>/src/`:
- `lessonScenes.ts` (FPS, SCENE_SPANS, TOTAL_SECONDS, one `sceneN` export per scene)
- `Root.tsx` (the Series of scenes)
- the used template `.tsx` files (copied unchanged)
and stages the icons/logos into `public/`. It then bundles to confirm it compiles.
It does NOT render. Rendering stays local in Remotion Studio, exactly as now.

## Guardrails the engine enforces (so a bad plan cannot ship)

- Unknown template name, or content that fails the template's zod schema (including
  character limits): reject with a clear message.
- Icon concept that does not resolve to a real id: reject (never guess an id).
- Scene spans not contiguous or not on cue boundaries: reject.
- A long or preview-then-expand scene left with no pulses when the SRT shows a
  re-mention: flag it (the mandatory-pulsing rule).
- Course identity (`courseTitle`, course icon) not matching `course.json`: reject.

Related: `SELECTION_INDEX.md` (how Fleet picks templates), `README.md` (the visual
rules), `.claude/skills/lesson-video-pipeline/SKILL.md` (the agent's job).
