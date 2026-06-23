import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { EyebrowLabel } from './EyebrowLabel';

// Catalog example: left-aligned and centred variants, plus colour variants.
// Fully revealed by frame 45 (reveal { startFrame: 0, inFrames: 12 }).
// Icon ids reused from LessonTitle's own example context (no icons needed here,
// but the blue / pink / teal colour set mirrors what LessonTitle and
// CaseStudyIntro carry as their accent palette).
export const EyebrowLabelExample: React.FC = () => {
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
        gap: 56,
        paddingLeft: 120,
        paddingRight: 120,
      }}
    >
      {/* Left-aligned variant (LessonTitle style), blue, 32 px, letterSpacing 0.01em */}
      <EyebrowLabel
        frame={frame}
        reveal={r}
        text="Lesson Three"
        color="blue"
        align="left"
        fontSize={32}
        letterSpacing="0.01em"
        fontWeight={700}
      />

      {/* Left-aligned variant, pink accent */}
      <EyebrowLabel
        frame={frame}
        reveal={r}
        text="Module Overview"
        color="pink"
        align="left"
        fontSize={32}
        letterSpacing="0.01em"
        fontWeight={700}
      />

      {/* Left-aligned variant, teal accent */}
      <EyebrowLabel
        frame={frame}
        reveal={r}
        text="Key Concept"
        color="teal"
        align="left"
        fontSize={32}
        letterSpacing="0.01em"
        fontWeight={700}
      />

      {/* Centred variant (CaseStudyIntro style), blue, 34 px, letterSpacing 0.18em, ExtraBold */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <EyebrowLabel
          frame={frame}
          reveal={r}
          text="Case Study"
          color="blue"
          align="center"
          fontSize={34}
          letterSpacing="0.18em"
          fontWeight={800}
        />
      </div>
    </AbsoluteFill>
  );
};
