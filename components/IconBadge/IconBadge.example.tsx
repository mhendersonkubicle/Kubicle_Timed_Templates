import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { IconBadge } from './IconBadge';

export const IconBadgeExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80,
    }}>
      <IconBadge frame={frame} reveal={r} icon="network-system-dark" circleColor="blue" size={340} />
      <IconBadge frame={frame} reveal={r} icon="teamwork-collaboration-dark" circleColor="pink" size={340} />
    </AbsoluteFill>
  );
};
