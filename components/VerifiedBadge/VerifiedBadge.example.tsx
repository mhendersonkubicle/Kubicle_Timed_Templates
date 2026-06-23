import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, FONT_BODY } from '../_lib/kit';
import { VerifiedBadge } from './VerifiedBadge';

// Catalog example: blue, pink, and teal colour variants beside a role label,
// fully revealed by frame ~45.
export const VerifiedBadgeExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: FONT_BODY,
    fontWeight: 700,
    fontSize: 38,
    color: COLORS.white,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  };

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
      {/* Blue variant, matches CharacterProfileCard default accent */}
      <div style={rowStyle}>
        <span style={labelStyle}>Product Strategist</span>
        <VerifiedBadge frame={frame} reveal={r} color="blue" size={32} />
      </div>

      {/* Pink variant */}
      <div style={rowStyle}>
        <span style={labelStyle}>Founder &amp; CEO</span>
        <VerifiedBadge frame={frame} reveal={r} color="pink" size={32} />
      </div>

      {/* Teal variant */}
      <div style={rowStyle}>
        <span style={labelStyle}>Data Scientist</span>
        <VerifiedBadge frame={frame} reveal={r} color="teal" size={32} />
      </div>

      {/* Small size (26) for duo/compact layouts */}
      <div style={{ ...rowStyle, opacity: 0.72 }}>
        <span style={{ ...labelStyle, fontSize: 30 }}>Compact (size 26)</span>
        <VerifiedBadge frame={frame} reveal={r} color="blue" size={26} />
      </div>
    </AbsoluteFill>
  );
};
