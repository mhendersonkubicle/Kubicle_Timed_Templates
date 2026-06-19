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

// White icon (contrast on the saturated blue/pink pill circles). The pills sit in
// Dodger-Blue (left) and Wild-Strawberry (right) circles; a two-tone library icon
// keeps Dodger-Blue accents that vanish on the blue circle and clash on the pink,
// so pill icons are force-recoloured to solid white. The icon id/variant is cosmetic.
const forceWhite = (raw) =>
  raw
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/fill:\s*#[0-9a-fA-F]{3,8}/gi, 'fill:#FFFFFF')
    .replace(/fill="#[0-9a-fA-F]{3,8}"/gi, 'fill="#FFFFFF"')
    .replace(/stroke:\s*#[0-9a-fA-F]{3,8}/gi, 'stroke:#FFFFFF')
    .replace(/stroke="#[0-9a-fA-F]{3,8}"/gi, 'stroke="#FFFFFF"')
    .replace(/<svg([^>]*?)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, '')} fill="#FFFFFF" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">`);

const WhiteIcon = ({ name, size }) => {
  const [html, setHtml] = useState('');
  const [handle] = useState(() => delayRender(`Loading pill icon: ${name}`));
  useEffect(() => {
    fetch(staticFile(`icons/${name}.svg`))
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((raw) => setHtml(forceWhite(raw)))
      .catch(() => setHtml(''))
      .finally(() => continueRender(handle));
  }, [name, handle]);
  if (!html) return null;
  return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Ports the Splitscreen Points v1 prototype to the STANDARD reveal-sequence
// timing model.
//   • setup: the Oxford Blue right half pans in from off-canvas right
//     (easeInOutCubic translateX +960 → 0). The platinum-blue left half is the
//     AbsoluteFill background (the BG asset is transparent on the left), so only
//     the dark right panel slides in. This is the scaffolding reveal.
//   • Two group titles fade + slide-up. Left = #0496FF, right = #FF3D8A. Under
//     the standard model each title is its OWN target (leftTitle / rightTitle),
//     so a side can be introduced independently.
//   • 1-4 pills per side (independent counts). Each pill is one object: it
//     scales 0 → 1 with easeOutBack from its centre, then its caption fades in
//     (internal cascade derived from the step's at/in, like Process5Steps'
//     icon→number→label). Pills are top-aligned from row 0, a side with fewer
//     than 4 simply leaves the lower rows empty (no auto-centring).
//   • Icons (optional) sit inside the pill's circle on the left edge, resolved
//     from the master Icons/ library (icons/<id>.svg). Use a -dark variant
//
// NARRATION is linear, side-complete: deliver one whole side (title then pills
// top-to-bottom) before the other; never ping-pong a left pill against a right
// pill. A parallel cadence is physically possible by giving left/right targets
// equal `at` values, but the default is side-complete. See GUIDANCE.md.

// ─── Schema ──────────────────────────────────────────────────────────────────

const pillSchema = z.object({
  // Pill caption, Satoshi Medium (500) at 40 px. ≤22 chars to fit the pill body.
  text: z.string().min(1).max(22),
  // Optional icon id, resolves to icons/<id>.svg (the master Icons/
  // library). Use a -dark variant so the light/blue line art reads on the dark panel. E.g. "info-diagram-dark",
  // "graduation-cap", "benefit-hand". Renders white inside the pill's circle
  // (blue on the left, pink on the right). Omit to leave the circle plain.
  icon: z.string().min(1).optional(),
});

const sectionSchema = z.object({
  // Group title, Satoshi 900 at 58 px. ≤40 chars to keep on one line.
  title: z.string().min(1).max(40),
  // 1 to 4 pills, top → bottom. Each side is independent (e.g. left 1, right 4).
  // Pills are top-aligned from row 0; fewer than 4 leave the lower rows empty.
  pills: z.array(pillSchema).min(1).max(4),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum-blue left half, the dark right panel only arrives with `setup`).
// Each step is one "object": a pill step reveals its pill, caption AND optional
// icon together. All times are scene-relative SECONDS.
//
// Addressable targets for this template:
//   setup                         dark right panel pans in (scaffolding)
//   leftTitle / rightTitle        the two section titles
//   leftPill0..leftPill3          left pill objects, top → bottom by row
//   rightPill0..rightPill3        right pill objects, top → bottom by row
// A {side}Pill{i} with i >= that side's pill count is ignored (mirrors
// Process5Steps' step{i} >= N rule).
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|leftTitle|rightTitle|(left|right)Pill[0-3])$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.75), // entrance duration (pill scale + caption cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed object (a title or a pill) is
// NAMED AGAIN later in the narration (>~2-3s after its reveal), it gives a
// brief, subtle brand pulse at the exact re-mention timestamp. `at` is the
// scene-relative second of the re-mention (taken from the SRT). `target`
// matches the content reveal targets (titles + pills, never setup). See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(leftTitle|rightTitle|(left|right)Pill[0-3])$/),
  at: z.number().nonnegative(),
});

export const splitscreenPointsV1TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const splitscreenPointsV1Schema = z.object({
  // Left section, dark side, white text, blue accent.
  left:  sectionSchema,
  // Right section, light side, dark text, pink accent.
  right: sectionSchema,
  timings: splitscreenPointsV1TimingsSchema.optional(),
});

export type SplitscreenPointsV1Props = z.infer<typeof splitscreenPointsV1Schema>;

export const splitscreenPointsV1Meta = {
  description:
    'Two-column comparison: blue pills on the dark left side, pink pills on the ' +
    'light right side, each under its own section title. The dark right panel ' +
    'pans in, then each title and pill reveals as a discrete object. Best for ' +
    'comparing two sets, pros vs cons, before vs after, do vs don\'t, where ' +
    'each side carries a short bulleted list of 1 to 4 points.',
  authoringNotes:
    'left and right each take a title (Satoshi Black 58 px, ≤40 chars) and 1 to ' +
    '4 pills (Satoshi Medium 40 px, ≤22 chars each). The two sides are ' +
    'independent, e.g. left 1 pill, right 4, and pills are top-aligned from ' +
    'row 0 (fewer pills leave the lower rows empty; no auto-centring). Optional ' +
    'per-pill icon is a master Icons/ id (icons/<id>.svg); use a -dark variant (light/blue line art) so it reads on the dark panel ' +
    'white) shown in the circle. GOOD: left title "Manual" + right title ' +
    '"Automated". BAD: titles too long to fit on one line. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every ' +
    'element appears only when a step in `timings.sequence` targets it. Targets: ' +
    'setup, leftTitle, rightTitle, leftPill0..leftPill3, rightPill0..rightPill3. ' +
    'Each step is { target, at (seconds), in? (entrance duration, default 0.75) }. ' +
    'A pill step reveals its pill, caption AND optional icon together; the ' +
    'caption cascade is derived internally from the step. NARRATION MUST be ' +
    'linear-by-side: complete one side (title then pills in row order, top to ' +
    'bottom) before the other, never ping-pong pills across sides. A parallel ' +
    'cadence is allowed by giving left/right targets equal `at` values, but the ' +
    'default is side-complete. See GUIDANCE.md for full selection and narration ' +
    'rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BG_SRC          = staticFile('Template-Specific-Assets/SplitscreenPointsV1/oxfordblue_splitscreen_bg.png');
const PILL_LEFT_SRC   = staticFile('Template-Specific-Assets/SplitscreenPointsV1/pill_left_side.png');
const PILL_RIGHT_SRC  = staticFile('Template-Specific-Assets/SplitscreenPointsV1/pill_right_side.png');
const SATOSHI_BLACK_SRC  = staticFile('fonts/Satoshi-Black.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

// Pill geometry inside each pill PNG (1920×1080).
const PILL_W       = 693;
const PILL_H       = 111;
const CIRCLE_D     = 111;
const LEFT_PILL_X  = 156;
const RIGHT_PILL_X = 1032;
const PILL_Y       = 353;
const ROW_STEP     = 133;

// Section title position (above row 0).
const TITLE_Y      = 210;

// Section colours. Left swapped from the prototype's #00B8EE (lighter cyan)
// to #0496FF (Dodger Blue) per design correction.
const LEFT_BLUE  = '#0496FF';
const RIGHT_PINK = '#FF3D8A';

const TITLE_SLIDE_DISTANCE = 28;

// BG pan-in: the asset's dark right half (x=960..1920) starts off-canvas and
// slides into place. Translating the full-canvas image by +960 px pushes the
// dark half fully off the right edge.
const BG_PAN_TRAVEL = 960;

// Caption fade-in, as a proportion of the pill step's entrance duration. The
// pill shape pops over the full window; the caption fades over the back end
// (matches the prototype's +0.55 s offset / 0.30 s fade at the default 0.75 s).
const PILL_TEXT_OFFSET_FRAC = 0.55 / 0.75;
const PILL_TEXT_DUR_FRAC    = 0.30 / 0.75;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeInOutCubic = Easing.inOut(Easing.cubic);
const easeOutBack = Easing.out(Easing.back(1.70158));
const easeOutQuad = Easing.out(Easing.quad);
const easeOutExpo = Easing.out(Easing.exp);

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
    const black  = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`, { weight: '900', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [k, m] = await Promise.all([black.load(), medium.load()]);
    const fonts  = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(k);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Group title (slides up + fades) ─────────────────────────────────────────

function GroupTitle({
  frame,
  text,
  color,
  x,
  titleStart,
  titleDur,
  pulseFrames,
}: {
  frame: number;
  text: string;
  color: string;
  x: number;
  titleStart: number;
  titleDur: number;
  pulseFrames: number[];
}) {
  const opacity = interpolate(frame, [titleStart, titleStart + titleDur * 0.82], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutQuad,
  });
  const slideProg = interpolate(frame, [titleStart, titleStart + titleDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutExpo,
  });
  const ty = (1 - slideProg) * TITLE_SLIDE_DISTANCE;

  // Re-mention pulse: a brief scale bump around the title's own anchor (its
  // left edge baseline), composed onto the entrance translateY. 1 at rest.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top:  TITLE_Y,
        zIndex: 2,
        opacity,
        transform: `translateY(${ty}px) scale(${pulse})`,
        transformOrigin: 'left center',
      }}
    >
      <span
        style={{
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 58,
          color,
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
 );
}

// ─── Animated pill ───────────────────────────────────────────────────────────
// One pill = one object. The pill shape scales in (easeOutBack); the caption
// fades over the back end of the step's entrance window. Both are derived from
// the single reveal step's start frame + duration.

function AnimPill({
  frame,
  side,
  rowIndex,
  text,
  icon,
  startFrame,
  scaleDur,
  textOffset,
  textDur,
  pulseFrames,
}: {
  frame: number;
  side: 'left' | 'right';
  rowIndex: number;
  text: string;
  icon?: string;
  startFrame: number;
  scaleDur: number;
  textOffset: number;
  textDur: number;
  pulseFrames: number[];
}) {
  const isLeft = side === 'left';
  const textColor = isLeft ? '#FFFFFF' : '#0C1A28';
  const pillSrc   = isLeft ? PILL_LEFT_SRC : PILL_RIGHT_SRC;
  const pillOriginX = isLeft ? LEFT_PILL_X : RIGHT_PILL_X;

  // Scale from 0 → 1 with easeOutBack.
  const scale = interpolate(frame, [startFrame, startFrame + scaleDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutBack,
  });

  // Text fade-in starts after the pill has popped most of the way.
  const textStart = startFrame + textOffset;
  const textOp = interpolate(frame, [textStart, textStart + textDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutQuad,
  });

  if (scale <= 0) return null;

  // Re-mention pulse: a brief scale bump around the pill's centre, composed
  // onto the entrance scale (so it only bumps after the pill has landed). 1 at
  // rest, so an empty pulse list leaves the entrance untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  const stageX = pillOriginX;
  const stageY = PILL_Y + rowIndex * ROW_STEP;

  return (
    <div
      style={{
        position: 'absolute',
        left: stageX,
        top:  stageY,
        width:  PILL_W,
        height: PILL_H,
        zIndex: 2,
        transform: `scale(${scale * pulse})`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
      }}
    >
      {/* Pill PNG asset, shifted so the pill region fills this container */}
      <Img
        src={pillSrc}
        alt=""
        style={{
          position: 'absolute',
          top:  -PILL_Y,
          left: -pillOriginX,
          width:  1920,
          height: 1080,
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Optional icon, sits centred inside the circle on the pill's left edge */}
      {icon && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top:  0,
            width:  CIRCLE_D,
            height: CIRCLE_D,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        >
          <WhiteIcon name={icon} size={CIRCLE_D * 0.58} />
        </div>
     )}

      {/* Text, fades in after the pill has popped. Container is the full
          pill height with flex+center for line-box centring; the SPAN gets a
          small upward translate so the cap-height (visual centre) sits on
          the pill's mid-line instead of below it. No overflow clipping, so
          descenders (g, y, p) render fully. */}
      <div
        style={{
          position: 'absolute',
          left: CIRCLE_D + 18,
          top:  0,
          height: PILL_H,
          display: 'flex',
          alignItems: 'center',
          opacity: textOp,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 40,
            color: textColor,
            whiteSpace: 'nowrap',
            letterSpacing: '-0.3px',
            // Optical centring nudge, flex centres the line-box, but the
            // glyph cap sits below the line-box centre by ~descender-height.
            // -5 px brings the cap-height visually onto the pill mid-line.
            transform: 'translateY(-5px)',
          }}
        >
          {text}
        </span>
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const SplitscreenPointsV1: React.FC<SplitscreenPointsV1Props> = ({
  left,
  right,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading SplitscreenPointsV1 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.75);

  // Setup, the dark right panel pans in from off-canvas right across its window.
  const cSetup = cue('setup');
  const bgX = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [BG_PAN_TRAVEL, 0], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeInOutCubic,
      })
    : BG_PAN_TRAVEL;

  // Resolve the two title steps.
  const cLeftTitle  = cue('leftTitle');
  const cRightTitle = cue('rightTitle');

  // Re-mention pulse frames per target (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Render one pill object, gated on its reveal step. The pill scale spans the
  // step's whole entrance window; the caption fades over the back end.
  const renderPill = (
    s: RevealStep | undefined,
    side: 'left' | 'right',
    rowIndex: number,
    pill: { text: string; icon?: string },
 ) => {
    if (!s) return null;
    const scaleDur = f(durOf(s));
    return (
      <AnimPill
        key={`${side}${rowIndex}`}
        frame={frame}
        side={side}
        rowIndex={rowIndex}
        text={pill.text}
        icon={pill.icon}
        startFrame={f(s.at)}
        scaleDur={scaleDur}
        textOffset={Math.round(scaleDur * PILL_TEXT_OFFSET_FRAC)}
        textDur={Math.max(1, Math.round(scaleDur * PILL_TEXT_DUR_FRAC))}
        pulseFrames={pulseFramesFor(`${side}Pill${rowIndex}`)}
      />
   );
  };

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 2, setup scaffolding (only when the sequence schedules it).
          The splitscreen BG asset has a TRANSPARENT left half; the platinum-blue
          AbsoluteFill shows through on the left while the asset's dark navy fills
          the right. The asset pans in from the right before any content appears.
          With no setup step the dark panel sits fully off-canvas right (blank). */}
      <Img
        src={BG_SRC}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width:  '100%',
          height: '100%',
          objectFit: 'fill',
          display: 'block',
          transform: `translateX(${bgX}px)`,
        }}
      />

      {/* Phase 3, content objects, each gated on its reveal step */}
      {cLeftTitle && (
        <GroupTitle
          frame={frame}
          text={left.title}
          color={LEFT_BLUE}
          x={LEFT_PILL_X}
          titleStart={f(cLeftTitle.at)}
          titleDur={f(durOf(cLeftTitle))}
          pulseFrames={pulseFramesFor('leftTitle')}
        />
     )}

      {cRightTitle && (
        <GroupTitle
          frame={frame}
          text={right.title}
          color={RIGHT_PINK}
          x={RIGHT_PILL_X}
          titleStart={f(cRightTitle.at)}
          titleDur={f(durOf(cRightTitle))}
          pulseFrames={pulseFramesFor('rightTitle')}
        />
     )}

      {/* Left pills (1-4, top-aligned from row 0), each gated on leftPill{i} */}
      {left.pills.map((pill, i) =>
        renderPill(cue(`leftPill${i}`), 'left', i, pill),
     )}

      {/* Right pills (1-4, top-aligned from row 0), each gated on rightPill{i} */}
      {right.pills.map((pill, i) =>
        renderPill(cue(`rightPill${i}`), 'right', i, pill),
     )}
    </AbsoluteFill>
 );
};
