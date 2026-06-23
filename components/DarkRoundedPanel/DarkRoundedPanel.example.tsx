import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, Icon, FONT_HEAD, FONT_BODY } from '../_lib/kit';
import { DarkRoundedPanel } from './DarkRoundedPanel';

// Catalog example: three size variants shown stacked, fully revealed by frame 45.
// Icons reuse ids that appear in BigPoints3V1's own usage so they are guaranteed
// to resolve (science-magnifyingglass-dark, core-values-value-dark, network-system-dark).
export const DarkRoundedPanelExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      }}
    >
      {/* Variant 1: standard tall panel (default height 733, default borderRadius 40) */}
      <DarkRoundedPanel
        frame={frame}
        reveal={r}
        width={1700}
        height={280}
        borderRadius={40}
        top={60}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 64,
          }}
        >
          <Icon id="science-magnifyingglass-dark" size={80} tint="#0496FF" />
          <span style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 52, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Default panel (height 280, radius 40)
          </span>
        </div>
      </DarkRoundedPanel>

      {/* Variant 2: medium height, tighter radius */}
      <DarkRoundedPanel
        frame={frame}
        reveal={{ startFrame: 0, inFrames: 12 }}
        width={1400}
        height={220}
        borderRadius={24}
        top={400}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 48,
          }}
        >
          <Icon id="core-values-value-dark" size={72} tint="#FF3D8A" />
          <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, color: '#E6ECF2' }}>
            Medium panel (height 220, radius 24)
          </span>
        </div>
      </DarkRoundedPanel>

      {/* Variant 3: compact strip, fully round ends */}
      <DarkRoundedPanel
        frame={frame}
        reveal={{ startFrame: 0, inFrames: 12 }}
        width={1000}
        height={140}
        borderRadius={70}
        top={680}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
          }}
        >
          <Icon id="network-system-dark" size={60} tint="#33CCCC" />
          <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 38, color: '#E6ECF2' }}>
            Compact strip (height 140, radius 70)
          </span>
        </div>
      </DarkRoundedPanel>
    </AbsoluteFill>
  );
};
