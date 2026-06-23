// RadialDarkStage , full-canvas dark radial gradient backdrop that irises in from centre over a platinum base.
//
// CODE-FIRST: pure CSS/SVG. No PNG dependencies. Recolourable via the accent
// stop prop; resizable by the consumer. This is a CANVAS-REGION component:
// it occupies the full 1920x1080 stage. Render it directly (not inside <Place>).
//
// Lifted from the AIWorkflowDiagramV1 "setup" beat: a platinum base holds while
// an oxford-blue-to-black radial gradient scales 0 -> 1 from canvas centre via
// easeInOutCubic, so the dark field "irises in" over the light surface.
// When dotGrid=true, a faint SVG dot matrix (32x18, r=1.2, white at 6% opacity)
// fades in after the radial iris completes.

import React from 'react';
import { Easing, interpolate } from 'remotion';
import { type Reveal } from '../_lib/kit';

// Geometry matches the source template.
const W = 1920;
const H = 1080;
const DOT_COLS = 32;
const DOT_ROWS = 18;

// Platinum base (#E6ECF2) visible at scale 0, exactly as in AIWorkflowDiagramV1.
const PLATINUM_BG = '#E6ECF2';

// Oxford-blue radial gradient: exact stops from AIWorkflowDiagramV1.
const OXFORD_BG =
  'radial-gradient(ellipse at 50% 50%, ' +
  '#0a3050 0%, #052438 38%, #02101c 72%, #000000 100%)';

const easeInOutCubic = Easing.inOut(Easing.cubic);
const easeOutCubic = Easing.out(Easing.cubic);

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export type RadialDarkStageProps = {
  frame: number;
  reveal: Reveal;
  // Show the faint white dot-grid overlay after the radial iris. Default false.
  dotGrid?: boolean;
};

export const RadialDarkStage: React.FC<RadialDarkStageProps> = ({
  frame,
  reveal,
  dotGrid = false,
}) => {
  const { startFrame, inFrames } = reveal;
  const endFrame = startFrame + inFrames;

  // Radial iris: scale 0 -> 1, easeInOutCubic (matches AIWorkflowDiagramV1 setup).
  const bgScale = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  // Dot grid fades in during the back half of the iris window, then fully opaque.
  // bgOp logic: starts at 0 until bgScale > 0.5, then ramps to 1.
  const bgOp = easeOutCubic(clamp01((bgScale - 0.5) * 2));

  // Pre-compute dot positions.
  const dots: React.ReactElement[] = [];
  if (dotGrid && bgOp > 0) {
    const stepX = W / DOT_COLS;
    const stepY = H / DOT_ROWS;
    for (let r = 0; r < DOT_ROWS; r++) {
      for (let c = 0; c < DOT_COLS; c++) {
        const cx = c * stepX + stepX / 2;
        const cy = r * stepY + stepY / 2;
        dots.push(
          <circle key={`${r}-${c}`} cx={cx} cy={cy} r={1.2} fill="#FFFFFF" />,
        );
      }
    }
  }

  return (
    // Platinum base layer: always visible (matched to source template).
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: PLATINUM_BG,
        overflow: 'hidden',
      }}
    >
      {/* Oxford radial gradient irises in from canvas centre. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: OXFORD_BG,
          transform: `scale(${bgScale})`,
          transformOrigin: 'center center',
        }}
      />

      {/* Faint dot grid: SVG overlay, fades in as the iris completes. */}
      {dotGrid && dots.length > 0 && (
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <g opacity={0.06 * bgOp}>{dots}</g>
        </svg>
      )}
    </div>
  );
};
