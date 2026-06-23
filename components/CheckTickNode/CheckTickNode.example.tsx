import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { CheckTickNode } from './CheckTickNode';

// Catalog example: three nodes at different canvas positions (matching
// FivePoints1SubtopicV2's 3-milestone vertical layout), all fully revealed.
// Icon ids match the FivePoints1SubtopicV2 three-milestone example so they
// are known-good at the catalog render stage.
export const CheckTickNodeExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  // Three milestone Ys from FivePoints1SubtopicV2 cardCyFor(3, i):
  //   CANVAS_CY=540, CARD_PITCH=200 => centres at 340, 540, 740.
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      }}
    >
      <CheckTickNode frame={frame} reveal={r} cy={340} />
      <CheckTickNode frame={frame} reveal={r} cy={540} />
      <CheckTickNode frame={frame} reveal={r} cy={740} />
    </AbsoluteFill>
  );
};
