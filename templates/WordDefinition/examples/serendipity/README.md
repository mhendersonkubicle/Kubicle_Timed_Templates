# Example, serendipity (single-term definition)

A glossary card authored as a **linear two-beat definition** under the
reveal-sequence timing model.

## Files

| File | What it is |
|---|---|
| `WordDefinition.example.tsx` | The authored scene: one term + its definition + the reveal sequence. |

## What it shows

The fixed WordDefinition layout in its only mode: exactly one `title` and one
`description`. The reveal sequence dresses the stage first (`setup`, banner
drops in from the top, icon pill slides in from the right, together), then types
the word out (`title`), then fades the definition in (`description`).

The narration is **name-then-define**: the word is spoken first (mapping to the
`title` reveal), then its meaning (mapping to `description`), never the other
way round, and only one term per card.

No MP4 is rendered here; this is a layout/timing reference.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Narration rules" and
"Reveal order (canonical)".
