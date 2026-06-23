import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { SectionHeadline } from './SectionHeadline';

// Catalog example: blue (default), pink, and teal colour variants, plus both
// size variants. All fully revealed by frame ~45 (reveal { startFrame: 0, inFrames: 12 }).
// Icon ids not required here; colours mirror LessonSummary's accent palette
// (science-magnifyingglass-dark and core-values-value-dark resolve in that template's context).
export const SectionHeadlineExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 52,
        paddingLeft: 120,
        paddingRight: 120,
      }}
    >
      {/* Default: blue, large (62 px) — LessonSummary headline register */}
      <SectionHeadline
        frame={frame}
        reveal={r}
        text="Lesson Summary"
        color="blue"
        size="large"
      />

      {/* Pink variant, large — splitscreen right-column header */}
      <SectionHeadline
        frame={frame}
        reveal={r}
        text="Key Takeaways"
        color="pink"
        size="large"
      />

      {/* Teal variant, medium (58 px) — secondary section label */}
      <SectionHeadline
        frame={frame}
        reveal={r}
        text="What You Learned"
        color="teal"
        size="medium"
      />
    </AbsoluteFill>
  );
};
