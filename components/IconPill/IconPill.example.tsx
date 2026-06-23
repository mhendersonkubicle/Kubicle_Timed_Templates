import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { IconPill } from './IconPill';

// Catalog example: blue and pink variants, fully revealed.
export const IconPillExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      alignItems: 'center', justifyContent: 'center', gap: 48,
    }}>
      <IconPill frame={frame} reveal={r} text="Reads the record" icon="science-magnifyingglass-dark" color="blue" width={840} height={120} />
      <IconPill frame={frame} reveal={r} text="Updates the field" icon="core-values-value-dark" color="pink" width={840} height={120} />
    </AbsoluteFill>
  );
};
