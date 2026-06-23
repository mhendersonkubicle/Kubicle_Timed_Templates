import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { BodyCopy } from './BodyCopy';

// Catalog example: dark and light variants, fully revealed.
// Icon ids reused from LessonGoal's own usage (no icon rendered here, but
// the reveal timing matches the goal copy beat from StandardGoal.example.tsx).
export const BodyCopyExample: React.FC = () => {
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
        padding: '0 120px',
        gap: 72,
      }}
    >
      {/* Dark variant: near-black #0B1F33 text, for light/platinum surfaces.
          Here shown on a white card to demonstrate how it reads on its intended bg. */}
      <div
        style={{
          background: '#E6ECF2',
          borderRadius: 24,
          padding: '48px 56px',
          maxWidth: 1100,
        }}
      >
        <BodyCopy
          frame={frame}
          reveal={r}
          variant="dark"
          text="Identify three risks in a project plan and propose a mitigation for each."
          maxWidth={1000}
        />
      </div>

      {/* Light variant: muted slate #4A5864 at 55.5px, for title bars and panel surfaces. */}
      <div
        style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '48px 56px',
          maxWidth: 1100,
        }}
      >
        <BodyCopy
          frame={frame}
          reveal={{ startFrame: 0, inFrames: 12 }}
          variant="light"
          text="By the end of this lesson you will be able to apply a structured review process to any financial model."
          maxWidth={1000}
        />
      </div>
    </AbsoluteFill>
  );
};
