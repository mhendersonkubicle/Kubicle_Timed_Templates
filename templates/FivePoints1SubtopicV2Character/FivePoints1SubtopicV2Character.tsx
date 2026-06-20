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

// FivePoints1SubtopicV2Character, vertical 1-5 milestone roadmap with a
// character portrait in the left panel, rebuilt on the STANDARD reveal-sequence
// timing model.
//
// Layout / look are unchanged from the prototype:
//   • Platinum-blue (#E6ECF2) base.
//   • A Dodger-Blue rounded panel on the left holds a character PNG, framed so
//     the FACE (not the bounding box) lands near the panel centre, controlled
//     by `character.characterHeight` + `character.characterY` so authors can
//     swap PNGs without re-engineering. The oversized lower body is masked by
//     the panel's overflow:hidden.
//   • A dotted spine runs down the right linking 1-5 milestone tick circles.
//   • Each milestone is a card: a baked pill body, a dodger-blue icon square
//     masking the baked arrow with a white Small-Icon glyph on top, a bold
//     title and a grey description.
//
// TIMING, the bespoke spotlight engine (peaks[]/transit/spotlightEnter/exit
// that drove a continuous travelling focus sweep) is RETIRED. Each milestone is
// now a self-contained reveal triggered at its own `at`: its tick pops + glyph
// trims in, its card lifts/scales/fades up to full focus, and the blue "lit"
// spine overlay advances to the deepest revealed tick. `setup` fades in the
// panel + character and draws the empty grey spine. Nothing shows until a step
// targets it (empty sequence => blank canvas).

// ─── Schema ──────────────────────────────────────────────────────────────────

const milestoneSchema = z.object({
  title:       z.string().min(1).max(20),
  description: z.string().min(1).max(32),
  // master Icons/ (-dark) id, resolves to icons/<id>.svg. The SVGs in that
  // folder are pre-coloured white so they read on the dodger-blue square.
  icon:        z.string().min(1),
});

const characterAnchorSchema = z.object({
  // Character PNG id, resolves to characters/<id>.png.
  id:              z.string().min(1),
  // Rendered height of the character in px (width preserved by aspect ratio).
  // Default 950 fills the panel with the face near the centre.
  characterHeight: z.number().min(200).max(1200).optional(),
  // Top offset of the character inside the panel content box, in px.
  // Tune so the face's vertical centre lands near the panel centre.
  characterY:      z.number().optional(),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup               Dodger-Blue panel + character fade in, empty dotted
//                       spine draws down (Phase 2 scaffolding).
//   milestone0..N-1     one milestone revealed as a single object: its tick
//                       circle pops + checkmark glyph trims, its card lifts /
//                       scales / fades up, and the blue spine advances to that
//                       tick. N is milestones.length (1-5). A milestone{i} with
//                       i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|milestone[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.7), // entrance duration (tick + card)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed milestone is NAMED AGAIN later in
// the narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse
// at the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). `target` matches the milestone{i} content
// targets (setup is not pulsable). See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^milestone[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const fivePoints1SubtopicV2CharacterTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const fivePoints1SubtopicV2CharacterSchema = z.object({
  // 1 to 5 milestones, the spine + card band auto-centre vertically for
  // the count (3 milestones sit centred in the frame, etc.).
  milestones: z.array(milestoneSchema).min(1).max(5),
  character:  characterAnchorSchema,
  timings:    fivePoints1SubtopicV2CharacterTimingsSchema.optional(),
});

export type FivePoints1SubtopicV2CharacterProps = z.infer<
  typeof fivePoints1SubtopicV2CharacterSchema
>;

export const fivePoints1SubtopicV2CharacterMeta = {
  description:
    'Vertical 1-5 milestone roadmap: a Dodger-Blue panel on the left holding ' +
    'a character portrait (face near the centrepoint), and a dotted spine on ' +
    'the right linking the milestone tick circles. Milestones reveal one at a ' +
    'time top-to-bottom; each tick pops, its card lifts in, and the blue spine ' +
    'overlay advances down to that tick. Despite the "Character" name this is a ' +
    'roadmap / ordered-list template, the portrait is decorative scaffolding ' +
    'that carries no per-milestone content.',
  authoringNotes:
    'Supply 1 to 5 milestones in top-to-bottom roadmap order, the spine + ' +
    'card band auto-centre vertically for the count (3 milestones sit centred ' +
    'in the frame, etc.). Each milestone has { title (≤20 chars), description ' +
    '(≤32 chars), icon }; icon is an id from the Icons/ set (e.g. ' +
    '"search (1)", "layer-plus", "arrow-trend-up"), those SVGs are pre-coloured ' +
    'white and render on a dodger-blue square that masks the baked arrow inside ' +
    'each pill. character.id is a PNG in characters/<id>.png; characterHeight ' +
    'controls the rendered px height and characterY positions it from the panel ' +
    'top so the face lands near the panel centre with nothing clipped. ' +
    'TIMING (reveal-sequence model): nothing shows by default, schedule a ' +
    '`setup` step (panel + character + empty spine) then one `milestone{i}` per ' +
    'milestone in roadmap order. Each milestone{i} reveals tick i + card i and ' +
    'advances the blue spine to that tick as one object; milestone{i} targets ' +
    'beyond milestones.length are ignored. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.7) }. NARRATION ' +
    'MUST be linear top-to-bottom: introduce each milestone in roadmap order, ' +
    'one fully (title + description) before the next, never jump down the ' +
    'roadmap ahead of the revealed tick or back up. See GUIDANCE.md for full ' +
    'selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────
// icon_base.png from the prototype is unused (the panel hosts a character PNG,
// not a line-art icon) and is intentionally not referenced here.

const PILL_BASE_SRC        = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2Character/pill_base.png');
const DOTTED_LINE_SRC      = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2Character/dotted_line_base.png');
const BLUE_DOTTED_LINE_SRC = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2Character/blue_dotted_line_base.png');
const TICK_BASE_SRC        = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2Character/tick_base.png');
const TICK_SRC             = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2Character/tick.png');
const INTER_BOLD_SRC       = staticFile('fonts/ClashGrotesk-Bold.woff2');
const SATOSHI_REG_SRC      = staticFile('fonts/Satoshi-Regular.woff2');

// ─── Layout constants (lifted verbatim from the prototype) ─────────────────────

const PILL_SRC_LEFT = 1065;
const PILL_SRC_TOP  = 76;
const CARD_W = 755;
const CARD_H = 158;

// Vertical layout for 1-5 cards. The 5-card pitch (200 px) is preserved
// from the prototype; for fewer cards the band centres on the canvas.
const CANVAS_CY  = 540;
const CARD_PITCH = 200;
const cardCyFor  = (count: number, i: number) =>
  CANVAS_CY - ((count - 1) * CARD_PITCH) / 2 + i * CARD_PITCH;
const tickCyFor  = (count: number, i: number) => cardCyFor(count, i);
const spineTopFor    = (count: number) => tickCyFor(count, 0);
const spineBottomFor = (count: number) => tickCyFor(count, count - 1);

const TICK_SRC_CX = 995;
const TICK_SRC_CY = 141;
const TICK_GLYPH_LEFT  = 981;
const TICK_GLYPH_RIGHT = 1008;

// Dodger-Blue panel.
const PANEL_LEFT   = 85;
const PANEL_TOP    = 40;
const PANEL_WIDTH  = 770;
const PANEL_HEIGHT = 970;
const PANEL_RADIUS = 40;
const PANEL_FILL   = '#0496FF';                  // dodger blue

const CARD_TEXT_LEFT   = 154;
const CARD_TITLE_TOP   = 30;
const CARD_DESC_TOP    = 86;
const CARD_TEXT_RIGHT_PAD = 24;

// Per-card icon overlay: a dodger-blue rounded square that masks the
// baked arrow in pill_base.png plus a master Icons/ (-dark) SVG centred on top.
// Baked-square true alpha bbox in pill_base.png: x=1094..1190, y=110..199
// (radius ~17). Overlay extends 2 px past every edge so no rim peeks through.
const ICON_BOX_LEFT   = 27;     // 1094 - 1065 - 2
const ICON_BOX_TOP    = 33;     // 110  - 76   - 1
const ICON_BOX_WIDTH  = 100;
const ICON_BOX_HEIGHT = 92;
const ICON_BOX_RADIUS = 18;
const ICON_GLYPH_SIZE = 50;
const ICON_BOX_GRADIENT =
  'linear-gradient(180deg, #1FA3FF 0%, #0496FF 100%)';

// Default character framing, chosen so a typical presenter PNG (face
// ~27 % from the top) lands the face near the dodger-blue panel centre.
// At 950 px tall the character fills the panel prominently; the lower
// body extends past the panel and is masked by the panel's overflow:
// hidden, leaving a clean head-and-shoulders framing.
const DEFAULT_CHARACTER_HEIGHT = 950;
const DEFAULT_CHARACTER_Y      = 175;            // raises the face above panel centre

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const DEFAULT_STEP_IN = 0.7;

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
// Two stacked clipped layers:
//   • grey dotted spine, drawn (top → bottom) across the `setup` window.
//   • blue "lit" overlay, its height tracks the deepest revealed milestone
//     tick (blueBottom), so the spine fills down as milestones reveal.

function Spine({
  frame,
  setupStartF,
  setupEndF,
  blueBottom,
  spineTop,
  spineBottom,
}: {
  frame: number;
  setupStartF: number;
  setupEndF: number;
  blueBottom: number;     // y of the deepest revealed tick (<= spineTop => no fill)
  spineTop: number;
  spineBottom: number;
}) {
  const spineHeight = spineBottom - spineTop;
  if (spineHeight <= 0) {
    // Single milestone -> no spine to draw; tick + card carry the scene.
    return null;
  }

  const drawProg = interpolate(frame, [setupStartF, setupEndF], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const drawHeight  = spineHeight * drawProg;
  const drawClipBot = 1080 - (spineTop + drawHeight);

  const blueHeight  = clamp01((blueBottom - spineTop) / spineHeight) * spineHeight;
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

// ─── Milestone (tick circle + checkmark glyph) ─────────────────────────────────
// Reveals at its step: the base circle pops with a back-overshoot scale and the
// checkmark glyph trims in left → right. `startF` is the step start frame, `durF`
// its entrance duration in frames.

function Milestone({
  tickCy,
  frame,
  startF,
  durF,
  pulseFrames,
}: {
  tickCy: number;
  frame: number;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const offset = tickCy - TICK_SRC_CY;

  // Re-mention pulse: a brief scale bump around the tick's centre, only after
  // it has landed (pulseScale is 1 outside pulse windows, so it never collides
  // with the entrance).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Circle pops over the first ~90 % of the entrance.
  const circleProg  = clamp01(local / (durF * 0.9));
  const circleScale = circleProg > 0 ? easeOutBackSubtle(circleProg) : 0;

  // Glyph trims in over a window inside the entrance, finishing as the circle
  // settles (preserves the prototype's "circle then check" feel).
  const trimStart = durF * 0.30;
  const trimEnd   = durF * 1.0;
  const trimProg  = clamp01((local - trimStart) / (trimEnd - trimStart));
  const trimEased = easeInOutCubic(trimProg);
  const tickRevealRight = (1920 - TICK_GLYPH_LEFT) - (TICK_GLYPH_RIGHT - TICK_GLYPH_LEFT) * trimEased;

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

// ─── Card (pill body + icon square + title + description) ──────────────────────
// Reveals at its step: scales + fades up to full focus (1.0 scale, full opacity)
// across the entrance. Once settled it holds at full focus, there is no global
// travelling spotlight under the reveal-sequence model.

function Card({
  frame,
  startF,
  durF,
  cy,
  title,
  description,
  icon,
  pulseFrames,
}: {
  frame: number;
  startF: number;
  durF: number;
  cy: number;
  title: string;
  description: string;
  icon: string;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const prog       = clamp01(local / durF);
  const eased      = easeInOutCubic(prog);
  // Lifts from a slightly recessed state (the prototype's 0.70 opacity / 1.0
  // scale "unfocused" look) up to full focus (1.05 scale, full opacity).
  const drawScale   = 1.0 + 0.05 * eased;
  const drawOpacity = 0.70 + 0.30 * eased;

  // Re-mention pulse: a brief scale bump around the card's centre, composed on
  // top of the entrance/focus scale. 1 outside pulse windows -> no change.
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

      {/* Dodger-blue square that masks the baked arrow; user-chosen Small-Icon
          glyph renders centred on top. */}
      <div
        style={{
          position: 'absolute',
          left:   ICON_BOX_LEFT,
          top:    ICON_BOX_TOP,
          width:  ICON_BOX_WIDTH,
          height: ICON_BOX_HEIGHT,
          borderRadius: ICON_BOX_RADIUS,
          background:   ICON_BOX_GRADIENT,
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

// ─── Character anchor (face-centred in the Dodger-Blue panel) ──────────────────

function CharacterAnchor({
  id,
  characterHeight,
  characterY,
}: {
  id: string;
  characterHeight: number;
  characterY:      number;
}) {
  // Dodger-blue panel container. overflow:hidden clips the (deliberately
  // oversized) character to the rounded panel shape so the figure reads
  // as fitting inside the panel, face near centre, lower body masked by
  // the panel's bottom edge. No visible bounding frame on the image.
  return (
    <div
      style={{
        position: 'absolute',
        left:   PANEL_LEFT,
        top:    PANEL_TOP,
        width:  PANEL_WIDTH,
        height: PANEL_HEIGHT,
        borderRadius: PANEL_RADIUS,
        background:   PANEL_FILL,
        overflow:     'hidden',
      }}
    >
      <Img
        src={staticFile(`characters/${id}.png`)}
        alt=""
        style={{
          position: 'absolute',
          left: '50%',
          top:  characterY,
          height: characterHeight,
          width:  'auto',
          transform: 'translateX(-50%)',
          display: 'block',
          // Two-layer drop shadow that follows the PNG's alpha mask so
          // the figure (not its bounding box) casts the shadow on the
          // dodger-blue panel. Deep-navy values stay visible against the
          // bright background.
          filter:
            'drop-shadow(0 18px 24px rgba(2, 18, 36, 0.45)) ' +
            'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.35))',
        }}
      />
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const FivePoints1SubtopicV2Character: React.FC<
  FivePoints1SubtopicV2CharacterProps
> = ({ milestones, character, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() =>
    delayRender('Loading FivePoints1SubtopicV2Character fonts'),
 );
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
  const durOf = (s: RevealStep) => (s.in ?? DEFAULT_STEP_IN);

  // Re-mention pulse frames per milestone target (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  const count = milestones.length;
  const cardCYs = Array.from({ length: count }, (_, i) => cardCyFor(count, i));
  const tickCYs = Array.from({ length: count }, (_, i) => tickCyFor(count, i));
  const spineTop    = spineTopFor(count);
  const spineBottom = spineBottomFor(count);

  // Setup, panel/character fade and grey spine draw across its window.
  const cSetup = cue('setup');
  const panelOp = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [0, 1], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeInOutCubic,
      })
    : 0;

  // Blue spine bottom, the deepest revealed milestone tick whose step has
  // started. Advances down the spine as milestones reveal.
  let blueBottom = spineTop - 1;   // below spineTop => no blue fill yet
  for (let i = 0; i < count; i++) {
    const c = cue(`milestone${i}`);
    if (c && frame >= f(c.at)) blueBottom = Math.max(blueBottom, tickCYs[i]!);
  }

  const characterHeight = character.characterHeight ?? DEFAULT_CHARACTER_HEIGHT;
  const characterY      = character.characterY      ?? DEFAULT_CHARACTER_Y;

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 2, setup scaffolding: panel + character + empty grey spine. */}
      {cSetup && (
        <div style={{ position: 'absolute', inset: 0, opacity: panelOp, pointerEvents: 'none' }}>
          <CharacterAnchor
            id={character.id}
            characterHeight={characterHeight}
            characterY={characterY}
          />
        </div>
     )}

      {cSetup && (
        <Spine
          frame={frame}
          setupStartF={f(cSetup.at)}
          setupEndF={f(cSetup.at + durOf(cSetup))}
          blueBottom={blueBottom}
          spineTop={spineTop}
          spineBottom={spineBottom}
        />
     )}

      {/* Phase 3, per-milestone cards, each gated on its milestone{i} reveal. */}
      {milestones.map((m, i) => {
        const c = cue(`milestone${i}`);
        return c ? (
          <Card
            key={`c${i}`}
            frame={frame}
            startF={f(c.at)}
            durF={f(durOf(c))}
            cy={cardCYs[i]!}
            title={m.title}
            description={m.description}
            icon={m.icon}
            pulseFrames={pulseFramesFor(`milestone${i}`)}
          />
       ) : null;
      })}

      {/* Phase 3, per-milestone tick circles + glyphs, same gating. */}
      {milestones.map((_, i) => {
        const c = cue(`milestone${i}`);
        return c ? (
          <Milestone
            key={`m${i}`}
            tickCy={tickCYs[i]!}
            frame={frame}
            startF={f(c.at)}
            durF={f(durOf(c))}
            pulseFrames={pulseFramesFor(`milestone${i}`)}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
