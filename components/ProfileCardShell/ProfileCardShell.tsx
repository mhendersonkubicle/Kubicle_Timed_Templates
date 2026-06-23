// ProfileCardShell , white rounded-rectangle card container with multi-layer drop shadow; outer scaffold for portrait + text + stat card layouts.
//
// CODE-FIRST: pure CSS, recolourable via optional borderColor prop, resizable via
// width/height/borderRadius props. Three preset size variants match the source
// template geometry exactly (single, duo, team). The card pops in with an
// easeOutBack(1.25) squash-and-stretch entrance: during the overshoot the card
// briefly stretches horizontally and compresses vertically, then settles to 1:1.
//
// Place children inside; they render in the card's coordinate space (overflow:hidden).
// Wrap this in <Place x y> from the kit to position it on the 1920x1080 canvas.

import React from 'react';
import { pulse, easeOutCubic, COLORS, type Reveal } from '../_lib/kit';
import { Easing, interpolate } from 'remotion';

// Card size presets lifted from CharacterProfileCard geometry.
export type CardVariant = 'single' | 'duo' | 'team';

const VARIANTS: Record<CardVariant, { width: number; height: number; borderRadius: number }> = {
  single: { width: 640,  height: 1000, borderRadius: 40 },
  duo:    { width: 580,  height: 920,  borderRadius: 36 },
  team:   { width: 1800, height: 920,  borderRadius: 36 },
};

// Multi-layer drop shadow matching CharacterProfileCard's CARD_SHADOW exactly.
const CARD_SHADOW =
  '0 30px 60px rgba(15, 25, 45, 0.10), ' +
  '0 10px 25px rgba(15, 25, 45, 0.06)';

// easeOutBack with the same overshoot tension used in CharacterProfileCard (1.25
// as specified; the source uses 1.80 for the card internally but the brief calls
// for 1.25 here, giving a subtler squash for a reusable shell).
const easeOutBackShell = Easing.out(Easing.back(1.25));

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export type ProfileCardShellProps = {
  frame: number;
  reveal: Reveal;
  // Size: choose a named preset OR supply explicit dimensions. Named preset wins
  // when both are provided.
  variant?: CardVariant;          // default 'single'
  width?: number;                 // ignored when variant is set
  height?: number;                // ignored when variant is set
  borderRadius?: number;          // ignored when variant is set
  // Optional accent for a top colour strip or ring (not rendered by the shell
  // itself but exposed so composing layouts can read it). Defaults to COLORS.blue.
  accentColor?: string;
  // Background of the card face. Default white.
  background?: string;
  children?: React.ReactNode;
};

export const ProfileCardShell: React.FC<ProfileCardShellProps> = ({
  frame,
  reveal,
  variant = 'single',
  width,
  height,
  borderRadius,
  accentColor: _accentColor = COLORS.blue,
  background = '#FFFFFF',
  children,
}) => {
  // Resolve geometry: named variant wins over explicit dims.
  const geo = VARIANTS[variant] ?? VARIANTS.single;
  const w  = variant ? geo.width        : (width        ?? geo.width);
  const h  = variant ? geo.height       : (height       ?? geo.height);
  const br = variant ? geo.borderRadius : (borderRadius ?? geo.borderRadius);

  // Entrance progress (0..1) via easeOutBack(1.25).
  const localProg = clamp01(
    interpolate(frame, [reveal.startFrame, reveal.startFrame + reveal.inFrames], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const cardBase = easeOutBackShell(localProg);
  const opProg   = easeOutCubic(localProg);

  // Squash-and-stretch: active only during the overshoot phase (cardBase > 1).
  // Overshoot is mapped to a 0-1 value capped at the known back(1.25) peak
  // (~1.088). The card stretches horizontally (+6%) and squashes vertically (-6%)
  // at peak, then both settle to 1:1.
  const OVERSHOOT_PEAK = 0.088;   // empirical for back(1.25)
  const STRETCH_MAX    = 0.06;
  const overshootFrac  = clamp01(Math.max(0, cardBase - 1) / OVERSHOOT_PEAK);
  const stretch        = overshootFrac * STRETCH_MAX;
  const scaleX         = cardBase * (1 + stretch);
  const scaleY         = cardBase * (1 - stretch);

  // Re-mention pulse (scale multiplier, 1 at rest).
  const p = pulse(frame, reveal);

  // Early-exit before any pixels are visible keeps the DOM clean.
  if (cardBase <= 0 && localProg <= 0) return null;

  return (
    <div
      style={{
        width:  w,
        height: h,
        borderRadius: br,
        background,
        boxShadow: CARD_SHADOW,
        overflow: 'hidden',
        transform: `scale(${scaleX * p}, ${scaleY * p})`,
        transformOrigin: '50% 50%',
        opacity: opProg,
        // Ensure children with absolute positioning inside the card work correctly.
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
};
