import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, FONT_BODY, FONT_HEAD } from '../_lib/kit';
import { TypewriterText } from './TypewriterText';

// Catalog example: three colour variants, all fully revealed by ~frame 45.
// Icon ids reused from BulletList6Pills's own example (guaranteed to resolve).
export const TypewriterTextExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  // Typing windows: each line starts typing at frame 12 (after entrance) and
  // finishes well before frame 45 so the catalog snapshot reads cleanly.
  const typeEnd = 44;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 48,
        paddingLeft: 120,
      }}
    >
      {/* Variant 1: BulletList6Pills usage, 60 px Satoshi Bold white */}
      <TypewriterText
        frame={frame}
        reveal={r}
        text="Define the brief"
        typeStartFrame={12}
        typeEndFrame={typeEnd}
        fontFamily={FONT_BODY}
        fontWeight={700}
        fontSize={60}
        color={COLORS.white}
      />

      {/* Variant 2: Timeline5Tiles usage, 37 px Satoshi Bold white */}
      <TypewriterText
        frame={frame}
        reveal={r}
        text="Research the audience"
        typeStartFrame={12}
        typeEndFrame={typeEnd}
        fontFamily={FONT_BODY}
        fontWeight={700}
        fontSize={37}
        color={COLORS.white}
      />

      {/* Variant 3: BigPoints3V2 usage, 33 px Satoshi Medium dark ink */}
      <TypewriterText
        frame={frame}
        reveal={{ startFrame: 0, inFrames: 12 }}
        text="Sketch the structure"
        typeStartFrame={12}
        typeEndFrame={typeEnd}
        fontFamily={FONT_BODY}
        fontWeight={500}
        fontSize={33}
        color="#0B1E33"
      />

      {/* Variant 4: Blue accent, larger Inter heading weight */}
      <TypewriterText
        frame={frame}
        reveal={r}
        text="Draft the storyboard"
        typeStartFrame={12}
        typeEndFrame={typeEnd}
        fontFamily={FONT_HEAD}
        fontWeight={800}
        fontSize={52}
        color={COLORS.blue}
      />
    </AbsoluteFill>
  );
};
