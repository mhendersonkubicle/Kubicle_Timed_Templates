import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { BulletDotRow } from './BulletDotRow';

// Catalog example: default blue dot variant + a teal colour variant, fully revealed.
// Icon ids from Carousel5Tiles default props; reused verbatim so they resolve.
export const BulletDotRowExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 0,
        padding: '0 120px',
      }}
    >
      {/* Blue dot variant (default, matches Carousel5Tiles) */}
      <BulletDotRow frame={frame} reveal={r} text="Describe intent, not steps" />
      <BulletDotRow frame={frame} reveal={r} text="Let the model draft v1" />
      <BulletDotRow frame={frame} reveal={r} text="Edit, don't rewrite" />

      {/* Spacer */}
      <div style={{ height: 40 }} />

      {/* Teal dot variant */}
      <BulletDotRow frame={frame} reveal={r} text="Small diffs, fast feedback" dotColor="teal" />
      <BulletDotRow frame={frame} reveal={r} text="Run, observe, refine" dotColor="teal" />
      <BulletDotRow frame={frame} reveal={r} text="Trust the test suite" dotColor="teal" />

      {/* Spacer */}
      <div style={{ height: 40 }} />

      {/* Pink dot variant, larger font */}
      <BulletDotRow frame={frame} reveal={r} text="Read every diff" dotColor="pink" fontSize={40} dotSize={10} />
      <BulletDotRow frame={frame} reveal={r} text="Run the code yourself" dotColor="pink" fontSize={40} dotSize={10} />
    </AbsoluteFill>
  );
};
