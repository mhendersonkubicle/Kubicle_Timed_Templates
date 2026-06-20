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

// FivePoints1SubtopicV2, vertical 1-to-5 milestone roadmap.
//   • Dark left anchor panel (icon_base.png) holding either a line-art icon
//     (icons/<id>.svg, 500×500) or a character portrait (characters/<id>.png).
//   • On the right, a grey dotted spine connects up to 5 milestone circles,
//     each paired with a card (blue icon square + Inter Bold title + Satoshi
//     description). A blue dotted overlay fills the spine down to the deepest
//     revealed milestone.
//
// REVEAL-SEQUENCE PORT: the original V2 animation glided a continuous
// "spotlight" down the spine and pulled whichever card it was nearest into
// focus (1.05× scale, 0.7→1.0 opacity). That continuous travelling-highlight
// does not decompose into discrete reveals, so it is replaced by per-milestone
// reveal-and-settle steps: each `card{i}` scales/fades up to its settled state
// and each `tick{i}` pops its circle + wipes its check, at that step's cue.
// The blue spine fill is re-derived from the deepest revealed tick rather than
// from a spotlight Y. All times are scene-relative SECONDS.

// ─── Schema ──────────────────────────────────────────────────────────────────

const milestoneSchema = z.object({
  title:       z.string().min(1).max(20),
  description: z.string().min(1).max(32),
  // Per-card icon shown in the blue square on the card's left. Resolves to
  // icons/<id>.svg (the Icons/ folder). Any icon in that folder
  // works, they're already pre-coloured white and overlay the blue square.
  icon:        z.string().min(1),
});

export const fivePoints1SubtopicV2AnchorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('icon'),     id: z.string().min(1) }),
  z.object({ kind: z.literal('character'), id: z.string().min(1) }),
]);

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). Each step is one "object". All times are scene-relative
// SECONDS.
//
// Addressable targets:
//   setup            scaffolding: dark left panel + anchor fade in and the grey
//                    dotted spine draws from the first to the last tick.
//   card{i}          milestone i's card (icon square + title + description)
//                    scales/fades up to its settled state.
//   tick{i}          milestone i's circle pops in (easeOutBack) and its white
//                    check glyph wipes in; the blue spine fills down to it.
//                    i = 0..milestones.length-1; targets beyond the count are
//                    ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|card[0-9]+|tick[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.7), // entrance / pop duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed milestone is NAMED AGAIN later in
// the narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse
// at the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets are the same INDEXED content slots as
// the sequence (card{i} / tick{i}), excluding setup. See README "re-mention
// pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(card[0-9]+|tick[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const fivePoints1SubtopicV2TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const fivePoints1SubtopicV2Schema = z.object({
  // 1 to 5 milestones, the column of cards + ticks auto-centres vertically
  // for the count (e.g. 3 cards sit centred in the frame).
  milestones: z.array(milestoneSchema).min(1).max(5),
  anchor:     fivePoints1SubtopicV2AnchorSchema,
  timings:    fivePoints1SubtopicV2TimingsSchema.optional(),
});

export type FivePoints1SubtopicV2Props = z.infer<typeof fivePoints1SubtopicV2Schema>;

export const fivePoints1SubtopicV2Meta = {
  description:
    'Vertical 1-to-5 milestone roadmap: a dark anchor panel on the left (icon ' +
    'OR character portrait); on the right a grey dotted spine connects up to 5 ' +
    'milestone circles, each paired with a card (blue icon square + title + ' +
    'description). Milestones reveal top-to-bottom, one at a time, and a blue ' +
    'dotted overlay fills the spine down to the latest milestone. Best for a ' +
    'roadmap, journey, or staged plan where order reads downward.',
  authoringNotes:
    'Supply 1 to 5 milestones, the column auto-centres vertically for the ' +
    'count (3 cards sit centred in the frame, etc.). Each milestone has ' +
    '{ title (≤20 chars), description (≤32 chars), icon }, icon is an id from ' +
    'the Icons/ folder (icons/<id>.svg, already pre-coloured white) ' +
    "shown in the blue square on the card's left. anchor is a discriminated " +
    "union: { kind: 'icon', id } renders icons/<id>.svg (500×500 line art), " +
    'use a DARK-MODE icon (the "-dark" suffix gives platinum + dodger-blue ' +
    "strokes that read on the Oxford-Blue panel). { kind: 'character', id } " +
    'renders characters/<id>.png fitted to the panel (object-fit: contain, ' +
    'bottom-anchored); use a pre-cut PNG with a transparent background. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every ' +
    'element appears only when a step in `timings.sequence` targets it. ' +
    'Targets: setup (panel + anchor + dotted spine), then card{i} and tick{i} ' +
    'per milestone (i = 0..milestones.length-1). Each step is { target, at ' +
    '(seconds), in? (entrance duration, default 0.7) }. The canonical order is ' +
    'setup, then card0, tick0, card1, tick1, … so each milestone reveals its ' +
    'card then completes its tick before the next. NARRATION MUST be linear ' +
    'top-to-bottom: introduce milestone 1 fully before milestone 2, matching ' +
    'the spine\'s downward progression. See GUIDANCE.md for full selection and ' +
    'narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const ICON_BASE_SRC        = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/icon_base.png');
const PILL_BASE_SRC        = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/pill_base.png');
const DOTTED_LINE_SRC      = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/dotted_line_base.png');
const BLUE_DOTTED_LINE_SRC = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/blue_dotted_line_base.png');
const TICK_BASE_SRC        = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/tick_base.png');
const TICK_SRC             = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/tick.png');
const INTER_BOLD_SRC       = staticFile('fonts/ClashGrotesk-Bold.woff2');
const SATOSHI_REG_SRC      = staticFile('fonts/Satoshi-Regular.woff2');

// ─── Layout constants ─────────────────────────────────────────────────────────

const PILL_SRC_LEFT = 1065;
const PILL_SRC_TOP  = 76;
const CARD_W = 755;
const CARD_H = 158;

// Card centre Ys auto-centre vertically for `count` milestones (1-5). At
// count=5 the pitch (200) reproduces the original positions [139, 340, 540,
// 740, 940]; at lower counts the band shrinks and sits centred on CANVAS_CY.
const CANVAS_CY  = 540;
const CARD_PITCH = 200;
const cardCyFor  = (count: number, i: number) =>
  CANVAS_CY - ((count - 1) * CARD_PITCH) / 2 + i * CARD_PITCH;
const tickCyFor  = (count: number, i: number) => cardCyFor(count, i);

const TICK_SRC_CX = 995;
const TICK_SRC_CY = 141;
const TICK_GLYPH_LEFT  = 981;
const TICK_GLYPH_RIGHT = 1008;

// Spine spans from first tick to last tick, derived per count.
const spineTopFor    = (count: number) => tickCyFor(count, 0);
const spineBottomFor = (count: number) => tickCyFor(count, count - 1);

// Per-card icon box, the dodger-blue square on the left of each card. The
// component overlays a matching-colour rounded square (to mask the baked
// arrow in pill_base.png) and renders the chosen master Icons/ (-dark) SVG on top.
// Local card coords, derived from pill_base alpha bbox (1094..1189, 116..199).
// Baked-square true alpha bbox in pill_base.png: x=1094..1190, y=110..199
// (radius ~17). Overlay extends 2 px past every edge so the baked square's
// lighter top edge can't peek through as a visible rim.
const ICON_BOX_LEFT   = 27;     // 1094 - 1065 - 2
const ICON_BOX_TOP    = 33;     // 110  - 76   - 1
const ICON_BOX_WIDTH  = 100;    // baked 97 + 3
const ICON_BOX_HEIGHT = 92;     // baked 90 + 2
const ICON_BOX_RADIUS = 18;     // baked ~17, +1 to fully clip corners
const ICON_GLYPH_SIZE = 50;
const ICON_BOX_GRADIENT =
  'linear-gradient(180deg, #1FA3FF 0%, #0496FF 100%)';

// Icon-mode anchor: 500×500 square centred on the panel.
const PANEL_CX = 482;
const PANEL_CY = 536;
const PANEL_ICON_SIZE = 500;

// Character-mode anchor: full panel content bbox.
const PANEL_CONTENT_LEFT   = 107;
const PANEL_CONTENT_TOP    = 61;
const PANEL_CONTENT_WIDTH  = 858 - 107;
const PANEL_CONTENT_HEIGHT = 1012 - 61;
const PANEL_CORNER_RADIUS  = 40;

const CARD_TEXT_LEFT   = 154;
const CARD_TITLE_TOP   = 30;
const CARD_DESC_TOP    = 86;
const CARD_TEXT_RIGHT_PAD = 24;

// Card settled appearance (the old focus-pull's "in focus" end state, every
// revealed card now settles here once its entrance completes).
const CARD_SETTLED_SCALE   = 1.05;
const CARD_SETTLED_OPACITY = 1.0;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const DEFAULT_IN = 0.7;

const easeInOutCubic    = Easing.inOut(Easing.cubic);
const easeOutBackSubtle = Easing.out(Easing.back(0.6));

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

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
    const inter   = new FontFace('ClashGrotesk',  `url(${INTER_BOLD_SRC}) format('woff2')`, { weight: '700', display: 'block' });
    const satoshi = new FontFace('Satoshi', `url(${SATOSHI_REG_SRC}) format('woff2')`, { weight: '400', display: 'block' });
    const [i, s]  = await Promise.all([inter.load(), satoshi.load()]);
    const fonts   = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(i);
    fonts.add(s);
  })();
  return fontsPromise;
}

// ─── Spine ────────────────────────────────────────────────────────────────────
// The grey spine draws in across the setup window. The blue overlay fills down
// to `blueY`, the centre of the deepest revealed tick, so the active spine
// segment tracks the milestones being revealed (no continuous spotlight).

function Spine({
  frame,
  blueY,
  spineTop,
  spineBottom,
  spineDrawStart,
  spineDrawEnd,
}: {
  frame: number;
  blueY: number;
  spineTop: number;
  spineBottom: number;
  spineDrawStart: number;
  spineDrawEnd: number;
}) {
  const spineHeight = spineBottom - spineTop;
  const drawProg = interpolate(frame, [spineDrawStart, spineDrawEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const drawHeight  = spineHeight * drawProg;
  const drawClipBot = 1080 - (spineTop + drawHeight);

  const blueProg   = clamp01((blueY - spineTop) / Math.max(1, spineHeight));
  const blueHeight = spineHeight * blueProg;
  const blueClipBot = 1080 - (spineTop + blueHeight);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(${spineTop}px 0 ${drawClipBot}px 0)`,
          pointerEvents: 'none',
        }}
      >
        <Img src={DOTTED_LINE_SRC} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(${spineTop}px 0 ${blueClipBot}px 0)`,
          pointerEvents: 'none',
        }}
      >
        <Img src={BLUE_DOTTED_LINE_SRC} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </>
 );
}

// ─── Milestone (tick) ───────────────────────────────────────────────────────
// Gated on its tick{i} reveal: the circle pops in (easeOutBack scale) over the
// step window and the white check glyph wipes in left-to-right.

function Milestone({
  frame,
  startFrame,
  durFrame,
  tickCy,
  pulseFrames,
}: {
  frame: number;
  startFrame: number;
  durFrame: number;
  tickCy: number;
  pulseFrames: number[];
}) {
  const offset = tickCy - TICK_SRC_CY;

  const circleProg  = clamp01((frame - startFrame) / durFrame);
  const circleScale = circleProg > 0 ? easeOutBackSubtle(circleProg) : 0;

  // Check wipes in over the back half of the step window.
  const trimProg  = clamp01((frame - (startFrame + durFrame * 0.4)) / (durFrame * 0.7));
  const trimEased = easeInOutCubic(trimProg);
  const tickRevealRight = (1920 - TICK_GLYPH_LEFT) - (TICK_GLYPH_RIGHT - TICK_GLYPH_LEFT) * trimEased;

  // Re-mention pulse: a brief scale bump around the tick's own centre, only
  // after it has popped in (pulseScale returns 1 outside pulse windows).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  const sharedTransform = `translateY(${offset}px) scale(${circleScale * pulse})`;
  const sharedOrigin    = `${TICK_SRC_CX}px ${TICK_SRC_CY}px`;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: sharedTransform,
          transformOrigin: sharedOrigin,
          opacity: circleProg > 0 ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <Img src={TICK_BASE_SRC} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: sharedTransform,
          transformOrigin: sharedOrigin,
          clipPath: `inset(0 ${tickRevealRight}px 0 0)`,
          opacity: trimProg > 0 ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <Img src={TICK_SRC} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </>
 );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
// Gated on its card{i} reveal: scales/fades from a smaller dim state up to the
// settled state (the old focus-pull end state: 1.05× scale, full opacity).

function Card({
  frame,
  startFrame,
  durFrame,
  cy,
  title,
  description,
  icon,
  pulseFrames,
}: {
  frame: number;
  startFrame: number;
  durFrame: number;
  cy: number;
  title: string;
  description: string;
  icon: string;
  pulseFrames: number[];
}) {
  const inProg = clamp01((frame - startFrame) / durFrame);
  const eased  = easeInOutCubic(inProg);
  const drawScale   = 0.92 + (CARD_SETTLED_SCALE - 0.92) * eased;
  const drawOpacity = CARD_SETTLED_OPACITY * eased;

  // Re-mention pulse: a brief scale bump around the card's own centre, only
  // after it has settled (pulseScale returns 1 outside pulse windows).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  const left = PILL_SRC_LEFT;
  const top  = cy - CARD_H / 2;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width:  CARD_W,
        height: CARD_H,
        transform: `scale(${drawScale * pulse})`,
        transformOrigin: 'center center',
        opacity: drawOpacity,
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <Img
          src={PILL_BASE_SRC}
          alt=""
          style={{
            position: 'absolute',
            left: -left,
            top:  -PILL_SRC_TOP,
            width:  1920,
            height: 1080,
            display: 'block',
          }}
        />
      </div>

      {/* Per-card icon overlay, a matched dodger-blue rounded square covers
          the baked arrow in pill_base.png and the master Icons/ (-dark) SVG renders on
          top. SVGs in Icons/ are already pre-coloured white. */}
      <div
        style={{
          position: 'absolute',
          left: ICON_BOX_LEFT,
          top:  ICON_BOX_TOP,
          width:  ICON_BOX_WIDTH,
          height: ICON_BOX_HEIGHT,
          borderRadius: ICON_BOX_RADIUS,
          background: ICON_BOX_GRADIENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img
          src={staticFile(`icons/${icon}.svg`)}
          alt=""
          style={{ width: ICON_GLYPH_SIZE, height: ICON_GLYPH_SIZE, display: 'block' }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: CARD_TEXT_LEFT,
          top:  CARD_TITLE_TOP,
          right: CARD_TEXT_RIGHT_PAD,
          color: '#000000',
          fontFamily: "'ClashGrotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 37,
          letterSpacing: '-0.005em',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: 'absolute',
          left: CARD_TEXT_LEFT,
          top:  CARD_DESC_TOP,
          right: CARD_TEXT_RIGHT_PAD,
          color: '#707070',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 33,
          letterSpacing: '-0.005em',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {description}
      </div>
    </div>
 );
}

// ─── Anchor (icon or character) ──────────────────────────────────────────────

type Anchor = FivePoints1SubtopicV2Props['anchor'];

function Anchor({ anchor }: { anchor: Anchor }) {
  if (anchor.kind === 'icon') {
    return (
      <div
        style={{
          position: 'absolute',
          left: PANEL_CX - PANEL_ICON_SIZE / 2,
          top:  PANEL_CY - PANEL_ICON_SIZE / 2,
          width:  PANEL_ICON_SIZE,
          height: PANEL_ICON_SIZE,
        }}
      >
        <Img
          src={staticFile(`icons/${anchor.id}.svg`)}
          alt=""
          style={{ width: PANEL_ICON_SIZE, height: PANEL_ICON_SIZE }}
        />
      </div>
   );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL_CONTENT_LEFT,
        top:  PANEL_CONTENT_TOP,
        width:  PANEL_CONTENT_WIDTH,
        height: PANEL_CONTENT_HEIGHT,
        borderRadius: PANEL_CORNER_RADIUS,
        overflow: 'hidden',
      }}
    >
      <Img
        src={staticFile(`characters/${anchor.id}.png`)}
        alt=""
        style={{
          width:  '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: '50% 100%',
          display: 'block',
        }}
      />
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const FivePoints1SubtopicV2: React.FC<FivePoints1SubtopicV2Props> = ({
  milestones,
  anchor,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading FivePoints1SubtopicV2 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? DEFAULT_IN);

  // Re-mention pulse frames per content target (card{i} / tick{i}).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Vertically centre the band of cards/ticks for however many milestones (1-5).
  const count = milestones.length;
  const cardCYs = Array.from({ length: count }, (_, i) => cardCyFor(count, i));
  const tickCYs = Array.from({ length: count }, (_, i) => tickCyFor(count, i));
  const spineTop    = spineTopFor(count);
  const spineBottom = spineBottomFor(count);

  // Setup, panel + anchor fade in and the dotted spine draws over its window.
  const cSetup = cue('setup');
  const panelOp = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [0, 1], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeInOutCubic,
      })
    : 0;

  // Blue spine fill, track the deepest revealed tick whose pop has started.
  // blueY is the centre Y of that tick; before any tick, it stays at the top.
  let deepestRevealed = -1;
  for (let i = 0; i < count; i++) {
    const c = cue(`tick${i}`);
    if (c && frame >= f(c.at)) deepestRevealed = i;
  }
  const blueY = deepestRevealed >= 0 ? tickCYs[deepestRevealed]! : spineTop;

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 2, scaffolding: dark panel + anchor + dotted spine (setup). */}
      {cSetup && (
        <>
          <div style={{ position: 'absolute', inset: 0, opacity: panelOp, pointerEvents: 'none' }}>
            <Img
              src={ICON_BASE_SRC}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
            />
            <Anchor anchor={anchor} />
          </div>

          <Spine
            frame={frame}
            blueY={blueY}
            spineTop={spineTop}
            spineBottom={spineBottom}
            spineDrawStart={f(cSetup.at)}
            spineDrawEnd={f(cSetup.at + durOf(cSetup))}
          />
        </>
     )}

      {/* Phase 3, cards, each gated on its card{i} reveal. */}
      {milestones.map((m, i) => {
        const c = cue(`card${i}`);
        return c ? (
          <Card
            key={`c${i}`}
            frame={frame}
            startFrame={f(c.at)}
            durFrame={f(durOf(c))}
            cy={cardCYs[i]!}
            title={m.title}
            description={m.description}
            icon={m.icon}
            pulseFrames={pulseFramesFor(`card${i}`)}
          />
       ) : null;
      })}

      {/* Phase 3, ticks, each gated on its tick{i} reveal. */}
      {milestones.map((_, i) => {
        const c = cue(`tick${i}`);
        return c ? (
          <Milestone
            key={`m${i}`}
            frame={frame}
            startFrame={f(c.at)}
            durFrame={f(durOf(c))}
            tickCy={tickCYs[i]!}
            pulseFrames={pulseFramesFor(`tick${i}`)}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
