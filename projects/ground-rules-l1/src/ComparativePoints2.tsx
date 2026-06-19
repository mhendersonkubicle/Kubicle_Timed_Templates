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

// ComparativePoints2, two comparative points linked by a centre chain-link
// connector, rebuilt on the STANDARD reveal-sequence timing model.
//   • setup     , bg.png scales 0 → 1 from the centre (easeInOutCubic) AND the
//                  centre connector (middle_base.png + baked white chain-link
//                  icon) scales 0 → 1 while rotating −180° → 0°. The connector
//                  carries a slight internal delay so it lands just after the
//                  background, preserving the prototype's staging. Both fold
//                  into ONE setup reveal, fixed, non-content scaffolding.
//   • leftPoint , the left shell slides in from off-canvas (left), its icon
//                  and pill caption revealed as ONE unit. Caption fades a touch
//                  after the shell settles (internal sub-stagger).
//   • rightPoint, mirror of leftPoint, sliding in from the right.
//
// Layout: two side points (left + right) joined by a chain-link icon. The
// centre connector is a fixed decoration, its link icon is baked in, not
// user-supplied. Side icons resolve from the shared library and carry their own
// white + Dodger Blue colours (Pattern A, no runtime recolour).

// ─── Schema ──────────────────────────────────────────────────────────────────

const sidePointSchema = z.object({
  // Icon ID from the catalog's available_icons list (e.g. "vocabulary").
  icon:  z.string().min(1),
  // Pill caption, bold white inside the pill graphic. ≤30 chars to fit.
  label: z.string().min(1).max(30),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// platinum stage with nothing on it). Each step is one "object": a side step
// reveals its shell, icon AND pill caption together. All times are
// scene-relative SECONDS.
//
// Addressable targets for this template (FIXED named slots, geometry is
// strictly two points, one per side, so there is no count variation):
//   setup        bg scale-in + centre chain-link connector scale/rotate
//   leftPoint    left shell + left icon + left pill caption (one unit)
//   rightPoint   right shell + right icon + right pill caption (one unit)
export const revealStepSchema = z.object({
  target: z.enum(['setup', 'leftPoint', 'rightPoint']),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.2), // entrance duration (slide + caption)
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type ComparativePoints2Target = RevealStep['target'];

// Re-mention pulse: when an already-revealed point is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.enum(['leftPoint', 'rightPoint']),
  at: z.number().nonnegative(),
});

export const comparativePoints2TimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const comparativePoints2Schema = z.object({
  // Exactly 2 points, left and right of the centre connector.
  points: z.array(sidePointSchema).length(2),
  timings: comparativePoints2TimingSchema.optional(),
});

export type ComparativePoints2Props = z.infer<typeof comparativePoints2Schema>;

export const comparativePoints2Meta = {
  description:
    'Two icon-and-pill points flanking a centre chain-link connector that scales ' +
    'and rotates into place. Each side carries a single concise label and a ' +
    'representative icon; the chain icon reads visually as "these belong ' +
    'together". Best for pairing two parallel concepts where the relationship ' +
    'is one of linkage or association, cause and effect, input and output, ' +
    'two complementary skills, two halves of the same idea.',
  authoringNotes:
    'Always supply exactly 2 points (left, right), this is a comparison layout, not a ' +
    'list. icon is an id from the catalog (e.g. "vocabulary", "strong-mind"); the two ' +
    'icons should be conceptually parallel since the layout reads as a pairing. label ' +
    'is the pill caption, strict 30-character max, one line at 37 px in Satoshi Bold. ' +
    'Write tight noun phrases or short titles. GOOD: "Word recognition", "Working ' +
    'memory". BAD: "Improving word recognition skills" (too long). ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets are FIXED ' +
    'named slots: setup, leftPoint, rightPoint. Each step is { target, at (seconds), ' +
    'in? (entrance duration, default 1.2) }. setup folds the bg scale-in and the ' +
    'centre connector scale/rotate into one scaffolding reveal; leftPoint and ' +
    'rightPoint each reveal their shell + icon + caption as a single object. ' +
    'NARRATION MUST be linear two-point linkage: name the relationship in one line, ' +
    'then deliver the left point fully before the right, never interleave the two ' +
    'captions in one breath. See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BG_SRC          = staticFile('Template-Specific-Assets/ComparativePoints2/bg.png');
const MIDDLE_BASE_SRC = staticFile('Template-Specific-Assets/ComparativePoints2/middle_base.png');
const LEFT_SHELL_SRC  = staticFile('Template-Specific-Assets/ComparativePoints2/left_shell_box.png');
const RIGHT_SHELL_SRC = staticFile('Template-Specific-Assets/ComparativePoints2/right_shell_box.png');
const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

// Pill bboxes, measured from Left_Shell_Box.png / Right_Shell_Box.png.
const LEFT_PILL_X  = 156;
const RIGHT_PILL_X = 1232;
const PILL_TOP_Y   = 803;
const PILL_W       = 540;
const PILL_H       = 91;

// Frame icon centres (above the pills).
const LEFT_FRAME_CX  = 425;
const RIGHT_FRAME_CX = 1501;
const SIDE_ICON_CY   = 540;
const SIDE_ICON_SIZE = 380;

// Centre connector, Middle_Base.png solid bbox centre.
const MIDDLE_CX      = 962;
const MIDDLE_CY      = 609;
const LINK_ICON_SIZE = 220;

// Off-canvas travel distance for side frame slide-in.
const SIDE_TRAVEL = 1300;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Internal sub-stagger proportions, expressed as fractions of a step's `in`
// window so the compound prototype flourishes survive the collapse to one
// {at, in} per object:
//   setup:      bg fills the whole window; the connector starts ~35% in and
//               finishes with it (preserving the prototype's connector delay).
//   side point: the shell slides + fades across the whole window; the pill
//               caption fades in over the LAST ~30% (the late pill-text flourish).
const CONN_OFFSET_FRAC = 0.35;
const PILL_OFFSET_FRAC = 0.70;
const SIDE_FADE_FRAC   = 0.30;

const easeInOutCubic = Easing.inOut(Easing.cubic);
const easeInOutQuad  = Easing.inOut(Easing.quad);

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

// ─── Link icon (centre connector decoration, fixed, white line art) ──────────

function LinkIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="#FFFFFF"
    >
      <path d="M387,247.8c-5.6-5.6-14.7-5.6-20.3,0L237.1,377.4c-26.5,26.5-69.6,26.5-96.1,0c-26.5-26.5-26.5-69.6,0-96.1l129.6-129.6c5.6-5.6,5.6-14.7,0-20.3c-5.6-5.6-14.7-5.6-20.3,0L120.7,261c-37.7,37.7-37.7,99.2,0,136.9c37.7,37.7,99.2,37.7,136.9,0L387,268.1C392.6,262.5,392.6,253.4,387,247.8z" />
      <path d="M474.3,114.7c-37.7-37.7-99.2-37.7-136.9,0L208,244.1c-5.6,5.6-5.6,14.7,0,20.3c5.6,5.6,14.7,5.6,20.3,0L357.7,135c26.5-26.5,69.6-26.5,96.1,0c26.5,26.5,26.5,69.6,0,96.1L324.2,360.6c-5.6,5.6-5.6,14.7,0,20.3c5.6,5.6,14.7,5.6,20.3,0l129.6-129.6C512,213.9,512,152.3,474.3,114.7z" />
    </svg>
 );
}

// ─── Background ───────────────────────────────────────────────────────────────

function Background({ frame, startF, endF }: { frame: number; startF: number; endF: number }) {
  const s = interpolate(frame, [startF, endF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  return (
    <Img
      src={BG_SRC}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        width:  '100%',
        height: '100%',
        display: 'block',
        transform: `scale(${s})`,
        transformOrigin: 'center center',
      }}
    />
 );
}

// ─── Centre connector (Middle_Base + link icon, scale + 180° rotate) ──────────

function Connector({ frame, startF, endF }: { frame: number; startF: number; endF: number }) {
  const eased = interpolate(frame, [startF, endF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const scale    = eased;
  const rotation = -180 + eased * 180;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: `${MIDDLE_CX}px ${MIDDLE_CY}px`,
        opacity: frame >= startF ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={MIDDLE_BASE_SRC}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          left: MIDDLE_CX - LINK_ICON_SIZE / 2,
          top:  MIDDLE_CY - LINK_ICON_SIZE / 2,
          width:  LINK_ICON_SIZE,
          height: LINK_ICON_SIZE,
        }}
      >
        <LinkIcon size={LINK_ICON_SIZE} />
      </div>
    </div>
 );
}

// ─── Side frame (shell + icon + pill caption, one revealed object) ───────────
// Driven by a single reveal step {at, in}: the shell slides in from off-canvas
// and fades over the whole window, then the pill caption fades in over the last
// part of it (internal sub-stagger). frame < startF -> absent.

function SideFrame({
  frame,
  side,
  shellSrc,
  icon,
  label,
  startF,
  durF,
  pulseFrames,
}: {
  frame: number;
  side: 'left' | 'right';
  shellSrc: string;
  icon: string;
  label: string;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  if (frame < startF) return null;

  const isLeft     = side === 'left';
  const travelFrom = isLeft ? -SIDE_TRAVEL : SIDE_TRAVEL;
  const frameCX    = isLeft ? LEFT_FRAME_CX : RIGHT_FRAME_CX;
  const pillX      = isLeft ? LEFT_PILL_X   : RIGHT_PILL_X;

  // Re-mention pulse: a brief scale bump around the point's centre, only after
  // it has fully landed (so it never collides with the entrance).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  const slideX = interpolate(frame, [startF, startF + durF], [travelFrom, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutQuad,
  });
  const op = interpolate(frame, [startF, startF + durF * SIDE_FADE_FRAC], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const textOp = interpolate(
    frame,
    [startF + durF * PILL_OFFSET_FRAC, startF + durF],
    [0, 1],
    {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: easeInOutCubic,
    },
 );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateX(${slideX}px) scale(${pulse})`,
        transformOrigin: `${frameCX}px ${SIDE_ICON_CY}px`,
        opacity: op,
        pointerEvents: 'none',
      }}
    >
      {/* Outlined shell (footer pill is baked into the asset) */}
      <Img
        src={shellSrc}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Library icon, centred above the pill, SVG carries its own white + Dodger Blue */}
      <div
        style={{
          position: 'absolute',
          left: frameCX - SIDE_ICON_SIZE / 2,
          top:  SIDE_ICON_CY - SIDE_ICON_SIZE / 2,
          width:  SIDE_ICON_SIZE,
          height: SIDE_ICON_SIZE,
        }}
      >
        <Img
          src={staticFile(`icons/${icon}.svg`)}
          alt=""
          style={{ width: SIDE_ICON_SIZE, height: SIDE_ICON_SIZE }}
        />
      </div>

      {/* Pill text, flex-centred wrapper sized to the pill's bbox. The wrapper
          clips so a too-long label can never spill past the pill onto the
          background; the span is capped at 100% width and ellipsis-truncated. */}
      <div
        style={{
          position: 'absolute',
          left: pillX,
          top:  PILL_TOP_Y,
          width:  PILL_W,
          height: PILL_H,
          display: 'flex',
          alignItems:     'center',
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: textOp,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 37,
            lineHeight: 1,
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transform: 'translateY(-8px)',
          }}
        >
          {label}
        </span>
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const ComparativePoints2: React.FC<ComparativePoints2Props> = ({ points, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading ComparativePoints2 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<ComparativePoints2Target, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: ComparativePoints2Target): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 1.2);

  // Resolve each target's step once.
  const cSetup = cue('setup');
  const cLeft  = cue('leftPoint');
  const cRight = cue('rightPoint');

  // Re-mention pulse frames per side (from timings.pulses).
  const pulseFramesFor = (target: 'leftPoint' | 'rightPoint') =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));
  const leftPulseF  = pulseFramesFor('leftPoint');
  const rightPulseF = pulseFramesFor('rightPoint');

  // setup window, bg fills the whole window; the connector starts a fraction in
  // and finishes with it (preserving the prototype's slight connector delay).
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupEndF   = cSetup ? f(cSetup.at + durOf(cSetup)) : 0;
  const connStartF  = cSetup
    ? f(cSetup.at + durOf(cSetup) * CONN_OFFSET_FRAC)
    : 0;

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, bg zoom + centre connector scale/rotate (one scaffolding reveal,
          only when the sequence schedules it). */}
      {cSetup && (
        <>
          <Background frame={frame} startF={setupStartF} endF={setupEndF} />
          <Connector frame={frame} startF={connStartF} endF={setupEndF} />
        </>
     )}

      {/* leftPoint, left shell + icon + caption, gated on its reveal step */}
      {cLeft && (
        <SideFrame
          frame={frame}
          side="left"
          shellSrc={LEFT_SHELL_SRC}
          icon={points[0]!.icon}
          label={points[0]!.label}
          startF={f(cLeft.at)}
          durF={f(durOf(cLeft))}
          pulseFrames={leftPulseF}
        />
     )}

      {/* rightPoint, right shell + icon + caption, gated on its reveal step */}
      {cRight && (
        <SideFrame
          frame={frame}
          side="right"
          shellSrc={RIGHT_SHELL_SRC}
          icon={points[1]!.icon}
          label={points[1]!.label}
          startF={f(cRight.at)}
          durF={f(durOf(cRight))}
          pulseFrames={rightPulseF}
        />
     )}
    </AbsoluteFill>
 );
};
