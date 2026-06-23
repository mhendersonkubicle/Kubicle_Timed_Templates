// HorizontalProgressBar , pill-shaped progress bar with a dark track and animated dodger-blue fill.
// CODE-FIRST: pure CSS, recolourable via props, placement-agnostic (renders in its own box).
// Two modes:
//   continuous  , animates width as a fraction 0..1 using the appear() helper + easeInOutCubic.
//   segmented   , N equal steps; each step eases from i/N to (i+1)/N with easeInOutCubic.
// Extracted from BigPoints3V1 loading-bar geometry (BAR_HEIGHT 51, track #052438, fill gradient).
import React from 'react';
import { interpolate, Easing } from 'remotion';
import {
  appear, pulse, easeOutCubic, COLORS, type Reveal,
} from '../_lib/kit';

// Brand bar colours taken directly from BigPoints3V1 constants.
const TRACK_COLOR = '#052438';
const FILL_GRADIENT = 'linear-gradient(180deg, #48B2FF 0%, #0496FF 100%)';

// easeInOutCubic for per-step fill animation (matches the brief spec).
const easeInOutCubic = Easing.inOut(Easing.cubic);

export type HorizontalProgressBarProps = {
  frame: number;
  reveal: Reveal;

  // Bar dimensions.
  width: number;           // total track width in px
  height?: number;         // track height in px; default 51 (BigPoints3V1) or pass 44 (Timeline5Tiles)

  // Mode A: continuous fill. Pass fill (0..1); the bar animates to this fraction
  // across the reveal entrance window using easeInOutCubic.
  fill?: number;

  // Mode B: segmented. The bar is divided into N equal steps; it fills in step
  // by step, one step per reveal cue. Pass segmentIndex (0-based, which step is
  // currently active) and segmentCount (total N). Each step eases from i/N to
  // (i+1)/N with easeInOutCubic across the reveal entrance window.
  segmentIndex?: number;
  segmentCount?: number;

  // Override colours.
  trackColor?: string;     // default #052438
  fillGradient?: string;   // default dodger-blue gradient
};

export const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({
  frame,
  reveal,
  width,
  height = 51,
  fill,
  segmentIndex,
  segmentCount,
  trackColor = TRACK_COLOR,
  fillGradient = FILL_GRADIENT,
}) => {
  // Entrance: the whole bar fades in with the reveal using easeOutCubic.
  const entranceOp = appear(frame, reveal, easeOutCubic);
  if (entranceOp <= 0) return null;

  // Pulse scale on re-mention (wraps the whole bar).
  const pScale = pulse(frame, reveal);

  const borderRadius = height / 2;

  // Compute the fill width.
  let fillFrac: number;

  if (segmentCount != null && segmentIndex != null && segmentCount > 0) {
    // Segmented mode: fill progresses from i/N to (i+1)/N for the current step.
    const fromFrac = segmentIndex / segmentCount;
    const toFrac = (segmentIndex + 1) / segmentCount;
    const stepProg = interpolate(
      frame,
      [reveal.startFrame, reveal.startFrame + reveal.inFrames],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic },
    );
    fillFrac = fromFrac + (toFrac - fromFrac) * stepProg;
  } else {
    // Continuous mode: animate from 0 to fill fraction across the entrance window.
    const target = fill ?? 1;
    fillFrac = interpolate(
      frame,
      [reveal.startFrame, reveal.startFrame + reveal.inFrames],
      [0, target],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic },
    );
  }

  // Clamp to [0, 1].
  const clampedFrac = Math.max(0, Math.min(1, fillFrac));

  // The fill div width must be at least height so the rounded cap always shows,
  // even at near-zero fill. Only apply this floor when there is nonzero fill.
  const fillPx = clampedFrac > 0
    ? Math.max(height, clampedFrac * width)
    : 0;

  return (
    <div
      style={{
        opacity: entranceOp,
        transform: `scale(${pScale})`,
        transformOrigin: 'left center',
        display: 'inline-block',
      }}
    >
      {/* Dark track */}
      <div
        style={{
          position: 'relative',
          width,
          height,
          borderRadius,
          background: trackColor,
          overflow: 'hidden',
        }}
      >
        {/* Blue fill, clipped by the track's overflow:hidden */}
        {fillPx > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: fillPx,
              height: '100%',
              borderRadius,
              background: fillGradient,
            }}
          />
        )}
      </div>
    </div>
  );
};
