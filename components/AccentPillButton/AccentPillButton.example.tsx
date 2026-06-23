import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { AccentPillButton } from './AccentPillButton';

// Catalog example: three colour variants + a duo-size variant, fully revealed.
// Icon ids match CharacterProfileCard's own example (no icon lib dependency here
// as AccentPillButton is code-first with an inline plus glyph, not an Icon id).
export const AccentPillButtonExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      {/* Blue (primary brand) */}
      <AccentPillButton frame={frame} reveal={r} label="Follow" accentColor="blue" height={56} />
      {/* Pink variant */}
      <AccentPillButton frame={frame} reveal={r} label="Follow" accentColor="pink" height={56} />
      {/* Teal variant */}
      <AccentPillButton frame={frame} reveal={r} label="Follow" accentColor="teal" height={56} />
      {/* Duo/team card size (48 px) */}
      <AccentPillButton frame={frame} reveal={r} label="Follow" accentColor="blue" height={48} />
      {/* Custom label, no icon */}
      <AccentPillButton frame={frame} reveal={r} label="Connect" accentColor="#3AB795" height={56} showIcon={false} />
    </AbsoluteFill>
  );
};
