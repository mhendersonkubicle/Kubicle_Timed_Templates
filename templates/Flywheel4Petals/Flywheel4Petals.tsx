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

// Flywheel4Petals, a large canvas-filling petal flywheel, rebuilt on the
// STANDARD reveal-sequence timing model.
//   • Platinum-blue (#E6ECF2) canvas.
//   • Donut wheel takes ~90 % of canvas height. 2 to 6 segments, each a
//     (360/count)° pie-slice of the annulus, auto-arranged for the count
//     (clockwise from the top).
//   • Shades of dodger blue going clockwise (lightest at top, deepest oxford
//     toward the end) so each petal is visually distinct without breaking the
//     brand palette.
//   • Inside each petal, top → bottom radially: big "01..0N" number near the
//     rim, lucide-style icon in the middle, phase name, short body line.
//   • Central oxford-blue hub holds the headline title + supporting line +
//     a -dark-suffix centre icon.
//
// Reveal-sequence model (see README):
//   • setup     , the hub circle scales in (back overshoot) AND a faint
//                  empty donut-ring scaffold scales in behind it, so the
//                  stage is established with motion (Phase 2 scaffolding).
//                  The hub's title/icon/subtitle fade in once the circle
//                  lands (internal sub-stagger). One scaffolding reveal.
//   • petal{i}  , petal i's coloured fill fades + scales up, then its
//                  number → icon → label → body cascade in (one object).
//                  Clockwise from the top: petal0 top, then 1,2,…,N-1.
//
// Nothing renders by default; an element appears ONLY when a step in
// timings.sequence targets it. Side icons are master Icons/ (-dark) (pre-coloured white,
// read on the dodger-blue petal); the centre icon is a -dark master Icons/ id
// (platinum + Dodger-Blue line art, reads on the oxford-blue hub). Icons render
// AS-IS, no runtime recolour (Pattern A).

// ─── Schema ──────────────────────────────────────────────────────────────────

export const flywheel4PetalsPetalSchema = z.object({
  label: z.string().min(1).max(14),
  body:  z.string().min(1).max(48),
  // master Icons/ (-dark) id, resolves to icons/<id>.svg. Those SVGs are
  // pre-coloured white so they read on the dodger-blue petal.
  icon:  z.string().min(1),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup              the central hub scales in + a faint empty donut-ring
//                      scaffold scales in behind it (Phase 2 scaffolding).
//   petal0..petalN-1   one petal revealed as a single object: its coloured
//                      fill fades/scales in, then its number -> icon -> label
//                      -> body cascade. N is petals.length (2-6). Petals are
//                      ordered CLOCKWISE FROM THE TOP. A petal{i} with i >= N
//                      is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|petal[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.0), // entrance duration (fill + cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed petal is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content petal (petal{i}); setup
// is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^petal[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const flywheel4PetalsTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const flywheel4PetalsSchema = z.object({
  title:       z.string().min(1).max(28),   // central hub headline
  subtitle:    z.string().min(1).max(40),   // small line under the title in the hub
  // Master Icons/ id, resolves to icons/<id>.svg. Use a -dark-suffix icon
  // from the catalogue: those are platinum + dodger-blue line art and read
  // brightly on the oxford-blue → black hub.
  centerIcon:  z.string().min(1),
  // 2 to 6 petals, clockwise from the top. The wheel auto-divides 360° by
  // the count; the wheel re-arranges and the gradient re-spreads for any
  // count in range.
  petals:      z.array(flywheel4PetalsPetalSchema).min(2).max(6),
  timings:     flywheel4PetalsTimingSchema.optional(),
});

export type Flywheel4PetalsProps = z.infer<typeof flywheel4PetalsSchema>;

export const flywheel4PetalsMeta = {
  description:
    'Canvas-filling petal flywheel diagram. A central oxford-blue hub holds ' +
    'the title; 2 to 6 numbered dodger-blue petals around it (light → dark ' +
    'clockwise) each show an icon, phase name, and short body description. ' +
    'Use for iterative cycles (plan → act → observe → reflect), growth ' +
    'flywheels, or any 2-6 stage loop.',
  authoringNotes:
    'title is the headline inside the central hub (≤28 chars, Satoshi Bold, ' +
    'white on oxford). subtitle is a short supporting line below it (≤40 ' +
    'chars). centerIcon is drawn above the title in the hub, use a -dark-' +
    'suffix icon from the master Icons/ catalogue (those are platinum + ' +
    'dodger-blue line art and stand out against the oxford-blue → black hub). ' +
    'petals is 2 to 6 entries in CLOCKWISE order starting from the top; the ' +
    'wheel auto-divides 360° by the count and the gradient re-spreads light → ' +
    'dark, so every count in range reads cleanly. Each petal carries a label ' +
    '(≤14 chars, short phase name), a body (≤48 chars, single supporting ' +
    'line), and an icon, a master Icons/ (-dark) id (those SVGs are pre-coloured white ' +
    'and read on the dodger-blue petal). GOOD label: "Plan", "Act", ' +
    '"Observe", "Reflect". BAD label: "Planning phase activities" (too long, ' +
    'strip to the verb or noun core). Long labels/bodies are clipped to the ' +
    'petal interior, never spill onto the background. ' +
    'TIMING (reveal-sequence model): nothing shows by default; schedule a ' +
    '`setup` step (the hub + empty donut-ring scaffold scale in) then one ' +
    '`petal{i}` per petal in CLOCKWISE-FROM-TOP order. Each petal{i} reveals ' +
    'its fill + number/icon/label/body as one object. Sync each petal{i}.at ' +
    'to the narration cue that introduces that stage; the loop is inherently ' +
    'LINEAR so reveal order = clockwise petal order. Re-mention pulses go in ' +
    'timings.pulses ({ target: petal{i}, at }); empty pulses render ' +
    'identically. See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');
const INTER_EXTRABOLD_SRC = staticFile('fonts/ClashGrotesk-Bold.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const WHEEL_CX = 960;
const WHEEL_CY = 540;
// ─── White petal icon (contrast on the dodger-blue petals) ───────────────────
// The petals are saturated Dodger-Blue. A two-tone library icon keeps Dodger-Blue
// accents that vanish against that fill, so petal icons are force-recoloured to
// solid white. (The centre hub icon sits on the dark oxford hub, where the -dark
// light-artwork reads, so it is left as-is.)
const forceWhite = (raw: string) =>
  raw
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/fill:\s*#[0-9a-fA-F]{3,8}/gi, 'fill:#FFFFFF')
    .replace(/fill="#[0-9a-fA-F]{3,8}"/gi, 'fill="#FFFFFF"')
    .replace(/stroke:\s*#[0-9a-fA-F]{3,8}/gi, 'stroke:#FFFFFF')
    .replace(/stroke="#[0-9a-fA-F]{3,8}"/gi, 'stroke="#FFFFFF"')
    .replace(/<svg([^>]*?)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, '')} fill="#FFFFFF" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">`);

function WhiteIcon({ name }: { name: string }) {
  const [html, setHtml] = useState('');
  const [handle] = useState(() => delayRender(`Loading petal icon: ${name}`));
  useEffect(() => {
    fetch(staticFile(`icons/${name}.svg`))
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((raw) => setHtml(forceWhite(raw)))
      .catch(() => setHtml(''))
      .finally(() => continueRender(handle));
  }, [name, handle]);
  if (!html) return null;
  return <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

const OUTER_R  = 490;     // wheel almost fills canvas height (50 px margins)
const INNER_R  = 220;     // hub edge, kept small so each petal has vertical
                          // breathing room for its content stack
const GAP_DEG  = 1.2;     // small angular gap between petals (white slivers)

// Content sits at the petal centroid. Each petal lays out its number, icon,
// label, and body as a VERTICAL stack centred on this point (regardless of
// which petal, so left/right petals don't suffer horizontal cramming).
const CONTENT_R = 355;

// Per-item Y offsets from the petal content centroid (stack height ~210).
const NUMBER_DY = -92;
const ICON_DY   = -16;
const LABEL_DY  = 44;
const BODY_DY   = 92;

// Hub (centred on wheel)
const HUB_R = INNER_R;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// Internal sub-stagger proportions, expressed as fractions of a petal's `in`
// window so the per-petal content cascade survives the collapse to one
// {at, in} per object. The fill fades/scales over the first ~half; the
// content then cascades number -> icon -> label -> body.
const FILL_FRAC    = 0.50;   // petal fill entrance occupies first half
const NUMBER_OFF   = 0.30;   // number starts ~30% in
const ICON_OFF     = 0.45;
const LABEL_OFF    = 0.58;
const BODY_OFF     = 0.70;
const ITEM_DUR     = 0.40;   // each content item entrance duration (fraction)

// setup sub-stagger: hub circle fills the window; its content fades in once
// the circle has landed.
const HUB_CONTENT_OFFSET_FRAC = 0.70;

const easeOutCubic         = Easing.out(Easing.cubic);
const easeInOutCubic       = Easing.inOut(Easing.cubic);
const easeOutBackSubtle    = Easing.out(Easing.back(1.1));
const easeOutBackOvershoot = Easing.out(Easing.back(1.4));

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

// Shades of dodger blue going clockwise (lightest at top, deepest at the end).
// Each petal gets a [outer, inner] gradient pair. Outer = rim side (lighter);
// inner = hub side (darker). The 6-stop ramp is re-spread across whatever count
// is supplied so 2/3/4/5/6 petals always span lightest → deepest.
const PETAL_GRADIENTS = [
  ['#7CC7FF', '#1A9CFE'],  // lightest
  ['#5BB6FF', '#0F95FB'],
  ['#1A9CFE', '#0686EE'],
  ['#0686EE', '#0560A8'],
  ['#0560A8', '#0a3a5e'],
  ['#0066BB', '#0a3050'],  // deepest oxford
] as const;

// Hub, oxford-blue → near-black radial gradient (same palette family as
// Carousel5Tiles tiles and the TreeDiagram4x2 bg).
const HUB_BG =
  'radial-gradient(circle at 38% 32%, #0e3454 0%, #052438 38%, #02101c 75%, #000000 100%)';
const HUB_BORDER = 'rgba(255,255,255,0.08)';
const HUB_SHADOW =
  '0 18px 44px rgba(0,0,0,0.45), ' +
  'inset 0 2px 6px rgba(255,255,255,0.10)';

const PETAL_SHADOW = 'drop-shadow(0 12px 22px rgba(5,36,56,0.22))';

const TEXT_WHITE       = '#FFFFFF';
const TEXT_WHITE_DIM   = 'rgba(255,255,255,0.85)';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,    { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`,  { weight: '500', display: 'block' });
    const inter  = new FontFace('ClashGrotesk',   `url(${INTER_EXTRABOLD_SRC}) format('woff2')`, { weight: '800', display: 'block' });
    const [b, m, i] = await Promise.all([bold.load(), medium.load(), inter.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
    fonts.add(m);
    fonts.add(i);
  })();
  return fontsPromise;
}

// ─── Geometry helpers ────────────────────────────────────────────────────────

function rad(deg: number): number { return (deg * Math.PI) / 180; }

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  const a = rad(angleDeg);
  return { x: WHEEL_CX + radius * Math.cos(a), y: WHEEL_CY - radius * Math.sin(a) };
}

// Annular sector path. Angles are in math degrees (90° = up).
function petalPath(startDeg: number, endDeg: number, innerR: number, outerR: number): string {
  const p1 = polar(startDeg, outerR);
  const p2 = polar(endDeg,   outerR);
  const p3 = polar(endDeg,   innerR);
  const p4 = polar(startDeg, innerR);

  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    // Outer arc start → end. Sweep-flag 1 = clockwise in screen coords (y down).
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    // Inner arc end → start.
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// Donut-ring scaffold path (full annulus, two concentric circles). Used as the
// faint empty wheel outline during setup.
function ringPath(innerR: number, outerR: number): string {
  return [
    // Outer circle (clockwise).
    `M ${(WHEEL_CX + outerR).toFixed(2)} ${WHEEL_CY.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 1 0 ${(WHEEL_CX - outerR).toFixed(2)} ${WHEEL_CY.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 1 0 ${(WHEEL_CX + outerR).toFixed(2)} ${WHEEL_CY.toFixed(2)}`,
    'Z',
    // Inner circle (counter-clockwise, carves the hole via even-odd fill).
    `M ${(WHEEL_CX + innerR).toFixed(2)} ${WHEEL_CY.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 1 1 ${(WHEEL_CX - innerR).toFixed(2)} ${WHEEL_CY.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 1 1 ${(WHEEL_CX + innerR).toFixed(2)} ${WHEEL_CY.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// Petal i of `count` (0-indexed clockwise from top). The wheel is divided
// evenly into `count` slices of (360 / count)°. Petal 0 sits at the top
// (mid = 90°) and each subsequent petal steps clockwise.
function petalAngles(
  i: number,
  count: number,
): { startDeg: number; endDeg: number; midDeg: number } {
  const sweep    = 360 / count;
  const mid      = 90 - i * sweep;            // clockwise from top
  const halfWidth = sweep / 2 - GAP_DEG / 2;
  return {
    startDeg: mid + halfWidth,
    endDeg:   mid - halfWidth,
    midDeg:   mid,
  };
}

// Petal i's content centroid, the point the content stack is centred on.
function petalCentroid(i: number, count: number): { x: number; y: number } {
  const { midDeg } = petalAngles(i, count);
  return polar(midDeg, CONTENT_R);
}

// Pick a petal gradient spread evenly across the palette so 2..6 petals always
// span lightest → deepest without re-using the same shade.
function petalGradient(i: number, count: number): readonly [string, string] {
  const idx = count <= 1 ? 0 : Math.round((i * (PETAL_GRADIENTS.length - 1)) / (count - 1));
  return PETAL_GRADIENTS[idx]!;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Empty donut-ring scaffold, scales in during setup behind the hub.
function RingScaffold({ frame, startF, durF }: { frame: number; startF: number; durF: number }) {
  const local = frame - startF;
  if (local < 0) return null;
  const scale = interpolate(local, [0, durF], [0.92, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
  });
  const op = interpolate(local, [0, durF * 0.7], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  return (
    <g
      style={{
        transformOrigin: `${WHEEL_CX}px ${WHEEL_CY}px`,
        transform: `scale(${scale})`,
        opacity: op,
      }}
    >
      <path
        d={ringPath(INNER_R, OUTER_R)}
        fillRule="evenodd"
        fill="rgba(5,36,56,0.05)"
        stroke="rgba(5,36,56,0.16)"
        strokeWidth={1.5}
      />
    </g>
  );
}

function Petal({
  i, count, frame, startF, durF, pulseFrames,
}: {
  i: number; count: number; frame: number; startF: number; durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const { startDeg, endDeg, midDeg } = petalAngles(i, count);
  const path = petalPath(startDeg, endDeg, INNER_R, OUTER_R);
  const [outerColor, innerColor] = petalGradient(i, count);

  // Fill entrance occupies the first FILL_FRAC of the window.
  const fillDurF = Math.max(1, durF * FILL_FRAC);
  const op = interpolate(local, [0, fillDurF * 0.7], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const introScale = interpolate(local, [0, fillDurF], [0.92, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
  });

  // Re-mention pulse, multiplied into the petal's own transform around its
  // centroid; 1 outside pulse windows so the entrance is untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const centroid = petalCentroid(i, count);

  // Gradient direction: from outer rim toward the hub, aligned with the petal's
  // midpoint angle so the lit "rim" side sits at the wheel's outer edge.
  const mid = polar(midDeg, OUTER_R);
  const hub = polar(midDeg, INNER_R);
  const gradId = `petal-grad-${i}`;

  return (
    <g
      style={{
        transformOrigin: `${centroid.x}px ${centroid.y}px`,
        transform: `scale(${introScale * pulse})`,
        opacity: op,
        filter: PETAL_SHADOW,
      }}
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={mid.x} y1={mid.y}
          x2={hub.x} y2={hub.y}
        >
          <stop offset="0%"   stopColor={outerColor} />
          <stop offset="100%" stopColor={innerColor} />
        </linearGradient>
      </defs>
      {/* Base petal fill */}
      <path d={path} fill={`url(#${gradId})`} />
      {/* Subtle inner highlight along the rim, thin lighter band. */}
      <path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1.5}
      />
    </g>
  );
}

function Hub({
  frame, startF, durF,
  title, subtitle, centerIcon,
}: {
  frame: number; startF: number; durF: number;
  title: string; subtitle: string; centerIcon: string;
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const scale = interpolate(local, [0, durF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const contentOp = interpolate(
    local,
    [durF * HUB_CONTENT_OFFSET_FRAC, durF],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: WHEEL_CX - HUB_R,
        top:  WHEEL_CY - HUB_R,
        width:  HUB_R * 2,
        height: HUB_R * 2,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Hub circle */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: HUB_BG,
          border: `1px solid ${HUB_BORDER}`,
          boxShadow: HUB_SHADOW,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 30,
          opacity: contentOp,
        }}
      >
        <div style={{ width: 92, height: 92 }}>
          <Img
            src={staticFile(`icons/${centerIcon}.svg`)}
            alt=""
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
        <div
          style={{
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: '-0.015em',
            lineHeight: 1.05,
            textAlign: 'center',
            textTransform: 'uppercase',
            textShadow: '0 1px 3px rgba(0,0,0,0.35)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.70)',
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            letterSpacing: '-0.005em',
            lineHeight: 1.35,
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function PetalContent({
  i, count, petal, frame, startF, durF, pulseFrames,
}: {
  i: number;
  count: number;
  petal: Flywheel4PetalsProps['petals'][number];
  frame: number;
  startF: number;
  durF: number;     // total petal entrance; number/icon/label/body cascade within it
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const centre = petalCentroid(i, count);
  const numberPos = { x: centre.x, y: centre.y + NUMBER_DY };
  const iconPos   = { x: centre.x, y: centre.y + ICON_DY };
  const labelPos  = { x: centre.x, y: centre.y + LABEL_DY };
  const bodyPos   = { x: centre.x, y: centre.y + BODY_DY };

  // Re-mention pulse, applied to the whole petal's content via an outer wrapper
  // scaled around the petal centroid. 1 outside pulse windows -> no effect on
  // the entrance cascade; composes with each child's own reveal transform.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Per-element start frames + durations, as fractions of the petal window.
  const itemDurF   = Math.max(1, durF * ITEM_DUR);
  const numberStart = durF * NUMBER_OFF;
  const iconStart   = durF * ICON_OFF;
  const labelStart  = durF * LABEL_OFF;
  const bodyStart   = durF * BODY_OFF;

  // Number, pop with back overshoot.
  const numberLocal = local - numberStart;
  const numberScale = interpolate(numberLocal, [0, itemDurF], [0.55, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const numberOp = interpolate(numberLocal, [0, itemDurF * 0.5], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Icon, fade + slight scale.
  const iconLocal = local - iconStart;
  const iconOp = interpolate(iconLocal, [0, itemDurF * 0.6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const iconScale = interpolate(iconLocal, [0, itemDurF], [0.78, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
  });

  // Label, fade.
  const labelLocal = local - labelStart;
  const labelOp = interpolate(labelLocal, [0, itemDurF * 0.7], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Body, fade.
  const bodyLocal = local - bodyStart;
  const bodyOp = interpolate(bodyLocal, [0, itemDurF * 0.8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  const labelMaxWidth = 240;
  const bodyMaxWidth  = 220;

  const numberStr = String(i + 1).padStart(2, '0');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${centre.x}px ${centre.y}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Number */}
      <div
        style={{
          position: 'absolute',
          left: numberPos.x,
          top:  numberPos.y,
          transform: `translate(-50%, -50%) scale(${numberScale})`,
          opacity: numberOp,
          color: TEXT_WHITE,
          fontFamily: "'ClashGrotesk', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 72,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          textShadow: '0 2px 8px rgba(0,40,80,0.30)',
        }}
      >
        {numberStr}
      </div>

      {/* Icon */}
      <div
        style={{
          position: 'absolute',
          left: iconPos.x,
          top:  iconPos.y,
          width: 64,
          height: 64,
          transform: `translate(-50%, -50%) scale(${iconScale})`,
          opacity: iconOp,
        }}
      >
        <WhiteIcon name={petal.icon} />
      </div>

      {/* Label, single line by design; long text wraps to 2 lines and
          anything past that is clipped so it never spills onto the bg. */}
      <div
        style={{
          position: 'absolute',
          left: labelPos.x,
          top:  labelPos.y,
          transform: 'translate(-50%, -50%)',
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: '-0.012em',
          lineHeight: 1.05,
          width: labelMaxWidth,
          maxHeight: 28 * 1.05 * 2,
          textAlign: 'center',
          opacity: labelOp,
          textShadow: '0 1px 4px rgba(0,40,80,0.30)',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}
      >
        {petal.label}
      </div>

      {/* Body, wraps inside the petal; ≥3 lines is clipped so a runaway
          description can't spill onto the background. */}
      <div
        style={{
          position: 'absolute',
          left: bodyPos.x,
          top:  bodyPos.y,
          transform: 'translate(-50%, -50%)',
          color: TEXT_WHITE_DIM,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 17,
          letterSpacing: '-0.003em',
          lineHeight: 1.30,
          width: bodyMaxWidth,
          maxHeight: 17 * 1.30 * 3,
          textAlign: 'center',
          opacity: bodyOp,
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}
      >
        {petal.body}
      </div>
    </div>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const Flywheel4Petals: React.FC<Flywheel4PetalsProps> = ({
  title,
  subtitle,
  centerIcon,
  petals,
  timings,
}) => {
  const frame = useCurrentFrame();
  const count = petals.length;

  const [handle] = useState(() => delayRender('Loading Flywheel4Petals fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent.
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 1.0);

  // Re-mention pulse frames per petal{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `petal${i}`)
      .map((p) => f(p.at));

  // setup, the hub + faint donut-ring scaffold scale in.
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupDurF   = cSetup ? f(durOf(cSetup)) : 0;

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {/* SVG wheel, the donut-ring scaffold (setup) and petal fills. */}
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Phase 2, empty donut-ring scaffold scales in (only when setup is scheduled). */}
        {cSetup && (
          <RingScaffold frame={frame} startF={setupStartF} durF={setupDurF} />
        )}

        {/* Phase 3, petal fills, each gated on its petal{i} reveal. */}
        {petals.map((_, i) => {
          const c = cue(`petal${i}`);
          return c ? (
            <Petal
              key={`petal-${i}`}
              i={i}
              count={count}
              frame={frame}
              startF={f(c.at)}
              durF={f(durOf(c))}
              pulseFrames={pulseFramesFor(i)}
            />
          ) : null;
        })}
      </svg>

      {/* Phase 3, per-petal content (number -> icon -> label -> body cascade),
          gated and timed by the same petal{i} reveal. */}
      {petals.map((petal, i) => {
        const c = cue(`petal${i}`);
        return c ? (
          <PetalContent
            key={`pc-${i}`}
            i={i}
            count={count}
            petal={petal}
            frame={frame}
            startF={f(c.at)}
            durF={f(durOf(c))}
            pulseFrames={pulseFramesFor(i)}
          />
        ) : null;
      })}

      {/* setup, central hub scales in (rendered on top of petals). */}
      {cSetup && (
        <Hub
          frame={frame}
          startF={setupStartF}
          durF={setupDurF}
          title={title}
          subtitle={subtitle}
          centerIcon={centerIcon}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const flywheel4PetalsDefaultProps: Flywheel4PetalsProps = {
  title:      'Agentic Loop',
  subtitle:   'How a machine learns from its own actions',
  centerIcon: 'bot',
  petals: [
    { label: 'Plans',    body: 'Draft the next move from the goal',     icon: 'clipboard' },  // top
    { label: 'Acts',     body: 'Run a tool, write code, send a call',   icon: 'zap'       },  // right
    { label: 'Observes', body: 'Capture results, errors, side effects', icon: 'eye'       },  // bottom
    { label: 'Reflects', body: 'Update the plan from what was learned', icon: 'refresh'   },  // left
  ],
  timings: {
    sequence: [
      { target: 'setup',  at: 0.3, in: 1.2 },
      { target: 'petal0', at: 1.6 },
      { target: 'petal1', at: 3.0 },
      { target: 'petal2', at: 4.4 },
      { target: 'petal3', at: 5.8 },
    ],
  },
};
