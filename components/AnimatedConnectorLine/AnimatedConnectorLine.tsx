// AnimatedConnectorLine , self-drawing SVG line or cubic-bezier path with outer glow
// CODE-FIRST: pure SVG, recolourable via props, placement-agnostic (renders in its own box).
// Two layered SVG paths share the same `d` string (straight lines use <line> via
// degenerate bezier; curves use cubic-bezier). Outer glow: strokeWidth 10, opacity 0.18.
// Inner: strokeWidth 2.5-3. Both use pathLength=1 + strokeDasharray=1 + strokeDashoffset
// animated from 1 (hidden) to 0 (fully drawn) via appear() + easeInOutCubic.
// Extracted from AIWorkflowDiagramV1's Connector component.
import React from 'react';
import { Easing, interpolate } from 'remotion';
import {
  appear, pulse, resolveColor, type Reveal, type ColorVariant,
} from '../_lib/kit';

// easeInOutCubic: the default easing for a line "drawing itself" feels most
// natural with a symmetric ease (matches the source template's connector draws).
const easeInOutCubic = Easing.inOut(Easing.cubic);

// A 2-D point on the SVG canvas.
export type Point = { x: number; y: number };

// The connector path type. For straight lines pass `curve: false` (or omit it);
// for a cubic-bezier pass `curve: true` and supply cp1 + cp2 control points. If
// control points are omitted on a curve the component auto-derives a horizontal
// S-curve (matching AIWorkflowDiagramV1's makeHCurve: cp1 mid-x at from.y, cp2
// mid-x at to.y).
export type AnimatedConnectorLineProps = {
  frame:   number;
  reveal:  Reveal;

  // Endpoints (SVG user-space coordinates).
  from: Point;
  to:   Point;

  // Optional explicit cubic-bezier control points. Only used when curve=true.
  // If omitted, the component generates a horizontal S-curve automatically.
  cp1?: Point;
  cp2?: Point;

  // When true the path uses a cubic-bezier; when false (default) a straight line.
  curve?: boolean;

  // Canvas size that the SVG element occupies. Defaults to a box that snugly
  // wraps from+to (with glowPad padding). Pass explicit values when the component
  // is embedded at a fixed size inside a larger layout.
  svgWidth?:  number;
  svgHeight?: number;

  // Stroke colour. Named brand variant ('blue', 'pink', 'teal') or any hex.
  // Default 'blue' (#0496FF).
  color?: ColorVariant;

  // Inner path stroke width. Default 3.
  strokeWidth?: number;

  // Glow outer stroke width. Default 10.
  glowWidth?: number;

  // Glow opacity at full draw. Default 0.18 (matches source template).
  glowOpacity?: number;

  // Easing function override. Default easeInOutCubic.
  easing?: (t: number) => number;
};

const GLOW_PAD = 20; // extra padding so the glow ring is not clipped by the SVG edge

export const AnimatedConnectorLine: React.FC<AnimatedConnectorLineProps> = ({
  frame,
  reveal,
  from,
  to,
  cp1,
  cp2,
  curve = false,
  svgWidth,
  svgHeight,
  color = 'blue',
  strokeWidth = 3,
  glowWidth = 10,
  glowOpacity = 0.18,
  easing = easeInOutCubic,
}) => {
  // Entrance progress 0..1
  const drawProg = appear(frame, reveal, easing);
  if (drawProg <= 0) return null;

  // Re-mention pulse scale (1 at rest)
  const pScale = pulse(frame, reveal);

  // Stroke colour
  const strokeColor = resolveColor(color);

  // strokeDashoffset: 1 = hidden, 0 = fully drawn. At full progress it is 0.
  const dashOffset = interpolate(
    frame,
    [reveal.startFrame, reveal.startFrame + reveal.inFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing },
  );

  // Compute the path d string.
  // For a straight line we still use a cubic bezier path so pathLength=1 works
  // identically for both modes (avoids the need to measure actual pixel length).
  let pathD: string;
  if (curve) {
    // Use provided control points or auto-derive a horizontal S-curve.
    const midX = (from.x + to.x) / 2;
    const p1 = cp1 ?? { x: midX, y: from.y };
    const p2 = cp2 ?? { x: midX, y: to.y };
    pathD = `M ${from.x} ${from.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${to.x} ${to.y}`;
  } else {
    // Straight line expressed as a degenerate cubic bezier.
    pathD = `M ${from.x} ${from.y} C ${from.x} ${from.y}, ${to.x} ${to.y}, ${to.x} ${to.y}`;
  }

  // Auto-derive SVG dimensions from the bounding box of the endpoints plus glow padding.
  const allX = [from.x, to.x, ...(cp1 ? [cp1.x] : []), ...(cp2 ? [cp2.x] : [])];
  const allY = [from.y, to.y, ...(cp1 ? [cp1.y] : []), ...(cp2 ? [cp2.y] : [])];
  const minX = Math.min(...allX) - GLOW_PAD;
  const minY = Math.min(...allY) - GLOW_PAD;
  const maxX = Math.max(...allX) + GLOW_PAD;
  const maxY = Math.max(...allY) + GLOW_PAD;

  const w = svgWidth  ?? (maxX - minX);
  const h = svgHeight ?? (maxY - minY);

  // When using auto-derived dimensions the viewBox aligns with the bounding box.
  // When explicit dimensions are passed, viewBox matches them (coordinates assumed
  // to already be in the SVG's space).
  const viewBox = svgWidth != null
    ? `0 0 ${svgWidth} ${svgHeight ?? h}`
    : `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div
      style={{
        display: 'inline-block',
        transform: `scale(${pScale})`,
        transformOrigin: 'center center',
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={viewBox}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Outer glow layer */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={glowWidth}
          strokeLinecap="round"
          opacity={glowOpacity * drawProg}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={dashOffset}
        />
        {/* Inner stroke layer */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
};
