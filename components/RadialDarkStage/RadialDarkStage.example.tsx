import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { RadialDarkStage } from './RadialDarkStage';

// Catalog example: shows RadialDarkStage with and without the dot grid.
// Fully revealed by frame 45 (reveal: startFrame 0, inFrames 12).
// The two instances are stacked left/right by slicing the canvas in half
// so both variants are visible at a glance.
//
// Icon ids reused from AIWorkflowDiagramV1's own example (all resolve).
export const RadialDarkStageExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const reveal = { startFrame: 0, inFrames: 12 };

  return (
    // Outer shell uses the same oxford-to-navy gradient the other examples use,
    // though RadialDarkStage itself will fully cover it once revealed.
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        overflow: 'hidden',
      }}
    >
      {/* Left half: no dot grid */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 960,
          height: 1080,
          overflow: 'hidden',
        }}
      >
        <RadialDarkStage frame={frame} reveal={reveal} dotGrid={false} />
        {/* Label */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            width: 960,
            textAlign: 'center',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 30,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.01em',
          }}
        >
          dotGrid=false
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          position: 'absolute',
          left: 958,
          top: 0,
          width: 4,
          height: 1080,
          background: 'rgba(255,255,255,0.12)',
        }}
      />

      {/* Right half: with dot grid */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 0,
          width: 960,
          height: 1080,
          overflow: 'hidden',
        }}
      >
        <RadialDarkStage frame={frame} reveal={reveal} dotGrid={true} />
        {/* Label */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            width: 960,
            textAlign: 'center',
            fontFamily: 'Satoshi, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 30,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.01em',
          }}
        >
          dotGrid=true
        </div>
      </div>
    </AbsoluteFill>
  );
};
