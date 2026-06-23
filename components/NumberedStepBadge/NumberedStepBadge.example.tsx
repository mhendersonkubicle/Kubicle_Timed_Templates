import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { NumberedStepBadge } from './NumberedStepBadge';

// Catalog example: shows three size variants (default 126 px, larger 140 px,
// smaller 96 px) all fully revealed by frame ~12. Badge step numbers 01, 02, 03.
// Background matches the kit dark canvas convention.
export const NumberedStepBadgeExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 60,
      }}
    >
      {/* Default 126 px (Timeline5Tiles native size) */}
      <NumberedStepBadge frame={frame} reveal={r} step={1} diameter={126} />
      {/* 140 px (Flywheel petal size) */}
      <NumberedStepBadge frame={frame} reveal={r} step={2} diameter={140} />
      {/* 96 px (compact / inline use) */}
      <NumberedStepBadge frame={frame} reveal={r} step={3} diameter={96} />
    </AbsoluteFill>
  );
};
