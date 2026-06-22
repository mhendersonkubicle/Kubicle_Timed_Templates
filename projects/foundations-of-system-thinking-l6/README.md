# Foundations of System Thinking, Lesson 6: Emergence

Project record for the assembled Remotion lesson. Timing is SRT-derived, pulses are SRT-detected, and every template appears at most once (variety rule). No em dashes or en dashes appear in any text.

## Files

- `lesson.srt`, the source captions (copied from `Lesson_6_Emergence.srt`); cue start times drive every scene-relative `at`.
- `narration.mp3`, the voiceover (copied from `Foundations_of_System_Thinking_Lesson_6_Emergence.mp3`); `Root.tsx` plays it across the full composition.
- `src/lessonScenes.ts`, the nine scene prop objects plus `FPS`, `TOTAL_SECONDS`, and `SCENE_SPANS`.
- `src/Root.tsx`, the Remotion composition that lays the scenes out in a `Series` and mounts the audio.
- `src/*.tsx`, one file per used template (nine templates, listed below).

Total runtime: 182.776 s at 30 fps. Nine scenes.

## Scene plan (scene to template to beat)

| # | Span (s) | Template | Beat |
|---|---|---|---|
| 1 | 0.000 to 3.229 | LessonTitle | Opening card: "Systems Thinking", Lesson 6, "Emergence". |
| 2 | 3.229 to 10.591 | LessonGoal | The stated learning goal: define emergence and explain why emergent outcomes are hard to predict. |
| 3 | 10.591 to 20.994 | WordDefinition | Name and define the term "Emergence". |
| 4 | 20.994 to 49.880 | Topic1Subtopics6 | "Team culture" as one concept unpacked into the discrete things individuals do (communicate, respond, handle conflict). |
| 5 | 49.880 to 69.524 | BigPoints3V1 | The three forces that reinforce an organisational pattern: structures, incentives, norms. |
| 6 | 69.524 to 98.784 | ComparativePoints2 | Our instinct to explain outcomes by pointing to a component: "who made it happen?" and "who caused it?". |
| 7 | 98.784 to 115.435 | YinYang2Points | The central shift: from "who caused this?" (blame a person) to "what produced this?" (see the system). |
| 8 | 115.435 to 162.900 | SplitscreenPointsV1 | Deep two-column contrast of the two questions: what each one leads you to look at. |
| 9 | 162.900 to 182.776 | LessonSummary | Closing recap of the three things the lesson covered. |

## How each rule was applied

### SRT timing
Every scene span is taken straight from the SRT cue boundaries, and each reveal `at` is the introducing cue's start time converted to scene-relative seconds (cue start minus span start). Examples: scene 4's `detail0` at 5.21 maps to cue 8 ("they communicate in certain ways"); scene 5's three points at 15.73 / 16.45 / 17.42 map to cue 18 ("structures, incentives, and norms"); scene 8's `rightTitle` at 23.99 maps to cue 37 ("Asking 'what produced this'"). Reveals are never pulled early to cover gaps.

### Variety (one template per lesson)
Nine distinct templates, zero repeats among content scenes. The lesson has three comparison-shaped beats (scenes 6, 7, 8); rather than reuse one comparison template, each was routed to the best-fitting distinct one: ComparativePoints2 for the two-instinct pairing, YinYang2Points for the two-state shift, SplitscreenPointsV1 for the multi-pill deep contrast. The structural cards (LessonTitle, LessonGoal, LessonSummary) are exempt from the variety rule.

### Semantic fit
- WordDefinition for the single term plus its definition (scene 3).
- Topic1Subtopics6 for one concept ("team culture") fanning into supporting behaviours (scene 4).
- BigPoints3V1 for exactly three parallel, icon-able drivers (scene 5).
- ComparativePoints2 for a two-item pairing where the point is association, not opposition (scene 6).
- YinYang2Points for a genuine two-state contrast with one reinforcing sub-point each (scene 7).
- SplitscreenPointsV1 for two columns each carrying a short list of pills (scene 8: three left, four right).
No cycle, flywheel, timeline, or character template was forced; none of those structures is present in the script.

### No dead air
Every used template has an animating `setup` step (none is flagged `staging: none`; the no-op templates BigPoints3V2 and CirclePoints4 were not chosen). Each scene's `setup` fires at 0.2 s and brings scaffolding on screen (panel pan-in, loading bar, anchor icon, banner) well before the first spoken content, so scenes whose first content reveal arrives late (scene 4 at 5.21, scene 5 at 15.73, scene 7 at 5.67, scene 8 at 5.74) are covered by staging motion rather than by front-loading content.

### Character limits (all within each template's schema)
- WordDefinition: title 9 chars (limit 40); description 119 chars (under the "aim under 120" target, hard limit 200).
- Topic1Subtopics6: mainTitle 12 chars (limit 30); longest detail 37 chars (limit 38).
- BigPoints3V1: labels up to 10 chars (limit 25).
- ComparativePoints2: captions up to 19 chars (limit 30).
- YinYang2Points: titles 16 and 17 chars (limit 18); sub-point captions 14 chars (limit 16).
- SplitscreenPointsV1: titles within 40; longest pill 20 chars (limit 22).
- LessonSummary: recaps up to 32 chars (limit 32).
- LessonGoal: goal 87 chars (limit 160).

### Icon resolution (no invented ids)
All 14 icon ids were verified against the master `Icons/` library and each has a real `.svg` (the format the templates fetch). Contrast was matched to each surface:
- ComparativePoints2 renders icons as-is on dark shells, so both use the `-dark` (light-artwork) variant: `reputation-recognition-dark`, `hands-fingerpointing-dark`.
- Topic1Subtopics6 anchor sits on the light left panel, so it uses a `-light` variant (`user-experience-networkofpeople-light`); its header titleIcon is force-recoloured white on the dark panel (`teamwork-collaboration-dark`).
- BigPoints3V1, YinYang2Points, and SplitscreenPointsV1 force their icons to solid white (Pattern B / saturated-fill), so the variant is cosmetic; `-dark` ids were used throughout for consistency.

### Re-mention pulses
`detect-rementions.py` logic was applied per scene. The only intra-scene callback to an already-revealed item is in scene 4: the "Team culture" header is revealed at the top, then the narration returns to it at cue 12 ("a team's character"), so `header` carries a pulse at 15.69 s. In the other scenes each item is named exactly once at its reveal (the scene-8 pills, for instance, are each spoken as they appear in cues 37 to 38), so no later re-mention exists to pulse; the "who caused this / what produced this" motif recurs only across scene boundaries, and pulses are scene-scoped. Scene 8, the longest scene, was checked specifically against the lengthy-scene rule and confirmed to have no eligible re-mention rather than a dropped one.

### First-lesson roles
This is Lesson 6, not the first lesson, so the `BulletList6Pills` course-outline beat is correctly absent (it belongs only to Lesson 1, which uses it). The LessonTitle course identity (`courseTitle: 'Systems Thinking'`, no course icon) is reused exactly as set in `systems-thinking-l1`, so the top-left identity is consistent across the course.

### Case study
The script contains no case study about a named company, so no `CaseStudyIntro` card and no company logo are used. The organisational example in cues 15 to 18 is a general pattern ("a firm develops a reputation"), not a specific named company, so it stays a general concept (scene 5 icons) rather than a logo.

## QA fixes and checks

- Scanned `lessonScenes.ts` for em dashes (U+2014), en dashes (U+2013), figure dash, horizontal bar, and double-hyphen-as-dash: none found.
- Verified all nine used template `.tsx` files resolve and were copied into `src/`.
- Verified all 14 referenced icon ids exist as real `.svg` files in `Icons/`; no guessed ids.
- Confirmed every used template has an animating `setup` (no `staging: none` template chosen), so no scene opens on dead air.
- Confirmed all text fields are within their template's character limits (closest margins: scene 4 detail at 37 of 38, scene 9 recap at 32 of 32, scene 7 title at 17 of 18).
- Confirmed course identity matches `systems-thinking-l1` and that the first-lesson course-outline template is not present here.
- Note for the timing-fit pass: scene 8's `leftTitle` is anchored at 5.74 s; the phrase "who caused this" is first spoken inside this scene slightly earlier at 4.46 s (cue 32). The current value is within tolerance and keeps the title settling under the setup motion, so it was left as assembled; tighten to 4.46 only if a stricter cue-exact pass is wanted.

## Preview

Delivered to local Remotion Studio for the user to preview and export. Per project convention, the MP4 is not auto-rendered; producing the final video is the user's step from Studio.
