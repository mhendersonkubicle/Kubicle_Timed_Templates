# harness/

A minimal Remotion project used **only to compile-check** a built lesson. It is
the repo-committed, version-pinned twin of the local bench at
`~/.cache/claude-remotion-bench`, so a lesson can be bundled on a clean machine
(for example a CI runner) without relying on anything outside the repo.

It does **not** render video. Rendering stays local in Remotion Studio.

## What's here

- `package.json` + `package-lock.json` , pinned Remotion 4.0.230 / React 18.3.1 /
  zod 4 / TypeScript 5 (identical to the bench, so builds match).
- `remotion.config.ts`, `tsconfig.json` , the same config as the bench.
- `src/index.ts` , the entry that registers `./Root`.

## How a build uses it

1. A lesson is built into `projects/<courseId>-l<n>/src/` (lessonScenes.ts,
   Root.tsx, the used template `.tsx` files).
2. To compile-check, copy that `src/` into `harness/src/` and run
   `npm ci` then `npx remotion bundle` here. Bundling verifies the composition
   compiles; it does not need the public assets (staticFile paths resolve at
   render time, which happens locally).

This folder is additive. It changes nothing about the existing local process.
