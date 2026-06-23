import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { InfoBanner } from './InfoBanner';

// Catalog example: blue (default), pink, and teal accent variants, all fully
// revealed by frame ~45. Icon ids reused from Pyramid5Tiers's own defaultProps.
export const InfoBannerExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 36,
        padding: '0 80px',
      }}
    >
      {/* Default blue accent */}
      <InfoBanner
        frame={frame}
        reveal={r}
        title="Outcomes"
        body="What the user actually receives. Value, results, the feeling of progress. Everything below is in service of this."
        accentColor="blue"
        width={900}
      />

      {/* Pink accent */}
      <InfoBanner
        frame={frame}
        reveal={r}
        title="Reasoning"
        body="Models, prompts, and chains of thought. The cognitive layer that turns inputs into useful outputs."
        accentColor="pink"
        width={900}
      />

      {/* Teal accent, entrance from left */}
      <InfoBanner
        frame={frame}
        reveal={r}
        title="Data"
        body="Documents, training sets, embeddings. The foundation everything is built on."
        accentColor="teal"
        width={900}
        from="left"
      />
    </AbsoluteFill>
  );
};
