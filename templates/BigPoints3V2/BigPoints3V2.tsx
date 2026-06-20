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

// BigPoints3V2, three pillar cards appearing one-by-one with typewriter subtopics.
//   • Three pillar cards (base_container.png) reveal sequentially, each running
//     the same self-contained beat as one object.
//   • Per-card beat (as PROPORTIONS of the step's `in` window, see CARD_BEAT):
//       0%   - 29%   easeOutBack (subtle, c1=0.9) scale-in + fade-in
//       19%  - 44%   title + anchor (icon/character) fade in
//       44%  - 63%   pill + sphere fade in (asset rendered as-is, no clip)
//       65%  - 100%  subtopic types out character-by-character
//   • Default duration ~10 s @ 30 fps; the third card finishes around 8.5 s.
//
// Icons are rendered "Pure White line art", any source SVG (dark, light, or
// coloured) is forced to white at runtime via a `brightness(0) invert(1)`
// filter on the icon Img, so the icons/ assets need no pre-patching. (Note this
// diverges from YinYang2Points' SVG-fetch/#33CCCC recolour.)

// ─── Content schema ───────────────────────────────────────────────────────────

// Anchor accepts either a line-art icon (rendered at 400×400) or a character
// portrait PNG (rendered at 400×720, bottom-anchored, fills the upper card).
const anchorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('icon'),     id: z.string().min(1) }),
  z.object({ kind: z.literal('character'), id: z.string().min(1) }),
]);

export type CardAnchor = z.infer<typeof anchorSchema>;

const cardSchema = z.object({
  // Header title, bold white, one line, ≤25 chars at 55 px.
  title:    z.string().min(1).max(25),
  // Body subtopic, types out beside the numbered sphere. ≤30 chars to fit.
  subtopic: z.string().min(1).max(30),
  // Card anchor, icon OR character. Each card picks independently.
  anchor:   anchorSchema,
});

export type CardData = z.infer<typeof cardSchema>;

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum-blue fill). All times are scene-relative SECONDS.
//
// Addressable targets for this template (FIXED named slots, count is fixed at 3):
//   setup            no-op / cosmetic. This template has NO scaffolding to
//                    reveal, the platinum-blue fill is always present and each
//                    card's container arrives WITH its content. The slot exists
//                    for cross-template consistency and renders nothing visible.
//   card0/card1/card2  one pillar card revealed as a SINGLE object: container
//                    pops in, then title+anchor -> pill+sphere -> typewriter
//                    subtopic cascade, all inside the step's `in` window.
export const revealStepSchema = z.object({
  target: z.enum(['setup', 'card0', 'card1', 'card2']),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(2.0), // entrance duration (full per-card cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type BigPoints3V2Target = RevealStep['target'];

// Re-mention pulse: when an already-revealed card is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). See README "re-mention pulse" principle.
// Targets are the content cards only (setup has no visible object to pulse).
export const pulseStepSchema = z.object({
  target: z.enum(['card0', 'card1', 'card2']),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const bigPoints3V2TimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const bigPoints3V2Schema = z.object({
  // Exactly 3 cards, ordered left → right.
  cards: z.array(cardSchema).length(3),
  timings: bigPoints3V2TimingSchema.optional(),
});

export type BigPoints3V2Props = z.infer<typeof bigPoints3V2Schema>;

export const bigPoints3V2Meta = {
  description:
    'Three pillar cards arriving one-by-one on a platinum-blue base. Each card ' +
    'stacks a bold white title, a large white icon (or a character portrait), a ' +
    'numbered sphere accent, and a typewriter subtopic line at the base. Best ' +
    'for three sequential takeaways where each warrants both a headline and a ' +
    'short supporting line.',
  authoringNotes:
    'Always supply exactly 3 cards. title is the bold white headline (Inter ' +
    'ExtraBold, 55 px), strict 25-char max. GOOD: "Plan", "Build", "Ship". ' +
    'BAD: "Plan the project carefully" (too long). subtopic is the typewriter ' +
    'body line beside the sphere (Satoshi Medium, 33 px), strict 30-char max. ' +
    'GOOD: "Define entities and relationships". BAD: long sentences with ' +
    'commas, keep noun phrases. anchor is a discriminated union per card: ' +
    "{ kind: 'icon', id } renders icons/<id>.svg (400×400 line art, forced " +
    "white); { kind: 'character', id } renders characters/<id>.png at 400×720 " +
    'bottom-anchored (fills upper card). Each card chooses independently. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every card ' +
    'appears only when a step in `timings.sequence` targets it. Targets are ' +
    'FIXED named slots: setup (optional/no-op, there is no scaffolding to ' +
    'reveal), card0, card1, card2. Each step is { target, at (seconds), in? ' +
    '(entrance duration, default 2.0) }. A card step reveals its container, ' +
    'title, anchor, sphere AND typewriter subtopic together as one object; the ' +
    'internal beat plays out as proportions of `in`. NARRATION MUST be linear, ' +
    'one card at a time: deliver card0 fully (headline + subtopic) before card1, ' +
    'and card1 before card2, never preview a later card while only earlier ' +
    'cards are on screen. See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BASE_CONTAINER_SRC  = staticFile('Template-Specific-Assets/BigPoints3V2/base_container.png');
const PILL_AND_SPHERE_SRC = staticFile('Template-Specific-Assets/BigPoints3V2/pill_and_sphere.png');
const INTER_EXTRABOLD_SRC = staticFile('fonts/Inter-ExtraBold.woff2');
const SATOSHI_MEDIUM_SRC  = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

// base_container.png solid bbox: x=82..651 (centre 366), y=226..1027 (centre 626).
const CARD_SRC_CX = 366;
const CARD_SRC_CY = 626;

// Final card centre x positions in the 1920×1080 frame, plus a uniform Y shift.
const CARD_FINAL_CXS = [356, 961, 1566] as const;
const CARD_OFFSET_Y  = -80;

// Sphere bbox inside the card asset (centre of the numbered disc).
const SPHERE_LEFT = 124;
const SPHERE_TOP  = 913;
const SPHERE_W    = 84;
const SPHERE_H    = 81;

// Title position inside the card (centred horizontally on CARD_SRC_CX).
// Width is capped below the 569 px card body so long titles wrap onto a
// second line instead of bleeding out over the platinum background.
const TITLE_TOP   = 296;
const TITLE_WIDTH = 500;
// Icon: 400×400, centred at (CARD_SRC_CX, 625).
const ICON_SIZE = 400;
const ICON_TOP  = 425;

// Character bbox per card, sits BELOW the title, ends just above the
// pill+sphere. object-fit: contain + bottom-anchor keeps the portrait's
// aspect ratio and pushes the subject to the bottom of the box.
const CHAR_WIDTH  = 400;
const CHAR_HEIGHT = 520;
const CHAR_TOP    = 380;
// Subtopic position: right of the sphere, vertically centred on it.
const SUBTOPIC_LEFT  = 232;
const SUBTOPIC_WIDTH = 380;
const SUBTOPIC_CY    = SPHERE_TOP + SPHERE_H / 2;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Per-card beat as PROPORTIONS of the step's `in` window. The original
// prototype used absolute relative-second offsets against a ~2.4 s card beat;
// these are those offsets normalised to fractions so the whole cascade scales
// with whatever `in` the step supplies (folding the eight former tunable
// sub-fields into one `in`, exactly as Process5Steps folds its icon/number/
// label cascade into the step entrance).
const CARD_BEAT = {
  scaleEnd:       0.29,  // card scale-in completes  (was 0.70 s of ~2.4 s)
  fadeEnd:        0.17,  // card fade-in completes   (was 0.40 s)
  contentFadeIn:  0.19,  // title + anchor start     (was 0.45 s)
  contentFadeEnd: 0.44,  // title + anchor settled   (was 1.05 s)
  pillFadeIn:     0.44,  // pill + sphere start      (was 1.05 s)
  pillFadeOut:    0.63,  // pill + sphere settled    (was 1.50 s)
  typeStart:      0.65,  // subtopic typewriter start(was 1.55 s)
  typeEnd:        1.00,  // subtopic typewriter done (was 2.40 s)
} as const;

// Subtle easeOutBack with c1=0.9 (gentle overshoot, no bounce).
const subtleBackEase = Easing.out(Easing.back(0.9));
const cubicInOut     = Easing.inOut(Easing.cubic);

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

// ─── A single card ────────────────────────────────────────────────────────────
// One card = one reveal object. It is gated on its step (rendered only when the
// sequence targets card{index}) and timed entirely from that step's start frame
// + `in` window. The internal beat plays out as proportions of `in`.

function Card({
  index,
  frame,
  card,
  startFrame,
  inFrames,
  pulseFrames,
}: {
  index: number;
  frame: number;
  card: CardData;
  startFrame: number;
  inFrames: number;
  pulseFrames: number[];
}) {
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // Re-mention pulse: a brief scale bump around the card's own centre, only
  // after it has landed (returns 1 outside pulse windows, so it never collides
  // with the entrance and an empty pulses list changes nothing).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Resolve the proportional beat to concrete frame offsets within this `in`.
  const scaleDurF    = inFrames * CARD_BEAT.scaleEnd;
  const fadeDurF     = inFrames * CARD_BEAT.fadeEnd;
  const contentInF   = inFrames * CARD_BEAT.contentFadeIn;
  const contentEndF  = inFrames * CARD_BEAT.contentFadeEnd;
  const pillInF      = inFrames * CARD_BEAT.pillFadeIn;
  const pillOutF     = inFrames * CARD_BEAT.pillFadeOut;
  const typeStartF   = inFrames * CARD_BEAT.typeStart;
  const typeEndF     = inFrames * CARD_BEAT.typeEnd;

  // Card scale + fade (settles to 1 once the scale window passes).
  const scaleProg    = interpolate(localFrame, [0, scaleDurF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const settled      = localFrame >= scaleDurF;
  const cardScale    = settled ? 1 : (scaleProg > 0 ? subtleBackEase(scaleProg) : 0);
  const cardOpacity  = interpolate(localFrame, [0, fadeDurF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  // Title + anchor fade together once the card has mostly arrived.
  const contentOp = interpolate(localFrame, [contentInF, contentEndF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: cubicInOut,
  });

  // Pill + sphere fade in as a single asset.
  const pillOp = interpolate(localFrame, [pillInF, pillOutF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: cubicInOut,
  });

  // Subtopic typewriter, kicks off after the pill expansion.
  const typeProg = interpolate(localFrame, [typeStartF, typeEndF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(card.subtopic.length * typeProg);
  const visibleSub = card.subtopic.slice(0, charsShow);

  // Position offset to land this card at its final-comp centre.
  const offsetX = CARD_FINAL_CXS[index]! - CARD_SRC_CX;
  const offsetY = CARD_OFFSET_Y;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${cardScale * pulse})`,
        transformOrigin: `${CARD_SRC_CX}px ${CARD_SRC_CY}px`,
        opacity: cardOpacity,
        pointerEvents: 'none',
      }}
    >
      {/* Blue gradient card */}
      <Img
        src={BASE_CONTAINER_SRC}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          left: CARD_SRC_CX,
          top:  TITLE_TOP,
          transform: 'translateX(-50%)',
          width: TITLE_WIDTH,
          textAlign: 'center',
          color: '#FFFFFF',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 55,
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          overflowWrap: 'break-word',
          opacity: contentOp,
        }}
      >
        {card.title}
      </div>

      {/* Anchor, icon (line art) OR character (portrait PNG) */}
      {card.anchor.kind === 'icon' ? (
        <div
          style={{
            position: 'absolute',
            left: CARD_SRC_CX - ICON_SIZE / 2,
            top:  ICON_TOP,
            width:  ICON_SIZE,
            height: ICON_SIZE,
            opacity: contentOp,
          }}
        >
          <Img
            src={staticFile(`icons/${card.anchor.id}.svg`)}
            alt=""
            // Force any source icon (dark/light/coloured) to pure white:
            // brightness(0) flattens every non-transparent pixel to black,
            // invert(1) then flips it to white, alpha/line-art preserved.
            style={{ width: ICON_SIZE, height: ICON_SIZE, filter: 'brightness(0) invert(1)' }}
          />
        </div>
     ) : (
        <div
          style={{
            position: 'absolute',
            left: CARD_SRC_CX - CHAR_WIDTH / 2,
            top:  CHAR_TOP,
            width:  CHAR_WIDTH,
            height: CHAR_HEIGHT,
            opacity: contentOp,
          }}
        >
          <Img
            src={staticFile(`characters/${card.anchor.id}.png`)}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: '50% 100%',
              display: 'block',
            }}
          />
        </div>
     )}

      {/* Pill + sphere asset (rendered as-is, drop shadow baked in) */}
      <Img
        src={PILL_AND_SPHERE_SRC}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width:  '100%',
          height: '100%',
          display: 'block',
          opacity: pillOp,
        }}
      />

      {/* Number inside the sphere, flex-centred to the sphere's bbox */}
      <div
        style={{
          position: 'absolute',
          left: SPHERE_LEFT,
          top:  SPHERE_TOP,
          width:  SPHERE_W,
          height: SPHERE_H,
          display: 'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 38,
          lineHeight: 1,
          opacity: pillOp,
        }}
      >
        {index + 1}
      </div>

      {/* Subtopic typewriter, right of the sphere */}
      <div
        style={{
          position: 'absolute',
          left: SUBTOPIC_LEFT,
          top:  SUBTOPIC_CY,
          transform: 'translateY(-50%)',
          width: SUBTOPIC_WIDTH,
          color: '#0B1E33',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 33,
          lineHeight: 1.15,
          letterSpacing: '-0.005em',
          overflowWrap: 'break-word',
          opacity: localFrame >= typeStartF ? 1 : 0,
        }}
      >
        {visibleSub}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const BigPoints3V2: React.FC<BigPoints3V2Props> = ({ cards, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading BigPoints3V2 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default). `setup` is intentionally
  // a no-op here: this template has no scaffolding to reveal, so even when it
  // is scheduled nothing visible is drawn, the platinum-blue fill is the
  // implicit blank canvas and each card brings its own container.
  const byTarget = new Map<BigPoints3V2Target, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: BigPoints3V2Target): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 2.0);

  const cardTargets: BigPoints3V2Target[] = ['card0', 'card1', 'card2'];

  // Re-mention pulse frames per card (from timings.pulses).
  const pulseFramesFor = (target: 'card0' | 'card1' | 'card2') =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 3, pillar cards, each gated on its card{i} reveal step. The
          `setup` slot draws nothing (no scaffolding to reveal). */}
      {([0, 1, 2] as const).map((i) => {
        const c = cue(cardTargets[i]!);
        return c ? (
          <Card
            key={i}
            index={i}
            frame={frame}
            card={cards[i]!}
            startFrame={f(c.at)}
            inFrames={f(durOf(c))}
            pulseFrames={pulseFramesFor(cardTargets[i]! as 'card0' | 'card1' | 'card2')}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
