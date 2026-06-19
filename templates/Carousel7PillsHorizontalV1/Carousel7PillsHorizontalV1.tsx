import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// Carousel7PillsHorizontalV1, the "Horizontal Carousel Pan" template.
//
//   • Phase 1 (setup): a platinum-blue full-screen panel slides off to the
//     LEFT, revealing the deep-oxford-blue world stage (empty until a pill is
//     scheduled).
//   • Phase 2 (pills): the world (a wide canvas holding all pills) translates
//     right → left. The camera parks on pill i exactly at that pill's `at`
//     time; between two scheduled pills it eases (easeInOutCubic pan) from the
//     earlier arrival to the later one. On arrival the stamp shell bobs
//     (raise → hold → lower) and the pill's white label fades in.
//   • Phase 3 (outro): a platinum-blue panel slides in from the RIGHT, masking
//     the world out.
//
// All visuals are CSS / inline SVG, no PNG dependencies.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const carousel7PillsHorizontalV1PillSchema = z.object({
  // Pill caption, Satoshi Bold white, one line. ≤22 chars keeps the stadium
  // pill at its default width.
  label: z.string().min(1).max(22),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the empty oxford-blue stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the platinum intro panel slides off left, revealing the
//                    empty oxford-blue world stage (Phase 1).
//   pill0..pillN-1   each pill revealed as a single object: the camera lands on
//                    it, its stamp bobs (raise → hold → lower) and its label
//                    fades in. N = pills.length (1-7). A pill{i} with i >= N is
//                    ignored. Because the camera is a continuous pan, schedule a
//                    CONTIGUOUS pill0..pillN-1 run (no sparse subsets).
//   outro            the platinum panel slides in from the right, masking the
//                    world out (optional terminal object).
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|outro|pill[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.8), // entrance duration (pan + stamp + fade,
                                           // or panel slide for setup/outro)
});
// Input-shaped: a step's `in` is optional to callers and defaulted at runtime
// (see durOf). The scene reads `s.in ?? DEFAULT_IN` everywhere.
export type RevealStep = z.input<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed pill is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets are the CONTENT pills only
// (pill0..pillN-1), never the setup/outro chrome. See README "re-mention
// pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^pill[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.input<typeof pulseStepSchema>;

export const carousel7PillsHorizontalV1TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const carousel7PillsHorizontalV1Schema = z.object({
  // 1 to 7 pills, in left → right conveyor order. The conveyor sizes itself to
  // the pill count, so fewer pills just make a shorter sweep (a single pill
  // dwells with no pans). Maps directly to indexed targets pill0..pillN-1.
  pills:   z.array(carousel7PillsHorizontalV1PillSchema).min(1).max(7),
  timings: carousel7PillsHorizontalV1TimingsSchema.optional(),
});

// Input-shaped props: callers (JSX / default props) may omit each step's
// optional `in` (it defaults at runtime via the schema / durOf). The scene body
// treats `in` as possibly-undefined throughout, so this is sound.
export type Carousel7PillsHorizontalV1Props = z.input<
  typeof carousel7PillsHorizontalV1Schema
>;

export const carousel7PillsHorizontalV1Meta = {
  description:
    'A "horizontal conveyor": camera pans right→left across a wide oxford-blue ' +
    'canvas, stopping on each of up to 7 stadium-shaped pills. Each stop bobs a ' +
    'small stamp shell against the pill and fades in the pill\'s white label. ' +
    'Platinum-blue panels frame the intro (exits left) and outro (enters right). ' +
    'Use for multi-step workflows, video module breakdowns, or roadmap timelines.',
  authoringNotes:
    'Supply 1 to 7 pills in left → right conveyor order, the conveyor sizes to ' +
    'the count, so fewer pills just makes a shorter sweep (a single pill dwells ' +
    'with no pans). Labels ≤22 chars each (one line of Satoshi Bold ~68 px), ' +
    'keep them short or summarise, as the label is clipped to the pill and will ' +
    'not spill past the end-cap. Use parallel phrasing, short noun phrases or ' +
    'step titles. No icons inside the pills, each pill is preceded by a circular ' +
    'play-button signifier. ' +
    'TIMING (reveal-sequence model): nothing shows by default, schedule a ' +
    '`setup` step (intro panel slides off, revealing the empty stage), then one ' +
    '`pill{i}` per pill in left → right order, then an optional `outro` (closing ' +
    'panel). Each step is { target, at (seconds), in? (entrance duration, ' +
    'default 0.8) }. The camera parks on pill i at that pill\'s `at`, easing the ' +
    'pan from the previous scheduled pill; the pill\'s `in` drives its stamp bob ' +
    'and label fade. Because the camera is a continuous pan, schedule a ' +
    'CONTIGUOUS pill0..pillN-1 run (no sparse subsets / skipped pills). ' +
    'NARRATION MUST be linear pill-by-pill in conveyor order: introduce each ' +
    'pill strictly left to right as the camera lands on it; never describe a ' +
    'later pill before arrival and never jump back. See GUIDANCE.md for full ' +
    'selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants ────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const CANVAS_CX = CANVAS_W / 2;
const CANVAS_CY = CANVAS_H / 2;

// Pill geometry, stadium (fully rounded ends). The play circle lives INSIDE
// the pill on the left; the pill's "shell" outline is the focal frame so it
// gets a thicker border.
const PILL_W = 1280;
const PILL_H = 180;
const PILL_RADIUS = PILL_H / 2;
const SHELL_BORDER_PX = 4;              // pill + stamp share the same outline weight

// Play-button circle, sits INSIDE the pill on the LEFT.
const PLAY_DIAM = 124;
const PLAY_INSET_LEFT = 28;             // gap between pill's inner edge and circle

// Stamp shell, large outlined rectangle directly below the pill. Same width
// as the pill; bobs up to "stamp" the pill on arrival and drops back to its
// rest position before the camera pans on (factory-conveyor stamper feel).
const STAMP_W = PILL_W;
const STAMP_H = 110;
const STAMP_RADIUS = 18;
const STAMP_REST_GAP   = 56;            // distance from pill bottom to stamp top at rest
const STAMP_RAISED_GAP = 3;             // distance when fully "stamped" against the pill
const STAMP_TRAVEL = STAMP_REST_GAP - STAMP_RAISED_GAP;

// World-space pitch between consecutive pill centres. Bumped a little wider
// to keep one (now-wider) pill cleanly framed in the 1920-px viewport.
const PILL_PITCH = 1700;

// Stamp-cycle proportions within a pill's entrance window. The arrival
// stamps the pill (raise → hold → lower) over roughly the first 60 % of the
// window; the label inks in once the stamp meets the pill. These replace the
// old standalone stampRaise/stampHold/stampLower/textFadeDuration constants, 
// they now scale to each pill step's `in`.
const STAMP_RAISE_FRAC = 0.16;          // raise: 0 → raised
const STAMP_HOLD_FRAC  = 0.30;          // hold at raised
const STAMP_LOWER_FRAC = 0.20;          // lower: raised → rest
const TEXT_FADE_FRAC   = 0.34;          // label fade-in window (starts after raise)

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const DEFAULT_IN = 0.8;                 // sensible per-pill / per-panel default

const easeInOutCubic = Easing.inOut(Easing.cubic);
const easeOutCubic   = Easing.out(Easing.cubic);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed pill that is named again later gives a quick scale pulse at the
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

// ─── Palette ─────────────────────────────────────────────────────────────────

const OXFORD_GRADIENT =
  'linear-gradient(180deg, #052438 0%, #042033 50%, #03192A 100%)';
const PLATINUM_BLUE = '#E6ECF2';
const DODGER_BLUE   = '#0496FF';
const WHITE         = '#FFFFFF';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace(
      'Satoshi',
      `url(${SATOSHI_BOLD_SRC}) format('woff2')`,
      { weight: '700', display: 'block' },
   );
    const b = await bold.load();
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
  })();
  return fontsPromise;
}

// ─── Play-button glyph (white triangle inside a dodger-blue gradient disk) ───

function PlayCircle({ size }: { size: number }) {
  // Triangle proportions: a clean equilateral-ish glyph nudged right so its
  // visual centre lines up with the circle centre.
  const tri = size * 0.34;
  const offsetX = size * 0.04;
  return (
    <div
      style={{
        width:  size,
        height: size,
        borderRadius: '50%',
        // Vertical dodger-blue gradient: brighter at the top, deeper at the
        // bottom, gives the disk a subtle sense of dimension without glow.
        background:
          'linear-gradient(180deg, #38B0FF 0%, #0496FF 55%, #0072CC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          marginLeft: offsetX,
          borderTop:    `${tri * 0.62}px solid transparent`,
          borderBottom: `${tri * 0.62}px solid transparent`,
          borderLeft:   `${tri}px solid ${WHITE}`,
        }}
      />
    </div>
 );
}

// ─── Stamp shell (the single, screen-fixed conveyor-belt stamper) ────────────
//
// Lives in SCREEN space, it does NOT travel with the panning world. Sits
// centred on the canvas, just below where any pill lands, and lifts up each
// time a new pill arrives. `liftPx` is the current vertical lift in pixels
// (0 at rest, +STAMP_TRAVEL when fully stamped). Outline weight matches the
// pill so the two shapes read as a matched pair.
function StampShell({ liftPx }: { liftPx: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: CANVAS_CX - STAMP_W / 2,
        top:  CANVAS_CY + PILL_H / 2 + STAMP_REST_GAP - liftPx,
        width:  STAMP_W,
        height: STAMP_H,
        borderRadius: STAMP_RADIUS,
        border: `${SHELL_BORDER_PX}px solid ${DODGER_BLUE}`,
        background: 'transparent',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
 );
}

// ─── A single stage: pill containing play circle + label ─────────────────────
//
// Positioned in WORLD space, its container places it at (centerX, CANVAS_CY).
// The pill rectangle is centred on that point.
function Stage({
  label,
  textOpacity,
}: {
  label: string;
  textOpacity: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: -PILL_W / 2,
        top:  -PILL_H / 2,
        width:  PILL_W,
        height: PILL_H,
        borderRadius: PILL_RADIUS,
        border: `${SHELL_BORDER_PX}px solid ${DODGER_BLUE}`,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        // Left padding hugs the play circle; right padding gives the label
        // breathing room before the rounded end-cap.
        padding: `0 64px 0 ${PLAY_INSET_LEFT}px`,
        gap: 36,
        boxSizing: 'border-box',
      }}
    >
      <PlayCircle size={PLAY_DIAM} />
      <span
        style={{
          color: WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 68,
          letterSpacing: '-0.01em',
          // lineHeight > 1 so the clip box has room for descenders (g, y, p), 
          // overflow:hidden (below) clips vertically too, and lineHeight:1 would
          // shave the bottoms off. The pill centres the text, so it stays centred.
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          // Stay inside the pill: take the remaining flex space and clip with an
          // ellipsis rather than spilling past the rounded end-cap. The ≤22-char
          // schema cap keeps real labels well within this; this is the safety net.
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: textOpacity,
        }}
      >
        {label}
      </span>
    </div>
 );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const Carousel7PillsHorizontalV1: React.FC<
  Carousel7PillsHorizontalV1Props
> = ({ pills, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() =>
    delayRender('Loading Carousel7PillsHorizontalV1 fonts'),
 );
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default: just the empty oxford-blue stage).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? DEFAULT_IN);

  // Re-mention pulse frames per pill index (from timings.pulses). A pill bumps
  // briefly each time it is named again; outside its pulse windows pulseScale
  // returns 1, so an empty/absent pulses list changes nothing.
  const pulseFramesFor = (i: number) =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `pill${i}`)
      .map((p) => f(p.at));

  // The pill steps actually scheduled, in pill-index order (only those whose
  // index is within pills.length and that have a cue). The camera pans across
  // exactly these arrivals.
  const scheduledPills = pills
    .map((_, i) => ({ i, c: cue(`pill${i}`) }))
    .filter((p): p is { i: number; c: RevealStep } => p.c !== undefined);

  // ── Camera index across the pill phase ──────────────────────────────────
  // Each scheduled pill i has an arrival time `at`. The camera parks on pill i
  // for frames >= f(at), and between two consecutive scheduled arrivals it eases
  // (easeInOutCubic) from the earlier pill's index to the later one's. Before
  // the first arrival it sits parked on the first scheduled pill.
  const cameraIdx = (() => {
    if (scheduledPills.length === 0) return 0;
    const first = scheduledPills[0]!;
    if (frame <= f(first.c.at)) return first.i;
    const last = scheduledPills[scheduledPills.length - 1]!;
    if (frame >= f(last.c.at)) return last.i;
    // Find the segment [prev, next] the current frame falls in.
    for (let k = 0; k < scheduledPills.length - 1; k++) {
      const a = scheduledPills[k]!;
      const b = scheduledPills[k + 1]!;
      const aF = f(a.c.at);
      const bF = f(b.c.at);
      if (frame >= aF && frame <= bF) {
        // Pan eases over the back half of the gap so the camera dwells on `a`
        // briefly after arrival, then sweeps to `b`, landing exactly at b.at.
        const panProg = clamp01((frame - aF) / Math.max(1, bF - aF));
        return a.i + (b.i - a.i) * easeInOutCubic(panProg);
      }
    }
    return last.i;
  })();

  // World translateX: world is laid out with pill i at worldX = i * PILL_PITCH,
  // and we keep the camera (canvas centre) over cameraIdx * PILL_PITCH.
  const worldOffsetX = -cameraIdx * PILL_PITCH;

  // ── Shared stamp lift ────────────────────────────────────────────────────
  // The stamp is a single, screen-fixed shell. On each pill's arrival it runs
  // raise → hold → lower → rest over the first portion of that pill's `in`
  // window. Whichever scheduled pill the camera is currently nearest owns the
  // active stamp cycle.
  const stampLiftPx = (() => {
    if (scheduledPills.length === 0) return 0;
    // The active pill is the latest scheduled arrival at or before `frame`.
    let active: { i: number; c: RevealStep } | null = null;
    for (const p of scheduledPills) {
      if (frame >= f(p.c.at)) active = p;
    }
    if (!active) return 0;

    const startF = f(active.c.at);
    const winF   = f(durOf(active.c));
    const intoWin = frame - startF;
    if (intoWin < 0 || winF <= 0) return 0;

    const raiseEnd = winF * STAMP_RAISE_FRAC;
    const holdEnd  = raiseEnd + winF * STAMP_HOLD_FRAC;
    const lowerEnd = holdEnd  + winF * STAMP_LOWER_FRAC;
    if (intoWin < raiseEnd) {
      return easeInOutCubic(intoWin / Math.max(1, raiseEnd)) * STAMP_TRAVEL;
    }
    if (intoWin < holdEnd) {
      return STAMP_TRAVEL;
    }
    if (intoWin < lowerEnd) {
      const p = (intoWin - holdEnd) / Math.max(1, lowerEnd - holdEnd);
      return (1 - easeInOutCubic(p)) * STAMP_TRAVEL;
    }
    return 0;
  })();

  // ── Setup: intro panel slides off LEFT across the setup window ──
  // panelX = 0 means fully covering the viewport; panelX = -CANVAS_W means
  // fully off-canvas to the left. No setup step -> the panel never appears
  // (the stage is simply already exposed).
  const cSetup = cue('setup');
  const introPanelX = cSetup
    ? interpolate(
        frame,
        [f(cSetup.at), f(cSetup.at + durOf(cSetup))],
        [0, -CANVAS_W],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic },
     )
    : null;

  // ── Outro: platinum panel slides in from RIGHT across the outro window ──
  const cOutro = cue('outro');
  const outroPanelX = cOutro
    ? interpolate(
        frame,
        [f(cOutro.at), f(cOutro.at + durOf(cOutro))],
        [CANVAS_W, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic },
     )
    : null;

  const textFadeFrames = (winF: number) => winF * TEXT_FADE_FRAC;
  const stampRaiseFrames = (winF: number) => winF * STAMP_RAISE_FRAC;

  return (
    <AbsoluteFill style={{ background: OXFORD_GRADIENT, overflow: 'hidden' }}>
      {/* WORLD, a wide container holding all scheduled stages. The world's
          origin (0, 0) is the canvas centre; pills sit at worldX = i *
          PILL_PITCH. We translate the whole world by worldOffsetX to pan. */}
      <div
        style={{
          position: 'absolute',
          left: CANVAS_CX,
          top:  CANVAS_CY,
          transform: `translateX(${worldOffsetX}px)`,
          willChange: 'transform',
        }}
      >
        {pills.map((p, i) => {
          // A pill renders ONLY if its reveal step is scheduled.
          const c = cue(`pill${i}`);
          if (!c) return null;

          const startF = f(c.at);
          const winF   = f(durOf(c));
          const intoWin = frame - startF;

          // Label inks in once the stamp meets the pill (raise complete).
          // Reads as "the stamper hits → ink appears on the pill".
          const textOpacity = (() => {
            const localTextFrame = intoWin - stampRaiseFrames(winF);
            if (localTextFrame <= 0) return 0;
            const prog = clamp01(localTextFrame / Math.max(1, textFadeFrames(winF)));
            return easeOutCubic(prog);
          })();

          // Re-mention pulse: a brief scale bump around the pill's own centre,
          // composed on top of the (already-landed) entrance. The wrapper's
          // origin (0, 0) coincides with the pill centre, since Stage offsets
          // its box by -PILL_W/2, -PILL_H/2, so transformOrigin: '0 0' scales
          // about the pill centre.
          const pulse = pulseScale(frame, pulseFramesFor(i), f(PULSE_DUR_S));

          return (
            <div
              key={`stage-${i}`}
              style={{
                position: 'absolute',
                left: i * PILL_PITCH,
                top:  0,
                transform: `scale(${pulse})`,
                transformOrigin: '0 0',
              }}
            >
              <Stage label={p.label} textOpacity={textOpacity} />
            </div>
         );
        })}
      </div>

      {/* STAMP SHELL, single, screen-fixed; bobs up on each pill arrival.
          Only shown once at least one pill is scheduled. */}
      {scheduledPills.length > 0 && <StampShell liftPx={stampLiftPx} />}

      {/* SETUP PANEL, platinum-blue full-screen, slides off LEFT. Only when
          a setup step is scheduled. */}
      {introPanelX !== null && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top:  0,
            width:  CANVAS_W,
            height: CANVAS_H,
            background: PLATINUM_BLUE,
            transform: `translateX(${introPanelX}px)`,
            pointerEvents: 'none',
          }}
        />
     )}

      {/* OUTRO PANEL, platinum-blue full-screen, slides in from RIGHT. Only
          when an outro step is scheduled. */}
      {outroPanelX !== null && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top:  0,
            width:  CANVAS_W,
            height: CANVAS_H,
            background: PLATINUM_BLUE,
            transform: `translateX(${outroPanelX}px)`,
            pointerEvents: 'none',
          }}
        />
     )}
    </AbsoluteFill>
 );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const carousel7PillsHorizontalV1DefaultProps: Carousel7PillsHorizontalV1Props = {
  pills: [
    { label: 'Topic 1' },
    { label: 'Topic 2' },
    { label: 'Topic 3' },
    { label: 'Topic 4' },
    { label: 'Topic 5' },
    { label: 'Topic 6' },
    { label: 'Topic 7' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.0, in: 0.6 },
      { target: 'pill0', at: 0.8 },
      { target: 'pill1', at: 2.6 },
      { target: 'pill2', at: 4.4 },
      { target: 'pill3', at: 6.2 },
      { target: 'pill4', at: 8.0 },
      { target: 'pill5', at: 9.8 },
      { target: 'pill6', at: 11.6 },
      { target: 'outro', at: 13.5, in: 1.5 },
    ],
  },
};
