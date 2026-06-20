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

// BigPoints3V1, a row of 2-3 columns of icon + pill caption on an oxford-blue
// panel, with a sweeping loading bar that advances to each column as its point
// is revealed.
//   • setup: the oxford-blue panel fades + scales 0.93 -> 1, and the loading-bar
//     dark track + empty fill container fade in (scaffolding, no point content).
//   • Each point: its icon scales in (easeOutBack) with a sine pulse, then its
//     caption pill pops (easeOutBack scale + easeOutCubic slide-up + opacity),
//     and the bar fill advances from the previous column to this column.
//   • The last scheduled point completes the bar fill to 100 %.
//
// Icons use Pattern B runtime recolour: the SVG ships with #33CCCC accents
// (Icon Library default), and at render time the SvgIcon swaps that to Dodger
// Blue (#1E9AFF) plus fills the root white so unstyled outlines read on the
// dark panel.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const bigPoints3V1PointSchema = z.object({
  // Icon id from icons/ (e.g. "rocket", "idea", "money-bag").
  // Unknown ids degrade silently to an empty column.
  icon: z.string().min(1),
  // Pill caption, Satoshi Black 34 px white inside the pill graphic. ≤25 chars.
  label: z.string().min(1).max(25),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas. All
// times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the oxford-blue panel + empty loading bar fade/scale in
//   point0..pointN-1 one point revealed as a single object: its icon pops + pulses,
//                    its pill pops, and the bar fill advances to that column. N is
//                    points.length (2-3). A point{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|point[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.8), // entrance duration (icon + pulse + pill)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed point is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets are the SAME indexed point slots as
// the reveal sequence (point{i}), excluding setup. See README "re-mention
// pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^point[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const bigPoints3V1TimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const bigPoints3V1Schema = z.object({
  // 2 or 3 points. The oxford-blue panel + loading bar shrink to fit the count
  // and stay centred in frame (no negative space for the 2-point case).
  points: z.array(bigPoints3V1PointSchema).min(2).max(3),
  timings: bigPoints3V1TimingSchema.optional(),
});

export type BigPoints3V1Props = z.infer<typeof bigPoints3V1Schema>;

export const bigPoints3V1Meta = {
  description:
    'A row of 2-3 columns on an oxford-blue base, each column holding a single ' +
    'bold icon and a coloured pill caption beneath. A loading bar sweeps left → ' +
    'right, advancing to each column as its point reveals; the icon pops + pulses ' +
    'and the caption pill pops in. The panel and bar shrink to fit the column ' +
    'count and stay centred. Best for surfacing two or three top-level takeaways ' +
    'or features as a quick visual recap with minimal supporting copy.',
  authoringNotes:
    'Supply 2 or 3 points, ordered left → right. The panel auto-sizes and centres ' +
    'for the count. icon is an id from the catalog (e.g. "rocket", "idea", ' +
    '"money-bag"); unknown ids leave the slot empty. label is the pill caption, ' +
    'strict 25-character max, one line at 34 px in Satoshi Black; write short ' +
    'noun phrases (2-4 words). GOOD: "Faster processing", "Real-time sync", ' +
    '"Zero downtime". BAD: "Processes data faster" (too long). ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (panel + empty bar) then one `point{i}` per point in order. ' +
    'Each step is { target, at (seconds), in? (entrance duration, default 0.8) }. ' +
    'A point step reveals its icon AND caption together and advances the bar fill ' +
    'to that column; the last scheduled point completes the bar to 100 %. ' +
    'NARRATION MUST be linear-by-point: deliver one takeaway fully before the ' +
    'next, strictly left to right, never jump ahead or back, because the bar ' +
    'arriving at column i is the visual commitment that point i is "now". See ' +
    'GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const PILL_SRC            = staticFile('Template-Specific-Assets/BigPoints3V1/pill_box.png');
const SATOSHI_BLACK_SRC   = staticFile('fonts/Satoshi-Black.woff2');
const INTER_EXTRABOLD_SRC = staticFile('fonts/ClashGrotesk-Bold.woff2');

// ─── Layout constants ─────────────────────────────────────────────────────────
// The Oxford-blue panel and the loading bar used to be fixed 1920×1080 PNGs, so
// the layout was locked to 3 columns. They are drawn in CSS (colours + geometry
// matched to the original artwork) so the panel can shrink to fit 2 or 3 columns
// with no negative space and stay centred in frame.

// Per-column horizontal allocation, and the distance from the outer column
// centres to the panel edge. Derived from the original 3-column artwork:
//   panel x[59..1863] (w 1804); columns at 360 / 961 / 1562 → spacing 601;
//   outer columns sit 301 px in from each panel edge.
const COL_SPACING = 601;
const COL_EDGE    = 301;
const panelWidthFor = (n: number) => (n - 1) * COL_SPACING + 2 * COL_EDGE;
const panelLeftFor  = (n: number) => Math.round((1920 - panelWidthFor(n)) / 2);
const colCxFor      = (i: number, n: number) => panelLeftFor(n) + COL_EDGE + i * COL_SPACING;

// Panel box (vertical position matches the original artwork; width is dynamic).
const PANEL_TOP    = 274;
const PANEL_HEIGHT = 733;
const PANEL_RADIUS = 56;
const PANEL_GRADIENT =
  'linear-gradient(180deg, #052234 0%, #041C2C 45%, #02121C 100%)';
const PANEL_SHADOW =
  '0 40px 80px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.35)';

// Loading bar, floats just above the panel top, inset from the panel sides.
const BAR_TOP         = 205;
const BAR_HEIGHT      = 51;
const BAR_INSET       = 46;     // gap between each bar end and the panel side
const BAR_TRACK_COLOR = '#052438';
const BAR_FILL_GRADIENT =
  'linear-gradient(180deg, #48B2FF 0%, #0496FF 100%)';

// Whole composition shifts up so the panel + bar group reads as vertically
// centred on the canvas.
const VERTICAL_OFFSET = -60;
// Icon visual size, prototype renders at 165 px then scales 2.45×.
const ICON_SZ = 404;
// Icon vertical centre.
const ICON_CY = 574;
// Pulse triggered as each point reveals, sine bump, ±8 % peak over 0.45 s.
const PULSE_AMP = 0.08;
const PULSE_DUR_S = 0.45;
// Pill graphic is a 552×113 region inside a 1920×1080 PNG, top-left at (106, 854).
const PILL_W     = 552;
const PILL_H     = 113;
const PILL_IMG_X = 106;
const PILL_IMG_Y = 854;
const PILL_TOP   = 854;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic = Easing.out(Easing.cubic);
const easeOutBack  = Easing.out(Easing.back(1.70158));

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed point that is named again later gives a quick scale pulse at the
// re-mention. Brand values: ~0.45 s, +5 % peak, smooth up-and-down (half-sine).
// Distinct from the entrance pulse (PULSE_AMP/PULSE_DUR_S above) so the two
// never interfere.
const REMENTION_PULSE_DUR_S = 0.45;
const REMENTION_PULSE_AMP   = 0.05;
// Scale multiplier at `frame` given the pulse frames; 1 at rest, up to
// 1 + REMENTION_PULSE_AMP at a pulse peak. Overlapping pulses take the max.
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) {
      s = Math.max(s, 1 + REMENTION_PULSE_AMP * Math.sin((local / durF) * Math.PI));
    }
  }
  return s;
}

// ─── Font loading ─────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const satoshi = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`,  { weight: '900', display: 'block' });
    const inter   = new FontFace('ClashGrotesk',   `url(${INTER_EXTRABOLD_SRC}) format('woff2')`, { weight: '800', display: 'block' });
    const [s, i]  = await Promise.all([satoshi.load(), inter.load()]);
    const fonts   = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(s);
    fonts.add(i);
  })();
  return fontsPromise;
}

// ─── SvgIcon (Pattern B runtime recolour) ─────────────────────────────────────
// Fetches an SVG from the static asset folder and rewrites it for the
// "white base + Dodger Blue accents" colour scheme used on the Oxford Blue
// panel:
//   • Root <svg> tag injects fill="white" → unstyled outline paths inherit white.
//   • Source teal accents (#33CCCC) are remapped to Dodger Blue (#1E9AFF).
// Unknown icon names render nothing (graceful degradation).

function SvgIcon({ name, size }: { name: string; size: number }) {
  const [html, setHtml] = useState('');
  const [handle] = useState(() => delayRender(`Loading icon: ${name}`));

  useEffect(() => {
    const url = staticFile(`icons/${name}.svg`);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.text();
      })
      .then((raw) => {
        const processed = raw
          .replace(/<\?xml[^>]*\?>\s*/g, '')
          // Recolour teal accents → Dodger Blue.
          .replace(/style="fill:#33CCCC;?"/gi, 'style="fill:#1E9AFF;"')
          .replace(/fill:#33CCCC/gi, 'fill:#1E9AFF')
          .replace(/fill="#33CCCC"/gi, 'fill="#1E9AFF"')
          // Force white default fill + exact render size on the root tag.
          .replace(
            /<svg [^>]*>/,
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="white" width="${size}" height="${size}" style="display:block">`,
         );
        setHtml(processed);
      })
      .catch(() => setHtml(''))
      .finally(() => continueRender(handle));
  }, [name, size, handle]);

  if (!html) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
 );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
// Renders one pill using pill_box.png (full 1920×1080 canvas) windowed to the
// 552×113 region at (106, 854). Entry: easeOutBack scale-pop + easeOutCubic
// translateY + quick opacity ramp.

function AnimPill({
  frame,
  label,
  cx,
  startFrame,
  pillDuration,
  rementionScale = 1,
}: {
  frame: number;
  label: string;
  cx: number;
  startFrame: number;
  pillDuration: number;
  rementionScale?: number;
}) {
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const raw      = Math.min(1, localFrame / pillDuration);
  const easeBack = easeOutBack(raw);
  const opacity  = Math.min(1, raw / (10.5 / pillDuration));
  const ty       = (1 - easeOutCubic(raw)) * 50;
  const sc       = 0.6 + easeBack * 0.4;

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - PILL_W / 2,
        top:  PILL_TOP,
        width:  PILL_W,
        height: PILL_H,
        overflow: 'hidden',
        opacity,
        transform: `translateY(${ty}px) scale(${sc * rementionScale})`,
        transformOrigin: 'center center',
      }}
    >
      <Img
        src={PILL_SRC}
        alt=""
        style={{
          position: 'absolute',
          left: -PILL_IMG_X,
          top:  -PILL_IMG_Y,
          width:  1920,
          height: 1080,
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontFamily: "'Satoshi', 'ClashGrotesk', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: '-0.01em',
            textShadow: '0 1px 6px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const BigPoints3V1: React.FC<BigPoints3V1Props> = ({ points, timings }) => {
  const frame = useCurrentFrame();

  const [fontHandle] = useState(() => delayRender('Loading BigPoints3V1 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.8);

  // ── Dynamic geometry for the column count (2 or 3) ─────────────────────────
  const nCols      = points.length;
  const PANEL_W    = panelWidthFor(nCols);
  const PANEL_LEFT = panelLeftFor(nCols);
  const COL_CX     = points.map((_, i) => colCxFor(i, nCols));
  const BAR_LEFT   = PANEL_LEFT + BAR_INSET;
  const BAR_WIDTH  = PANEL_W - 2 * BAR_INSET;

  // ── Setup, panel fade/scale + empty bar fade ──────────────────────────────
  const cSetup = cue('setup');
  const setupOp = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
      })
    : 0;
  const setupScale = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [0.93, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
      })
    : 0.93;

  // ── Per-point cues (indexed) ───────────────────────────────────────────────
  // Each point i is gated on a point{i} step. The bar fill is driven by these
  // cues: it advances to column i's edge across point{i}'s entrance window, and
  // the LAST scheduled point completes the fill to 100 % rather than the column
  // centre, so the bar starts and finishes with content.
  const pointCues = points.map((_, i) => cue(`point${i}`));

  // Re-mention pulse frames per point index (from timings.pulses).
  const pulseFramesFor = (i: number) =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `point${i}`)
      .map((p) => f(p.at));
  const lastScheduledIdx = pointCues.reduce(
    (acc, c, i) => (c ? i : acc),
    -1,
 );

  // The bar's leading edge sits at BAR_LEFT + BAR_WIDTH × fillPct/100. Column i
  // (centre COL_CX[i]) corresponds to fill % = (COL_CX[i] - BAR_LEFT)/BAR_WIDTH.
  const colFillPct = (i: number) =>
    Math.max(0, Math.min(100, ((COL_CX[i]! - BAR_LEFT) / BAR_WIDTH) * 100));

  // Build strictly-increasing keyframes frame[] -> fillPct[] from the scheduled
  // point cues, so the fill arrives at each column exactly on its cue and the
  // last point completes the sweep to 100 %.
  const kf: number[] = [];
  const kp: number[] = [];
  pointCues.forEach((c, i) => {
    if (!c) return;
    const targetPct = i === lastScheduledIdx ? 100 : colFillPct(i);
    const arriveAt  = f(c.at + durOf(c) * 0.5);   // bar reaches the column mid-entrance
    if (kf.length === 0 || arriveAt > kf[kf.length - 1]!) {
      kf.push(arriveAt);
      kp.push(targetPct);
    }
  });
  // Anchor a 0 % start at the first scheduled point's cue so the fill begins
  // empty and sweeps from there.
  const firstCue = pointCues.find((c) => c);
  if (firstCue && kf.length > 0) {
    const startAt = f(firstCue.at);
    if (startAt < kf[0]!) {
      kf.unshift(startAt);
      kp.unshift(0);
    }
  }
  const barFillPct =
    kf.length >= 2
      ? interpolate(frame, kf, kp, {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        })
      : kf.length === 1
        ? (frame >= kf[0]! ? kp[0]! : 0)
        : 0;

  const pulseDur = f(PULSE_DUR_S);

  return (
    <AbsoluteFill style={{ backgroundColor: '#E6ECF2', overflow: 'hidden' }}>
      {/* Vertical-centre nudge so the panel + loading-bar group reads as
          centred on the canvas. */}
      <AbsoluteFill style={{ transform: `translateY(${VERTICAL_OFFSET}px)` }}>
        {/* Phase 2, setup scaffolding (only when the sequence schedules it):
            oxford-blue panel + empty loading bar. */}
        {cSetup && (
          <>
            {/* Oxford-blue panel (CSS), width fits the column count, centred; scales in */}
            <div
              style={{
                position: 'absolute',
                left: PANEL_LEFT,
                top:  PANEL_TOP,
                width:  PANEL_W,
                height: PANEL_HEIGHT,
                borderRadius: PANEL_RADIUS,
                background: PANEL_GRADIENT,
                boxShadow: PANEL_SHADOW,
                opacity: setupOp,
                transform: `scale(${setupScale})`,
                transformOrigin: 'center center',
              }}
            />

            {/* Loading bar, dark track */}
            <div
              style={{
                position: 'absolute',
                left: BAR_LEFT,
                top:  BAR_TOP,
                width:  BAR_WIDTH,
                height: BAR_HEIGHT,
                borderRadius: BAR_HEIGHT / 2,
                background: BAR_TRACK_COLOR,
                opacity: setupOp,
              }}
            />

            {/* Loading bar, blue fill, advances column-by-column on point cues */}
            <div
              style={{
                position: 'absolute',
                left: BAR_LEFT,
                top:  BAR_TOP,
                width:  BAR_WIDTH,
                height: BAR_HEIGHT,
                borderRadius: BAR_HEIGHT / 2,
                overflow: 'hidden',
                opacity: setupOp,
              }}
            >
              <div
                style={{
                  width: `${barFillPct}%`,
                  height: '100%',
                  background: BAR_FILL_GRADIENT,
                  borderRadius: BAR_HEIGHT / 2,
                }}
              />
            </div>
          </>
       )}

        {/* Phase 3, points, each gated on its point{i} reveal step. The icon
            scales/pulses in and the caption pill pops, together as one object. */}
        {points.map(({ icon, label }, i) => {
          const c = pointCues[i];
          if (!c) return null;

          const cx      = COL_CX[i]!;
          const startF  = f(c.at);
          const iconDur = Math.max(1, f(durOf(c) * 0.55));

          const iconOpacity = interpolate(frame, [startF, startF + iconDur], [0, 1], {
            extrapolateLeft:  'clamp',
            extrapolateRight: 'clamp',
          });
          const iconScale = interpolate(frame, [startF, startF + iconDur], [0.55, 1], {
            extrapolateLeft:  'clamp',
            extrapolateRight: 'clamp',
            easing: easeOutBack,
          });

          // Sine pulse triggered at the same moment, peaks at +8 % halfway
          // through the 0.45 s bump, returns to 1 cleanly.
          const pulseProg = interpolate(frame, [startF, startF + pulseDur], [0, 1], {
            extrapolateLeft:  'clamp',
            extrapolateRight: 'clamp',
          });
          const pulse = 1 + PULSE_AMP * Math.sin(Math.PI * pulseProg);

          // Pill pops a touch after the icon, late in the point's entrance.
          const pillStartF    = startF + Math.round(f(durOf(c)) * 0.35);
          const pillDurFrames = Math.max(1, f(durOf(c) * 0.55));

          // Re-mention pulse: a brief scale bump applied additively to the whole
          // point object (icon + pill) about each element's own centre, only
          // after the point has landed. Returns 1 outside pulse windows, so it
          // never disturbs the entrance.
          const remention = pulseScale(frame, pulseFramesFor(i), f(REMENTION_PULSE_DUR_S));

          return (
            <AbsoluteFill key={i}>
              {/* Icon centred at (cx, ICON_CY) */}
              <div
                style={{
                  position: 'absolute',
                  left: cx - ICON_SZ / 2,
                  top:  ICON_CY - ICON_SZ / 2,
                  width:  ICON_SZ,
                  height: ICON_SZ,
                  opacity: iconOpacity,
                  transform: `scale(${iconScale * pulse * remention})`,
                  transformOrigin: 'center center',
                }}
              >
                <SvgIcon name={icon} size={ICON_SZ} />
              </div>

              <AnimPill
                frame={frame}
                label={label}
                cx={cx}
                startFrame={pillStartF}
                pillDuration={pillDurFrames}
                rementionScale={remention}
              />
            </AbsoluteFill>
         );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
 );
};
