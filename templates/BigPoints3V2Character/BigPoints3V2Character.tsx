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

// BigPoints3V2Character, character-only variant of BigPoints3V2.
//
// Same layout, animation, and three-card waterfall as the icon version.
// The only difference is the anchor inside each card: instead of a
// 400×400 line-art icon, each card hosts a CHARACTER PORTRAIT positioned
// so the face lands at the centre of the card body.
//
// The card itself (`base_container.png`) is already a dodger-blue
// gradient panel with rounded corners, so the character sits directly
// on that gradient, no separate background rectangle is needed. The
// character image is clipped to the card body via overflow: hidden so
// any lower-torso overflow disappears cleanly behind the pill-and-sphere
// asset at the bottom.
//
// Each of the three cards takes a DIFFERENT character so the trio reads
// as a team rather than three copies of the same person.
//
// TIMING (reveal-sequence STANDARD MODEL): there is no shared scaffolding
// here, each card carries its own backdrop, so the three cards are the
// reveal objects. A card appears ONLY when a step targets it; the default
// (empty sequence) is the blank platinum stage. Each card's internal
// cascade (card scale/fade -> content fade -> pill+sphere fade -> subtopic
// typewriter) is folded into a single step's `in` window as fixed
// proportions, exactly like Process5Steps folds chevron -> icon -> number
// -> label into one step.

// ─── Schema ──────────────────────────────────────────────────────────────────

const characterSchema = z.object({
  // Only the character identity is authorable. Every card renders the portrait
  // at the SAME fixed size and vertical offset (CHARACTER_HEIGHT / CHARACTER_Y)
  // so the tops of all three heads line up across the trio. Swap the id to
  // change the person, never the framing.
  id: z.string().min(1),
});

const cardSchema = z.object({
  title:     z.string().min(1).max(25),
  subtopic:  z.string().min(1).max(30),
  character: characterSchema,
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the static platinum-blue stage). All times are scene-relative SECONDS.
//
// Addressable targets for this template (FIXED, fixed-3 count):
//   setup            OPTIONAL, near-no-op marker. This scene has no shared
//                    scaffolding to reveal (each card carries its own
//                    backdrop + pill/sphere, and the platinum base is always
//                    present), so `setup` typically does nothing and is kept
//                    only for cross-template parity. Usually omitted.
//   card0/card1/card2  the three pillar cards. Each reveals as ONE object:
//                    card backdrop pops/fades in, then its content (character
//                    + title) fades, the pill+sphere+number fades, and the
//                    subtopic types out, the whole cascade unfolds across the
//                    step's `in` window.
//
// The per-card `in` default is ~2.4 s (longer than YinYang's 0.5 or Process's
// 0.8) so the internal cascade + typewriter keep their original pacing.
export const revealStepSchema = z.object({
  target: z.enum(['setup', 'card0', 'card1', 'card2']),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(2.4), // entrance duration (full card cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type BigPoints3V2CharacterTarget = RevealStep['target'];

// Re-mention pulse: when an already-revealed card is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Only content cards are pulsable (no setup).
export const pulseStepSchema = z.object({
  target: z.enum(['card0', 'card1', 'card2']),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const bigPoints3V2CharacterTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const bigPoints3V2CharacterSchema = z.object({
  cards:   z.array(cardSchema).length(3),
  timings: bigPoints3V2CharacterTimingSchema.optional(),
});

export type BigPoints3V2CharacterProps = z.infer<typeof bigPoints3V2CharacterSchema>;

export const bigPoints3V2CharacterMeta = {
  description:
    'Three pillar cards arriving one-by-one on a platinum-blue base. Same ' +
    'layout + animation as BigPoints3V2 (icon variant), but each card now ' +
    'hosts a CHARACTER PORTRAIT clipped to the dodger-blue card body, ' +
    'with the face landing at the card centre. Use exactly three different ' +
    'characters so the trio reads as a team.',
  authoringNotes:
    'Always supply exactly 3 cards. title ≤25 chars (Inter ExtraBold 55 px). ' +
    'subtopic ≤30 chars (Satoshi Medium 33 px, typewriter, keep it short so ' +
    'it finishes typing within the step). character.id is a PNG ID in ' +
    'characters/<id>.png, the ONLY authorable field. Size and position are ' +
    'fixed for every card so the tops of all three heads line up; you cannot ' +
    '(and should not) resize or reposition a character. Just swap the id to ' +
    'change the person. IMPORTANT: use consistently-framed presenter ' +
    'HEAD-SHOTS (roughly square, face ~27% from the top). Full-body shots or ' +
    'wide/landscape images will NOT align. Use a different character per card ' +
    'for the team feel. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, each card ' +
    'appears only when a step in `timings.sequence` targets it. Targets: ' +
    'setup (optional near-no-op; this template has no scaffolding to reveal), ' +
    'card0, card1, card2. Each step is { target, at (seconds), in? (entrance ' +
    'duration, default 2.4) }. A card step reveals its backdrop, character, ' +
    'title, number and typewriter subtopic together as one object. NARRATION ' +
    'MUST be linear-by-card: introduce one card fully (title then its subtopic) ' +
    'before the next, never jump ahead or back. The three read as parallel ' +
    'members of a set/team. See GUIDANCE.md for full selection and narration ' +
    'rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BASE_CONTAINER_SRC  = staticFile('Template-Specific-Assets/BigPoints3V2Character/base_container.png');
const PILL_AND_SPHERE_SRC = staticFile('Template-Specific-Assets/BigPoints3V2Character/pill_and_sphere.png');
const INTER_EXTRABOLD_SRC = staticFile('fonts/Inter-ExtraBold.woff2');
const SATOSHI_MEDIUM_SRC  = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (lifted directly from BigPoints3V2) ─────────────────────

const CARD_SRC_CX = 366;
const CARD_SRC_CY = 626;

const CARD_FINAL_CXS = [356, 961, 1566] as const;
const CARD_OFFSET_Y  = -80;

const SPHERE_LEFT = 124;
const SPHERE_TOP  = 913;
const SPHERE_W    = 84;
const SPHERE_H    = 81;

// Width capped below the 569 px card body so long titles wrap onto a second
// line instead of bleeding out over the platinum background.
const TITLE_TOP   = 296;
const TITLE_WIDTH = 500;

const SUBTOPIC_LEFT  = 232;
const SUBTOPIC_WIDTH = 380;
const SUBTOPIC_CY    = SPHERE_TOP + SPHERE_H / 2;

// Character container, sized to MATCH THE CARD BODY exactly, with
// rounded corners that follow the card outline. This way:
//   • Any character pixels that extend past the container clip at the
//     same curved shape as the card itself (no straight-line shoulder
//     cut-off, clipping happens on the card edge).
//   • Nothing appears outside the visible blue card.
const CHAR_CONTAINER_LEFT   = 82;
const CHAR_CONTAINER_TOP    = 226;
const CHAR_CONTAINER_WIDTH  = 569;
const CHAR_CONTAINER_HEIGHT = 801;
const CHAR_CONTAINER_RADIUS = 40;

// Fixed for EVERY character, not authorable. Height/Y are identical for all
// three cards so the heads line up across the trio. This ONLY holds for
// consistently-framed presenter head-shots (face ~27% from the PNG top, roughly
// square canvas), the intended input for this template. Full-body shots or
// non-portrait images won't match in head size/position; no fixed transform can
// reconcile different shot types. Height extends below the 801px container so
// the figure clips at the rounded card edge (image bottom = 130+780 = 910),
// with the pill graphic overlapping the mid-torso.
const CHARACTER_HEIGHT = 780;
const CHARACTER_Y      = 130;   // face lands ~y=567 in card source

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Internal cascade phase boundaries, expressed as PROPORTIONS of a card step's
// `in` window. Lifted from the original BigPoints3V2 absolute timings (card
// scale 0.70, fade 0.40, content fade 0.45→1.05, pill fade 1.05→1.50,
// typewriter 1.55→2.40) and normalised against the original ~2.40 s total so
// the cascade keeps its relative pacing at any `in`.
const CARD_SCALE_END   = 0.70 / 2.4;   // ≈0.292, card pop settles
const CARD_FADE_END    = 0.40 / 2.4;   // ≈0.167, card opacity ramps
const CONTENT_FADE_IN  = 0.45 / 2.4;   // ≈0.188, character + title start
const CONTENT_FADE_END = 1.05 / 2.4;   // ≈0.438
const PILL_FADE_IN     = 1.05 / 2.4;   // ≈0.438, pill/sphere/number start
const PILL_FADE_END    = 1.50 / 2.4;   // ≈0.625
const TYPE_START       = 1.55 / 2.4;   // ≈0.646, subtopic typewriter start
const TYPE_END         = 2.40 / 2.4;   // 1.000, typewriter finishes at step end

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
// One card = one reveal object. `startFrame` is the step's `at`; `inFrames` is
// the step's `in` window, across which the whole internal cascade unfolds.

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
  card: z.infer<typeof cardSchema>;
  startFrame: number;
  inFrames: number;
  pulseFrames: number[];
}) {
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // Phase boundaries (frames within the step), derived from the proportions.
  const cardScaleDur   = inFrames * CARD_SCALE_END;
  const cardFadeDur    = inFrames * CARD_FADE_END;
  const contentFadeIn  = inFrames * CONTENT_FADE_IN;
  const contentFadeEnd = inFrames * CONTENT_FADE_END;
  const pillFadeIn     = inFrames * PILL_FADE_IN;
  const pillFadeOut    = inFrames * PILL_FADE_END;
  const typeStart      = inFrames * TYPE_START;
  const typeEnd        = inFrames * TYPE_END;

  const scaleProg    = interpolate(localFrame, [0, cardScaleDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const settled      = localFrame >= cardScaleDur;
  const cardScale    = settled ? 1 : (scaleProg > 0 ? subtleBackEase(scaleProg) : 0);
  const cardOpacity  = interpolate(localFrame, [0, cardFadeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  const contentOp = interpolate(localFrame, [contentFadeIn, contentFadeEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: cubicInOut,
  });

  const pillOp = interpolate(localFrame, [pillFadeIn, pillFadeOut], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: cubicInOut,
  });

  const typeProg = interpolate(localFrame, [typeStart, typeEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(card.subtopic.length * typeProg);
  const visibleSub = card.subtopic.slice(0, charsShow);

  const offsetX = CARD_FINAL_CXS[index]! - CARD_SRC_CX;
  const offsetY = CARD_OFFSET_Y;

  // Re-mention pulse: a brief scale bump around the card's own centre. It only
  // bumps inside a pulse window (1 at rest), so it never disturbs the entrance
  // cascade; it multiplies into the existing card scale, sharing the same
  // transformOrigin at the card source centre.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

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
      {/* Dodger-blue gradient card backdrop */}
      <Img
        src={BASE_CONTAINER_SRC}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Character portrait, rendered FIRST so title + pill+sphere sit
          ON TOP of the figure. The container fills nearly the full card
          body; the figure is sized so the chest extends down past the
          pill area where it's hidden by the pill graphic. Drop shadow
          lifts the figure off the dodger-blue gradient. */}
      <div
        style={{
          position: 'absolute',
          left:   CHAR_CONTAINER_LEFT,
          top:    CHAR_CONTAINER_TOP,
          width:  CHAR_CONTAINER_WIDTH,
          height: CHAR_CONTAINER_HEIGHT,
          borderRadius: CHAR_CONTAINER_RADIUS,
          overflow: 'hidden',
          opacity: contentOp,
        }}
      >
        <Img
          src={staticFile(`characters/${card.character.id}.png`)}
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top:  CHARACTER_Y,
            height: CHARACTER_HEIGHT,
            width:  'auto',
            transform: 'translateX(-50%)',
            display: 'block',
            filter:
              'drop-shadow(0 14px 20px rgba(2, 18, 36, 0.42)) ' +
              'drop-shadow(0 4px 6px rgba(2, 18, 36, 0.32))',
          }}
        />
      </div>

      {/* Title, rendered AFTER character so it always sits on top. */}
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

      {/* Pill + sphere asset overlays the bottom of the card, covers the
          character's chest cleanly so there's no visible cut-off line. */}
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

      {/* Number inside the sphere */}
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

      {/* Subtopic typewriter */}
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
          opacity: localFrame >= typeStart ? 1 : 0,
        }}
      >
        {visibleSub}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const BigPoints3V2Character: React.FC<BigPoints3V2CharacterProps> = ({ cards, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading BigPoints3V2Character fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default). `setup` is a near-no-op
  // here (this template has no shared scaffolding) but is honoured for parity.
  const byTarget = new Map<BigPoints3V2CharacterTarget, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: BigPoints3V2CharacterTarget): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 2.4);

  // Re-mention pulse frames per card (from timings.pulses).
  const pulseFramesFor = (target: 'card0' | 'card1' | 'card2') =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Each card is gated on its own reveal step; absent step -> no card. */}
      {([0, 1, 2] as const).map(i => {
        const c = cue(`card${i}` as BigPoints3V2CharacterTarget);
        return c ? (
          <Card
            key={i}
            index={i}
            frame={frame}
            card={cards[i]!}
            startFrame={f(c.at)}
            inFrames={f(durOf(c))}
            pulseFrames={pulseFramesFor(`card${i}` as 'card0' | 'card1' | 'card2')}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
