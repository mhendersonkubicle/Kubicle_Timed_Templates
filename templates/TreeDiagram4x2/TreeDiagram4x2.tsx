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

// TreeDiagram4x2, hero panel on the left → 2-5 caption pills → 1-3 leaves each,
// rebuilt on the STANDARD reveal-sequence timing model.
//   • Platinum-blue (#E6ECF2) base, with an oxford-blue → near-black radial
//     gradient panel that scales 0 → 1 from centre.
//   • Hero panel (the "root"): large dodger-blue rectangle on the left. Inside:
//     a large hero icon (any library SVG, forced solid white via a CSS mask) and
//     a dark title pill at the bottom (title ≤3 words, wraps to stay inside).
//   • Captions: dodger-blue gradient pills, Satoshi Medium white label.
//   • Leaves: smaller dodger spheres with a white icon + white body text to the
//     right. Each branch carries 1-3 leaves; point text may wrap to 2 lines.
//   • The number of branches (2-5) and leaves per branch (1-3) is variable, row
//     positions, the trunk extent, leaf size and spacing all scale to fit the
//     canvas with no overlap.
//   • Connector lines draw on with stroke-dashoffset.
//
// Reveal-sequence model (see README):
//   setup            oxford-blue stage scales in + hero panel slides in (root +
//                    its title pill) + the panel→trunk stub draws. One animated
//                    scaffolding reveal, no content text beyond the title.
//   branch0..branchN-1   one branch revealed as a single object: its trunk→pill
//                    connector + caption pill + pill→junction + per-leaf stubs +
//                    each leaf sphere/icon/text cascade. The vertical trunk
//                    segment down to a branch draws as that branch reveals.
//
// Icons render via a CSS mask forced to solid white (Pattern B, runtime
// recolour), so the source SVG's colour/theme is irrelevant and the
// icon-contrast suffix is cosmetic here (iconVariant: n/a, recoloured).

// ─── Schema ──────────────────────────────────────────────────────────────────

export const treeDiagram4x2LeafSchema = z.object({
  icon: z.string().min(1),                  // icons/<id>.svg (masked solid white)
  text: z.string().min(1).max(60),          // Satoshi Medium, white, wraps to 2 lines
});

export const treeDiagram4x2BranchSchema = z.object({
  caption: z.string().min(1).max(22),       // pill label, Satoshi Medium white
  leaves:  z.array(treeDiagram4x2LeafSchema).min(1).max(3),  // 1-3 points per pill
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// platinum stage with nothing on it). Each step is one "object". All times are
// scene-relative SECONDS.
//
// Addressable targets (root-outward, top-down order):
//   setup              oxford-blue stage scale-in + hero panel (root) slide-in +
//                      title pill + panel→trunk stub. One scaffolding reveal.
//   branch0..branchN-1 one branch revealed as a single object: its connectors,
//                      caption pill, and all 1-3 leaves (sphere + icon + text).
//                      N is branches.length (2-5). A branch{i} with i >= N is
//                      ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|branch[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.6), // entrance duration (connectors + pill + leaf cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed branch is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content branch (branch{i});
// setup is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^branch[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const treeDiagram4x2TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const treeDiagram4x2Schema = z.object({
  // Title shown in the dark pill at the bottom of the hero panel. At most THREE
  // words so it stays inside the pill (it wraps if needed).
  title:     z.string().min(1).max(30).refine(
    (s) => s.trim().split(/\s+/).filter(Boolean).length <= 3,
    { message: 'title must be at most 3 words' },
  ),
  // Icon id resolving to icons/<id>.svg, drawn large inside the panel and
  // forced to solid white (any library SVG works; it is masked, not tinted).
  heroIcon:  z.string().min(1),
  // 2 to 5 branches, each with a caption and 1-3 leaves.
  branches:  z.array(treeDiagram4x2BranchSchema).min(2).max(5),
  timings:   treeDiagram4x2TimingsSchema.optional(),
});

export type TreeDiagram4x2Props = z.infer<typeof treeDiagram4x2Schema>;

export const treeDiagram4x2Meta = {
  description:
    'Tree diagram with a hero panel on the left (large white icon + dark title ' +
    'pill) that connects to 2-5 caption pills, each splitting into 1-3 ' +
    'icon-labelled leaves. Use to introduce a topic and map its decisions, ' +
    'taxonomy, or pros/cons.',
  authoringNotes:
    'title is the dark-pill copy at the bottom of the hero panel, at most 3 ' +
    'words, Satoshi Bold white (it wraps to stay inside the pill). heroIcon is ' +
    'the big illustration inside the panel: supply ANY icon id from the library ' +
    '(icons/<id>.svg), it is rendered as a solid-white silhouette via a CSS ' +
    'mask, so colour/theme of the source SVG does not matter (use a ' +
    'transparent-background SVG). Supply 2 to 5 branches, each with a caption ' +
    '(≤22 chars, ideally ≤20 for headroom) plus 1 to 3 leaves. Leaf text may be ' +
    'longer and wraps to 2 lines; leaf icons should encode a fast read ' +
    '(check/x, arrow-up/down). Bundled leaf icons: check, x, arrow-up, ' +
    'arrow-down, plus, minus, info, alert-triangle, git-branch, diagram. ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (oxford-blue stage scales in, the hero panel/root slides in ' +
    'with its title pill, and the panel→trunk stub draws), then one `branch{i}` ' +
    'per branch in TOP-DOWN order (branch0 is the topmost row). Each branch{i} ' +
    'reveals its connector lines, caption pill, and all its leaves (sphere + ' +
    'icon + text) as one object. The number of branches is the built-in count ' +
    'variation (2-5); rows, trunk extent and leaf size auto-layout. Re-mention ' +
    'pulses: list { target: branch{i}, at } to give a revealed branch a brief, ' +
    'subtle brand pulse when it is named again later. NARRATION MUST be linear ' +
    'root-outward, top-down: introduce the topic (root) during setup, then ' +
    'deliver each branch fully (caption then its leaves) before the next, never ' +
    'interleaving leaves across branches. See GUIDANCE.md for full selection ' +
    'and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (px on a 1920×1080 canvas) ─────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Left hero panel
const PANEL_LEFT   = 60;
const PANEL_TOP    = 70;
const PANEL_W      = 620;
const PANEL_H      = 940;
const PANEL_RIGHT  = PANEL_LEFT + PANEL_W;       // 680
const PANEL_CY     = PANEL_TOP + PANEL_H / 2;    // 540
const PANEL_RADIUS = 36;

// Hero icon inside panel
const HERO_ICON_SIZE = 440;
const HERO_ICON_CX   = PANEL_LEFT + PANEL_W / 2; // 370
const HERO_ICON_CY   = PANEL_TOP + 380;          // 450

// Title pill at the bottom of the panel
const TITLE_PILL_W   = 480;
const TITLE_PILL_H   = 130;
const TITLE_PILL_CX  = PANEL_LEFT + PANEL_W / 2;        // 370
const TITLE_PILL_CY  = PANEL_TOP + PANEL_H - 110;       // 900
const TITLE_PILL_RADIUS = 18;

// Vertical trunk + branch columns (x positions are fixed; y is computed).
const TRUNK_X    = 770;

// Vertical band the branches are distributed within.
const BAND_TOP = 120;
const BAND_BOT = 960;
const BAND_H   = BAND_BOT - BAND_TOP;

// Caption pill
const PILL_CX    = 1010;
const PILL_W     = 360;
const PILL_H     = 78;
const PILL_LEFT  = PILL_CX - PILL_W / 2;          // 830
const PILL_RIGHT = PILL_CX + PILL_W / 2;          // 1190

// Leaf column
const LEAF_CIRCLE_CX = 1330;
const JUNCTION_X     = 1235;
const LEAF_R_MAX     = 38;
const LEAF_GAP       = 12;   // vertical gap between leaves in a branch
const ROW_MARGIN     = 40;   // min gap between adjacent branch clusters

// Line lengths that don't depend on layout
const LEN_PANEL_TO_TRUNK = TRUNK_X - PANEL_RIGHT;                    // 90
const LEN_TRUNK_TO_PILL  = PILL_LEFT - TRUNK_X;                       // 60
const LEN_PILL_TO_JUNC   = JUNCTION_X - PILL_RIGHT;                   // 45

// Panel slides in from off-canvas left
const PANEL_SLIDE_FROM = -(PANEL_LEFT + PANEL_W + 20);

// ─── Dynamic layout ───────────────────────────────────────────────────────────
// Given the branch count + the densest branch, pick a leaf radius so the
// tallest cluster fits its row slot, then derive row centres + leaf offsets.

function computeLayout(branchCount: number, maxLeaves: number) {
  const rowSlot = BAND_H / branchCount;
  // Solve leaf radius R from: maxLeaves*(2R) + (maxLeaves-1)*GAP + MARGIN <= rowSlot
  const rawR = (rowSlot - (maxLeaves - 1) * LEAF_GAP - ROW_MARGIN) / (2 * maxLeaves);
  const leafR = Math.max(16, Math.min(LEAF_R_MAX, Math.floor(rawR)));
  const leafPitch = 2 * leafR + LEAF_GAP;
  const rowY = (i: number) => BAND_TOP + rowSlot * (i + 0.5);
  // Leaf font scales gently with radius (26 at full size, smaller when dense).
  const leafFont = Math.round(Math.max(17, Math.min(26, leafR * 0.5 + 7)));
  // Vertical offset of leaf j (0-based) within a branch of K leaves, centred.
  const leafOffset = (j: number, k: number) => (j - (k - 1) / 2) * leafPitch;
  return { rowSlot, leafR, leafPitch, rowY, leafFont, leafOffset };
}

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

const easeOutCubic         = Easing.out(Easing.cubic);
const easeInOutCubic       = Easing.inOut(Easing.cubic);
const easeOutBackSubtle    = Easing.out(Easing.back(1.0));
const easeOutBackOvershoot = Easing.out(Easing.back(1.1));

// Internal sub-stagger proportions of a step's `in` window. These let each
// compound object (the setup scaffolding, or one branch's connectors + pill +
// leaf cascade) survive the collapse to a single {at, in} per object.
//
//   setup: the oxford-blue stage scales in over the FULL window; the hero panel
//          slide starts ~12% in and finishes ~70% through; the title pill pops
//          near the end; the panel→trunk stub draws over the back ~25%.
const SETUP_PANEL_START_FRAC = 0.12;
const SETUP_PANEL_END_FRAC   = 0.70;
const SETUP_TITLE_START_FRAC = 0.62;
const SETUP_TITLE_END_FRAC   = 0.92;
const SETUP_STUB_START_FRAC  = 0.74;
const SETUP_STUB_END_FRAC    = 1.0;

//   branch: a single object's `in` window holds (fractions of the window):
//     [0.00..0.30]  trunk segment (down to this row) + trunk→pill connector draw
//     [0.18..0.62]  caption pill slides + fades in
//     [0.34..0.55]  pill→junction connector draws
//     [0.46..0.70]  vertical junction spans the leaves (if >1 leaf)
//     [0.55..]      per-leaf stub + sphere + icon + text cascade (staggered)
const BR_TRUNK_START_FRAC = 0.0;  const BR_TRUNK_DUR_FRAC = 0.30;
const BR_PILL_START_FRAC  = 0.18; const BR_PILL_DUR_FRAC  = 0.44;
const BR_PJ_START_FRAC    = 0.34; const BR_PJ_DUR_FRAC    = 0.21;
const BR_VJ_START_FRAC    = 0.46; const BR_VJ_DUR_FRAC    = 0.24;
const BR_LEAFLINE_START_FRAC = 0.55; const BR_LEAFLINE_DUR_FRAC = 0.18;
const BR_CIRCLE_START_FRAC   = 0.62; const BR_CIRCLE_DUR_FRAC   = 0.26;
const BR_TEXT_START_FRAC     = 0.70; const BR_TEXT_DUR_FRAC     = 0.22;
const BR_LEAF_STAGGER_FRAC   = 0.07; // per-leaf stagger as a fraction of `in`

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

// ─── Visual style fragments ──────────────────────────────────────────────────

const DODGER_BG =
  'linear-gradient(180deg, #5BB6FF 0%, #1A9CFE 38%, #0686EE 72%, #0075D8 100%)';
const DODGER_SHADOW =
  'inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,72,140,0.30)';
const PANEL_SHADOW =
  'inset 0 5px 10px rgba(255,255,255,0.30), inset 0 -6px 12px rgba(0,72,140,0.30)';

const SPHERE_BG =
  'radial-gradient(circle at 32% 28%, #7CC7FF 0%, #2EA3FE 32%, #0A8AEF 62%, #005EAA 100%)';
const SPHERE_SHADOW =
  'inset 0 -5px 10px rgba(0,42,92,0.35), inset 4px 4px 8px rgba(255,255,255,0.18)';

const TITLE_PILL_BG =
  'linear-gradient(180deg, #061b2b 0%, #000000 90%)';
const TITLE_PILL_SHADOW =
  'inset 0 1px 2px rgba(255,255,255,0.08), inset 0 -1px 3px rgba(0,0,0,0.60)';

const LINE_COLOR  = 'rgba(255,255,255,0.75)';
const LINE_WIDTH  = 2.5;
const TEXT_WHITE  = '#FFFFFF';

const OXFORD_BG =
  'radial-gradient(ellipse at 50% 50%, #0a3050 0%, #052438 38%, #02101c 72%, #000000 100%)';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,   { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [b, m] = await Promise.all([bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function win(frame: number, startF: number, durF: number): number {
  if (durF <= 0) return frame >= startF ? 1 : 0;
  return Math.max(0, Math.min(1, (frame - startF) / durF));
}

function AnimLine({
  x1, y1, x2, y2, length, progress,
}: {
  x1: number; y1: number; x2: number; y2: number;
  length: number; progress: number;
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={LINE_COLOR}
      strokeWidth={LINE_WIDTH}
      strokeLinecap="round"
      strokeDasharray={length}
      strokeDashoffset={length * (1 - progress)}
    />
  );
}

// Probe which icon ids actually resolve to a file, so a missing/typo'd id can
// fall back to a placeholder glyph instead of rendering blank. delayRender holds
// the frame until the probes finish.
function useIconExistence(ids: string[]): Record<string, boolean> {
  const key = Array.from(new Set(ids)).sort().join('|');
  const [exists, setExists] = useState<Record<string, boolean>>({});
  const [handle] = useState(() => delayRender('Probing TreeDiagram4x2 icons'));
  useEffect(() => {
    let cancelled = false;
    const unique = Array.from(new Set(ids));
    Promise.all(
      unique.map(
        (id) =>
          new Promise<[string, boolean]>((resolve) => {
            const img = new Image();
            img.onload = () => resolve([id, true]);
            img.onerror = () => resolve([id, false]);
            img.src = staticFile(`icons/${id}.svg`);
          }),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const [id, ok] of results) map[id] = ok;
        setExists(map);
      })
      .finally(() => continueRender(handle));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, key]);
  return exists;
}

// Neutral "unknown icon" placeholder (help-circle), white stroke, shown when
// an icon id doesn't resolve.
function PlaceholderIcon({ size, opacity }: { size: number; opacity: number }) {
  // strokeWidth is in viewBox units (0-24), SVG scales it with `size`, so it
  // must be a constant, not pixel-scaled.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={TEXT_WHITE}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity, display: 'block' }}
    >
      <circle cx="12" cy="12" r="9.2" />
      <path d="M9.2 9.2a3 3 0 0 1 5.7 1c0 2-2.9 2.6-2.9 4" />
      <line x1="12" y1="17.4" x2="12.02" y2="17.4" />
    </svg>
  );
}

// Solid-white icon via CSS mask, works for ANY source SVG (colour/theme
// irrelevant) and never crashes the render on a missing file. A missing id
// (missing=true) renders the placeholder glyph instead.
function WhiteIcon({
  id, size, opacity, missing,
}: { id: string; size: number; opacity: number; missing?: boolean }) {
  if (missing) return <PlaceholderIcon size={size} opacity={opacity} />;
  const url = `url(${staticFile(`icons/${id}.svg`)})`;
  return (
    <div
      style={{
        width: size,
        height: size,
        opacity,
        backgroundColor: TEXT_WHITE,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Hero panel (the root) + title pill. Driven by the setup step's window via
// pre-computed local frame offsets.
function HeroPanel({
  frame, title, heroIcon, heroMissing,
  slideStartF, slideEndF, titleStartF, titleEndF,
}: {
  frame: number; title: string; heroIcon: string; heroMissing: boolean;
  slideStartF: number; slideEndF: number; titleStartF: number; titleEndF: number;
}) {
  const slideP = interpolate(frame, [slideStartF, slideEndF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic,
  });
  const tx = PANEL_SLIDE_FROM + (0 - PANEL_SLIDE_FROM) * slideP;

  const iconOp = interpolate(frame, [slideStartF + (slideEndF - slideStartF) * 0.55, slideEndF + 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const titleScale = interpolate(frame, [titleStartF, titleEndF], [0.92, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const titleOp = interpolate(frame, [titleStartF, titleStartF + (titleEndF - titleStartF) * 0.8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0, top: 0, width: CANVAS_W, height: CANVAS_H,
        transform: `translateX(${tx}px)`,
        pointerEvents: 'none',
      }}
    >
      {/* Panel rectangle */}
      <div
        style={{
          position: 'absolute',
          left: PANEL_LEFT, top: PANEL_TOP, width: PANEL_W, height: PANEL_H,
          borderRadius: PANEL_RADIUS,
          background: DODGER_BG,
          boxShadow: PANEL_SHADOW,
        }}
      />

      {/* Hero icon, solid white silhouette of any library SVG */}
      <div
        style={{
          position: 'absolute',
          left: HERO_ICON_CX - HERO_ICON_SIZE / 2,
          top:  HERO_ICON_CY - HERO_ICON_SIZE / 2,
        }}
      >
        <WhiteIcon id={heroIcon} size={HERO_ICON_SIZE} opacity={iconOp} missing={heroMissing} />
      </div>

      {/* Title pill (dark), title wraps to stay inside the pill */}
      <div
        style={{
          position: 'absolute',
          left: TITLE_PILL_CX - TITLE_PILL_W / 2,
          top:  TITLE_PILL_CY - TITLE_PILL_H / 2,
          width:  TITLE_PILL_W,
          height: TITLE_PILL_H,
          transform: `scale(${titleScale})`,
          transformOrigin: 'center center',
          opacity: titleOp,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: TITLE_PILL_RADIUS,
            background: TITLE_PILL_BG,
            boxShadow: TITLE_PILL_SHADOW,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: '-0.015em',
            lineHeight: 1.05,
            padding: '0 26px',
            textAlign: 'center',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

function CaptionPill({
  rowY, caption, frame, startF, durF,
}: {
  rowY: number; caption: string; frame: number; startF: number; durF: number;
}) {
  const op = interpolate(frame, [startF, startF + durF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const dx = interpolate(frame, [startF, startF + durF], [-18, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: PILL_LEFT,
        top:  rowY - PILL_H / 2,
        width: PILL_W,
        height: PILL_H,
        transform: `translateX(${dx}px)`,
        opacity: op,
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 999,
          background: DODGER_BG,
          boxShadow: DODGER_SHADOW,
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 33,
          letterSpacing: '-0.01em',
          textShadow: '0 1px 2px rgba(0,50,100,0.25)',
          padding: '0 24px',
          whiteSpace: 'nowrap',
        }}
      >
        {caption}
      </div>
    </div>
  );
}

function Leaf({
  cx, cy, r, font, textX, icon, iconMissing, text,
  frame, circleStartF, circleDurF, textStartF, textDurF,
}: {
  cx: number; cy: number; r: number; font: number; textX: number;
  icon: string; iconMissing: boolean; text: string;
  frame: number;
  circleStartF: number; circleDurF: number;
  textStartF: number;  textDurF: number;
}) {
  const scale = interpolate(frame, [circleStartF, circleStartF + circleDurF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const iconOp = interpolate(frame, [circleStartF + circleDurF * 0.4, circleStartF + circleDurF + 2], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const textOp = interpolate(frame, [textStartF, textStartF + textDurF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const textDx = interpolate(frame, [textStartF, textStartF + textDurF], [-10, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: cx - r, top: cy - r,
          width: r * 2, height: r * 2,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          opacity: scale > 0 ? 1 : 0,
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: SPHERE_BG,
            boxShadow: SPHERE_SHADOW,
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: r * 0.36,
          }}
        >
          <WhiteIcon id={icon} size={r * 1.28} opacity={iconOp} missing={iconMissing} />
        </div>
      </div>

      {/* Point text, may be longer; wraps to up to 2 lines. */}
      <div
        style={{
          position: 'absolute',
          left: textX,
          top:  cy,
          width: CANVAS_W - textX - 40,
          transform: `translate(${textDx}px, -50%)`,
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: font,
          lineHeight: 1.22,
          letterSpacing: '-0.005em',
          opacity: textOp,
          whiteSpace: 'normal',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
        }}
      >
        {text}
      </div>
    </>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const TreeDiagram4x2: React.FC<TreeDiagram4x2Props> = ({
  title, heroIcon, branches, timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading TreeDiagram4x2 fonts'));
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
  const durOf = (s: RevealStep) => (s.in ?? 1.6);

  // Re-mention pulse frames per branch{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `branch${i}`)
      .map((p) => f(p.at));

  // ── Dynamic geometry ──────────────────────────────────────────────────────
  // Resolve which icon ids exist so missing/typo'd ones fall back to a
  // placeholder glyph (only flagged missing once a probe confirms it).
  const allIconIds = [heroIcon, ...branches.flatMap((b) => b.leaves.map((l) => l.icon))];
  const iconExists = useIconExistence(allIconIds);
  const isMissing = (id: string) => iconExists[id] === false;

  const N = branches.length;
  const maxLeaves = Math.max(...branches.map((b) => b.leaves.length));
  const { leafR, rowY, leafFont, leafOffset } = computeLayout(N, maxLeaves);
  const leafTextX = LEAF_CIRCLE_CX + leafR + 24;
  const rowYs = branches.map((_, i) => rowY(i));
  const LEN_JUNC_TO_LEAF = (LEAF_CIRCLE_CX - leafR) - JUNCTION_X;

  // ── setup, oxford-blue stage + hero panel (root) + panel→trunk stub ───────
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupDurF   = cSetup ? f(durOf(cSetup)) : 0;
  const setupEndF   = setupStartF + setupDurF;
  const sub = (frac: number) => setupStartF + setupDurF * frac;

  const bgScale = cSetup
    ? interpolate(frame, [setupStartF, setupEndF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic,
      })
    : 0;

  // Panel→trunk stub draws over the back of the setup window.
  const stubP = cSetup
    ? win(frame, sub(SETUP_STUB_START_FRAC), setupDurF * (SETUP_STUB_END_FRAC - SETUP_STUB_START_FRAC))
    : 0;

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, oxford-blue gradient stage scales in (only when scheduled) */}
      {cSetup && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: OXFORD_BG,
            transform: `scale(${bgScale})`,
            transformOrigin: 'center center',
          }}
        />
      )}

      {/* Connector lines (svg layer): the panel→trunk stub draws during setup;
          each branch's trunk segment + connectors draw during that branch's
          reveal window. */}
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* Panel → trunk horizontal stub (setup scaffolding) */}
        {cSetup && (
          <AnimLine
            x1={PANEL_RIGHT} y1={PANEL_CY}
            x2={TRUNK_X}     y2={PANEL_CY}
            length={LEN_PANEL_TO_TRUNK}
            progress={easeInOutCubic(stubP)}
          />
        )}

        {/* Per-branch connectors, each gated on its branch{i} reveal */}
        {branches.map((branch, n) => {
          const c = cue(`branch${n}`);
          if (!c) return null;
          const ry = rowYs[n]!;
          const startF = f(c.at);
          const durF   = f(durOf(c));
          const K = branch.leaves.length;

          // Trunk segment: from the panel-stub's y (PANEL_CY) down/up to this
          // branch's row, so the vertical spine extends to reach the branch as
          // it appears. Drawn from PANEL_CY toward ry over the trunk window.
          const trunkTop = Math.min(PANEL_CY, ry);
          const trunkBot = Math.max(PANEL_CY, ry);
          const trunkLen = trunkBot - trunkTop;
          const pTrunk = win(frame, startF + durF * BR_TRUNK_START_FRAC, durF * BR_TRUNK_DUR_FRAC);
          const pPillJunc = win(frame, startF + durF * BR_PJ_START_FRAC, durF * BR_PJ_DUR_FRAC);
          const pJuncVert = win(frame, startF + durF * BR_VJ_START_FRAC, durF * BR_VJ_DUR_FRAC);
          const pTrunkPill = win(frame, startF + durF * BR_TRUNK_START_FRAC, durF * BR_TRUNK_DUR_FRAC);
          const topOff = leafOffset(0, K);
          const botOff = leafOffset(K - 1, K);

          return (
            <g key={`lines-${n}`}>
              {/* Vertical trunk segment reaching this branch's row */}
              {trunkLen > 0 && (
                <line
                  x1={TRUNK_X} y1={trunkBot}
                  x2={TRUNK_X} y2={trunkTop}
                  stroke={LINE_COLOR}
                  strokeWidth={LINE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={trunkLen}
                  strokeDashoffset={trunkLen * (1 - easeInOutCubic(pTrunk))}
                />
              )}
              {/* Trunk → caption pill */}
              <AnimLine
                x1={TRUNK_X}   y1={ry}
                x2={PILL_LEFT} y2={ry}
                length={LEN_TRUNK_TO_PILL}
                progress={easeInOutCubic(pTrunkPill)}
              />
              {/* Caption pill → junction */}
              <AnimLine
                x1={PILL_RIGHT} y1={ry}
                x2={JUNCTION_X} y2={ry}
                length={LEN_PILL_TO_JUNC}
                progress={easeInOutCubic(pPillJunc)}
              />
              {/* Vertical junction spanning the leaves (only if >1 leaf) */}
              {K > 1 && (
                <AnimLine
                  x1={JUNCTION_X} y1={ry + topOff}
                  x2={JUNCTION_X} y2={ry + botOff}
                  length={botOff - topOff}
                  progress={easeInOutCubic(pJuncVert)}
                />
              )}
              {/* Horizontal stub to each leaf */}
              {branch.leaves.map((_, j) => {
                const off = leafOffset(j, K);
                const stagger = durF * BR_LEAF_STAGGER_FRAC * j;
                const pJunc = win(frame, startF + durF * BR_LEAFLINE_START_FRAC + stagger, durF * BR_LEAFLINE_DUR_FRAC);
                return (
                  <AnimLine
                    key={`leafline-${n}-${j}`}
                    x1={JUNCTION_X}              y1={ry + off}
                    x2={LEAF_CIRCLE_CX - leafR}  y2={ry + off}
                    length={LEN_JUNC_TO_LEAF}
                    progress={easeInOutCubic(pJunc)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Hero panel (root), gated on setup */}
      {cSetup && (
        <HeroPanel
          frame={frame}
          title={title}
          heroIcon={heroIcon}
          heroMissing={isMissing(heroIcon)}
          slideStartF={sub(SETUP_PANEL_START_FRAC)}
          slideEndF={sub(SETUP_PANEL_END_FRAC)}
          titleStartF={sub(SETUP_TITLE_START_FRAC)}
          titleEndF={sub(SETUP_TITLE_END_FRAC)}
        />
      )}

      {/* Branches, each gated on its branch{i} reveal step (top-down order) */}
      {branches.map((branch, n) => {
        const c = cue(`branch${n}`);
        if (!c) return null;
        const ry = rowYs[n]!;
        return (
          <Branch
            key={`branch-${n}`}
            branch={branch}
            missingFor={isMissing}
            rowY={ry}
            frame={frame}
            startF={f(c.at)}
            durF={f(durOf(c))}
            leafR={leafR}
            leafFont={leafFont}
            leafOffset={leafOffset}
            leafTextX={leafTextX}
            pulseFrames={pulseFramesFor(n)}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// One branch revealed as a single object: its caption pill + all leaves
// (sphere + icon + text cascade). Wrapped in an outer transform that carries
// the re-mention pulse (origin at the branch's own centre), so the bump
// composes with (never replaces) each child's reveal transform. Per-leaf
// `missing` resolution is threaded in via missingFor so the icon-existence
// check stays close to the render.
function Branch({
  branch, missingFor, rowY, frame, startF, durF,
  leafR, leafFont, leafOffset, leafTextX, pulseFrames,
}: {
  branch: { caption: string; leaves: { icon: string; text: string }[] };
  missingFor: (id: string) => boolean;
  rowY: number; frame: number; startF: number; durF: number;
  leafR: number; leafFont: number;
  leafOffset: (j: number, k: number) => number;
  leafTextX: number;
  pulseFrames: number[];
}) {
  const K = branch.leaves.length;
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const branchCX = (TRUNK_X + LEAF_CIRCLE_CX) / 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${branchCX}px ${rowY}px`,
        pointerEvents: 'none',
      }}
    >
      <CaptionPill
        rowY={rowY}
        caption={branch.caption}
        frame={frame}
        startF={startF + durF * BR_PILL_START_FRAC}
        durF={durF * BR_PILL_DUR_FRAC}
      />
      {branch.leaves.map((leaf, j) => {
        const stagger = durF * BR_LEAF_STAGGER_FRAC * j;
        return (
          <Leaf
            key={`leaf-${j}`}
            cx={LEAF_CIRCLE_CX}
            cy={rowY + leafOffset(j, K)}
            r={leafR}
            font={leafFont}
            textX={leafTextX}
            icon={leaf.icon}
            iconMissing={missingFor(leaf.icon)}
            text={leaf.text}
            frame={frame}
            circleStartF={startF + durF * BR_CIRCLE_START_FRAC + stagger}
            circleDurF={durF * BR_CIRCLE_DUR_FRAC}
            textStartF={startF + durF * BR_TEXT_START_FRAC + stagger}
            textDurF={durF * BR_TEXT_DUR_FRAC}
          />
        );
      })}
    </div>
  );
}

// ─── Demo / test props ───────────────────────────────────────────────────────

export const treeDiagram4x2DefaultProps: TreeDiagram4x2Props = {
  title:    'AI Engineering',
  heroIcon: 'diagram',
  branches: [
    { caption: 'Prompts', leaves: [
      { icon: 'check', text: 'Show, don’t just describe' },
      { icon: 'x',     text: 'Avoid vague instructions' },
    ] },
    { caption: 'Context', leaves: [
      { icon: 'plus',  text: 'Pin relevant docs first' },
      { icon: 'minus', text: 'Cut stale, off-topic data' },
    ] },
    { caption: 'Evals', leaves: [
      { icon: 'arrow-up',   text: 'Test on real edge cases' },
      { icon: 'arrow-down', text: 'Don’t trust vibes alone' },
    ] },
    { caption: 'Safety', leaves: [
      { icon: 'info',           text: 'Add limits before launch' },
      { icon: 'alert-triangle', text: 'Watch for prompt injection' },
    ] },
  ],
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 2.0 },
      { target: 'branch0', at: 2.4 },
      { target: 'branch1', at: 4.2 },
      { target: 'branch2', at: 6.0 },
      { target: 'branch3', at: 7.8 },
    ],
  },
};
