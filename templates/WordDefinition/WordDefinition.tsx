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

// Ports the Word Definition prototype to the STANDARD reveal-sequence model:
//   • setup      , decorative chrome revealed as one unit: the banner (top-left
//                   graphic) drops down from off-canvas top (easeOutCubic, 520 px
//                   travel) while the icon pill (top-right) slides in from off-
//                   canvas right (easeOutCubic, 700 px travel). Both share the
//                   step's window, so they settle together.
//   • title      , the word being defined, Inter ExtraBold 74 px near-black,
//                   revealed with a typewriter character-stagger (each letter
//                   fades in across the step's window).
//   • description, the definition text, Satoshi Medium 55.5 px warm-grey, fades
//                   in below the title (easeInOutQuad) and wraps to 2-3 lines.
//
// The platinum-blue gradient background is the implicit blank stage and is always
// present. The prototype supported four background styles + four entry directions
// per element; this port locks to the persisted defaults (gradient platinum-blue
// background, banner from top, pill from right, description fade-in).

// ─── Schema ──────────────────────────────────────────────────────────────────

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just the
// platinum-blue gradient stage). Each step is one "object". All times are
// scene-relative SECONDS.
//
// Addressable targets for this template (FIXED named slots):
//   setup         banner + icon pill decorative chrome slide in together
//   title         the word being defined (typewriter character-stagger reveal)
//   description   the definition text (fade-in below the title)
export const revealStepSchema = z.object({
  target: z.enum(['setup', 'title', 'description']),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.6), // entrance duration (slide / type / fade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type WordDefinitionTarget = RevealStep['target'];

// Re-mention pulse: when an already-revealed element is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). See README "re-mention pulse" principle.
// Targets are the content slots only (title, description); setup is excluded.
export const pulseStepSchema = z.object({
  target: z.enum(['title', 'description']),
  at: z.number().nonnegative(),
});

export const wordDefinitionTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const wordDefinitionSchema = z.object({
  // The word being defined (e.g. "Serendipity"). Inter ExtraBold 74 px,
  // ALWAYS near-black ink (locked to the brand palette).
  title: z.string().min(1).max(40),
  // The definition text. Satoshi Medium 55.5 px, warm-grey, wraps.
  description: z.string().min(1).max(200),
  timings: wordDefinitionTimingSchema.optional(),
});

export type WordDefinitionProps = z.infer<typeof wordDefinitionSchema>;

export const wordDefinitionMeta = {
  description:
    'Vocabulary card: the word types out letter-by-letter top-left, the ' +
    'definition fades in below it, a banner drops from the top and an icon ' +
    'pill slides in from the right. Best for naming and defining a single ' +
    'term, a glossary card, key concept, or jargon-buster.',
  authoringNotes:
    'Two editable fields: title (the word being defined; Inter ExtraBold 74 px, ' +
    'near-black ink, colour locked) and description (Satoshi Medium 55.5 px, ' +
    'warm-grey, wraps to multiple lines). The platinum-blue gradient ' +
    'background, the title-text colour, and the description-text colour are ' +
    'all LOCKED to the brand palette, no per-render overrides. GOOD title: ' +
    '"Serendipity", "Ephemeral". GOOD description: "The occurrence of events ' +
    'by chance in a happy way." Aim for definitions under 120 chars so they ' +
    'fit 2-3 lines. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every ' +
    'element appears only when a step in `timings.sequence` targets it. Targets ' +
    '(fixed named slots): setup, title, description. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.6) }. The setup ' +
    'step reveals the banner AND pill together; the title step types the word ' +
    'out letter-by-letter across its window. NARRATION MUST be linear two-beat: ' +
    'name the word (title) first, then deliver its definition (description), ' +
    'never explain before naming, one term per card. See GUIDANCE.md for full ' +
    'selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BANNER_SRC = staticFile('Template-Specific-Assets/WordDefinition/word_definition_banner.png');
const ICON_PILL_SRC = staticFile('Template-Specific-Assets/WordDefinition/icon_pill.png');
const INTER_EXTRABOLD_SRC = staticFile('fonts/ClashGrotesk-Bold.woff2');
const SATOSHI_MEDIUM_SRC  = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (lifted directly from the prototype's defaults) ─────────

// Title position.
const TITLE_LEFT = 120;
const TITLE_TOP  = 460;
const TITLE_SIZE = 74;
const TITLE_LINE_HEIGHT = 1.05;

// Description position (below title with 40 px gap).
const DESC_TOP_OFFSET = 40;  // gap below title baseline
const DESC_SIZE = 55.5;
const DESC_LINE_HEIGHT = 1.25;

// Right-safe boundary so title/description don't run into the icon pill.
const RIGHT_SAFE_X = 1320;

// Brand-locked colours + background tint. NOT overridable per render.
const TITLE_COLOUR       = '#0B1B2B';   // near-black ink
const DESC_COLOUR        = '#4A5864';   // warm grey
const BACKGROUND_HUE     = 210;          // cool platinum blue
const BACKGROUND_GRADIENT =
  `linear-gradient(135deg, oklch(97% 0.012 ${BACKGROUND_HUE}) 0%, ` +
  `oklch(92% 0.022 ${BACKGROUND_HUE}) 100%)`;

// Banner + pill entry distances.
const BANNER_SLIDE_DISTANCE = 520;  // banner enters from top
const PILL_SLIDE_DISTANCE   = 700;  // pill enters from right

// Fraction of the title step's window each letter spends fading in. The rest of
// the window is spread across the letter start times (the typewriter stagger),
// preserving the prototype's character-by-character reveal while driving it from
// the single `in` duration.
const LETTER_FADE_FRACTION = 0.30;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic    = Easing.out(Easing.cubic);
const easeInOutQuad   = Easing.inOut(Easing.quad);
const easeOutQuad     = Easing.out(Easing.quad);

// Easing curve for letter stagger (ease, both ends slow, middle fast).
const staggerCurve = (i: number) => easeInOutQuad(i);

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
    const inter   = new FontFace('ClashGrotesk',  `url(${INTER_EXTRABOLD_SRC}) format('woff2')`, { weight: '800', display: 'block' });
    const satoshi = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`,  { weight: '500', display: 'block' });
    const [i, s]  = await Promise.all([inter.load(), satoshi.load()]);
    const fonts   = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(i);
    fonts.add(s);
  })();
  return fontsPromise;
}

// ─── Banner (top-left, slides in from above) ─────────────────────────────────

function Banner({ frame, startFrame, settleFrames }: { frame: number; startFrame: number; settleFrames: number }) {
  const prog = interpolate(frame, [startFrame, startFrame + settleFrames], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const ty = -BANNER_SLIDE_DISTANCE * (1 - prog);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateY(${ty}px)`,
        transformOrigin: '175px 175px',
        pointerEvents: 'none',
      }}
    >
      <Img
        src={BANNER_SRC}
        alt=""
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
 );
}

// ─── Icon pill (top-right, slides in from off-canvas right) ──────────────────

function IconPill({ frame, startFrame, settleFrames }: { frame: number; startFrame: number; settleFrames: number }) {
  const prog = interpolate(frame, [startFrame, startFrame + settleFrames], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const tx = PILL_SLIDE_DISTANCE * (1 - prog);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateX(${tx}px)`,
        transformOrigin: '1630px 540px',
        pointerEvents: 'none',
      }}
    >
      <Img
        src={ICON_PILL_SRC}
        alt=""
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
 );
}

// ─── Typewriter title ────────────────────────────────────────────────────────
// Characters reveal one-by-one using a staggered fade-in. The whole word
// finishes by endFrame; each letter fades over letterFadeFrames.

function TypewriterTitle({
  frame,
  text,
  color,
  startFrame,
  endFrame,
  letterFadeFrames,
  pulseFrames,
}: {
  frame: number;
  text: string;
  color: string;
  startFrame: number;
  endFrame: number;
  letterFadeFrames: number;
  pulseFrames: number[];
}) {
  const chars = Array.from(text);
  const n = chars.length;
  const total = Math.max(0.001, endFrame - startFrame);
  const spanRange = Math.max(0.001, total - letterFadeFrames);

  // Re-mention pulse: a brief additive scale bump, only after the title has
  // appeared (pulseScale returns 1 outside its windows, so the typewriter
  // reveal is untouched). Origin at the title block's left-centre so the
  // left-anchored layout stays put.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: TITLE_LEFT,
        top:  TITLE_TOP,
        fontFamily: "'ClashGrotesk', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: TITLE_SIZE,
        lineHeight: TITLE_LINE_HEIGHT,
        color,
        letterSpacing: '-0.015em',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        maxWidth: Math.max(200, RIGHT_SAFE_X - TITLE_LEFT),
        transform: `scale(${pulse})`,
        transformOrigin: 'left center',
      }}
    >
      {chars.map((ch, i) => {
        const iNorm = n <= 1 ? 0 : i / (n - 1);
        const letterStart = startFrame + staggerCurve(iNorm) * spanRange;
        const letterEnd   = letterStart + letterFadeFrames;
        const local = Math.max(0, Math.min(1, (frame - letterStart) / Math.max(0.001, letterEnd - letterStart)));
        const op = easeOutQuad(local);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: op,
              whiteSpace: 'pre',
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
       );
      })}
    </div>
 );
}

// ─── Description (fades in below title) ──────────────────────────────────────

function Description({
  frame,
  text,
  color,
  fadeStart,
  fadeEnd,
  pulseFrames,
}: {
  frame: number;
  text: string;
  color: string;
  fadeStart: number;
  fadeEnd: number;
  pulseFrames: number[];
}) {
  const opacity = interpolate(frame, [fadeStart, fadeEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutQuad,
  });

  // Re-mention pulse: additive scale bump after the description has faded in
  // (1 outside pulse windows, so the fade-in is unchanged). Origin at the
  // block's left-centre so the left-anchored layout stays put.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: TITLE_LEFT,
        top:  TITLE_TOP + TITLE_SIZE + DESC_TOP_OFFSET,
        fontFamily: "'Satoshi', 'ClashGrotesk', system-ui, sans-serif",
        fontWeight: 500,
        fontSize: DESC_SIZE,
        lineHeight: DESC_LINE_HEIGHT,
        color,
        letterSpacing: '-0.005em',
        opacity,
        maxWidth: Math.max(200, RIGHT_SAFE_X - TITLE_LEFT),
        transform: `scale(${pulse})`,
        transformOrigin: 'left center',
      }}
    >
      {text}
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const WordDefinition: React.FC<WordDefinitionProps> = ({
  title,
  description,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading WordDefinition fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default; just the gradient stage).
  const byTarget = new Map<WordDefinitionTarget, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: WordDefinitionTarget): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.6);

  // Resolve each target's step once.
  const cSetup = cue('setup');
  const cTitle = cue('title');
  const cDesc  = cue('description');

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: 'title' | 'description') =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));
  const titlePulseF = pulseFramesFor('title');
  const descPulseF  = pulseFramesFor('description');

  return (
    <AbsoluteFill style={{ background: BACKGROUND_GRADIENT, overflow: 'hidden' }}>
      {/* Setup, banner + icon pill chrome, revealed together (only when scheduled). */}
      {cSetup && (
        <Banner
          frame={frame}
          startFrame={f(cSetup.at)}
          settleFrames={f(durOf(cSetup))}
        />
     )}
      {cSetup && (
        <IconPill
          frame={frame}
          startFrame={f(cSetup.at)}
          settleFrames={f(durOf(cSetup))}
        />
     )}

      {/* Title, typewriter character-stagger across the step window. */}
      {cTitle && (
        <TypewriterTitle
          frame={frame}
          text={title}
          color={TITLE_COLOUR}
          startFrame={f(cTitle.at)}
          endFrame={f(cTitle.at + durOf(cTitle))}
          letterFadeFrames={Math.max(1, f(durOf(cTitle) * LETTER_FADE_FRACTION))}
          pulseFrames={titlePulseF}
        />
     )}

      {/* Description, fade-in below the title. */}
      {cDesc && (
        <Description
          frame={frame}
          text={description}
          color={DESC_COLOUR}
          fadeStart={f(cDesc.at)}
          fadeEnd={f(cDesc.at + durOf(cDesc))}
          pulseFrames={descPulseF}
        />
     )}
    </AbsoluteFill>
 );
};
