import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { GradientIconBadge } from './GradientIconBadge';

// Catalog example: square, circle, and small-square variants at two sizes, fully revealed.
// Icon ids reused from BulletList6Pills's own example ('science-magnifyingglass-dark',
// 'core-values-value-dark') plus a third that appears in BulletList6Pills demo narration.
export const GradientIconBadgeExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 60,
      }}
    >
      {/* Row 1: square (default, 120 px) + large square (200 px) */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60 }}>
        <GradientIconBadge frame={frame} reveal={r} icon="science-magnifyingglass-dark" shape="square" size={120} />
        <GradientIconBadge frame={frame} reveal={r} icon="core-values-value-dark" shape="square" size={200} />
      </div>

      {/* Row 2: circle (120 px) + circle (200 px) */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60 }}>
        <GradientIconBadge frame={frame} reveal={r} icon="science-magnifyingglass-dark" shape="circle" size={120} />
        <GradientIconBadge frame={frame} reveal={r} icon="core-values-value-dark" shape="circle" size={200} />
      </div>

      {/* Row 3: small-square (80 px) + small-square (120 px) */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 60 }}>
        <GradientIconBadge frame={frame} reveal={r} icon="science-magnifyingglass-dark" shape="small-square" size={80} />
        <GradientIconBadge frame={frame} reveal={r} icon="core-values-value-dark" shape="small-square" size={120} />
      </div>
    </AbsoluteFill>
  );
};
