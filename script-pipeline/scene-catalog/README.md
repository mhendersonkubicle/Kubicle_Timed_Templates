# Scene catalog generator

Builds the **scene library** , one rendered example still of every template ,
into `TEMPLATE-CATALOG.html` at the repo root. That file is the resource the
producer browses at the approval stage (and the link every `BREAKDOWN.md`
points to) to see what each template looks like and pick or swap one.

## Build / refresh it

```
python script-pipeline/scene-catalog/build-catalog.py
```

One command, no setup beyond the repo's own render deps:
- If `harness/node_modules` is missing it runs `npm ci` in `harness/` once (this
  also fetches the headless browser Remotion renders with).
- It copies the templates, stages their assets, renders one still per template
  (from each template's shipped `examples/`), and writes `TEMPLATE-CATALOG.html`.

Re-run it whenever you add or change a template, or fix an example. Commit the
regenerated `TEMPLATE-CATALOG.html`.

## Files

- `build-catalog.py` , orchestrator + generator (picks examples, computes the
  still frame, stages icons/assets, writes the build, assembles the HTML).
- `render.mjs` , bundles once and renders the stills, loading Remotion from the
  in-repo `harness/` deps.
- `_build/`, `out/` , intermediates (git-ignored). The only committed output is
  `TEMPLATE-CATALOG.html` at the repo root.

## Notes

- A grey target glyph in an example means that example referenced an icon id not
  in the master `Icons/` library; real lessons resolve real icons. If you see one,
  fix the shipped example to a real id rather than leaving the placeholder.
- `FRAME_OVERRIDES` in `build-catalog.py` pins the still frame for templates whose
  auto-frame lands on a sparse moment (e.g. one-at-a-time carousels).
