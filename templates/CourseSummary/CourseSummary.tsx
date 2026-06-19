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

// Ports the Course Summary prototype:
//   • Banner (course_summary_banner.png) drops down from above into the top-left
//     corner with easeOutCubic + an opacity ramp. This is the `setup` step.
//   • 1-6 recap pills cascade in from above, each rolling out from under the
//     previous: pill 0 from y=-160 -> its landing top, pill 1 from pill 0's
//     landing top -> its own, etc. Each pill's roll takes its step's `in`
//     duration (default 1.2 s) with easeOutCubic.
//   • Z-order: pill 0 is on top, pill 5 underneath, so each rolls out from
//     beneath its predecessor.
//   • The platinum-blue (#E6ECF2) background is the always-on base, not a
//     reveal target.

// ─── Schema ──────────────────────────────────────────────────────────────────

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum-blue base). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the banner drops down into the top-left corner (Phase 2)
//   pill0..pillN-1   each recap pill revealed as a single object: the white pill
//                    rolls in from above (from under its predecessor) as its bold
//                    black label fades in with it. N is recaps.length (1-6). A
//                    pill{i} with i >= N is ignored (no content for it).
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|pill[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.2), // entrance duration (banner drop / pill roll)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed pill is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets the same indexed pill slots as the
// reveal sequence (pill{i}); setup (the banner chrome) is not pulsable.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^pill[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const courseSummaryTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const courseSummarySchema = z.object({
  // 1 to 6 recap lines, ordered top -> bottom. The pill band auto-centres
  // vertically for the count (3 pills sit centred in the frame, etc.).
  recaps: z.array(z.string().min(1).max(40)).min(1).max(6),
  timings: courseSummaryTimingSchema.optional(),
});

export type CourseSummaryProps = z.infer<typeof courseSummarySchema>;

export const courseSummaryMeta = {
  description:
    'End-of-course recap: a banner badge drops down into the top-left corner, ' +
    'then 1-6 takeaway pills cascade in from above, each rolling out from under ' +
    'the previous. Best for summarising the main points of a lesson or module ' +
    'in a flat, ordered top-to-bottom list.',
  authoringNotes:
    'Supply 1 to 6 recap lines, the pill band auto-centres vertically for the ' +
    'count (3 pills sit centred in the frame, etc.). Each line is bold black ' +
    'inside the white pill, 40-character max at 37 px in Satoshi Bold; if a ' +
    'sentence is longer it wraps onto a second line inside the pill (never ' +
    'spills onto the background). Aim for parallel structure (all noun phrases ' +
    'or all verb phrases). GOOD recap: "Define your target audience". BAD: ' +
    '"It\'s important to define your target audience first" (too long, not ' +
    'parallel). ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (the banner drop) first, then one `pill{i}` per recap line in ' +
    'top-to-bottom order. Each step is { target, at (seconds), in? (entrance ' +
    'duration, default 1.2, the slower roll feel) }. A pill step reveals its ' +
    'pill AND its label together. NARRATION MUST be linear top-to-bottom: ' +
    'introduce the recaps strictly in the order they stack down the frame, one ' +
    'at a time, never reference a lower pill before it has rolled in. The ' +
    'banner is non-narrated scaffolding revealed at setup. See GUIDANCE.md for ' +
    'full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BANNER_SRC = staticFile('Template-Specific-Assets/CourseSummary/course_summary_banner.png');
const PILL_SRC   = staticFile('Template-Specific-Assets/CourseSummary/course_summary_pill.png');
const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

// course_summary_pill.png places one pill at y=116..261 inside a 1920×1080
// canvas; pill alpha-bbox runs x=605..1785.
const PILL_ASSET_TOP = 116;
const PILL_HEIGHT    = 145;
const PILL_LEFT      = 605;
const PILL_RIGHT     = 1785;
// Horizontal centre of the pill body, used as the re-mention pulse origin.
const PILL_CX        = (PILL_LEFT + PILL_RIGHT) / 2;   // 1195

// Vertical layout, the band of `count` pills (1-6) auto-centres on the canvas.
const ROW_PITCH = 155;
const CANVAS_CY = 540;
const firstPillTopFor = (count: number) =>
  CANVAS_CY - ((count - 1) * ROW_PITCH + PILL_HEIGHT) / 2;
const pillTopFor     = (count: number, i: number) => firstPillTopFor(count) + i * ROW_PITCH;
// Pill 0's entry starts off-canvas above; each later pill enters from where
// the previous one landed (the "roll out from under the previous" effect).
const pillFromTopFor = (count: number, i: number) =>
  i === 0 ? -160 : pillTopFor(count, i - 1);

// Text position relative to the pill row. Width is capped to the pill's body
// so a long sentence wraps onto a second line inside the pill (never spills
// onto the background).
const TEXT_LEFT      = 790;
const TEXT_MAX_WIDTH = PILL_RIGHT - TEXT_LEFT - 30;   // 965

// Banner enters from above.
const BANNER_TRAVEL = -400;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic = Easing.out(Easing.cubic);

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

// ─── Font loading ─────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`, {
      weight: '700',
      display: 'block',
    });
    const loaded = await bold.load();
    (document.fonts as FontFaceSet & { add(f: FontFace): void }).add(loaded);
  })();
  return fontsPromise;
}

// ─── Banner ───────────────────────────────────────────────────────────────────
// Revealed by the `setup` step: drops down from above into the top-left corner
// with an opacity ramp over the first ~half of its entrance window.

function Banner({
  frame,
  startFrame,
  endFrame,
}: {
  frame: number;
  startFrame: number;
  endFrame: number;
}) {
  const ty = interpolate(frame, [startFrame, endFrame], [BANNER_TRAVEL, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  // Opacity ramps over the first half of the drop.
  const fadeEnd = startFrame + (endFrame - startFrame) * 0.5;
  const opacity = interpolate(frame, [startFrame, fadeEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Img
      src={BANNER_SRC}
      alt=""
      style={{
        position: 'absolute',
        left: 0,
        top:  0,
        width:  1920,
        height: 1080,
        transform: `translateY(${ty}px)`,
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
 );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({
  index,
  label,
  startFrame,
  pillDur,
  fromTop,
  toTop,
  pulseFrames,
}: {
  index: number;
  label: string;
  startFrame: number;
  pillDur: number;
  fromTop: number;
  toTop: number;
  pulseFrames: number[];
}) {
  const frame = useCurrentFrame();

  // Don't render until this pill's entry begins, so it doesn't flash at fromTop.
  if (frame < startFrame) return null;

  const prog = interpolate(frame, [startFrame, startFrame + pillDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const currentTop  = fromTop + (toTop - fromTop) * prog;
  const assetOffsetY = currentTop - PILL_ASSET_TOP;

  // Re-mention pulse: a brief scale bump around the pill's own centre, only
  // after it has landed (pulseScale returns 1 outside pulse windows, so this
  // never disturbs the roll-in entrance). Origin is the pill body centre in
  // canvas coords (the wrapper is a full-canvas layer anchored at 0,0).
  const pulse   = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const pulseCY = currentTop + PILL_HEIGHT / 2;

  // Earlier pills cover later ones: pill 0 on top (z=20), pill 5 below (z=15).
  const zIndex = 20 - index;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top:  0,
        width:  1920,
        height: 1080,
        zIndex,
        transform: `scale(${pulse})`,
        transformOrigin: `${PILL_CX}px ${pulseCY}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Single-pill PNG translated so its pill row lands at currentTop */}
      <Img
        src={PILL_SRC}
        alt=""
        style={{
          position: 'absolute',
          left: 0,
          top:  assetOffsetY,
          width:  1920,
          height: 1080,
          display: 'block',
        }}
      />

      {/* Label centred vertically on the pill. Width is capped to the pill body
          and text wraps onto the next line if it's too long; vertical overflow
          is clipped so it never spills past the pill onto the background. */}
      <div
        style={{
          position: 'absolute',
          left: TEXT_LEFT,
          top:  currentTop,
          width:  TEXT_MAX_WIDTH,
          height: PILL_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 37,
          lineHeight: 1.15,
          color: '#000',
          letterSpacing: '-0.01em',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}
      >
        {label}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const CourseSummary: React.FC<CourseSummaryProps> = ({ recaps, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading CourseSummary fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 1.2);

  // Re-mention pulse frames per pill (from timings.pulses).
  const pulseFramesFor = (i: number) =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `pill${i}`)
      .map((p) => f(p.at));

  const cSetup = cue('setup');

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 3, pills first so the banner (zIndex 100) sits on top.
          Each pill is gated on its pill{i} reveal step. */}
      {recaps.map((label, i) => {
        const c = cue(`pill${i}`);
        return c ? (
          <Pill
            key={i}
            index={i}
            label={label}
            startFrame={f(c.at)}
            pillDur={f(durOf(c))}
            fromTop={pillFromTopFor(recaps.length, i)}
            toTop={pillTopFor(recaps.length, i)}
            pulseFrames={pulseFramesFor(i)}
          />
       ) : null;
      })}

      {/* Phase 2, banner scaffolding (only when the sequence schedules setup). */}
      {cSetup && (
        <Banner
          frame={frame}
          startFrame={f(cSetup.at)}
          endFrame={f(cSetup.at + durOf(cSetup))}
        />
     )}
    </AbsoluteFill>
 );
};
