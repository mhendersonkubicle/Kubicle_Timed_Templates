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

// Ports the Yin Yang / 2 Points prototype:
//   • Phase 1 (0.20-3.20 s): left container slides up from below (+1080 → 0),
//     right container slides down from above (−1080 → 0), both easeOutCubic.
//     Each container is 3 stacked PNGs (base + title bar + boxes).
//   • Phase 2: titles fade in at 3.30 s (left) and 5.40 s (right) over 0.50 s.
//   • Phase 3 (paired reveals): each icon pulses (easeOutBack scale, 0.70 s)
//     + opacity ramp (0.35 s) and its box text fades (0.50 s):
//       3.80 s, icon 0 (left side)
//       4.60 s, icon 1 (left side)
//       5.95 s, icon 2 (right side)
//       6.75 s, icon 3 (right side)
//   • Default composition length is 300 frames (10 s @ 30 fps).
//
// Icons use Pattern B runtime recolour: the SVG ships with #33CCCC accents
// (Icon Library default), and at render time the SvgIcon swaps that to the
// per-side accent (left = Dodger Blue #0496FF, right = pink #F865B0) plus
// fills the root white so unstyled outlines read on the dark base.

// ─── Schema ──────────────────────────────────────────────────────────────────

const boxSchema = z.object({
  // Icon ID from icons/ (e.g. "rocket"). Body renders white, accents tinted
  // with the side's accent colour at render time.
  icon: z.string().min(1),
  // Box caption, Satoshi Bold 37 px black inside the white footer box. ≤16 chars
  // so it fits inside the fixed BOX_W=354 frame (see GUIDANCE character-limit rule).
  text: z.string().min(1).max(16),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas. Each
// step is one "object": a box step reveals its icon AND caption together.
// All times are scene-relative SECONDS.
//
// Addressable targets for this template:
//   setup                         scaffolding containers slide in (Phase 2)
//   leftTitle / rightTitle        the two section titles
//   leftBox0 / leftBox1           left icon+caption units
//   rightBox0 / rightBox1         right icon+caption units
export const revealStepSchema = z.object({
  target: z.enum([
    'setup',
    'leftTitle', 'rightTitle',
    'leftBox0', 'leftBox1',
    'rightBox0', 'rightBox1',
  ]),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.5), // entrance / pulse duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type YinYangTarget = RevealStep['target'];

// Re-mention pulse: when an already-revealed content object is NAMED AGAIN
// later in the narration (>~2-3s after its reveal), it gives a brief, subtle
// brand pulse at the exact re-mention timestamp. `at` is the scene-relative
// second of the re-mention (taken from the SRT). Pulse targets are the content
// objects only (titles + boxes), never the setup scaffolding.
export const pulseStepSchema = z.object({
  target: z.enum([
    'leftTitle', 'rightTitle',
    'leftBox0', 'leftBox1',
    'rightBox0', 'rightBox1',
  ]),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;
export type YinYangPulseTarget = PulseStep['target'];

export const yinYang2PointsTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const yinYang2PointsSchema = z.object({
  // Title text for the left side (Inter ExtraBold 55.5 px). ≤18 chars so it stays
  // inside the 735px coloured title bar (see GUIDANCE character-limit rule).
  leftTitle: z.string().min(1).max(18),
  // Title text for the right side (same 18-char limit as leftTitle).
  rightTitle: z.string().min(1).max(18),
  // 1 OR 2 boxes on the left side, ordered left → right. With 2 boxes the side
  // uses the baked two-box scaffolding; with 1 box a single, identically-sized
  // box is centred under the title. Each box is fixed at BOX_W × BOX_H.
  leftBoxes: z.array(boxSchema).min(1).max(2),
  // 1 OR 2 boxes on the right side, ordered left → right (same rules).
  rightBoxes: z.array(boxSchema).min(1).max(2),
  // Per-side accent colours. Defaults: left Dodger Blue, right pink.
  leftAccent:  z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  rightAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  timings: yinYang2PointsTimingSchema.optional(),
});

export type YinYang2PointsProps = z.infer<typeof yinYang2PointsSchema>;

export const yinYang2PointsMeta = {
  description:
    'Two-pane dichotomy: a navy panel with a blue accent bar holding a title + ' +
    '2 icon-and-label boxes slides in from below, mirrored by a navy panel with ' +
    'a pink accent bar on the right sliding down from above. Icons pulse in ' +
    'pair-by-pair as their box text fades. Best for stark either/or contrasts ' +
    'where each side has its own internal pair of examples, manual vs ' +
    'automated, before vs after, problem vs solution, do this vs not that.',
  authoringNotes:
    'Always supply leftTitle, rightTitle (Inter ExtraBold 55.5 px Oxford Blue ' +
    'inside the coloured title bar, ≤18 chars). leftBoxes and rightBoxes are exactly ' +
    '2 items each, icon id from the catalog plus a short box caption (Satoshi ' +
    'Bold 37 px, ≤16 chars). Pair the two sides for contrast or comparison. ' +
    'Every title and caption must be a single word or a short 2-4 word phrase. ' +
    'GOOD: leftTitle "Manual" + rightTitle "Automated". BAD: titles too long ' +
    'to fit on one line. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets: setup, ' +
    'leftTitle, rightTitle, leftBox0, leftBox1, rightBox0, rightBox1. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.5) }. A box step ' +
    'reveals its icon AND caption together. NARRATION MUST be linear-by-side: ' +
    'complete one side (title then both sub-points) before the other, never ' +
    'ping-pong sub-points across sides. See GUIDANCE.md for full selection and ' +
    'narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BASE_1_SRC          = staticFile('Template-Specific-Assets/YinYang2Points/base_1.png');
const BASE_2_SRC          = staticFile('Template-Specific-Assets/YinYang2Points/base_2.png');
const BASE_1_BOXES_SRC    = staticFile('Template-Specific-Assets/YinYang2Points/base_1_two_boxes.png');
const BASE_2_BOXES_SRC    = staticFile('Template-Specific-Assets/YinYang2Points/base_2_two_boxes.png');
const TITLE1_BOX_SRC      = staticFile('Template-Specific-Assets/YinYang2Points/title1_box.png');
const TITLE2_BOX_SRC      = staticFile('Template-Specific-Assets/YinYang2Points/title2_box.png');
const INTER_EXTRABOLD_SRC = staticFile('fonts/ClashGrotesk-Bold.woff2');
const SATOSHI_BOLD_SRC    = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

const ICON_SIZE = 300;
const ICON_CY   = 600;

const ICON_POS_L_CXS = [284, 673] as const;    // left side icon centres
const ICON_POS_R_CXS = [1256, 1644] as const;  // right side icon centres

const TITLE1_CX = 490;
const TITLE2_CX = 1445;
const TITLE_CY  = 348;
const TITLE_SIZE = 55.5;
const TITLE_MAX_WIDTH = 690;   // sits inside the 735px coloured title bar (with end padding); the 18-char title cap keeps text within it

const BOX_CY = 856;
const BOX_W  = 354;
const BOX_TEXT_SIZE = 37;
// Inner width a caption may use: the box is BOX_W=354; inset 12px each side so a
// full 16-char caption never touches the white box edge.
const BOX_TEXT_MAX_WIDTH = BOX_W - 24;

// Fixed footer-box geometry, measured from the baked two-box PNGs so a
// code-drawn single box is pixel-identical to the baked pair.
const BOX_H      = 127;
const BOX_RADIUS = 13;
const BOX_TOP    = BOX_CY - BOX_H / 2;                 // 792.5
const BOX_SHADOW = '0 6px 16px rgba(0, 0, 0, 0.16)';

// When a side carries a single sub-point, its box + icon are centred under the
// title (rather than using the paired left/right positions).
const SINGLE_BOX_CX_L = TITLE1_CX;   // 490
const SINGLE_BOX_CX_R = TITLE2_CX;   // 1445

const DEFAULT_LEFT_ACCENT  = '#0496FF';
const DEFAULT_RIGHT_ACCENT = '#F865B0';

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic = Easing.out(Easing.cubic);
const easeOutBack  = Easing.out(Easing.back(1.70158));

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
    const satoshi = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,   { weight: '700', display: 'block' });
    const [i, s]  = await Promise.all([inter.load(), satoshi.load()]);
    const fonts   = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(i);
    fonts.add(s);
  })();
  return fontsPromise;
}

// ─── SvgIcon (Pattern B runtime recolour) ─────────────────────────────────────
// Fetches the SVG, swaps the source `#33CCCC` accent with the per-side accent,
// and forces the root `<svg fill="white">` so unstyled outline paths render
// white on the dark base. Unknown icon names render nothing.

function SvgIcon({ name, size, accent }: { name: string; size: number; accent: string }) {
  const [html, setHtml] = useState('');
  const [handle] = useState(() => delayRender(`Loading icon: ${name}`));

  useEffect(() => {
    fetch(staticFile(`icons/${name}.svg`))
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(raw => setHtml(
        raw
          .replace(/<\?xml[^>]*\?>\s*/g, '')
          .replace(/style="fill:#33CCCC;?"/gi, `style="fill:${accent};"`)
          .replace(/fill:#33CCCC/gi, `fill:${accent}`)
          .replace(/fill="#33CCCC"/gi, `fill="${accent}"`)
          .replace(/<svg [^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" width="${size}" height="${size}" style="display:block">`)
     ))
      .catch(() => setHtml(''))
      .finally(() => continueRender(handle));
  }, [name, size, accent, handle]);

  if (!html) return null;
  return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Centred text helper ─────────────────────────────────────────────────────

function CentredText({
  cx,
  cy,
  text,
  size,
  weight,
  font,
  color,
  maxWidth,
  opacity,
  pulse = 1,
}: {
  cx: number;
  cy: number;
  text: string;
  size: number;
  weight: number;
  font: string;
  color: string;
  maxWidth: number;
  opacity: number;
  pulse?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - maxWidth / 2,
        top:  cy,
        // Re-mention pulse composes with the existing vertical centring; origin
        // is the object's own centre so the bump scales in place. Default
        // pulse === 1 leaves the original transform unchanged.
        transform: `translateY(-50%) scale(${pulse})`,
        transformOrigin: 'center center',
        width: maxWidth,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        color,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        pointerEvents: 'none',
        opacity,
      }}
    >
      {text}
    </div>
 );
}

// ─── Empty footer box (code-drawn, matches the baked box geometry) ───────────
// Used for the single-sub-point layout so a side can render exactly one box
// without leaving the second baked box empty. Pixel geometry is taken from the
// measured two-box PNGs (BOX_W × BOX_H, BOX_RADIUS, BOX_TOP, soft shadow).

function EmptyBox({ cx }: { cx: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - BOX_W / 2,
        top:  BOX_TOP,
        width:  BOX_W,
        height: BOX_H,
        borderRadius: BOX_RADIUS,
        background: '#FFFFFF',
        boxShadow: BOX_SHADOW,
        pointerEvents: 'none',
      }}
    />
 );
}

// ─── Container group (panel + title bar + footer boxes, slides together) ─────
// boxCenters === null  -> 2 sub-points: use the baked two-box PNG (unchanged).
// boxCenters is array  -> draw an EmptyBox at each centre (single-box layout).

function ContainerGroup({
  side,
  translateY,
  boxCenters,
}: {
  side: 'left' | 'right';
  translateY: number;
  boxCenters: number[] | null;
}) {
  const isLeft   = side === 'left';
  const baseSrc  = isLeft ? BASE_1_SRC          : BASE_2_SRC;
  const titleSrc = isLeft ? TITLE1_BOX_SRC      : TITLE2_BOX_SRC;
  const boxesSrc = isLeft ? BASE_1_BOXES_SRC    : BASE_2_BOXES_SRC;

  const fullAssetStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top:  0,
    width:  1920,
    height: 1080,
    pointerEvents: 'none',
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top:  0,
        width:  1920,
        height: 1080,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <Img src={baseSrc}  alt="" style={fullAssetStyle} />
      <Img src={titleSrc} alt="" style={fullAssetStyle} />
      {boxCenters === null
        ? <Img src={boxesSrc} alt="" style={fullAssetStyle} />
        : boxCenters.map((cx, i) => <EmptyBox key={i} cx={cx} />)}
    </div>
 );
}

// ─── Icon pulse + box text pair ──────────────────────────────────────────────

function IconPulse({
  frame,
  cx,
  cy,
  iconName,
  accent,
  startFrame,
  pulseDur,
  rementionScale = 1,
}: {
  frame: number;
  cx: number;
  cy: number;
  iconName: string;
  accent: string;
  startFrame: number;
  pulseDur: number;
  rementionScale?: number;
}) {
  if (frame < startFrame) return null;

  const localFrame = frame - startFrame;
  const pulseProg  = Math.max(0, Math.min(1, localFrame / pulseDur));
  const scale      = easeOutBack(pulseProg);
  // Opacity ramp roughly 0.35 s, half the pulse duration.
  const opacityProg = Math.max(0, Math.min(1, localFrame / (pulseDur * 0.5)));

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - ICON_SIZE / 2,
        top:  cy - ICON_SIZE / 2,
        width:  ICON_SIZE,
        height: ICON_SIZE,
        opacity: opacityProg,
        // Entrance scale (easeOutBack) multiplied by the additive re-mention
        // pulse. rementionScale === 1 outside pulse windows, so the entrance is
        // preserved exactly.
        transform: `scale(${scale * rementionScale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
      }}
    >
      <SvgIcon name={iconName} size={ICON_SIZE} accent={accent} />
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const YinYang2Points: React.FC<YinYang2PointsProps> = ({
  leftTitle,
  rightTitle,
  leftBoxes,
  rightBoxes,
  leftAccent,
  rightAccent,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading YinYang2Points fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  const accentL = leftAccent  ?? DEFAULT_LEFT_ACCENT;
  const accentR = rightAccent ?? DEFAULT_RIGHT_ACCENT;

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<YinYangTarget, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: YinYangTarget): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.5);

  // Re-mention pulse: per-target pulse frames from timings.pulses, mapped
  // through the fps helper. No pulses for a target -> pulseScale returns 1.
  const pulseDurF = f(PULSE_DUR_S);
  const pulseFramesFor = (target: YinYangPulseTarget) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));
  const pulseFor = (target: YinYangPulseTarget) =>
    pulseScale(frame, pulseFramesFor(target), pulseDurF);

  // Fade 0->1 across a step's [at, at+in] window.
  const fadeOp = (s: RevealStep) =>
    interpolate(frame, [f(s.at), f(s.at + durOf(s))], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
    });

  // Container slide from off-screen `fromY` to 0 across the step window.
  const slideY = (s: RevealStep, fromY: number) =>
    interpolate(frame, [f(s.at), f(s.at + durOf(s))], [fromY, 0], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: easeOutCubic,
    });

  // Resolve each target's step once.
  const cSetup      = cue('setup');
  const cLeftTitle  = cue('leftTitle');
  const cRightTitle = cue('rightTitle');
  const cLB0 = cue('leftBox0');
  const cLB1 = cue('leftBox1');
  const cRB0 = cue('rightBox0');
  const cRB1 = cue('rightBox1');

  // Per-side box layout. One box -> centred under the title; two -> paired
  // positions (the baked PNG layout). Box size is fixed regardless of count.
  const leftSingle  = leftBoxes.length === 1;
  const rightSingle = rightBoxes.length === 1;
  const leftCXs  = leftSingle  ? [SINGLE_BOX_CX_L] : [ICON_POS_L_CXS[0], ICON_POS_L_CXS[1]];
  const rightCXs = rightSingle ? [SINGLE_BOX_CX_R] : [ICON_POS_R_CXS[0], ICON_POS_R_CXS[1]];

  const titleFont = "'ClashGrotesk', system-ui, sans-serif";
  const boxFont   = "'Satoshi', 'ClashGrotesk', system-ui, sans-serif";

  // Render one icon+caption object, gated on its reveal step.
  const renderBox = (
    s: RevealStep | undefined,
    cx: number,
    iconName: string,
    text: string,
    accent: string,
    pulse: number,
 ) =>
    s ? (
      <>
        <IconPulse
          frame={frame}
          cx={cx}
          cy={ICON_CY}
          iconName={iconName}
          accent={accent}
          startFrame={f(s.at)}
          pulseDur={f(durOf(s))}
          rementionScale={pulse}
        />
        <CentredText
          cx={cx}
          cy={BOX_CY}
          text={text}
          size={BOX_TEXT_SIZE}
          weight={700}
          font={boxFont}
          color="#000000"
          maxWidth={BOX_TEXT_MAX_WIDTH}
          opacity={fadeOp(s)}
          pulse={pulse}
        />
      </>
   ) : null;

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 2, setup scaffolding (only when the sequence schedules it).
          One sub-point per side -> draw a single centred box; two -> baked PNG. */}
      {cSetup && (
        <ContainerGroup
          side="left"
          translateY={slideY(cSetup, 1080)}
          boxCenters={leftSingle ? leftCXs : null}
        />
     )}
      {cSetup && (
        <ContainerGroup
          side="right"
          translateY={slideY(cSetup, -1080)}
          boxCenters={rightSingle ? rightCXs : null}
        />
     )}

      {/* Phase 3, content objects, each gated on its reveal step */}
      {cLeftTitle && (
        <CentredText
          cx={TITLE1_CX}
          cy={TITLE_CY}
          text={leftTitle}
          size={TITLE_SIZE}
          weight={800}
          font={titleFont}
          color="#052438"
          maxWidth={TITLE_MAX_WIDTH}
          opacity={fadeOp(cLeftTitle)}
          pulse={pulseFor('leftTitle')}
        />
     )}

      {leftBoxes[0] && renderBox(cLB0, leftCXs[0]!, leftBoxes[0].icon, leftBoxes[0].text, accentL, pulseFor('leftBox0'))}
      {leftBoxes[1] && renderBox(cLB1, leftCXs[1]!, leftBoxes[1].icon, leftBoxes[1].text, accentL, pulseFor('leftBox1'))}

      {cRightTitle && (
        <CentredText
          cx={TITLE2_CX}
          cy={TITLE_CY}
          text={rightTitle}
          size={TITLE_SIZE}
          weight={800}
          font={titleFont}
          color="#052438"
          maxWidth={TITLE_MAX_WIDTH}
          opacity={fadeOp(cRightTitle)}
          pulse={pulseFor('rightTitle')}
        />
     )}

      {rightBoxes[0] && renderBox(cRB0, rightCXs[0]!, rightBoxes[0].icon, rightBoxes[0].text, accentR, pulseFor('rightBox0'))}
      {rightBoxes[1] && renderBox(cRB1, rightCXs[1]!, rightBoxes[1].icon, rightBoxes[1].text, accentR, pulseFor('rightBox1'))}
    </AbsoluteFill>
 );
};
