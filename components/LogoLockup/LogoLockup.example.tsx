import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { LogoLockup } from './LogoLockup';

// Catalog example: dark-background (default) variant and light-background variant,
// both fully revealed by frame 45. Logo ids reuse the same fictional company id
// from CaseStudyIntro's own example so they resolve with the staged Logos library.
export const LogoLockupExample: React.FC = () => {
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
        gap: 48,
      }}
    >
      {/* Default variant: dark background, use a "-light" logo so the artwork reads */}
      <LogoLockup
        frame={frame}
        reveal={r}
        logoId="Company-FinSage-light"
        variant="default"
      />

      {/* Light variant: shown on a platinum surface; logo artwork also "-light" */}
      <div
        style={{
          background: COLORS.platinum,
          borderRadius: 20,
          padding: 32,
          display: 'inline-flex',
        }}
      >
        <LogoLockup
          frame={frame}
          reveal={{ ...r, startFrame: 6 }}
          logoId="Company-FinSage-light"
          variant="light"
        />
      </div>
    </AbsoluteFill>
  );
};
