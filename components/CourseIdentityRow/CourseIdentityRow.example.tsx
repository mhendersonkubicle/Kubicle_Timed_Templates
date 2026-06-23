import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, Place } from '../_lib/kit';
import { CourseIdentityRow } from './CourseIdentityRow';

// Catalog example: three variants, all fully revealed by frame 45.
// Icons reuse ids confirmed in the IconPill example (science-magnifyingglass-dark,
// core-values-value-dark) plus a third showing text-only (no icon).
export const CourseIdentityRowExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      }}
    >
      {/* Blue tint variant with icon (matches LessonTitle default) */}
      <Place x={77} y={200}>
        <CourseIdentityRow
          frame={frame}
          reveal={r}
          courseTitle="Connecting AI Agents to Systems"
          iconId="science-magnifyingglass-dark"
          tint="#0794FD"
        />
      </Place>

      {/* Pink tint variant with icon */}
      <Place x={77} y={340}>
        <CourseIdentityRow
          frame={frame}
          reveal={r}
          courseTitle="Core Values Workshop"
          iconId="core-values-value-dark"
          tint="#FF3D8A"
        />
      </Place>

      {/* Text-only variant (no icon) */}
      <Place x={77} y={480}>
        <CourseIdentityRow
          frame={frame}
          reveal={r}
          courseTitle="Excel Fundamentals"
        />
      </Place>
    </AbsoluteFill>
  );
};
