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

// Timeline6Checkpoints, horizontal timeline whose blue fill grows checkpoint
// to checkpoint, activating each as it arrives.
//   • Platinum-blue (#E6ECF2) canvas with an oxford-blue panel that scales up
//     when the `setup` step fires (matches the other templates in the library).
//   • 1 to 6 checkpoints evenly spaced along a horizontal track at y=540
//     (canvas centre), at a FIXED spacing. With fewer than 6 the track + the
//     oxford-blue panel shrink and re-centre so there's no empty space, the
//     panel always wraps the content snugly.
//   • Above each checkpoint: date + title. Below: description. All three wrap
//     to stay inside the panel (long titles/dates go to a second line rather
//     than crossing onto the platinum background).
//   • The track starts grey/muted (revealed by `setup`). A dodger-blue fill
//     grows from the left edge; as it reaches each checkpoint that circle
//     pulses, recolors, drops in a check icon, and its date/title/description
//     cascade in.
//
// Converted to the STANDARD reveal-sequence timing model: the old global
// playhead clock (bgDuration / trackStart / playheadStart / move + pause +
// activation durations) is gone. The track fill is now re-derived from the
// reveal sequence, its leading edge interpolates from the previously revealed
// checkpoint to checkpoint i across that checkpoint's [at, at+in] window, so
// "the fill grows as you speak" is preserved without a separate clock.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const timeline6CheckpointsCheckpointSchema = z.object({
  date:        z.string().min(1).max(14),
  title:       z.string().min(1).max(18),
  description: z.string().min(1).max(54),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup                  the oxford-blue panel scales in, the muted track and
//                          the empty (inactive) checkpoint circles appear
//                          (scaffolding, Phase 2).
//   checkpoint0..N-1       one checkpoint revealed as a single object: the blue
//                          fill grows to its x, the circle pulses + recolors,
//                          the check icon drops in, and its date -> title ->
//                          description cascade. N is checkpoints.length (1-6).
//                          A checkpoint{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|checkpoint[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.6), // entrance duration (fill + activation cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed checkpoint is NAMED AGAIN later in
// the narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse
// at the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is an indexed checkpoint{i} (the same
// indexed content targets the sequence uses, excluding setup). See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^checkpoint[0-9]+$/),
  at: z.number().nonnegative(),
});

export const timeline6CheckpointsTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const timeline6CheckpointsSchema = z.object({
  // 1 to 6 checkpoints in chronological order. The panel + track shrink to fit
  // fewer than 6, staying centred with no empty space.
  checkpoints: z.array(timeline6CheckpointsCheckpointSchema).min(1).max(6),
  timings:     timeline6CheckpointsTimingsSchema.optional(),
});

export type Timeline6CheckpointsProps = z.infer<typeof timeline6CheckpointsSchema>;

export const timeline6CheckpointsMeta = {
  description:
    'Horizontal timeline with 1 to 6 chronological checkpoints on an ' +
    'oxford-blue panel. A dodger-blue fill grows along the track left → right; ' +
    'each checkpoint pulses + recolors and its date/title/description cascade ' +
    'in as the fill arrives. Fewer than 6 checkpoints shrink the panel to fit ' +
    '(no empty space). Use for project timelines, launch plans, roadmaps, ' +
    'release schedules, or any chronological milestone sequence.',
  authoringNotes:
    'Supply 1 to 6 checkpoints in chronological order; the panel + track shrink ' +
    'and re-centre to fit. date is the marker copy above each checkpoint ' +
    '(≤14 chars, "Q1 2025", "Day 3", "Apr 2026"). title is the bold checkpoint ' +
    'name (≤18 chars, Satoshi Black 36 px). description is one supporting line ' +
    'below (≤54 chars). All three wrap to a second line if long, staying inside ' +
    'the panel, but keep them short for the cleanest look. Aim for parallel ' +
    'structure. GOOD title: "Kickoff", "Beta launch", "GA release". BAD title: ' +
    '"Project kickoff meeting with stakeholders" (too long, split detail into ' +
    'the description line). ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (panel + muted track + empty circles) then one `checkpoint{i}` ' +
    'per checkpoint in chronological order. Each checkpoint{i} grows the fill to ' +
    'its x, activates its circle, and reveals its date/title/description as one ' +
    'object. Each step is { target, at (seconds), in? (entrance duration, ' +
    'default 0.6) }. NARRATION MUST be linear chronological: introduce ' +
    'checkpoints strictly in time order, one at a time, completing each ' +
    '(date, title, description) before the next, never describe a later ' +
    'milestone before its circle activates, and never jump back. See ' +
    'GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BLACK_SRC  = staticFile('fonts/Satoshi-Black.woff2');
const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Oxford-blue rounded panel, vertical extent is fixed (centred on the canvas);
// the horizontal extent is derived per-render from the checkpoint count so it
// wraps the content snugly with no empty space.
const PANEL_TOP    = 360;
const PANEL_BOT    = 720;
const PANEL_H      = PANEL_BOT - PANEL_TOP;   // 360, centred at canvas mid (y=540)
const PANEL_RADIUS = 28;

// Fixed spacing between checkpoints (= the original 6-checkpoint spacing, so a
// full 6-up timeline reproduces the previous layout exactly). The panel adds
// PANEL_SIDE_MARGIN beyond the outer checkpoints on each side.
const CHECKPOINT_SPACING = 296;   // (1700 − 220) / (6 − 1)
const PANEL_SIDE_MARGIN  = 160;   // panel edge sits this far beyond outer checkpoints

const TRACK_Y         = 540;     // canvas centre
const TRACK_THICKNESS = 8;
const CHECKPOINT_R    = 38;

// Text positions (relative to each checkpoint's centre x).
const DATE_Y          = 376;                       // date top
const TITLE_BOTTOM_Y  = TRACK_Y - CHECKPOINT_R - 8; // 494, title bottom sits just above the circle
const DESC_Y          = 620;                       // description top, wraps below
const TEXT_MAX_WIDTH  = 280;

// Per-render horizontal layout, derived from the checkpoint count.
function layoutFor(n: number): {
  trackLeft: number; trackRight: number;
  panelLeft: number; panelWidth: number;
} {
  const trackWidth = (n - 1) * CHECKPOINT_SPACING;
  const trackLeft  = CANVAS_W / 2 - trackWidth / 2;
  const trackRight = trackLeft + trackWidth;
  const panelLeft  = trackLeft - PANEL_SIDE_MARGIN;
  const panelRight = trackRight + PANEL_SIDE_MARGIN;
  return { trackLeft, trackRight, panelLeft, panelWidth: panelRight - panelLeft };
}

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

const easeOutCubic         = Easing.out(Easing.cubic);
const easeInOutCubic       = Easing.inOut(Easing.cubic);
const easeOutBackOvershoot = Easing.out(Easing.back(1.35));

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

// ─── Palette ─────────────────────────────────────────────────────────────────

const BG_COLOR = '#E6ECF2';

const PANEL_BG =
  'linear-gradient(180deg, #0e2741 0%, #08172a 100%)';
const PANEL_BORDER = '1px solid rgba(255,255,255,0.08)';
const PANEL_SHADOW = '0 24px 60px rgba(0,0,0,0.45)';

const TRACK_INACTIVE = 'rgba(255,255,255,0.15)';
const TRACK_ACTIVE   = '#1A9CFE';
const CHECKPOINT_INACTIVE_FILL   = '#1e3a55';
const CHECKPOINT_INACTIVE_STROKE = 'rgba(255,255,255,0.20)';
const CHECKPOINT_ACTIVE_FILL =
  'linear-gradient(180deg, #5EBBFF 0%, #1A9CFE 55%, #0A78D6 100%)';

const TEXT_WHITE       = '#FFFFFF';
const TEXT_DATE_BLUE   = '#7CC7FF';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const black  = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`, { weight: '900', display: 'block' });
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,  { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [k, b, m] = await Promise.all([black.load(), bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(k);
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

// ─── Sub-components ──────────────────────────────────────────────────────────

// The track is scaffolding: the muted (inactive) rail is revealed by `setup`,
// and the blue active fill is driven by the reveal sequence (its leading edge
// is computed in the main scene from the checkpoint cues, see fillX).
function Track({
  frame, startF, durF, fillX, trackLeft, trackRight,
}: {
  frame: number; startF: number; durF: number;
  fillX: number; trackLeft: number; trackRight: number;
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const op = interpolate(local, [0, durF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  return (
    <>
      {/* Inactive (background) track */}
      <div
        style={{
          position: 'absolute',
          left:   trackLeft,
          top:    TRACK_Y - TRACK_THICKNESS / 2,
          width:  Math.max(0, trackRight - trackLeft),
          height: TRACK_THICKNESS,
          borderRadius: TRACK_THICKNESS / 2,
          background: TRACK_INACTIVE,
          opacity: op,
        }}
      />
      {/* Active fill */}
      <div
        style={{
          position: 'absolute',
          left:   trackLeft,
          top:    TRACK_Y - TRACK_THICKNESS / 2,
          width:  Math.max(0, fillX - trackLeft),
          height: TRACK_THICKNESS,
          borderRadius: TRACK_THICKNESS / 2,
          background: TRACK_ACTIVE,
          opacity: op,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.30)',
        }}
      />
    </>
 );
}

function Checkpoint({
  cx, frame, setupStartF, setupDurF, activationProg, pulseFrames,
}: {
  cx: number;
  frame: number;
  setupStartF: number;
  setupDurF: number;
  activationProg: number;
  pulseFrames: number[];
}) {
  const setupLocal = frame - setupStartF;
  if (setupLocal < 0) return null;

  // Empty circle enters with the setup scaffolding.
  const enterScale = interpolate(setupLocal, [0, setupDurF], [0.7, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const enterOp = interpolate(setupLocal, [0, setupDurF * 0.7], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Activation pulse keyed off the checkpoint's own activation window
  // (0 -> 1 -> done). This is the entrance flourish, unchanged.
  const activationPulse = 1 + 0.18 * Math.sin(activationProg * Math.PI);

  // Re-mention pulse: an additive scale bump around the circle's centre, only
  // inside a pulse window (1 elsewhere, so it never disturbs the entrance).
  const rePulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - CHECKPOINT_R,
        top:  TRACK_Y - CHECKPOINT_R,
        width:  CHECKPOINT_R * 2,
        height: CHECKPOINT_R * 2,
        transform: `scale(${enterScale * activationPulse * rePulse})`,
        transformOrigin: 'center center',
        opacity: enterOp,
      }}
    >
      {/* Inactive base circle */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: CHECKPOINT_INACTIVE_FILL,
          boxShadow: `inset 0 0 0 2px ${CHECKPOINT_INACTIVE_STROKE}`,
        }}
      />
      {/* Active overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: CHECKPOINT_ACTIVE_FILL,
          opacity: activationProg,
        }}
      />
      {/* Check icon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: activationProg,
        }}
      >
        <Img
          src={staticFile('icons/check.svg')}
          alt=""
          style={{ width: CHECKPOINT_R * 1.05, height: CHECKPOINT_R * 1.05, display: 'block' }}
        />
      </div>
    </div>
 );
}

function CheckpointContent({
  cx, checkpoint, frame, activationStartF, activationDurF, pulseFrames,
}: {
  cx: number;
  checkpoint: Timeline6CheckpointsProps['checkpoints'][number];
  frame: number;
  activationStartF: number;
  activationDurF: number;
  pulseFrames: number[];
}) {
  const dateLocal  = frame - activationStartF;
  const titleLocal = frame - (activationStartF + Math.round(activationDurF * 0.20));
  const descLocal  = frame - (activationStartF + Math.round(activationDurF * 0.45));

  if (dateLocal < 0) return null;

  const dateOp = interpolate(dateLocal, [0, activationDurF * 0.8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const dateDy = interpolate(dateLocal, [0, activationDurF], [-10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  const titleOp = interpolate(titleLocal, [0, activationDurF * 0.8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const titleDy = interpolate(titleLocal, [0, activationDurF], [-12, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  const descOp = interpolate(descLocal, [0, activationDurF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const descDy = interpolate(descLocal, [0, activationDurF], [10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Shared wrapping rules, text is capped at the column width and breaks to a
  // second line (and breaks long words) so it never spills onto the platinum bg.
  const wrap = {
    maxWidth: TEXT_MAX_WIDTH,
    whiteSpace: 'normal' as const,
    overflowWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    textAlign: 'center' as const,
  };

  // Re-mention pulse: a brief, subtle scale bump on the whole text group, taken
  // around the checkpoint's own centre so the text and its circle pulse as one
  // object. 1 outside pulse windows, so it never disturbs the cascade entrance.
  const rePulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${rePulse})`,
        transformOrigin: `${cx}px ${TRACK_Y}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Date, light dodger blue accent */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top:  DATE_Y,
          transform: `translateX(-50%) translateY(${dateDy}px)`,
          opacity: dateOp,
          color: TEXT_DATE_BLUE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: '-0.005em',
          lineHeight: 1.1,
          ...wrap,
        }}
      >
        {checkpoint.date}
      </div>

      {/* Title, bold white. Bottom-anchored just above the circle so a long
          title wraps UPWARD (toward the date) instead of down into the circle.
          Capped at 2 lines. */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          bottom: CANVAS_H - TITLE_BOTTOM_Y,
          transform: `translateX(-50%) translateY(${titleDy}px)`,
          opacity: titleOp,
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 36,
          letterSpacing: '-0.015em',
          lineHeight: 1.08,
          textShadow: '0 1px 4px rgba(0,40,80,0.30)',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
          ...wrap,
        }}
      >
        {checkpoint.title}
      </div>

      {/* Description, medium dim, wraps below */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top:  DESC_Y,
          transform: `translateX(-50%) translateY(${descDy}px)`,
          opacity: descOp,
          color: 'rgba(255,255,255,0.78)',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: '-0.003em',
          lineHeight: 1.35,
          ...wrap,
        }}
      >
        {checkpoint.description}
      </div>
    </div>
 );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const Timeline6Checkpoints: React.FC<Timeline6CheckpointsProps> = ({
  checkpoints, timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading Timeline6Checkpoints fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ─── Layout derived from the checkpoint count (panel/track shrink to fit) ──
  const N = checkpoints.length;
  const { trackLeft, trackRight, panelLeft, panelWidth } = layoutFor(N);
  const cxs = checkpoints.map((_, i) => trackLeft + i * CHECKPOINT_SPACING);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.6);

  // Re-mention pulse frames per checkpoint (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `checkpoint${i}`)
      .map((p) => f(p.at));

  // Setup, the oxford-blue panel scales in, the muted track and the empty
  // checkpoint circles appear.
  const cSetup = cue('setup');
  const bgScale = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic,
      })
    : 0;

  // Per-checkpoint activation progress 0→1 over its own [at, at+in] window.
  // Drives the circle pulse/recolor/check and is the source of truth for how
  // far the fill has advanced toward that checkpoint.
  const activationProg = (i: number): number => {
    const c = cue(`checkpoint${i}`);
    if (!c) return 0;
    return clamp01((frame - f(c.at)) / Math.max(1, f(durOf(c))));
  };

  // ─── Track fill leading edge (re-derived from the reveal sequence) ─────────
  // The fill grows checkpoint to checkpoint: between consecutive revealed
  // checkpoints it interpolates by the later checkpoint's activation progress,
  // so the leading edge reaches checkpoint i's x exactly as that checkpoint
  // activates. This preserves the "fill grows as you speak" feel without a
  // separate playhead clock.
  const revealedIdx = checkpoints
    .map((_, i) => i)
    .filter((i) => cue(`checkpoint${i}`));
  let fillX = trackLeft;
  if (revealedIdx.length > 0) {
    const firstRevealed = revealedIdx[0]!;
    // Start the fill at the first revealed checkpoint and advance through the
    // rest in index order.
    fillX = cxs[firstRevealed]! * clamp01(activationProg(firstRevealed)) +
            trackLeft * (1 - clamp01(activationProg(firstRevealed)));
    for (let k = 1; k < revealedIdx.length; k++) {
      const prev = revealedIdx[k - 1]!;
      const cur  = revealedIdx[k]!;
      const p = activationProg(cur);
      if (p > 0) {
        fillX = cxs[prev]! + (cxs[cur]! - cxs[prev]!) * p;
      }
    }
  }

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {/* Phase 2, oxford-blue rounded panel (only when setup is scheduled).
          Width wraps the content snugly. */}
      {cSetup && (
        <div
          style={{
            position: 'absolute',
            left:   panelLeft,
            top:    PANEL_TOP,
            width:  panelWidth,
            height: PANEL_H,
            borderRadius: PANEL_RADIUS,
            background: PANEL_BG,
            border:     PANEL_BORDER,
            boxShadow:  PANEL_SHADOW,
            transform: `scale(${bgScale})`,
            transformOrigin: 'center center',
          }}
        />
     )}

      {/* Phase 2, muted track + active fill (track revealed by setup). */}
      {cSetup && (
        <Track
          frame={frame}
          startF={f(cSetup.at)}
          durF={f(durOf(cSetup))}
          fillX={fillX}
          trackLeft={trackLeft}
          trackRight={trackRight}
        />
     )}

      {/* Phase 2, empty checkpoint circles (revealed by setup); each then
          activates on its own checkpoint{i} cue. */}
      {cSetup && checkpoints.map((_, i) => (
        <Checkpoint
          key={`chk-${i}`}
          cx={cxs[i]!}
          frame={frame}
          setupStartF={f(cSetup.at)}
          setupDurF={f(durOf(cSetup))}
          activationProg={activationProg(i)}
          pulseFrames={pulseFramesFor(i)}
        />
     ))}

      {/* Phase 3, per-checkpoint text content, gated on its checkpoint{i}
          reveal (date -> title -> description cascade). */}
      {checkpoints.map((checkpoint, i) => {
        const c = cue(`checkpoint${i}`);
        return c ? (
          <CheckpointContent
            key={`cnt-${i}`}
            cx={cxs[i]!}
            checkpoint={checkpoint}
            frame={frame}
            activationStartF={f(c.at)}
            activationDurF={f(durOf(c))}
            pulseFrames={pulseFramesFor(i)}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const timeline6CheckpointsDefaultProps: Timeline6CheckpointsProps = {
  checkpoints: [
    { date: 'Jan 12', title: 'Research', description: 'Identify model & user needs' },
    { date: 'Feb 28', title: 'Prototype', description: 'Build the first model + UX' },
    { date: 'Apr 15', title: 'Eval',     description: 'Run eval suite + red teaming' },
    { date: 'Jun 3', title: 'Beta',     description: 'Release to early users' },
    { date: 'Aug 21', title: 'Launch',   description: 'General availability rollout' },
    { date: 'Oct 10', title: 'Scale',    description: 'Optimise cost and reliability' },
  ],
  timings: {
    sequence: [
      { target: 'setup',      at: 0.2, in: 0.9 },
      { target: 'checkpoint0', at: 1.2 },
      { target: 'checkpoint1', at: 2.4 },
      { target: 'checkpoint2', at: 3.6 },
      { target: 'checkpoint3', at: 4.8 },
      { target: 'checkpoint4', at: 6.0 },
      { target: 'checkpoint5', at: 7.2 },
    ],
  },
};
