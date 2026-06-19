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

// Pyramid5Tiers, left-side pyramid + right-side banner stack, rebuilt on the
// STANDARD reveal-sequence timing model.
//   • Platinum-blue (#E6ECF2) canvas.
//   • Pyramid on the LEFT, 2 to 5 stacked dodger-blue trapezoid slabs,
//     centred on a vertical axis at x≈480. The triangular envelope is fixed;
//     however many tiers you supply divide it evenly, so widths always grow
//     toward the base and the outline reads as a smooth triangle.
//   • Each slab carries a white master Icons/ (-dark) stroke icon.
//   • For every tier, an oxford-blue ROUNDED BANNER sits to the right of the
//     pyramid carrying a Title (dodger-blue Satoshi Black) + Body (white
//     Satoshi Medium). Banners are widest at the top and narrowest at the
//     bottom (since they butt up against the pyramid's diagonal).
//   • setup   , the triangular envelope outline scales in from the centre
//                (easeInOutCubic), staging the pyramid frame before any tier
//                content. This is the scaffolding reveal (animated, not no-op).
//   • tier{i} , each tier reveals as ONE object, TOP to BOTTOM: its slab
//                fades + settles, its icon pops, and its banner slides in with
//                a title + body sub-stagger, all inside the object's own `in`
//                window.
//
// Reveal order is LINEAR top → bottom (apex first, then downward to the base).
// Side icons are master Icons/ (-dark) (pre-coloured white, read on the dodger slab;
// Pattern A, no runtime recolour). See GUIDANCE.md.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const pyramid5TiersTierSchema = z.object({
  title: z.string().min(1).max(22),
  body:  z.string().min(1).max(180),    // wraps to 2-4 lines depending on banner width
  // master Icons/ (-dark) id, resolves to icons/<id>.svg. Those SVGs are
  // pre-coloured white and read cleanly on the dodger-blue slab.
  icon:  z.string().min(1),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// platinum stage with nothing on it). Each step is one "object". All times are
// scene-relative SECONDS.
//
// Addressable targets:
//   setup            the triangular pyramid envelope outline scales in
//   tier0..tierN-1   one tier revealed as a single object, TOP → BOTTOM: its
//                    slab + icon + banner (title + body) reveal together. N is
//                    tiers.length (2-5). A tier{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|tier[0-9]+)$/),
  at: z.number().nonnegative(),          // when it starts appearing
  in: z.number().positive().default(1.0), // entrance duration (slab + icon + banner)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed tier is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content tier (tier{i}); setup is
// not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^tier[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const pyramid5TiersTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const pyramid5TiersSchema = z.object({
  // 2-5 tiers, TOP → BOTTOM order. Top tier sits at the pyramid's apex; the
  // triangular envelope is divided evenly by however many tiers you supply.
  tiers:   z.array(pyramid5TiersTierSchema).min(2).max(5),
  timings: pyramid5TiersTimingsSchema.optional(),
});

export type Pyramid5TiersProps = z.infer<typeof pyramid5TiersSchema>;

export const pyramid5TiersMeta = {
  description:
    'Five-tier pyramid: dodger-blue trapezoid slabs on the left, each with ' +
    'an icon, connected to an oxford-blue banner on the right carrying a ' +
    'Title and Body. Use for hierarchies, product stacks, layered concepts.',
  authoringNotes:
    'Supply 2 to 5 tiers in top-to-bottom order, the triangular envelope is ' +
    'fixed and divides evenly, so fewer tiers simply means taller, broader ' +
    'slabs. title ≤22 chars (dodger-blue Satoshi Black inside the banner). ' +
    'body ≤180 chars, wraps to multiple lines; allow longer copy on top ' +
    'tiers (wider banner) and shorter on the bottom (narrowest slab). icon is ' +
    'a master Icons/ (-dark) id (pre-coloured white, e.g. benefit-hand, graduation-cap, ' +
    'arrow-trend-up, user, search) and renders AS-IS on the dodger slab. Aim ' +
    'for a tier hierarchy that reads from broadest at top to most specific at ' +
    'bottom (or reverse, depending on framing). GOOD title: "Strategy", ' +
    '"Tools", "Code", "Data", "Infra". BAD title: "Strategic planning layer ' +
    'that governs everything" (too long). ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (the triangular envelope outline scales in) then one ' +
    '`tier{i}` per tier in TOP → BOTTOM order. Each tier{i} reveals its slab + ' +
    'icon + banner (title + body) as ONE object, timed to the narration cue ' +
    'that introduces that tier; the hierarchy is inherently LINEAR so reveal ' +
    'order = tier order (apex first). Optional `timings.pulses` give a brief ' +
    'brand pulse to a tier{i} when the narration re-mentions it later. With an ' +
    'empty sequence nothing renders; with empty pulses the scene is unchanged. ' +
    'See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BLACK_SRC   = staticFile('fonts/Satoshi-Black.woff2');
const SATOSHI_BOLD_SRC    = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC  = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Pyramid geometry, the triangular envelope is FIXED (apex at top, base
// half-width = 430 near the canvas bottom). However many tiers are supplied
// (2-5) divide that fixed height evenly, so the slope never changes.
const APEX_X            = 480;
const APEX_Y            = 50;
const BASE_HALF_WIDTH   = 430;
const PYRAMID_HEIGHT    = 975;                        // fixed envelope height
const BASE_Y            = APEX_Y + PYRAMID_HEIGHT;     // 1025
const PYRAMID_SLOPE     = BASE_HALF_WIDTH / PYRAMID_HEIGHT;  // ≈ 0.441

// Per-render tier height: the fixed envelope split across `count` tiers.
function tierHeight(count: number): number { return PYRAMID_HEIGHT / count; }

// Tier geometry helpers (i = 0..count-1, top → bottom)
function tierTopY(i: number, count: number):     number { return APEX_Y + i * tierHeight(count); }
function tierBottomY(i: number, count: number):  number { return APEX_Y + (i + 1) * tierHeight(count); }
function tierCenterY(i: number, count: number):  number { return APEX_Y + (i + 0.5) * tierHeight(count); }
function halfWidthAtY(y: number): number { return (y - APEX_Y) * PYRAMID_SLOPE; }

// Icon size scales gently with tier height so it stays balanced whether the
// pyramid has 5 thin tiers or 2 tall ones. Clamped to a sensible range.
function iconSizeFor(count: number): number {
  return Math.max(56, Math.min(120, Math.round(tierHeight(count) * 0.30)));
}

// Icon position inside each tier, slightly below the centre of the trapezoid
// so the wider lower section gives it horizontal room (the apex tier is almost
// a triangle).
function iconPosFor(i: number, count: number): { x: number; y: number } {
  return { x: APEX_X, y: tierTopY(i, count) + tierHeight(count) * 0.62 };
}

// Banner geometry, sits to the right of the pyramid, separated by a small gap
// at the tier's BOTTOM y (so it never overlaps the diagonal).
const BANNER_GAP        = 24;       // gap between pyramid right edge (at tier bottom) and banner left
const BANNER_RIGHT_PAD  = 40;       // gap from banner right edge to canvas right
const BANNER_RIGHT_X    = CANVAS_W - BANNER_RIGHT_PAD;  // 1880
const BANNER_INSET_Y    = 12;       // vertical inset within tier
const BANNER_RADIUS     = 18;
const BANNER_PAD_X      = 32;       // horizontal padding inside the banner
const TITLE_BLOCK_WIDTH = 200;      // reserved width for title on the left of body
const TITLE_BODY_GAP    = 28;

function bannerLeftXFor(i: number, count: number): number {
  return APEX_X + halfWidthAtY(tierBottomY(i, count)) + BANNER_GAP;
}
function bannerTopYFor(i: number, count: number):  number { return tierTopY(i, count) + BANNER_INSET_Y; }
function bannerBotYFor(i: number, count: number):  number { return tierBottomY(i, count) - BANNER_INSET_Y; }
function bannerWidthFor(i: number, count: number): number { return BANNER_RIGHT_X - bannerLeftXFor(i, count); }
function bannerHeightFor(count: number):           number { return tierHeight(count) - 2 * BANNER_INSET_Y; }

// SVG path for one trapezoid slab.
function slabPath(i: number, count: number): string {
  const ty = tierTopY(i, count);
  const by = tierBottomY(i, count);
  const th = halfWidthAtY(ty);
  const bh = halfWidthAtY(by);
  return [
    `M ${(APEX_X - th).toFixed(2)} ${ty.toFixed(2)}`,
    `L ${(APEX_X + th).toFixed(2)} ${ty.toFixed(2)}`,
    `L ${(APEX_X + bh).toFixed(2)} ${by.toFixed(2)}`,
    `L ${(APEX_X - bh).toFixed(2)} ${by.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// SVG path for the full triangular envelope (the setup scaffolding outline).
function envelopePath(): string {
  const bh = halfWidthAtY(BASE_Y);
  return [
    `M ${APEX_X.toFixed(2)} ${APEX_Y.toFixed(2)}`,
    `L ${(APEX_X + bh).toFixed(2)} ${BASE_Y.toFixed(2)}`,
    `L ${(APEX_X - bh).toFixed(2)} ${BASE_Y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// Internal sub-stagger proportions, expressed as fractions of a tier's `in`
// window so the original slab → icon → banner → title → body cascade survives
// the collapse to one {at, in} per object.
const SLAB_DUR_FRAC    = 0.70;   // slab fade + settle, over the front of the window
const ICON_OFF_FRAC    = 0.20;   // icon starts a fifth in
const ICON_DUR_FRAC    = 0.50;
const BANNER_OFF_FRAC  = 0.28;
const BANNER_DUR_FRAC   = 0.62;
const TITLE_OFF_FRAC   = 0.48;
const TITLE_DUR_FRAC   = 0.45;
const BODY_OFF_FRAC    = 0.58;
const BODY_DUR_FRAC    = 0.42;

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

// Five subtle shades of dodger blue, lightest at the apex, deepest at the base.
const SLAB_GRADIENTS = [
  ['#7CC7FF', '#1A9CFE'], // lightest (apex end)
  ['#5BB6FF', '#0F95FB'],
  ['#3FA8FB', '#0686EE'],
  ['#1A9CFE', '#0075D8'],
  ['#0686EE', '#0560A8'], // deepest (base end)
] as const;

// Sample the 5-stop ramp so tier 0 is always lightest and the base tier is
// always deepest, regardless of how many tiers (2-5) are supplied.
function slabGradient(i: number, count: number): readonly [string, string] {
  const idx = count === 1 ? 0 : Math.round((i * (SLAB_GRADIENTS.length - 1)) / (count - 1));
  return SLAB_GRADIENTS[idx]!;
}

// Banner, oxford-blue rounded rectangle on the right.
const BANNER_BG =
  'linear-gradient(180deg, #0a3050 0%, #052438 60%, #02101c 100%)';
const BANNER_BORDER = '1px solid rgba(255,255,255,0.06)';
const BANNER_SHADOW = '0 10px 28px rgba(5,36,56,0.22)';

const TEXT_WHITE       = '#FFFFFF';
const TEXT_WHITE_DIM   = 'rgba(255,255,255,0.82)';
const TEXT_ACCENT_BLUE = '#0794FD';

// Subtle inner divider lines between slabs.
const SLAB_DIVIDER = 'rgba(255,255,255,0.20)';

// Envelope outline (setup scaffolding), faint dodger-blue stroke.
const ENVELOPE_STROKE = 'rgba(7,148,253,0.45)';
const ENVELOPE_FILL   = 'rgba(7,148,253,0.05)';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const black  = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`, { weight: '900', display: 'block' });
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,  { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [k, b, m] = await Promise.all([black.load(), bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(k);
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Setup scaffolding (triangular envelope outline scales in) ───────────────

function Envelope({ frame, startF, endF }: { frame: number; startF: number; endF: number }) {
  const s = interpolate(frame, [startF, endF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic,
  });
  const op = interpolate(frame, [startF, (startF + endF) / 2], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  if (frame < startF) return null;
  return (
    <g
      style={{
        // Pivot at the envelope's own centroid so it grows in place.
        transformOrigin: `${APEX_X}px ${(APEX_Y + BASE_Y) / 2}px`,
        transform: `scale(${s})`,
        opacity: op,
      }}
    >
      <path
        d={envelopePath()}
        fill={ENVELOPE_FILL}
        stroke={ENVELOPE_STROKE}
        strokeWidth={2}
        strokeDasharray="10 8"
      />
    </g>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Slab({
  i, count, frame, startF, durF,
}: {
  i: number; count: number; frame: number; startF: number; durF: number;
}) {
  const local = frame - startF;
  const op = interpolate(local, [0, durF * 0.7], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  // Subtle settle: slab arrives slightly under-scaled from the centre.
  const scale = interpolate(local, [0, durF], [0.92, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
  });
  if (local < 0) return null;

  const [topColor, bottomColor] = slabGradient(i, count);
  const gradId      = `slab-grad-${i}`;
  const path        = slabPath(i, count);

  // Pivot the scale around the slab's own centre so each tier appears to
  // expand in place rather than slide from the apex.
  const cx = APEX_X;
  const cy = tierCenterY(i, count);

  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        transform: `scale(${scale})`,
        opacity: op,
      }}
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={cx} y1={tierTopY(i, count)}
          x2={cx} y2={tierBottomY(i, count)}
        >
          <stop offset="0%"   stopColor={topColor} />
          <stop offset="100%" stopColor={bottomColor} />
        </linearGradient>
      </defs>
      {/* Base dodger fill */}
      <path d={path} fill={`url(#${gradId})`} />
      {/* Bottom divider, thin lighter line at the bottom edge of each slab for
          the stacked-tier read. Skipped on the last tier (no slab below). */}
      {i < count - 1 && (
        <line
          x1={APEX_X - halfWidthAtY(tierBottomY(i, count))}
          y1={tierBottomY(i, count)}
          x2={APEX_X + halfWidthAtY(tierBottomY(i, count))}
          y2={tierBottomY(i, count)}
          stroke={SLAB_DIVIDER}
          strokeWidth={1.5}
        />
      )}
    </g>
  );
}

function SlabIcon({
  i, count, icon, frame, startF, durF,
}: { i: number; count: number; icon: string; frame: number; startF: number; durF: number }) {
  const local = frame - startF;
  const scale = interpolate(local, [0, durF], [0.5, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackOvershoot,
  });
  const op = interpolate(local, [0, durF * 0.55], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  if (local < 0) return null;

  const pos  = iconPosFor(i, count);
  const size = iconSizeFor(count);
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x - size / 2,
        top:  pos.y - size / 2,
        width:  size,
        height: size,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        opacity: op,
      }}
    >
      <Img
        src={staticFile(`icons/${icon}.svg`)}
        alt=""
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

function Banner({
  i, count, title, body, frame,
  bannerStartF, bannerDurF,
  titleStartF, titleDurF,
  bodyStartF, bodyDurF,
}: {
  i: number; count: number; title: string; body: string;
  frame: number;
  bannerStartF: number; bannerDurF: number;
  titleStartF: number;  titleDurF: number;
  bodyStartF: number;   bodyDurF: number;
}) {
  // Banner slides in from the right + fade.
  const bLocal = frame - bannerStartF;
  if (bLocal < 0) return null;
  const bannerOp = interpolate(bLocal, [0, bannerDurF * 0.6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const bannerDx = interpolate(bLocal, [0, bannerDurF], [60, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackSubtle,
  });

  // Title fade.
  const tLocal = frame - titleStartF;
  const titleOp = interpolate(tLocal, [0, titleDurF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const titleDx = interpolate(tLocal, [0, titleDurF], [-12, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Body fade.
  const bdLocal = frame - bodyStartF;
  const bodyOp = interpolate(bdLocal, [0, bodyDurF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const bodyDx = interpolate(bdLocal, [0, bodyDurF], [-8, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  const left   = bannerLeftXFor(i, count);
  const top    = bannerTopYFor(i, count);
  const width  = bannerWidthFor(i, count);
  const height = bannerHeightFor(count);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateX(${bannerDx}px)`,
        opacity: bannerOp,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left, top, width, height,
          borderRadius: BANNER_RADIUS,
          background: BANNER_BG,
          border:     BANNER_BORDER,
          boxShadow:  BANNER_SHADOW,
        }}
      />
      {/* Inner content: title + body, horizontally arranged, vertically centred */}
      <div
        style={{
          position: 'absolute',
          left, top, width, height,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${BANNER_PAD_X}px`,
          gap: TITLE_BODY_GAP,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: `0 0 ${TITLE_BLOCK_WIDTH}px`,
            transform: `translateX(${titleDx}px)`,
            opacity: titleOp,
            color: TEXT_ACCENT_BLUE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: '-0.015em',
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            flex: 1,
            transform: `translateX(${bodyDx}px)`,
            opacity: bodyOp,
            color: TEXT_WHITE_DIM,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            letterSpacing: '-0.003em',
            lineHeight: 1.40,
            maxHeight: height - 12,
            overflow: 'hidden',
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

// ─── Tier (one revealed object: slab + icon + banner) ────────────────────────
// Driven by a single reveal step {at, in}. Internally cascades slab → icon →
// banner → title → body within the object's own window, then an OUTER pulse
// transform (origin at the tier's own centre) composes the re-mention pulse on
// top of the cascade. frame < startF -> absent.

function Tier({
  i, count, tier, frame, startF, durF, pulseFrames,
}: {
  i: number; count: number;
  tier: { title: string; body: string; icon: string };
  frame: number; startF: number; durF: number;
  pulseFrames: number[];
}) {
  if (frame < startF) return null;

  // Sub-stagger offsets (in frames) inside the tier's own window.
  const slabDurF   = durF * SLAB_DUR_FRAC;
  const iconStartF = startF + durF * ICON_OFF_FRAC;
  const iconDurF   = durF * ICON_DUR_FRAC;
  const bnrStartF  = startF + durF * BANNER_OFF_FRAC;
  const bnrDurF    = durF * BANNER_DUR_FRAC;
  const ttlStartF  = startF + durF * TITLE_OFF_FRAC;
  const ttlDurF    = durF * TITLE_DUR_FRAC;
  const bdyStartF  = startF + durF * BODY_OFF_FRAC;
  const bdyDurF    = durF * BODY_DUR_FRAC;

  // Re-mention pulse, multiplied into the tier's OUTER transform around the
  // tier's own centre; 1 outside pulse windows so the entrance is untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // The tier's centre, used as both the SVG and the HTML pulse pivot. The slab
  // is centred on APEX_X; the banner sits to its right. Pivot on the slab
  // centre keeps the bump anchored to the pyramid axis.
  const cx = APEX_X;
  const cy = tierCenterY(i, count);

  return (
    <>
      {/* Slab (SVG layer), wrapped in a pulse-scaled <g>. */}
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${pulse})` }}>
          <Slab i={i} count={count} frame={frame} startF={startF} durF={slabDurF} />
        </g>
      </svg>

      {/* Icon + banner (HTML layer), wrapped in a pulse-scaled div around the
          same tier centre so the bump composes with each child's reveal. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${pulse})`,
          transformOrigin: `${cx}px ${cy}px`,
          pointerEvents: 'none',
        }}
      >
        <SlabIcon
          i={i}
          count={count}
          icon={tier.icon}
          frame={frame}
          startF={iconStartF}
          durF={iconDurF}
        />
        <Banner
          i={i}
          count={count}
          title={tier.title}
          body={tier.body}
          frame={frame}
          bannerStartF={bnrStartF}
          bannerDurF={bnrDurF}
          titleStartF={ttlStartF}
          titleDurF={ttlDurF}
          bodyStartF={bdyStartF}
          bodyDurF={bdyDurF}
        />
      </div>
    </>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const Pyramid5Tiers: React.FC<Pyramid5TiersProps> = ({ tiers, timings }) => {
  const frame = useCurrentFrame();
  const count = tiers.length;

  const [handle] = useState(() => delayRender('Loading Pyramid5Tiers fonts'));
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

  // Re-mention pulse frames per tier{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `tier${i}`)
      .map((p) => f(p.at));

  // setup, the triangular envelope outline scales in across its window.
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupEndF   = cSetup ? f(cSetup.at + durOf(cSetup)) : 0;

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {/* setup, triangular envelope scaffolding (only when scheduled). */}
      {cSetup && (
        <svg
          width={CANVAS_W}
          height={CANVAS_H}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <Envelope frame={frame} startF={setupStartF} endF={setupEndF} />
        </svg>
      )}

      {/* Tiers, each gated on its tier{i} reveal step (TOP → BOTTOM). */}
      {tiers.map((tier, i) => {
        const c = cue(`tier${i}`);
        return c ? (
          <Tier
            key={`tier-${i}`}
            i={i}
            count={count}
            tier={tier}
            frame={frame}
            startF={f(c.at)}
            durF={f(durOf(c))}
            pulseFrames={pulseFramesFor(i)}
          />
        ) : null;
      })}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const pyramid5TiersDefaultProps: Pyramid5TiersProps = {
  tiers: [
    {
      title: 'Outcomes',
      body:  'What the user actually receives. Value, results, the feeling of progress. Everything below is in service of this.',
      icon:  'high-five-celebration-yes',
    },
    {
      title: 'UX',
      body:  'Interface and interaction patterns. Where humans meet the machine and decide whether they trust it.',
      icon:  'ai-assistant',
    },
    {
      title: 'Reasoning',
      body:  'Models, prompts, and chains of thought. The cognitive layer that turns inputs into useful outputs.',
      icon:  'auto-update',
    },
    {
      title: 'Tools',
      body:  'APIs, functions, retrieval. The machinery the model reaches for.',
      icon:  'layer-plus',
    },
    {
      title: 'Data',
      body:  'Documents, training sets, embeddings. The foundation everything is built on.',
      icon:  'add-document',
    },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 1.0 },
      { target: 'tier0', at: 1.3 },
      { target: 'tier1', at: 3.0 },
      { target: 'tier2', at: 4.7 },
      { target: 'tier3', at: 6.4 },
      { target: 'tier4', at: 8.1 },
    ],
  },
};
