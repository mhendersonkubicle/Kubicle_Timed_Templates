import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// OrgChart, configurable hierarchy / structure chart, rebuilt on the STANDARD
// reveal-sequence timing model.
//   • Platinum-blue (#E6ECF2) canvas.
//   • 1 fixed box at the top, then 1-5 rows below it, each holding 1-4 boxes
//     (e.g. a 1-4-3-4 structure). Rows can be uneven widths.
//   • Each box carries a single text label (no people / names / avatars).
//   • A central vertical "spine" runs down the middle; each row hangs off the
//     spine via a horizontal bar with a short drop to every box. This keeps the
//     connectors sensible even when adjacent rows have different box counts.
//   • Top box is deep oxford; every lower box is dodger blue, monochrome,
//     on-palette. Connectors are soft slate-blue lines drawn on with
//     stroke-dashoffset.
//   • The whole chart auto-centres vertically and each row auto-centres
//     horizontally, so any 1->N->... shape stays balanced on the canvas.
//
// Reveal (STANDARD MODEL):
//   • setup       , the central vertical spine draws in down the middle of the
//                    canvas (the scaffold the rows hang off). Non-content, fixed
//                    staging so the scene never opens dead.
//   • top         , the single top box scales in.
//   • node{r}_{c} , each lower box, revealed top-down (row r = 0..R-1) and
//                    left-to-right within a row (col c). The first node of a row
//                    (node{r}_0) also draws that row's horizontal bar + the drops
//                    to every box in the row, so the connector arrives with the
//                    row's first box.

// ─── Schema ──────────────────────────────────────────────────────────────────

// A single box label. Kept short, boxes get narrow at 4-per-row.
export const orgChartLabelSchema = z.string().min(1).max(40);

// One row of the chart: 1 to 4 box labels.
export const orgChartRowSchema = z.array(orgChartLabelSchema).min(1).max(4);

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just the
// platinum stage). Each step is one "object". All times are scene-relative
// SECONDS.
//
// Addressable targets (INDEXED nodes, top-down then left-to-right):
//   setup        the central vertical spine draws in (scaffold staging)
//   top          the single top box scales in
//   node{r}_{c}  lower box at row r (0-based among rows) col c (0-based within
//                the row). node{r}_0 also draws row r's horizontal bar + drops.
//                A node target whose r/c is out of range for the supplied rows
//                is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|top|node[0-9]+_[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.6), // entrance duration (box scale / connector draw)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed box is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets are CONTENT boxes only (top or
// node{r}_{c}); setup is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(top|node[0-9]+_[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const orgChartTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const orgChartSchema = z.object({
  // The single box at the very top (always exactly one).
  top:    orgChartLabelSchema,
  // 1 to 5 rows below the top, each holding 1 to 4 boxes. Uneven widths are
  // fine, e.g. [[4 boxes], [3 boxes], [4 boxes]] renders a 1-4-3-4 chart.
  rows:   z.array(orgChartRowSchema).min(1).max(5),
  timings: orgChartTimingsSchema.optional(),
});

export type OrgChartProps = z.infer<typeof orgChartSchema>;

export const orgChartMeta = {
  description:
    'Configurable structure chart: one fixed box at the top, then 1-5 rows ' +
    'below it of 1-4 boxes each (e.g. 1-4-3-4). Each box is a single text ' +
    'label, no people or avatars. A central spine links the rows, the chart ' +
    'auto-centres, and it reveals top-down row by row.',
  authoringNotes:
    'Supply top (one label for the top box) and rows (1 to 5 rows, each an ' +
    'array of 1 to 4 short labels). Rows may be different widths, a 1-4-3-4 ' +
    'shape is rows: [[..4..],[..3..],[..4..]]. Labels are <=40 chars and wrap ' +
    'to as many lines as fit; keep them short (a team, function, or stage, ' +
    '"Engineering", "AI Lab", "Q3 Launch") since boxes get narrow at 4-per-row. ' +
    'The top box is oxford; every lower box is dodger blue. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets are ' +
    'INDEXED nodes: schedule a `setup` step (the central spine draws in as the ' +
    'scaffold), then `top` (the top box), then one `node{r}_{c}` per lower box ' +
    'in TOP-DOWN, LEFT-TO-RIGHT order (row r 0-based among rows, col c 0-based ' +
    'within the row). node{r}_0 also draws that row connector. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.6) }. The chart ' +
    'auto-centres for whatever shape you supply. RE-MENTION PULSE: when a box is ' +
    'named again >~2-3s after its reveal, add a `timings.pulses` entry ' +
    '{ target, at } at the re-mention cue for a brief brand pulse. NARRATION ' +
    'MUST be top-down: introduce the top box first, then each level downward, ' +
    'left-to-right within a level, matching the reveal order. See GUIDANCE.md ' +
    'for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BLACK_SRC  = staticFile('fonts/Satoshi-Black.woff2');
const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Uniform box size across all rows (sized so 4 fit comfortably per row).
const BOX_W = 400;
const BOX_H = 104;
const H_GAP = 44;     // horizontal gap between boxes in a row
const TOP_BOX_W = 440; // the single top box is a touch wider for emphasis

// Vertical layout, the whole stack is centred in the canvas; the per-row
// pitch adapts to the row count (roomier for few rows, tighter for many).
const V_MARGIN   = 72;
const PITCH_MIN  = 142;
const PITCH_MAX  = 232;
const DROP_ABOVE = 28; // distance from a row's connector bar to its box tops

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

const easeOutCubic         = Easing.out(Easing.cubic);
const easeInOutCubic       = Easing.inOut(Easing.cubic);
const easeOutBackOvershoot = Easing.out(Easing.back(1.3));

// Within a node's `in` window, the first node of a row draws its connector
// (bar + drops) over the first part, then the box scales in over the rest, so
// the connector lands just before its box.
const CONN_FRACTION = 0.55; // connector draw occupies the first ~55% of the window

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

// Top, deep oxford -> near-black
const TOP_BG =
  'linear-gradient(135deg, #0a3050 0%, #052438 50%, #02101c 100%)';
// Lower boxes, dodger blue
const BOX_BG =
  'linear-gradient(135deg, #38AEFF 0%, #1A9CFE 50%, #0686EE 100%)';

const CARD_BORDER = '1px solid rgba(255,255,255,0.08)';
const CARD_SHADOW = '0 10px 26px rgba(5,36,56,0.20)';

const TEXT_WHITE = '#FFFFFF';

const CONNECTOR_COLOR = 'rgba(11,30,51,0.30)';
const CONNECTOR_WIDTH = 2.5;

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const black  = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`,  { weight: '900', display: 'block' });
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,   { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [k, b, m] = await Promise.all([black.load(), bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(k);
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ─── Box (single label, scale-in entry + re-mention pulse) ───────────────────

function LabelBox({
  isTop, cx, top, width, height, label, frame, startF, durF, pulseFrames,
}: {
  isTop: boolean;
  cx: number;       // horizontal centre
  top: number;      // top Y
  width: number;
  height: number;
  label: string;
  frame: number;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const scale = interpolate(local, [0, durF], [0.88, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const op = interpolate(local, [0, durF * 0.6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const dy = interpolate(local, [0, durF], [-10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Re-mention pulse, multiplied into this box's OUTER transform around its own
  // centre; 1 outside pulse windows so the entrance scale is untouched and the
  // bump composes with (never replaces) the reveal transform.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - width / 2,
        top,
        width,
        height,
        transform: `translateY(${dy}px) scale(${scale * pulse})`,
        transformOrigin: 'center center',
        opacity: op,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: isTop ? 20 : 18,
          background: isTop ? TOP_BG : BOX_BG,
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 20px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            // Fill the available width and wrap to as many lines as needed so a
            // long label never spills outside the box, long unbreakable words
            // are broken too. Clamped to 3 lines (which fits the box height) as
            // a safety net for extreme strings.
            width: '100%',
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: isTop ? 900 : 700,
            fontSize: isTop ? 30 : 26,
            letterSpacing: '-0.012em',
            lineHeight: 1.15,
            textAlign: 'center',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// Animated line (stroke-dashoffset draw-on).
function AnimLine({
  x1, y1, x2, y2, progress,
}: {
  x1: number; y1: number; x2: number; y2: number; progress: number;
}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={CONNECTOR_COLOR}
      strokeWidth={CONNECTOR_WIDTH}
      strokeLinecap="round"
      strokeDasharray={length}
      strokeDashoffset={length * (1 - clamp01(progress))}
    />
  );
}

// Horizontal centres for a row of n boxes, centred on the canvas.
function rowCentres(n: number): number[] {
  const groupW = n * BOX_W + (n - 1) * H_GAP;
  const firstCx = CANVAS_W / 2 - groupW / 2 + BOX_W / 2;
  return Array.from({ length: n }, (_, i) => firstCx + i * (BOX_W + H_GAP));
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const OrgChart: React.FC<OrgChartProps> = ({ top, rows, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading OrgChart fonts'));
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
  const durOf = (s: RevealStep) => (s.in ?? 0.6);

  // Re-mention pulse frames for a content target (from timings.pulses).
  const pulseFramesFor = (target: string): number[] =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // ── Vertical layout (auto-centred, adaptive pitch) ─────────────────────────
  const T      = 1 + rows.length;                       // total rows incl. top
  const avail  = CANVAS_H - 2 * V_MARGIN;
  const pitch  = T > 1
    ? Math.max(PITCH_MIN, Math.min(PITCH_MAX, (avail - BOX_H) / (T - 1)))
    : 0;
  const stackH = (T - 1) * pitch + BOX_H;
  const topY   = (CANVAS_H - stackH) / 2;
  const rowTopY = (r: number) => topY + r * pitch;      // r: 0 = top, 1..R rows

  // ── Per-row geometry ───────────────────────────────────────────────────────
  const rowGeom = rows.map((row, idx) => {
    const r          = idx + 1;                          // 1-based row position
    const centres    = rowCentres(row.length);
    const boxTop     = rowTopY(r);
    const barY       = boxTop - DROP_ABOVE;
    const prevBottom = idx === 0
      ? rowTopY(0) + BOX_H                               // bottom of the top box
      : rowTopY(r - 1) + BOX_H;                          // bottom of the row above
    // The row's connector arrives with the row's FIRST node (node{idx}_0).
    const firstNodeCue = cue(`node${idx}_0`);
    return { row, idx, centres, boxTop, barY, prevBottom, firstNodeCue };
  });

  // ── setup, the central vertical spine draws down the middle (scaffold) ─────
  // Drawn from the bottom of the top box down to the last row's bar level, so
  // there is a real staging animation before any box arrives.
  const cSetup = cue('setup');
  const spineTopY = rowTopY(0) + BOX_H;
  const spineBotY = rows.length > 0
    ? rowTopY(rows.length) - DROP_ABOVE
    : spineTopY;
  const spineProg = cSetup
    ? clamp01((frame - f(cSetup.at)) / Math.max(1, f(durOf(cSetup))))
    : 0;

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {/* Connectors: central spine + per-row bars + drops, behind the boxes. */}
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* setup, the central spine draws in as the scaffold (Phase 2). */}
        {cSetup && (
          <AnimLine
            x1={CANVAS_W / 2} y1={spineTopY}
            x2={CANVAS_W / 2} y2={spineBotY}
            progress={easeInOutCubic(spineProg)}
          />
        )}

        {/* Per-row bar + drops, drawn with the row's FIRST node reveal. */}
        {rowGeom.map((g) => {
          if (!g.firstNodeCue) return null;
          const base = f(g.firstNodeCue.at);
          const connDurF = Math.max(1, f(durOf(g.firstNodeCue) * CONN_FRACTION));
          const cp     = clamp01((frame - base) / connDurF);
          const barP   = clamp01(cp / 0.6);
          const dropP  = clamp01((cp - 0.4) / 0.6);
          const minCx  = g.centres[0]!;
          const maxCx  = g.centres[g.centres.length - 1]!;
          if (frame < base) return null;
          return (
            <React.Fragment key={`conn-${g.idx}`}>
              {/* Horizontal bar across this row (only if more than one box) */}
              {g.centres.length > 1 && (
                <>
                  <AnimLine
                    x1={CANVAS_W / 2} y1={g.barY}
                    x2={minCx}        y2={g.barY}
                    progress={easeInOutCubic(barP)}
                  />
                  <AnimLine
                    x1={CANVAS_W / 2} y1={g.barY}
                    x2={maxCx}        y2={g.barY}
                    progress={easeInOutCubic(barP)}
                  />
                </>
              )}
              {/* Short drop from the bar down to each box top */}
              {g.centres.map((cx, i) => (
                <AnimLine
                  key={`drop-${g.idx}-${i}`}
                  x1={cx} y1={g.barY}
                  x2={cx} y2={g.boxTop}
                  progress={easeInOutCubic(dropP)}
                />
              ))}
            </React.Fragment>
          );
        })}
      </svg>

      {/* Top box, gated on its `top` reveal step */}
      {(() => {
        const cTop = cue('top');
        return cTop ? (
          <LabelBox
            isTop
            cx={CANVAS_W / 2}
            top={rowTopY(0)}
            width={TOP_BOX_W}
            height={BOX_H}
            label={top}
            frame={frame}
            startF={f(cTop.at)}
            durF={f(durOf(cTop))}
            pulseFrames={pulseFramesFor('top')}
          />
        ) : null;
      })()}

      {/* Rows of boxes, each box gated on its own node{r}_{c} reveal step */}
      {rowGeom.map((g) =>
        g.row.map((label, i) => {
          const c = cue(`node${g.idx}_${i}`);
          if (!c) return null;
          // The first node of the row waits for the connector to draw before its
          // box scales in (connector occupies the first CONN_FRACTION); later
          // boxes in the row scale in from their own cue directly.
          const boxStartF = i === 0
            ? f(c.at) + Math.round(f(durOf(c)) * CONN_FRACTION)
            : f(c.at);
          return (
            <LabelBox
              key={`box-${g.idx}-${i}`}
              isTop={false}
              cx={g.centres[i]!}
              top={g.boxTop}
              width={BOX_W}
              height={BOX_H}
              label={label}
              frame={frame}
              startF={boxStartF}
              durF={f(durOf(c) * (i === 0 ? (1 - CONN_FRACTION) : 1))}
              pulseFrames={pulseFramesFor(`node${g.idx}_${i}`)}
            />
          );
        }),
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const orgChartDefaultProps: OrgChartProps = {
  top: 'Executive Office',
  rows: [
    ['Product', 'Engineering', 'Design', 'Operations'],
    ['Research', 'Platform', 'Brand'],
    ['AI Lab', 'Infrastructure', 'Web', 'Mobile'],
  ],
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 0.9 },
      { target: 'top',     at: 1.1 },
      { target: 'node0_0', at: 2.0 },
      { target: 'node0_1', at: 2.5 },
      { target: 'node0_2', at: 3.0 },
      { target: 'node0_3', at: 3.5 },
      { target: 'node1_0', at: 4.4 },
      { target: 'node1_1', at: 4.9 },
      { target: 'node1_2', at: 5.4 },
      { target: 'node2_0', at: 6.3 },
      { target: 'node2_1', at: 6.8 },
      { target: 'node2_2', at: 7.3 },
      { target: 'node2_3', at: 7.8 },
    ],
  },
};
