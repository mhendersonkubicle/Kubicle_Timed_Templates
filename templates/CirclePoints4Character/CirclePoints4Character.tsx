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

// CirclePoints4Character, a row of 1-4 circles on a light platinum-blue
// background, each circle filled with a CHARACTER PORTRAIT instead of a
// line-art icon, rebuilt on the STANDARD reveal-sequence timing model.
//   • setup    , the platinum background stage scales/fades in from the centre
//                 (easeInOutCubic). This is the scaffolding reveal, fixed,
//                 non-content, so the stage is never a static blank frame
//                 before the first portrait lands (avoids `staging: none`).
//   • point{i} , each circle reveals as ONE object: its disc pops in
//                 (easeOutBack scale 0 -> 1), a soft pulse rides the tail of
//                 the pop, the character portrait scales with it (clipped to
//                 the disc), and the label fades in alongside, all together.
//
// The character image is clipped to the circular disc (border-radius 50% on
// the wrapper), with the face positioned at the disc's vertical centre and a
// drop shadow following the figure's silhouette against the dodger-blue disc.
//
// Layout note: column centres derive from the prototype pitch (440 px) and
// auto-centre for the supplied count, so 1, 2, 3 or 4 circles all sit centred.
//
// TIMING (reveal-sequence model): nothing is shown by default. The background
// renders only when a `setup` step targets it; each circle renders only when a
// `point{i}` step targets it (indexed targets, exactly like CirclePoints4 /
// Process5Steps' step{i}). See GUIDANCE.md for selection + narration rules.

// ─── Schema ──────────────────────────────────────────────────────────────────

const pointSchema = z.object({
  // Character PNG id, resolves to characters/<id>.png. Pick PNGs with proper
  // alpha (no baked-in background) so the dodger-blue disc shows through where
  // the figure is transparent.
  characterId:     z.string().min(1),
  // Rendered height of the character image inside the circle, in px. Default
  // 480 fills the 382-diameter disc with comfortable cropping around the head.
  characterHeight: z.number().min(200).max(900).optional(),
  // Top offset of the character image from the wrapper top, in px. Tune so the
  // face lands at the circle's vertical centre (~191 px).
  characterY:      z.number().optional(),
  // Pill caption, bold black under the circle. ≤20 chars at 37 px.
  label:           z.string().min(1).max(20),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// flat #E6ECF2 fill with nothing staged on it). All times are scene-relative
// SECONDS.
//
// Addressable targets:
//   setup              the platinum background stage scales/fades in (the
//                      scaffolding reveal, fixed, non-content).
//   point0..pointN-1   one point revealed as a single object: its disc pops in,
//                      a soft pulse rides the pop, the portrait scales with it
//                      and its label fades, all together. N is points.length
//                      (1-4). A point{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  // `setup` (background stage) or `point{i}` (i = 0-based point index).
  target: z.string().regex(/^(setup|point[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.7), // entrance duration (pop + pulse + label fade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed point is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a point{i} slot (not setup),
// exactly like the sequence target. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^point[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const circlePoints4CharacterTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const circlePoints4CharacterSchema = z.object({
  // 1 to 4 points, one per circle, ordered left → right. The row auto-centres
  // horizontally for the count (e.g. 2 circles sit centred in the frame).
  points:  z.array(pointSchema).min(1).max(4),
  timings: circlePoints4CharacterTimingsSchema.optional(),
});

export type CirclePoints4CharacterProps = z.infer<typeof circlePoints4CharacterSchema>;

export const circlePoints4CharacterMeta = {
  description:
    'A row of 1-4 character-portrait circles on a light platinum-blue ' +
    'background. Each circle holds a head-and-shoulders portrait masked to a ' +
    'dodger-blue disc, with a bold black label beneath it. The background ' +
    'stage scales in first, then each circle pops in one-by-one (easeOutBack) ' +
    'with a soft pulse, the portrait scaling with the disc and the label ' +
    'fading in alongside. Best for putting faces to a flat set of 1-4 ' +
    'parallel roles, people, or personas where order is a presentation ' +
    'choice, not a dependency.',
  authoringNotes:
    'Provide 1 to 4 items, the circle row auto-centres horizontally for the ' +
    'count (2 circles sit centred, etc.). Each needs a characterId (PNG in ' +
    'characters/<id>.png with proper alpha), optional characterHeight + ' +
    'characterY for face-centring, and a label (≤20 chars, bold black below ' +
    'each circle). Tune characterHeight (default 480) and characterY (default ' +
    '61) per PNG so the face’s centre lands at the disc’s vertical ' +
    'centrepoint (~191 px). Write tight noun phrases (1-3 words). GOOD: ' +
    '"Strategy", "Engineering", "Design". BAD: "Leads our strategy" (too ' +
    'long, strip verbs, keep the noun core). ' +
    'TIMING (reveal-sequence model): nothing shows by default. Schedule a ' +
    '`setup` step first (the background stage scales/fades in), then one ' +
    '`point{i}` step per point, in left → right order. Each point{i} reveals ' +
    'circle i + its portrait + its label as ONE object (pop + pulse + label ' +
    'fade together). Each step is { target, at (seconds), in? (entrance ' +
    'duration, default 0.7) }. NARRATION MUST be linear, point-by-point: ' +
    'introduce each point one at a time in reveal order and never describe a ' +
    'point before its circle is on screen. See GUIDANCE.md for full selection ' +
    'and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BASE_CIRCLE_SRC  = staticFile('Template-Specific-Assets/CirclePoints4Character/base_circle.png');
const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted from the prototype) ─────────────────────────────

// Circle row, auto-centred horizontally for 1-4 circles (matches CirclePoints4).
// Pitch (440) is the spacing from the prototype's centres [315, 755, 1196, 1637].
const CANVAS_CX    = 960;
const CIRCLE_PITCH = 440;
const circleCxFor = (count: number, i: number) =>
  CANVAS_CX - ((count - 1) * CIRCLE_PITCH) / 2 + i * CIRCLE_PITCH;
const CIRCLE_CY  = 533;
const CIRCLE_D   = 382;

// Where the circle sits inside Base_Circle.png (a full 1920×1080 PNG).
const SRC_CIRCLE_CX = 315;
const SRC_CIRCLE_CY = 533;

const TEXT_Y = 830;

// Sine-pulse amplitude for the entrance pulse (peak overshoot above scale 1).
const PULSE_AMP = 0.15;

// Default character framing, face lands at the disc centre when the PNG has the
// face ~27% from its top (typical presenter framing).
const DEFAULT_CHARACTER_HEIGHT = 480;
const DEFAULT_CHARACTER_Y      = 61;   // ≈ CIRCLE_D/2 − 0.27 × 480

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutBack    = Easing.out(Easing.back(1.70158));
const easeInOutCubic = Easing.inOut(Easing.cubic);

// Setup background staging, scale-in range. The platinum stage scales from a
// touch under full size up to 1 while fading in, so the frame is never a flat
// static blank before the first portrait lands.
const SETUP_SCALE_FROM = 0.92;

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed object that is named again later gives a quick scale pulse at the
// re-mention. Brand values: ~0.45 s, +5 % peak, smooth up-and-down (half-sine).
// (Distinct from the entrance pulse PULSE_AMP above, which rides the pop.)
const PULSE_DUR_S = 0.45;
const PULSE_AMP_REMENTION = 0.05;
// Scale multiplier at `frame` given the pulse frames; 1 at rest, up to
// 1 + PULSE_AMP_REMENTION at a pulse peak. Overlapping pulses take the max.
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) {
      s = Math.max(s, 1 + PULSE_AMP_REMENTION * Math.sin((local / durF) * Math.PI));
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

// ─── Background stage (setup scaffolding reveal) ──────────────────────────────
// The platinum stage scales from SETUP_SCALE_FROM -> 1 while fading 0 -> 1 over
// the setup window. Rendered only when the sequence schedules a `setup` step.

function BackgroundStage({ frame, startF, endF }: { frame: number; startF: number; endF: number }) {
  const prog = interpolate(frame, [startF, endF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const scale = SETUP_SCALE_FROM + (1 - SETUP_SCALE_FROM) * prog;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#E6ECF2',
        opacity: prog,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    />
  );
}

// ─── Single circle (one reveal object: pop + pulse + portrait + label) ────────
// The point reveals as a unit across [startF, startF+durF]: an easeOutBack pop
// scales the disc 0 -> 1 over the first ~80% of the window, a soft sine pulse
// rides the tail, the portrait scales with the disc (it is inside the scaled
// wrapper), and the label fades in across the same window. A re-mention pulse
// composes on top of the entrance scale around the disc's own centre.

function CircleCharacter({
  cx,
  frame,
  characterId,
  characterHeight,
  characterY,
  label,
  startF,
  durF,
  pulseFrames,
}: {
  cx: number;
  frame: number;
  characterId: string;
  characterHeight: number;
  characterY: number;
  label: string;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  // Pop: easeOutBack scale 0 → 1 over the first ~80% of the window.
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

  // Re-mention pulse: a brief, additive scale bump around the disc's centre,
  // riding on top of the entrance scale. Returns 1 outside pulse windows, so it
  // never disturbs the pop/entrance reveal.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  const scale = Math.max(0, base + bump) * pulse;

  // Label fades in alongside the pop.
  const textOpacity = interpolate(local, [0, durF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Wrapper sized to the circle, with border-radius:50% so all content
          inside (the blue disc + the character) is clipped to a perfect
          circle. Scaled by the entrance pop + entrance pulse + re-mention
          pulse together, around the disc's own centre. */}
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
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      >
        {/* Dodger-blue disc backdrop (from Base_Circle.png). */}
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

        {/* Character portrait, clipped to the circular wrapper, with a
            silhouette drop shadow that hugs the figure against the disc. */}
        <Img
          src={staticFile(`characters/${characterId}.png`)}
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top:  characterY,
            height: characterHeight,
            width:  'auto',
            transform: 'translateX(-50%)',
            display: 'block',
            filter:
              'drop-shadow(0 12px 18px rgba(2, 18, 36, 0.40)) ' +
              'drop-shadow(0 3px 6px rgba(2, 18, 36, 0.30))',
          }}
        />
      </div>

      {/* Label, outside the scaled wrapper so the text stays put. */}
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

export const CirclePoints4Character: React.FC<CirclePoints4CharacterProps> = ({
  points,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading CirclePoints4Character fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default). `setup` stages the background; each point{i}
  // reveals circle i as one object.
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

  const cSetup = cue('setup');

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, platinum background stage scales/fades in (one scaffolding
          reveal, only when the sequence schedules it). */}
      {cSetup && (
        <BackgroundStage
          frame={frame}
          startF={f(cSetup.at)}
          endF={f(cSetup.at + durOf(cSetup))}
        />
      )}

      {points.map((p, i) => {
        const c = cue(`point${i}`);
        return c ? (
          <CircleCharacter
            key={i}
            cx={circleCxFor(points.length, i)}
            frame={frame}
            characterId={p.characterId}
            characterHeight={p.characterHeight ?? DEFAULT_CHARACTER_HEIGHT}
            characterY={p.characterY ?? DEFAULT_CHARACTER_Y}
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
