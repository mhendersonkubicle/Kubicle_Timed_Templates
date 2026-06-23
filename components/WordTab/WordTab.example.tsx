import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { WordTab } from './WordTab';

export const WordTabExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      alignItems: 'center', justifyContent: 'center', gap: 48,
    }}>
      <WordTab frame={frame} reveal={r} text="Definition" color="blue" height={120} fontSize={58} />
      <WordTab frame={frame} reveal={r} text="Key idea" color="teal" textColor="#0C1A28" height={120} fontSize={58} />
    </AbsoluteFill>
  );
};
