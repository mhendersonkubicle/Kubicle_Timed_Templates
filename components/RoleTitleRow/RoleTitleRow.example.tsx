import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { RoleTitleRow } from './RoleTitleRow';

// Catalog example: three colour variants (blue, pink, teal) at different sizes,
// with staggered badge reveals to show independent badgeReveal timing.
// All rows are fully revealed well before frame 45 (reveal startFrame 0, inFrames 12).
export const RoleTitleRowExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  // Title reveal: same as CharacterProfileCard default (startFrame 0, inFrames 12).
  const r = { startFrame: 0, inFrames: 12 };

  // Badge reveal slightly delayed to show staggered entrance (mirrors CharacterProfileCard
  // where `badge` cue fires 0.4 s after `name`).
  const badgeR = { startFrame: 8, inFrames: 10 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 56,
      }}
    >
      {/* Single-card size: fontSize 42, badgeSize 32, accent blue (default) */}
      <RoleTitleRow
        frame={frame}
        reveal={r}
        badgeReveal={badgeR}
        title="Product Strategist"
        verified={true}
        color="blue"
        fontSize={42}
        badgeSize={32}
        textColor={COLORS.white}
      />

      {/* Pink accent, same single-card size */}
      <RoleTitleRow
        frame={frame}
        reveal={r}
        badgeReveal={badgeR}
        title="Founder & CEO"
        verified={true}
        color="pink"
        fontSize={42}
        badgeSize={32}
        textColor={COLORS.white}
      />

      {/* Teal accent, team size (fontSize 40) */}
      <RoleTitleRow
        frame={frame}
        reveal={r}
        badgeReveal={badgeR}
        title="Lead Data Scientist"
        verified={true}
        color="teal"
        fontSize={40}
        badgeSize={32}
        textColor={COLORS.white}
      />

      {/* Duo/compact size (fontSize 32, badgeSize 26), no badge */}
      <RoleTitleRow
        frame={frame}
        reveal={r}
        title="Senior Analyst"
        verified={false}
        fontSize={32}
        badgeSize={26}
        textColor={COLORS.platinum}
      />
    </AbsoluteFill>
  );
};
