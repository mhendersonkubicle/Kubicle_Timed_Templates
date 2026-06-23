import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { AnimatedConnectorLine } from './AnimatedConnectorLine';

// Catalog example: straight and curved variants in blue, pink, and teal,
// arranged to suggest a mini workflow graph. All fully revealed by frame ~45.
// Icon ids reuse AIWorkflowDiagramV1's own geometry (pure SVG paths, no file ids).
export const AnimatedConnectorLineExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  // All three lines start at frame 0 and draw in over 12 frames (0.4 s at 30 fps).
  const r = { startFrame: 0, inFrames: 12 };

  // SVG canvas size for the example panel.
  const W = 1920;
  const H = 1080;

  // Three connector paths laid out as a simple source -> router -> sink diagram,
  // mirroring the AIWorkflowDiagramV1 [[1],[1],[1]] shape at reduced scale.
  //
  // Source node centre: (320, 540)
  // Router node centre: (960, 540)
  // Sink node centre:   (1600, 540)
  //
  // Node box size used to derive connection ports: width 280, height 140.
  // Right port of a node: cx + 140, cy
  // Left  port of a node: cx - 140, cy

  // Connector A: source -> router (straight, blue)
  const connA = {
    from: { x: 460, y: 540 },
    to:   { x: 820, y: 540 },
  };

  // Connector B: router -> sink (straight, teal, thicker to show strokeWidth prop)
  const connB = {
    from: { x: 1100, y: 540 },
    to:   { x: 1460, y: 540 },
  };

  // Connector C: a diagonal curve from source down-right to sink,
  // demonstrating the cubic-bezier curve mode in pink.
  const connC = {
    from: { x: 460, y: 540 },
    to:   { x: 1460, y: 760 },
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        overflow: 'hidden',
      }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Node boxes drawn as simple SVG rects for context */}
        {[
          { cx: 320,  cy: 540 },
          { cx: 960,  cy: 540 },
          { cx: 1600, cy: 540 },
        ].map(({ cx, cy }, i) => (
          <g key={i}>
            <rect
              x={cx - 140} y={cy - 70}
              width={280} height={140}
              rx={26}
              fill="#0496FF"
              fillOpacity={0.22}
              stroke="#0496FF"
              strokeWidth={1.5}
              strokeOpacity={0.5}
            />
          </g>
        ))}
      </svg>

      {/* Connector A: straight blue line, source -> router */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AnimatedConnectorLine
          frame={frame}
          reveal={r}
          from={connA.from}
          to={connA.to}
          curve={false}
          color="blue"
          strokeWidth={3}
          svgWidth={W}
          svgHeight={H}
        />
      </div>

      {/* Connector B: straight teal line, router -> sink */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AnimatedConnectorLine
          frame={frame}
          reveal={{ startFrame: 6, inFrames: 12 }}
          from={connB.from}
          to={connB.to}
          curve={false}
          color="teal"
          strokeWidth={2.5}
          svgWidth={W}
          svgHeight={H}
        />
      </div>

      {/* Connector C: cubic-bezier curve in pink, source -> sink (diagonal) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <AnimatedConnectorLine
          frame={frame}
          reveal={{ startFrame: 12, inFrames: 14 }}
          from={connC.from}
          to={connC.to}
          curve={true}
          color="pink"
          strokeWidth={2.5}
          glowOpacity={0.22}
          svgWidth={W}
          svgHeight={H}
        />
      </div>
    </AbsoluteFill>
  );
};
