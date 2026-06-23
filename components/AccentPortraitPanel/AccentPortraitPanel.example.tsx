import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { AccentPortraitPanel } from './AccentPortraitPanel';

// Catalog example: all three accent colour variants, fully revealed by frame ~45.
// characterId reused from CharacterProfileCard's own default props so it resolves.
export const AccentPortraitPanelExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
      }}
    >
      {/* Blue variant (dodger blue) */}
      <AccentPortraitPanel
        frame={frame}
        reveal={r}
        characterId="male_middleage_white"
        accentColor="#0496FF"
        size="single"
        width={300}
        height={360}
      />
      {/* Pink variant (wild strawberry) */}
      <AccentPortraitPanel
        frame={frame}
        reveal={{ startFrame: 6, inFrames: 12 }}
        characterId="male_middleage_white"
        accentColor="#F865B0"
        size="single"
        width={300}
        height={360}
      />
      {/* Teal variant (ocean green) */}
      <AccentPortraitPanel
        frame={frame}
        reveal={{ startFrame: 12, inFrames: 12 }}
        characterId="male_middleage_white"
        accentColor="#3AB795"
        size="single"
        width={300}
        height={360}
      />
    </AbsoluteFill>
  );
};
