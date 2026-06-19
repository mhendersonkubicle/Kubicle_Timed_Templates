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

// CirclePoints4, 1-4 circles in a row, each with a white icon and a bold label.
//   • Circles on a #E6ECF2 background (the blank-canvas default is just this
//     flat colour, there is no scaffolding PNG to reveal, so this template has
//     NO `setup` target).
//   • Each point reveals as ONE object: its circle pops in (easeOutBack scale
//     0 -> 1), a soft sine pulse rides the tail of the pop, and the label fades
//     in alongside, all within the step's entrance window.
//   • Icons rendered Pure White line art (the icon Img is forced solid white via
//     filter brightness(0) invert(1) so any icon reads on the blue disc).
//
// Layout note: column centres derive from the prototype pitch (440 px) and
// auto-centre for the supplied count, so 1, 2, 3 or 4 circles all sit centred.
//
// TIMING (reveal-sequence model): nothing is shown by default. Each circle
// renders ONLY when a `point{i}` step targets it (indexed targets, exactly like
// Process5Steps' step{i}). See GUIDANCE.md for selection + narration rules.

// ─── Schema ──────────────────────────────────────────────────────────────────

const pointSchema = z.object({
  // Icon ID from the icon library, any icon works; it's forced solid white
  // at runtime (see the icon Img filter), so it reads on the blue disc.
  icon:  z.string().min(1),
  // Pill caption, bold black under each circle. ≤20 chars at 37 px.
  label: z.string().min(1).max(20),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the flat #E6ECF2 fill). All times are scene-relative SECONDS.
//
// Addressable targets:
//   point0..pointN-1   one point revealed as a single object: its circle pops
//                      in, a soft pulse rides the pop, and its label fades, all
//                      together. N is points.length (1-4). A point{i} with
//                      i >= N is ignored.
//
// There is NO `setup` target: this template has no scaffolding (no backdrop or
// empty containers) to stage in, so the blank canvas is simply the flat fill.
export const revealStepSchema = z.object({
  target: z.string().regex(/^point[0-9]+$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.7), // entrance duration (pop + pulse + label fade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed point is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a point{i} slot, exactly like the
// sequence target. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^point[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const circlePoints4TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const circlePoints4Schema = z.object({
  // 1 to 4 points, one per circle, ordered left → right. The row auto-centres
  // horizontally for the count (e.g. 2 circles sit centred in the frame).
  points: z.array(pointSchema).min(1).max(4),
  timings: circlePoints4TimingsSchema.optional(),
});

export type CirclePoints4Props = z.infer<typeof circlePoints4Schema>;

export const circlePoints4Meta = {
  description:
    'A row of 1-4 circles on a light blue background. Each circle holds a ' +
    'white icon and reveals a bold black label beneath it. Circles pop in ' +
    'one-by-one (easeOutBack) with a soft pulse, each label fading in with its ' +
    'circle. Best for a flat set of parallel points, features, benefits, ' +
    'qualities, where order is a presentation choice, not a dependency.',
  authoringNotes:
    'Provide 1 to 4 items, the circle row auto-centres horizontally for the ' +
    'count (2 circles sit centred, etc.). Each item needs an icon id from the ' +
    'icon library (any icon, it is forced solid white to read on the blue ' +
    'disc) and a short label, strict 20-character max, bold black below each ' +
    'circle. Write tight noun phrases (1-3 words). GOOD: "Data quality", "Fast ' +
    'queries", "Low cost", "Easy setup". BAD: "Improve data quality" (too long ' +
    ', strip verbs, keep the noun core). ' +
    'TIMING (reveal-sequence model): nothing shows by default, schedule one ' +
    '`point{i}` step per point, in left → right order. Each point{i} reveals ' +
    'circle i + its white icon + its label as ONE object (pop + pulse + label ' +
    'fade together). There is NO `setup` target, the blank canvas is just the ' +
    'flat fill. Each step is { target, at (seconds), in? (entrance duration, ' +
    'default 0.7) }. NARRATION MUST be linear, point-by-point: introduce each ' +
    'point one at a time in reveal order and never describe a point before its ' +
    'circle is on screen. See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BASE_CIRCLE_SRC = staticFile('Template-Specific-Assets/CirclePoints4/base_circle.png');
const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted from the prototype) ─────────────────────────────

// Circle row, auto-centred horizontally for 1-4 circles. Pitch (440) is the
// spacing taken from the prototype's column centres [315, 755, 1196, 1637].
const CANVAS_CX    = 960;
const CIRCLE_PITCH = 440;
const circleCxFor = (count: number, i: number) =>
  CANVAS_CX - ((count - 1) * CIRCLE_PITCH) / 2 + i * CIRCLE_PITCH;
const CIRCLE_CY  = 533;
const CIRCLE_D   = 382;

// Where the circle sits inside Base_Circle.png (a full 1920×1080 PNG).
const SRC_CIRCLE_CX = 315;
const SRC_CIRCLE_CY = 533;

const ICON_SIZE = 240;
const TEXT_Y    = 830;

// Sine-pulse amplitude (peak overshoot above scale 1).
const PULSE_AMP = 0.15;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutBack = Easing.out(Easing.back(1.70158));

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed object that is named again later gives a quick scale pulse at the
// re-mention. Brand values: ~0.45 s, +5 % peak, smooth up-and-down (half-sine).
// (Distinct from the entrance pulse PULSE_AMP above, which rides the pop.)
const REMENTION_PULSE_DUR_S = 0.45;
const REMENTION_PULSE_AMP   = 0.05;
// Scale multiplier at `frame` given the pulse frames; 1 at rest, up to
// 1 + REMENTION_PULSE_AMP at a pulse peak. Overlapping pulses take the max.
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) {
      s = Math.max(s, 1 + REMENTION_PULSE_AMP * Math.sin((local / durF) * Math.PI));
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

// ─── Single circle (one reveal object: pop + pulse + label) ───────────────────
// The point reveals as a unit across [startF, startF+durF]: an easeOutBack pop
// scales the circle 0 -> 1 over the first ~80 % of the window, a soft sine
// pulse rides the tail, and the label fades in across the same window. This
// folds the prototype's old two-pass (pop pass, then a separate pulse+label
// pass) into a single per-object reveal as the reveal-sequence model requires.

function CirclePoint({
  cx,
  frame,
  icon,
  label,
  startF,
  durF,
  pulseFrames,
}: {
  cx: number;
  frame: number;
  icon: string;
  label: string;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  // Pop: easeOutBack scale 0 → 1 over the first ~80 % of the window.
  const popDur = Math.max(1, durF * 0.8);
  const popProg = interpolate(local, [0, popDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const base = popProg > 0 ? easeOutBack(popProg) : 0;

  // Pulse: soft sine bump riding the tail of the pop (over the full window).
  const pulseProg = interpolate(local, [0, durF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const bump = pulseProg > 0 && pulseProg < 1 ? PULSE_AMP * Math.sin(Math.PI * pulseProg) : 0;

  // Re-mention pulse: a brief, additive scale bump around the circle's centre,
  // riding on top of the entrance scale. Returns 1 outside pulse windows, so it
  // never disturbs the pop/entrance reveal.
  const pulse = pulseScale(frame, pulseFrames, f(REMENTION_PULSE_DUR_S));

  const scale = Math.max(0, base + bump) * pulse;

  // Label fades in alongside the pop.
  const textOpacity = interpolate(local, [0, durF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Wrapper sized to the circle, scaled together so both circle + icon scale */}
      <div
        style={{
          position: 'absolute',
          left: cx - CIRCLE_D / 2,
          top:  CIRCLE_CY - CIRCLE_D / 2,
          width:  CIRCLE_D,
          height: CIRCLE_D,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Base_Circle.png offset so its blue disc lands at (0,0) of the wrapper */}
        <Img
          src={BASE_CIRCLE_SRC}
          alt=""
          style={{
            position: 'absolute',
            left: -(SRC_CIRCLE_CX - CIRCLE_D / 2),
            top:  -(SRC_CIRCLE_CY - CIRCLE_D / 2),
            width:  1920,
            height: 1080,
            display: 'block',
          }}
        />

        {/* Icon centred on the disc, forced solid white so any icon reads on it */}
        <div
          style={{
            position: 'absolute',
            left: CIRCLE_D / 2 - ICON_SIZE / 2,
            top:  CIRCLE_D / 2 - ICON_SIZE / 2,
            width:  ICON_SIZE,
            height: ICON_SIZE,
          }}
        >
          <Img
            src={staticFile(`icons/${icon}.svg`)}
            alt=""
            // Force any source icon to solid white so it reads on the blue disc.
            style={{ width: ICON_SIZE, height: ICON_SIZE, filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>

      {/* Label, outside the scaled wrapper so it doesn't scale */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top:  TEXT_Y,
          transform: 'translate(-50%, 0)',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 37,
          color: '#000000',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          opacity: textOpacity,
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const CirclePoints4: React.FC<CirclePoints4Props> = ({ points, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading CirclePoints4 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default). Each point{i} reveals circle i as one object.
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.7);

  // Re-mention pulse frames per point{i} (from timings.pulses).
  const pulseFramesFor = (i: number) =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `point${i}`)
      .map((p) => f(p.at));

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {points.map((p, i) => {
        const c = cue(`point${i}`);
        return c ? (
          <CirclePoint
            key={i}
            cx={circleCxFor(points.length, i)}
            frame={frame}
            icon={p.icon}
            label={p.label}
            startF={f(c.at)}
            durF={f(durOf(c))}
            pulseFrames={pulseFramesFor(i)}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
