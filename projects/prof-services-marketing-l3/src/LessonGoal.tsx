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

// Ports the Lesson Goal screen onto the STANDARD reveal-sequence timing model.
// Three addressable objects, revealed strictly in order:
//   • setup  , decorative stripe (lesson_goal_stripe.png) sweeps up from
//     off-canvas bottom-left and fades in. Opacity 0->1 over the first 15 % of
//     the slide; transform translate(-60%, 110%) scale(1.05) -> translate(0,0)
//     scale(1). Pure scaffolding/background (no content).
//   • heading, "Lesson Goal" (Inter ExtraBold, Dodger Blue) rises 24 px + fades.
//   • goal   , goal copy (Satoshi Medium, ink) rises 24 px + fades.
// Default composition length is 300 frames (10 s @ 30 fps).

// ─── Schema ──────────────────────────────────────────────────────────────────

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets for this template (FIXED named slots):
//   setup     the decorative stripe sweeps in (scaffolding / background)
//   heading   the "Lesson Goal" eyebrow headline rises + fades in
//   goal      the lesson-goal body copy rises + fades in
export const revealStepSchema = z.object({
  target: z.enum(['setup', 'heading', 'goal']),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.7), // entrance / slide duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type LessonGoalTarget = RevealStep['target'];

// Re-mention pulse: when an already-revealed content object is NAMED AGAIN
// later in the narration (>~2-3s after its reveal), it gives a brief, subtle
// brand pulse at the exact re-mention timestamp. `at` is the scene-relative
// second of the re-mention (taken from the SRT). Only content objects pulse,
// the setup stripe is decorative scaffolding and is excluded. See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.enum(['heading', 'goal']),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const lessonGoalTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const lessonGoalSchema = z.object({
  // The body text, the actual lesson goal in the author's own words.
  // Wraps to multiple lines via `text-wrap: pretty` style (replicated as
  // CSS textWrap below); aim for under 120 characters so it fits 2-3 lines.
  goal: z.string().min(1).max(160),
  // Optional override for the eyebrow heading. Defaults to "Lesson Goal".
  heading: z.string().min(1).max(40).optional(),
  timings: lessonGoalTimingSchema.optional(),
});

export type LessonGoalProps = z.infer<typeof lessonGoalSchema>;

export const lessonGoalMeta = {
  description:
    'Single-screen lesson opener: Dodger Blue "Lesson Goal" headline with the ' +
    'goal copy below, plus a decorative stripe sweeping in from the bottom-left.',
  authoringNotes:
    'goal is the body text, write it as a clear outcome the learner can ' +
    'measure. GOOD: "Identify three risks in a project plan and propose a ' +
    'mitigation for each." BAD: "Learn about risks" (too vague). Aim for under ' +
    '120 chars so it fits 2-3 lines at 72 px. heading defaults to "Lesson Goal" ' +
    ', override only if a course uses different terminology (e.g. "Module ' +
    'Objective"). ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets (FIXED ' +
    'named slots): setup, heading, goal. Each step is { target, at (seconds), ' +
    'in? (entrance duration, default 0.7) }. The setup stripe is decorative ' +
    'scaffolding and may be omitted. NARRATION MUST be linear single-statement: ' +
    'a short framing beat as the heading appears, then the spoken goal as the ' +
    'goal copy reveals, never describe the goal before the heading beat. See ' +
    'GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const STRIPE_SRC = staticFile('Template-Specific-Assets/LessonGoal/lesson_goal_stripe.png');
const INTER_EXTRABOLD_SRC = staticFile('fonts/Inter-ExtraBold.woff2');
const SATOSHI_MEDIUM_SRC  = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout + design constants (lifted from the prototype's tweaked defaults) ─

const PLATINUM = '#E6ECF2';
const DODGER   = '#0496FF';
const INK      = '#0B1F33';

// Type sizes (post-tweak).
const HEAD_SIZE = 116;
const SUB_SIZE  = 72;

// Content block: left:7%, top:50% (translateY(-50%)), maxWidth:55%.
const CONTENT_LEFT_PCT  = 7;
const CONTENT_MAX_WIDTH = '55%';
const HEAD_BOTTOM_GAP   = 28; // px

// Stripe travel: starts off-canvas bottom-left, scaled 1.05.
const STRIPE_FROM_X_PCT = -60;
const STRIPE_FROM_Y_PCT = 110;
const STRIPE_FROM_SCALE = 1.05;
// Opacity reaches 1 at 15 % of the stripe-reveal animation.
const STRIPE_OPACITY_RAMP = 0.15;

// Rise-in offset for heading + goal text.
const RISE_FROM_Y = 24;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// cubic-bezier(.2, .8, .2, 1), the prototype's primary easing.
const stripeEase = Easing.bezier(0.2, 0.8, 0.2, 1);
const riseEase   = Easing.bezier(0.2, 0.8, 0.2, 1);

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
    const inter   = new FontFace('Inter',  `url(${INTER_EXTRABOLD_SRC}) format('woff2')`, { weight: '800', display: 'block' });
    const satoshi = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`,  { weight: '500', display: 'block' });
    const [i, s]  = await Promise.all([inter.load(), satoshi.load()]);
    const fonts   = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(i);
    fonts.add(s);
  })();
  return fontsPromise;
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const LessonGoal: React.FC<LessonGoalProps> = ({ goal, heading, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading LessonGoal fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<LessonGoalTarget, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: LessonGoalTarget): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.7);

  // Resolve each target's step once.
  const cSetup   = cue('setup');
  const cHeading = cue('heading');
  const cGoal    = cue('goal');

  // Re-mention pulse frames per content target (from timings.pulses). Empty
  // by default, so pulseScale returns 1 and the layout is unchanged.
  const pulseFramesFor = (target: 'heading' | 'goal') =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));
  const headPulseF = pulseFramesFor('heading');
  const goalPulseF = pulseFramesFor('goal');
  const headPulse  = pulseScale(frame, headPulseF, f(PULSE_DUR_S));
  const goalPulse  = pulseScale(frame, goalPulseF, f(PULSE_DUR_S));

  // Stripe, opacity ramps over the first 15 % of the slide; transform runs
  // for the full duration. Both driven by the setup step's window.
  let stripeOpacity = 0;
  let stripeTx = STRIPE_FROM_X_PCT;
  let stripeTy = STRIPE_FROM_Y_PCT;
  let stripeScale = STRIPE_FROM_SCALE;
  if (cSetup) {
    const start = f(cSetup.at);
    const end   = start + f(durOf(cSetup));
    const opEnd = start + Math.round(f(durOf(cSetup)) * STRIPE_OPACITY_RAMP);
    stripeOpacity = interpolate(frame, [start, opEnd], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
    });
    const stripeProg = interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: stripeEase,
    });
    stripeTx    = STRIPE_FROM_X_PCT * (1 - stripeProg);
    stripeTy    = STRIPE_FROM_Y_PCT * (1 - stripeProg);
    stripeScale = STRIPE_FROM_SCALE + (1 - STRIPE_FROM_SCALE) * stripeProg;
  }

  // Heading rise + fade, gated on its step.
  let headOpacity = 0;
  let headOffsetY = RISE_FROM_Y;
  if (cHeading) {
    const start = f(cHeading.at);
    const end   = start + f(durOf(cHeading));
    const headProg = interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: riseEase,
    });
    headOpacity = headProg;
    headOffsetY = (1 - headProg) * RISE_FROM_Y;
  }

  // Goal rise + fade, gated on its step.
  let goalOpacity = 0;
  let goalOffsetY = RISE_FROM_Y;
  if (cGoal) {
    const start = f(cGoal.at);
    const end   = start + f(durOf(cGoal));
    const goalProg = interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: riseEase,
    });
    goalOpacity = goalProg;
    goalOffsetY = (1 - goalProg) * RISE_FROM_Y;
  }

  return (
    <AbsoluteFill style={{ background: PLATINUM, overflow: 'hidden' }}>
      {/* setup, decorative stripe, full-canvas BG image, translate from
          off-canvas (only when the sequence schedules it). */}
      {cSetup && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: stripeOpacity,
            transform: `translate(${stripeTx}%, ${stripeTy}%) scale(${stripeScale})`,
            transformOrigin: 'center center',
          }}
        >
          <Img
            src={STRIPE_SRC}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width:  '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
     )}

      {/* Content block, left:7%, vertically centred, maxWidth:55% */}
      <div
        style={{
          position: 'absolute',
          left: `${CONTENT_LEFT_PCT}%`,
          top:  '50%',
          transform: 'translateY(-50%)',
          maxWidth: CONTENT_MAX_WIDTH,
          pointerEvents: 'none',
        }}
      >
        {/* heading, gated on its reveal step */}
        {cHeading && (
          <h1
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: HEAD_SIZE,
              lineHeight: 1.0,
              color: DODGER,
              letterSpacing: '-0.03em',
              margin: `0 0 ${HEAD_BOTTOM_GAP}px`,
              opacity: headOpacity,
              // Reveal rise composed with the additive re-mention pulse
              // (scale 1 at rest, anchored at the heading's own left-centre so
              // the left-aligned layout stays put).
              transform: `translateY(${headOffsetY}px) scale(${headPulse})`,
              transformOrigin: 'left center',
            }}
          >
            {heading ?? 'Lesson Goal'}
          </h1>
       )}

        {/* goal copy, gated on its reveal step */}
        {cGoal && (
          <p
            style={{
              fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: SUB_SIZE,
              lineHeight: 1.15,
              color: INK,
              letterSpacing: '-0.015em',
              margin: 0,
              maxWidth: 1000,
              textWrap: 'pretty',
              opacity: goalOpacity,
              // Reveal rise composed with the additive re-mention pulse
              // (scale 1 at rest, anchored at the copy's own left-centre).
              transform: `translateY(${goalOffsetY}px) scale(${goalPulse})`,
              transformOrigin: 'left center',
            }}
          >
            {goal}
          </p>
       )}
      </div>
    </AbsoluteFill>
 );
};
