# Example, four-milestone roadmap

A 4-milestone product journey (Discovery → Plan → Build → Launch) fronted by a presenter character, authored on the reveal-sequence timing model.

## What it shows

- The **milestone-count variation** (4 of the possible 1-5): the spine + card band auto-centre vertically for the count, and only `milestone0..3` are scheduled.
- **Linear top-to-bottom narration → reveal mapping.** Each narration cue's scene-relative start time becomes the `at` of the milestone it introduces; the blue spine fills down to each tick as it lights.
- **`setup` as scaffolding**, the dodger-blue panel + character fade in and the empty grey spine draws before any milestone content.

## Files

- `FivePoints1SubtopicV2Character.example.tsx`, the authored scene: realistic `milestones`, a `character`, and the reveal `sequence`. The source narration is in the header comment.

## Assets

- Milestone glyphs (`search (1)`, `map-marker-plus`, `layer-plus`, `arrow-trend-up`) resolve from the shared **Small-Icons/** set at render time.
- The character (`presenter-red`) resolves from the shared **characters/** set (`characters/presenter-red.png`), not bundled in this template.
- The pill / spine / tick PNGs come from this template's `Template-Specific-Assets/`.

No MP4 is rendered here; this is an authoring reference only.
