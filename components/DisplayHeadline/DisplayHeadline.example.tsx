import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { DisplayHeadline } from './DisplayHeadline';

// Catalog example: three colour variants shown together.
// 'white' (default) slides in from the left (lesson-title style).
// 'blue' rises up (goal/section-heading style).
// 'ink' slides in from the left (word-definition style), shown on a light panel.
// All fully revealed by frame ~45 (reveal { startFrame: 0, inFrames: 12 }).
export const DisplayHeadlineExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '0 80px',
      gap: 56,
    }}>
      {/* variant: white, entry: slide-x (default) — lesson title */}
      <DisplayHeadline
        frame={frame}
        reveal={r}
        text="Understanding AI Agents"
        variant="white"
        entry="slide-x"
        maxWidth={1200}
      />

      {/* variant: blue, entry: slide-y — section goal heading */}
      <DisplayHeadline
        frame={frame}
        reveal={r}
        text="By the end of this lesson"
        variant="blue"
        entry="slide-y"
        maxWidth={1200}
      />

      {/* variant: ink — word-definition heading, shown on a light inset panel */}
      <div style={{
        background: COLORS.platinum,
        borderRadius: 16,
        padding: '28px 40px',
        maxWidth: 900,
      }}>
        <DisplayHeadline
          frame={frame}
          reveal={r}
          text="Machine Learning"
          variant="ink"
          entry="slide-x"
          maxWidth={820}
        />
      </div>
    </AbsoluteFill>
  );
};
