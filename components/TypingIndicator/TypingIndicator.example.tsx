import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, Place } from '../_lib/kit';
import { TypingIndicator } from './TypingIndicator';

// Catalog example: TypingIndicator shown in two states.
//   Row 1: typing only (persistent, no fade-out) — what you see before a bubble lands.
//   Row 2: typing that fades out at frame 45 as the real bubble would arrive.
// Icon ids reused from GroupChat's own example (no new ids invented).
export const TypingIndicatorExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  // Fully revealed by frame ~12; startFrame: 0, inFrames: 12.
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 48,
      }}
    >
      {/* Persistent indicator, still composing */}
      <Place x={880} y={440}>
        <TypingIndicator frame={frame} reveal={r} />
      </Place>

      {/* Indicator that fades out at frame 45 (the real bubble would appear then) */}
      <Place x={880} y={540}>
        <TypingIndicator
          frame={frame}
          reveal={r}
          fadeOutAtFrame={45}
          fadeOutDur={4}
        />
      </Place>
    </AbsoluteFill>
  );
};
