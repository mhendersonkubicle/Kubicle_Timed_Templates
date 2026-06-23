import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { ProfileBioText } from './ProfileBioText';

// Catalog example: single (default) and duo size variants, fully revealed by
// frame 45 with reveal { startFrame: 0, inFrames: 12 }.
// Text and pulse frame mirror the CharacterProfileCard product-strategist
// example so the same character content reads consistently across components.
export const ProfileBioTextExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12, pulseFrames: [45] };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 60,
        padding: '0 120px',
      }}
    >
      {/* single / team card bio (fontSize 24, max 95 chars) */}
      <ProfileBioText
        frame={frame}
        reveal={r}
        text="Helping early-stage teams ship faster, sharper, and with confidence."
        width={580}
        size="single"
      />

      {/* duo card bio (fontSize 20, max 80 chars) */}
      <ProfileBioText
        frame={frame}
        reveal={r}
        text="Award-winning strategist with ten years in product leadership."
        width={460}
        size="duo"
      />

      {/* custom accent colour variant (pink tint) */}
      <ProfileBioText
        frame={frame}
        reveal={r}
        text="Building inclusive products that scale across global markets."
        width={580}
        size="single"
        color="#F865B0"
      />
    </AbsoluteFill>
  );
};
