import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { CharacterGradientPanel } from './CharacterGradientPanel';

// Catalog example: blue (default) and teal colour variants side-by-side,
// both fully revealed by frame 45. The character id matches the portrait
// used in the Topic1Subtopics6Character source example.
export const CharacterGradientPanelExample: React.FC = () => {
  useFonts();
  const frame  = useCurrentFrame();
  const reveal = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background:      `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems:      'center',
        justifyContent:  'center',
        gap:             80,
        flexDirection:   'row',
      }}
    >
      {/* Default dodger-blue panel (color='blue') */}
      <CharacterGradientPanel
        frame={frame}
        reveal={reveal}
        characterId="male_middleage_white"
        characterHeight={850}
        characterY={163}
        color="blue"
      />

      {/* Teal variant, same portrait */}
      <CharacterGradientPanel
        frame={frame}
        reveal={reveal}
        characterId="male_middleage_white"
        characterHeight={850}
        characterY={163}
        color="teal"
      />
    </AbsoluteFill>
  );
};
