# Example, multi-agent router (4-column fan-out / fan-in)

Demonstrates the classic AI-pipeline shape on the reveal-sequence model: a
single **user query** feeds an **intent router**, which fans out to three
specialist **agents**, which all converge on one **LLM engine** sink, the
column shape `[[1],[1],[3],[1]]`.

## Files

| File | What it is |
|---|---|
| `AIWorkflowDiagramV1.example.tsx` | The authored scene: 4 columns + the reveal sequence + a sample pulse. |

No MP4 is rendered (layout + timing reference only).

## What it shows

- **Left-to-right reveal.** `setup` irises the oxford-blue background in and
  fades the dot grid up; then `col0…col3` reveal one column at a time in flow
  order, each column's boxes popping in together with the connectors feeding
  into it from the previous column.
- **Count variation.** The 3-agent middle column stacks three boxes
  (vertically centred) and fans the complete-bipartite connectors out from the
  router and back into the sink; the single-box columns sit on the centre line.
- **Re-mention pulse.** `pulses: [{ target: 'col1', at: 8.4 }]` gives the
  router column a brief (~0.45 s, +5 %) brand pulse when the narration names it
  again, without re-animating the whole graph. Remove it and the scene renders
  identically up to that point.
- **Ambient packet.** After `col3` finishes, a bright data packet loops along
  one path through the graph as decoration; it is tied to `setup`, not a reveal
  object, and carries no narration.

See [`../../GUIDANCE.md`](../../GUIDANCE.md) → "Variation, column x box count".
