import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { ProgressSpine } from './ProgressSpine';

// Catalog example: 3-milestone spine, fully drawn and all milestones revealed
// by frame ~45. Uses icon ids from the FivePoints1SubtopicV2 three-milestone
// example so they are already validated to resolve.
//
// The spine rail completes its grey draw-in over frames 0-18 (0.6 s), and all
// three milestones are considered revealed from frame 0 (revealedCount=3) so
// the blue overlay fills the full spine immediately once drawn in.
export const ProgressSpineExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  // Setup reveal: starts immediately, draws in over 18 frames (~0.6 s at 30 fps).
  const setupReveal = { startFrame: 0, inFrames: 18 };

  // Milestone count matches the three-milestone example from FivePoints1SubtopicV2.
  const milestoneCount = 3;

  // Simulate progressive reveal across the example clip:
  // 0-14  => 0 milestones revealed (blue overlay absent)
  // 15-29 => 1 revealed  (blue covers top tick)
  // 30-44 => 2 revealed  (blue covers top two ticks)
  // 45+   => 3 revealed  (blue fills entire spine)
  const revealedCount =
    frame >= 45 ? 3 :
    frame >= 30 ? 2 :
    frame >= 15 ? 1 : 0;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        overflow: 'hidden',
      }}
    >
      <ProgressSpine
        frame={frame}
        reveal={setupReveal}
        milestoneCount={milestoneCount}
        revealedCount={revealedCount}
      />
    </AbsoluteFill>
  );
};
