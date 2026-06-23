import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { FullBleedBackground } from './FullBleedBackground';

// Catalog example: LessonTitle background PNG rendered full-bleed, fully revealed.
export const FullBleedBackgroundExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})` }}>
      <FullBleedBackground
        frame={frame}
        reveal={r}
        src="Template-Specific-Assets/LessonTitle/lesson_title_background.png"
        baseFill="#020d18"
      />
    </AbsoluteFill>
  );
};
