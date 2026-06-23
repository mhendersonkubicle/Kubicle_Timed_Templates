import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { StatPairRow } from './StatPairRow';

// Catalog example: single and duo size variants, fully revealed.
// Icon ids and values match CharacterProfileCard's default props so they
// resolve against the same data the source template already validates.
export const StatPairRowExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const reveal = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
      }}
    >
      {/* Single variant (fontSize 22, standard card) */}
      <StatPairRow
        frame={frame}
        reveal={reveal}
        stats={[
          { icon: 'followers', value: 1248 },
          { icon: 'posts',     value: 86 },
        ]}
        size="single"
      />

      {/* Duo variant (fontSize 20, tighter two-card layout) */}
      <StatPairRow
        frame={frame}
        reveal={reveal}
        stats={[
          { icon: 'followers', value: 3920 },
          { icon: 'likes',     value: 512 },
        ]}
        size="duo"
      />
    </AbsoluteFill>
  );
};
