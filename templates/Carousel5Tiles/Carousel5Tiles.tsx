import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// Carousel5Tiles, 3D coverflow carousel rebuilt on the STANDARD reveal-sequence
// timing model.
//   • Platinum-blue (#E6ECF2) canvas, matches the rest of the template library.
//   • setup (scaffolding): the perspective stage fades/scales in (0.92 -> 1.0),
//     bringing the empty coverflow frame on screen so the scene never opens on a
//     dead, static canvas. No tile content rides on setup.
//   • Each tile is one reveal object (tile{i}): when its step fires, that tile
//     becomes the centred card, sliding the ring (easeInOutCubic) from the
//     previously-centred tile to this one. The newly-centred tile is head-on;
//     its neighbours rotateY ∓22°/∓44° to thin slivers (coverflow) and fade out
//     toward the platinum background. Tiles are TRANSIENT, only the centre and
//     its immediate neighbours are visible at any moment.
//   • A tile only EXISTS once its step has fired (default blank); an unrevealed
//     tile is never painted, even as a side sliver.
//   • Content per tile: icon (110 px) + Satoshi Black 46 px dodger-blue title +
//     thin divider + 2-3 Satoshi Medium 33 px white bullets.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const carousel5TilesTileSchema = z.object({
  // Tile heading. Satoshi Black 46 px, dodger-blue. ≤28 chars so it fits in one
  // line of the 540-wide tile.
  title:   z.string().min(1).max(28),
  // Icon id resolving to icons/<id>.svg. The shared Icons library glyphs carry
  // their own white + Dodger-Blue line art (Pattern A, no runtime recolour);
  // they sit on the DARK oxford-blue tile, so use a -dark-suffix id.
  icon:    z.string().min(1),
  // 2-3 short bullet points. Satoshi Medium 33 px white. ≤34 chars each.
  bullets: z.array(z.string().min(1).max(34)).min(2).max(3),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just the
// platinum stage). Each step is one "object". All times are scene-relative
// SECONDS.
//
// The carousel is a CENTRE-FOCUSED transient layout: tiles do not persist as a
// static row, the ring slides so that the most-recently-revealed tile is the
// head-on centre card. Addressable targets:
//   setup            the perspective coverflow stage fades/scales in (Phase 2)
//   tile0..tileN-1   one tile revealed as a single object: the ring slides it to
//                    centre and its icon/title/bullets ride in with it. N is
//                    tiles.length (2-5). A tile{i} with i >= N is ignored.
// Reveal order is LINEAR in carousel order (tile0, tile1, ...): each step brings
// the next tile to the front. `in` is the slide duration from the previous
// centre to this tile.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|tile[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing / sliding in
  in: z.number().positive().default(0.8), // entrance duration (ring slide to centre)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed tile is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content tile (tile{i}); setup is
// not pulsable. See README "re-mention pulse" principle. Note: because tiles are
// transient, a pulse only reads while that tile is the centred card.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^tile[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const carousel5TilesTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const carousel5TilesSchema = z.object({
  // 2 to 5 tiles. The coverflow ring sizes itself to the tile count (slotFor /
  // the centre index both use tiles.length), so fewer tiles just makes a shorter
  // ring, the centred tile and its neighbours render the same way.
  tiles:   z.array(carousel5TilesTileSchema).min(2).max(5),
  timings: carousel5TilesTimingsSchema.optional(),
});

export type Carousel5TilesProps = z.infer<typeof carousel5TilesSchema>;

export const carousel5TilesMeta = {
  description:
    '3D coverflow carousel: 2-5 oxford-blue portrait tiles cycle horizontally on ' +
    'a platinum canvas, each showing an icon + dodger-blue title + 2-3 white ' +
    'bullets in Satoshi Medium. Tiles are transient (centre-focused): the ring ' +
    'slides so the most-recently-revealed tile is the head-on centre. Best for ' +
    'cycling related concepts one at a time.',
  authoringNotes:
    'Supply 2 to 5 tiles, the coverflow ring sizes to the count so fewer tiles ' +
    'simply makes a shorter ring. Titles ≤28 chars, bullets ≤34 chars each (2-3 ' +
    'bullets per tile). Use parallel imperative phrasing across tiles. Pick an ' +
    'icon id from the shared Icons library; tiles are DARK oxford-blue, so use a ' +
    '-dark-suffix id (light artwork) so the glyph reads (see README icon-contrast ' +
    'principle). ' +
    'TIMING (reveal-sequence model): nothing shows by default. Schedule a `setup` ' +
    'step (the coverflow stage fades/scales in) then one `tile{i}` per tile in ' +
    'carousel order. Each tile{i} slides the ring so tile i becomes the centred ' +
    'card and its content rides in; tiles are TRANSIENT (only centre + neighbours ' +
    'visible), so the reveal is LINEAR, one tile at a time. Sync each tile{i}.at ' +
    'to the narration cue that introduces that tile; `in` is the slide duration. ' +
    'Optional `pulses` give a brief brand pulse when a tile is re-mentioned (only ' +
    'reads while that tile is centred). See GUIDANCE.md for full selection and ' +
    'narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BLACK_SRC  = staticFile('fonts/Satoshi-Black.woff2');
const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants ────────────────────────────────────────────────────────

const STAGE_CX = 960;
const STAGE_CY = 540;

const TILE_W = 540;
const TILE_H = 760;
const TILE_GAP = 520;             // px between adjacent tile centers
const TILE_ROT_DEG = -22;         // each +1 slot rotates by this many degrees
const PERSPECTIVE = 1800;

const ICON_SIZE = 110;
const CONTENT_PAD = 56;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

const easeInOutCubic    = Easing.inOut(Easing.cubic);
const easeOutCubic      = Easing.out(Easing.cubic);
const easeOutBackSubtle = Easing.out(Easing.back(1.05));

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed object that is named again later gives a quick scale pulse at the
// re-mention. Brand values: ~0.45 s, +5 % peak, smooth up-and-down (half-sine).
const PULSE_DUR_S = 0.45;
const PULSE_AMP   = 0.05;
// Scale multiplier at `frame` given the pulse frames; 1 at rest, up to
// 1 + PULSE_AMP at a pulse peak. Overlapping pulses take the max.
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) {
      s = Math.max(s, 1 + PULSE_AMP * Math.sin((local / durF) * Math.PI));
    }
  }
  return s;
}

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const black  = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`,  { weight: '900', display: 'block' });
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,   { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [k, b, m] = await Promise.all([black.load(), bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(k);
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Signed slot for a tile relative to the centred carousel index.
//
// For 3+ tiles we wrap around the ring (shortest path) so tiles can re-enter
// from the opposite side, the coverflow loop. For exactly 2 tiles that ring is
// degenerate: the "other" tile sits at the antipode (distance n/2 = 1), and the
// wrap flips the exiting tile from slot −1 to +1 mid-transition, teleporting it
// across the screen. So with 2 tiles we use the raw linear distance: the exiting
// tile simply slides off one side and stays off, no reappearing ghost.
function slotFor(tileIdx: number, carouselIdx: number, n: number): number {
  const raw = tileIdx - carouselIdx;
  if (n < 3) return raw;
  let d = ((raw % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Tile({
  tile,
  slot,
  revealed,
  pulse,
}: {
  tile: z.infer<typeof carousel5TilesTileSchema>;
  slot: number;
  // Whether this tile's reveal step has fired yet. Unrevealed tiles are never
  // painted (blank-canvas default), even as side slivers.
  revealed: boolean;
  // Re-mention pulse multiplier for this tile (1 at rest).
  pulse: number;
}) {
  if (!revealed) return null;

  // Only show center + immediate neighbors. Anything further back overlaps the
  // slot-±1 tile and reads as a translucent double-rectangle on the platinum
  // background. The 1.4 cull leaves room for the cross-fade as a back tile
  // slides in from slot 2 → 1 (or out from −1 → −2) during a transition, past
  // that point it's hidden entirely.
  const absSlot = Math.abs(slot);
  if (absSlot > 1.4) return null;

  // Translate + rotate.
  const translateX = slot * TILE_GAP;
  const rotateY    = slot * TILE_ROT_DEG;

  // Opacity: center tile fully opaque, slot ±1 at half, fully hidden by 1.4.
  const tileOp = interpolate(absSlot, [0, 1, 1.4], [1, 0.5, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  // Content (icon + title + bullets) only visible on near-center tiles.
  const contentOp = interpolate(absSlot, [0, 0.5], [1, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  // z-index: center tile on top.
  const z = 100 - Math.round(absSlot * 10);

  return (
    <div
      style={{
        position: 'absolute',
        left: STAGE_CX,
        top:  STAGE_CY,
        width:  TILE_W,
        height: TILE_H,
        // Re-mention pulse multiplies into the tile's OUTER transform around its
        // own centre, composing with (never replacing) the coverflow translate/
        // rotate. 1 outside pulse windows so the slide is untouched.
        transform: `translate(-50%, -50%) scale(${pulse}) translateX(${translateX}px) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        opacity: tileOp,
        zIndex: z,
      }}
    >
      {/* Tile face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 28,
          background:
            'linear-gradient(135deg, #052438 0%, #0a3050 32%, #061b2b 62%, #000000 100%)',
          border: '1.5px solid rgba(255,255,255,0.10)',
          boxShadow:
            'inset 80px 80px 140px rgba(7,148,253,0.08), ' +
            '0 30px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Soft top-left highlight blob, matches the "lit corner" in the reference */}
        <div
          style={{
            position: 'absolute',
            left:   -120,
            top:    -120,
            width:  420,
            height: 420,
            background:
              'radial-gradient(circle, rgba(7,148,253,0.22) 0%, rgba(7,148,253,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: CONTENT_PAD,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            opacity: contentOp,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width:  ICON_SIZE,
              height: ICON_SIZE,
            }}
          >
            <Img
              src={staticFile(`icons/${tile.icon}.svg`)}
              alt=""
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>

          {/* Title, Satoshi Black 900 for a clear weight gap above the
              Satoshi Medium 500 bullets below. */}
          <div
            style={{
              color: '#0794FD',
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 46,
              lineHeight: 1.05,
              letterSpacing: '-0.015em',
              marginTop: 8,
            }}
          >
            {tile.title}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 60,
              height: 2,
              background: 'rgba(7,148,253,0.55)',
              marginTop: 2,
              marginBottom: 6,
            }}
          />

          {/* Bullets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {tile.bullets.map((b, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: '#0794FD',
                    marginTop: 16,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    color: '#FFFFFF',
                    fontFamily: "'Satoshi', system-ui, sans-serif",
                    fontWeight: 500,
                    fontSize: 33,
                    lineHeight: 1.35,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {b}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const Carousel5Tiles: React.FC<Carousel5TilesProps> = ({
  tiles,
  timings,
}) => {
  const frame = useCurrentFrame();
  const n = tiles.length;

  const [handle] = useState(() => delayRender('Loading Carousel5Tiles fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent.
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.8);

  // Re-mention pulse frames per tile{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `tile${i}`)
      .map((p) => f(p.at));

  // ── setup, the coverflow stage fades + scales in across its window. ──────
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupEndF   = cSetup ? f(cSetup.at + durOf(cSetup)) : 0;
  const stageOp = cSetup
    ? interpolate(frame, [setupStartF, setupEndF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
      })
    : 0;
  const stageScale = cSetup
    ? interpolate(frame, [setupStartF, setupEndF], [0.92, 1.0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
      })
    : 0.92;

  // ── Centre index, driven by the reveal sequence. ────────────────────────
  // Each tile{i} step says "tile i becomes the centred card at .at, over .in".
  // The float carousel index slides from the previously-centred tile to the
  // newly-revealed one across that tile's `in` window (easeInOutCubic), then
  // holds. Before the first tile reveal the index rests on tile 0. Tiles whose
  // step has not yet fired are never painted.
  //
  // Build the ordered list of tile reveals actually scheduled, sorted by start.
  const tileReveals = tiles
    .map((_, i) => {
      const c = cue(`tile${i}`);
      return c ? { idx: i, startF: f(c.at), durF: f(durOf(c)) } : null;
    })
    .filter((r): r is { idx: number; startF: number; durF: number } => r !== null)
    .sort((a, b) => a.startF - b.startF);

  // A tile is "revealed" (eligible to paint) once its step has fired.
  const revealedFor = (i: number): boolean => {
    const c = cue(`tile${i}`);
    return c != null && frame >= f(c.at);
  };

  // Compute the float carousel index at this frame from the scheduled reveals.
  function computeCarouselIndex(): number {
    if (tileReveals.length === 0) return 0;
    // Before the first reveal, rest on the first scheduled tile.
    if (frame < tileReveals[0]!.startF) return tileReveals[0]!.idx;

    // Find the active reveal (the latest whose start has passed) and the one
    // before it (the previous centre we slide away from).
    let activePos = 0;
    for (let p = 0; p < tileReveals.length; p++) {
      if (frame >= tileReveals[p]!.startF) activePos = p;
      else break;
    }
    const active = tileReveals[activePos]!;
    const prev   = activePos > 0 ? tileReveals[activePos - 1]! : null;

    // No previous centre, snap to the active tile.
    if (!prev) return active.idx;

    // Slide from prev.idx -> active.idx across active's `in` window.
    const slideProg = interpolate(frame, [active.startF, active.startF + active.durF], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic,
    });
    return prev.idx + (active.idx - prev.idx) * slideProg;
  }

  const carouselIdx = computeCarouselIndex();

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 2, the perspective coverflow stage (only when setup is scheduled).
          Fades + scales in so the scene never opens on a dead static canvas. */}
      {cSetup && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            perspective: `${PERSPECTIVE}px`,
            perspectiveOrigin: '50% 50%',
            opacity: stageOp,
            transform: `scale(${stageScale})`,
            transformOrigin: '50% 50%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
            }}
          >
            {tiles
              .map((tile, idx) => ({
                tile,
                idx,
                slot: slotFor(idx, carouselIdx, n),
              }))
              // Sort so far-from-center tiles paint first (so center is on top).
              .sort((a, b) => Math.abs(b.slot) - Math.abs(a.slot))
              .map(({ tile, idx, slot }) => (
                <Tile
                  key={idx}
                  tile={tile}
                  slot={slot}
                  revealed={revealedFor(idx)}
                  pulse={pulseScale(frame, pulseFramesFor(idx), f(PULSE_DUR_S))}
                />
              ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const carousel5TilesDefaultProps: Carousel5TilesProps = {
  tiles: [
    {
      title: 'Prompt-First',
      icon:  'terminal-dark',
      bullets: [
        'Describe intent, not steps',
        'Let the model draft v1',
        "Edit, don't rewrite",
      ],
    },
    {
      title: 'AI Pair Programming',
      icon:  'sparkles-dark',
      bullets: [
        'Treat the model as a peer',
        'Push back on weak ideas',
        'Ship code you understand',
      ],
    },
    {
      title: 'Tight Iteration Loops',
      icon:  'zap-dark',
      bullets: [
        'Small diffs, fast feedback',
        'Run, observe, refine',
        'Trust the test suite',
      ],
    },
    {
      title: 'Context Is Everything',
      icon:  'layers-dark',
      bullets: [
        'Feed the model real files',
        'Pin the relevant docs',
        'Cut noise, keep signal',
      ],
    },
    {
      title: 'Verify, Don’t Trust',
      icon:  'shield-check-dark',
      bullets: [
        'Read every diff',
        'Run the code yourself',
        'Catch hallucinated APIs',
      ],
    },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.8 },
      { target: 'tile0', at: 1.0 },
      { target: 'tile1', at: 3.6 },
      { target: 'tile2', at: 6.2 },
      { target: 'tile3', at: 8.8 },
      { target: 'tile4', at: 11.4 },
    ],
  },
};
