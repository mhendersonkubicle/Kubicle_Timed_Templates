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

// LessonSummary, closing recap screen.
//   • Background covers the full 1920×1080 canvas.
//   • "Lesson Summary" title fades + slides up (Arial Black 62 px, Dodger
//     Blue, 22 px slide-up over ~0.45 s with easeOutCubic).
//   • 1 to 5 recap pills stack vertically. Each enters with the "slideUp"
//     entry: starts 130 px below its row, slides up + fades in over ~0.55 s
//     (easeOutCubic). Each pill is the full-canvas PNG translated by
//     rowIndex × 118 px so it lands at its row.
//   • Fewer than 5 pills auto-centre: the title + pill stack share one vertical
//     offset of (5 − N) × 59 px so the group stays centred where the 5-pill
//     design sits (0 px shift at 5 pills, +236 px at 1 pill).
//   • Default composition length is 300 frames (10 s @ 30 fps).
//
// Note: the original HTML supports four entry styles (slideUp, wipe, slide,
// pop) via a tweak panel. This port locks to slideUp, the persisted default, 
// since the other styles aren't part of the approved design.

// ─── Schema ──────────────────────────────────────────────────────────────────

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas. All
// times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the full-canvas background PNG fades in (Phase 2 scaffolding)
//   title            the locked "Lesson Summary" Dodger Blue headline
//                    fades + slides up (its own content step)
//   pill0..pillN-1   each recap pill revealed as a single object: the row PNG
//                    slides up 130 px + fades, with its caption. N is
//                    recaps.length (1-5). A pill{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|title|pill[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.55), // entrance duration (slide-up + fade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed content object (the title or a
// pill) is NAMED AGAIN later in the narration (>~2-3s after its reveal), it
// gives a brief, subtle brand pulse at the exact re-mention timestamp. `at` is
// the scene-relative second of the re-mention (taken from the SRT). Targets are
// the CONTENT objects only (title + pill{i}), never the setup scaffolding. See
// README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(title|pill[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const lessonSummaryTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const lessonSummarySchema = z.object({
  // 1 to 5 recap lines, each ≤32 chars (the pill's white interior is ~890 px
  // wide and the 28 px text spills past the right edge if much longer). Fewer
  // than 5 lines auto-centre vertically, title included.
  recaps: z.array(z.string().min(1).max(32)).min(1).max(5),
  // The headline is fixed to "Lesson Summary", intentionally not authorable.
  timings: lessonSummaryTimingSchema.optional(),
});

export type LessonSummaryProps = z.infer<typeof lessonSummarySchema>;

export const lessonSummaryMeta = {
  description:
    'Closing screen for a lesson: Dodger Blue "Lesson Summary" headline above ' +
    'a column of 1 to 5 recap pills that slide up + fade in one-by-one. Fewer ' +
    'than 5 pills auto-centre vertically so the group stays balanced.',
  authoringNotes:
    'recaps is an array of 1 to 5 short recap lines, Arial 600 white at ' +
    '28 px inside coloured pills, ≤32 chars each. Aim for parallel structure ' +
    '(all noun phrases or all verb phrases). GOOD: "Define your audience", ' +
    '"Map the user journey". BAD: "It\'s important to define your audience" ' +
    '(too long, breaks parallel). With fewer than 5 recaps the title + pills ' +
    'auto-centre as a group, so a 3-line summary sits centred rather than ' +
    'clustered at the top. The headline is always "Lesson Summary" and is not ' +
    'authorable. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets: setup ' +
    '(background fade-in), title (the locked headline), and pill{i} (one per ' +
    'recap, i = 0..recaps.length-1). Each step is { target, at (seconds), in? ' +
    '(entrance duration, default 0.55) }. A pill step reveals its row PNG AND ' +
    'caption together. NARRATION MUST be linear top-to-bottom: introduce the ' +
    'headline, then each recap line strictly in stack order (pill0 down to ' +
    'pillN-1), one at a time, never reveal a lower pill before the ones above ' +
    'it, and do not pre-announce later recaps. See GUIDANCE.md for full ' +
    'selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BG_SRC   = staticFile('Template-Specific-Assets/LessonSummary/lesson_summary_background.png');
const PILL_SRC = staticFile('Template-Specific-Assets/LessonSummary/lesson_summary_pill.png');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

// Lesson_Summary_Pill.png natural pill position (measured from the asset).
const PILL_NATURAL_TOP    = 329;
const PILL_NATURAL_HEIGHT = 93;
const PILL_NATURAL_LEFT   = 133;
const PILL_CENTRE_Y       = PILL_NATURAL_TOP + PILL_NATURAL_HEIGHT / 2;  // 375.5
// Horizontal centre of the pill graphic on the 1920-wide canvas, used as the
// pulse scale origin so the re-mention bump grows symmetrically about the pill.
const PILL_PULSE_ORIGIN_X = 960;

// Title positioning (relative to the pill).
const TITLE_GAP = 110;  // pixels above PILL_NATURAL_TOP
const TITLE_TOP = PILL_NATURAL_TOP - TITLE_GAP;  // 219

// Pill row layout.
const MAX_PILLS       = 5;     // the 5-pill stack is the reference layout
const PILL_SPACING    = 118;   // vertical gap between pill tops
const PILL_TEXT_LEFT  = 242;   // x where pill text starts
const PILL_TEXT_SIZE  = 28;
const TITLE_SIZE      = 62;
const TITLE_COLOUR    = '#0496FF';

// Slide-up entry distance.
const PILL_SLIDE_DISTANCE = 130;
const TITLE_SLIDE_DISTANCE = 22;

// The headline is locked, it is always "Lesson Summary" and not a prop.
const TITLE_TEXT = 'Lesson Summary';

// Per-target default entrance durations (seconds). The title settles a touch
// quicker than a pill enters; both fall back to these when a step omits `in`.
const DEFAULT_TITLE_IN = 0.45;
const DEFAULT_PILL_IN  = 0.55;

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

// ─── Animated Pill ───────────────────────────────────────────────────────────
// Renders the full-canvas Pill PNG translated to the row's position. Slides up
// from +slideDistance below + opacity ramp.

function AnimatedPill({
  index,
  frame,
  text,
  startFrame,
  pillDur,
  offsetY,
  pulseFrames,
}: {
  index: number;
  frame: number;
  text: string;
  startFrame: number;
  pillDur: number;
  offsetY: number;   // shared group offset for auto-centring fewer-than-5 pills
  pulseFrames: number[];
}) {
  if (frame < startFrame) return null;

  const yShift = offsetY + index * PILL_SPACING;
  const raw    = interpolate(frame, [startFrame, startFrame + pillDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const eased  = easeOutCubic(raw);
  const ty     = (1 - eased) * PILL_SLIDE_DISTANCE;
  // Opacity ramps to 1 in the first 25 % of the entry (the prototype's "raw * 4" curve).
  const opacity = Math.min(1, raw * 4);

  // Re-mention pulse: a brief scale bump around this pill's own centre, only
  // after it has fully landed (so it never collides with the entrance). The
  // wrapper is full-canvas, so the transform origin is the pill graphic's
  // centre within the canvas; the scale composes with the slide translateY.
  // transformOrigin is in the element's own local box (before its translate),
  // so the pill graphic's centre sits at its natural PILL_CENTRE_Y regardless
  // of the row's translateY. The translate then carries the scaled pill to the
  // right row, leaving the bump centred on the pill the viewer sees.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width:  1920,
        height: 1080,
        opacity,
        transform: `translateY(${yShift + ty}px) scale(${pulse})`,
        transformOrigin: `${PILL_PULSE_ORIGIN_X}px ${PILL_CENTRE_Y}px`,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={PILL_SRC}
        alt=""
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
      />
      {/* Text overlay, vertically centred on the pill */}
      <div
        style={{
          position: 'absolute',
          top:  PILL_CENTRE_Y,
          left: PILL_TEXT_LEFT,
          transform: 'translateY(-50%)',
          color: '#FFFFFF',
          fontFamily: 'Arial, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: PILL_TEXT_SIZE,
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const LessonSummary: React.FC<LessonSummaryProps> = ({ recaps, timings }) => {
  const frame = useCurrentFrame();

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Auto-centre: shift the whole group (title + pills) down by half the height
  // freed up by each missing pill, so N<5 stays centred where 5 pills sit.
  // 0 px at 5 pills, +236 px at 1 pill. This offset is derived from the CONTENT
  // count (recaps.length), independent of which pills the sequence schedules.
  const N = recaps.length;
  const GROUP_OFFSET_Y = ((MAX_PILLS - N) * PILL_SPACING) / 2;

  // Setup, the full-canvas background fades in across its window.
  const cSetup = cue('setup');
  const bgOpacity = cSetup
    ? interpolate(
        frame,
        [f(cSetup.at), f(cSetup.at + (cSetup.in ?? DEFAULT_PILL_IN))],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic },
     )
    : 0;

  // Title, fade + slide-up, gated on its own reveal step.
  const cTitle = cue('title');
  const titleDur = cTitle ? f(cTitle.in ?? DEFAULT_TITLE_IN) : 0;
  const titleProg = cTitle
    ? interpolate(frame, [f(cTitle.at), f(cTitle.at) + titleDur], [0, 1], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeOutCubic,
      })
    : 0;
  const titleOpacity = titleProg;
  const titleOffsetY = (1 - titleProg) * TITLE_SLIDE_DISTANCE;
  // Title re-mention pulse: composes a scale bump into the title's own
  // transform, about its centre, after it has slid up. 1 outside pulse windows.
  const titlePulse = pulseScale(frame, pulseFramesFor('title'), f(PULSE_DUR_S));

  return (
    <AbsoluteFill style={{ background: '#040d18', overflow: 'hidden' }}>
      {/* Phase 2, background scaffolding (only when the sequence schedules it). */}
      {cSetup && (
        <Img
          src={BG_SRC}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: bgOpacity,
          }}
        />
     )}

      {/* Phase 3, locked headline, gated on its `title` reveal step */}
      {cTitle && (
        <div
          style={{
            position: 'absolute',
            top:  TITLE_TOP,
            left: PILL_NATURAL_LEFT,
            opacity: titleOpacity,
            transform: `translateY(${titleOffsetY + GROUP_OFFSET_Y}px) scale(${titlePulse})`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'Arial Black, Arial, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: TITLE_SIZE,
              color: TITLE_COLOUR,
              letterSpacing: '-0.5px',
              whiteSpace: 'nowrap',
            }}
          >
            {TITLE_TEXT}
          </span>
        </div>
     )}

      {/* Phase 3, 1-5 recap pills, each gated on its pill{i} reveal step.
          Slide up + fade in one-by-one, auto-centred as a group. */}
      {recaps.map((text, i) => {
        const c = cue(`pill${i}`);
        return c ? (
          <AnimatedPill
            key={i}
            index={i}
            frame={frame}
            text={text}
            startFrame={f(c.at)}
            pillDur={f(c.in ?? DEFAULT_PILL_IN)}
            offsetY={GROUP_OFFSET_Y}
            pulseFrames={pulseFramesFor(`pill${i}`)}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
