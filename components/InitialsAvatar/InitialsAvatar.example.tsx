import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, FONT_BODY } from '../_lib/kit';
import { InitialsAvatar } from './InitialsAvatar';

// Catalog example: all five tint-palette variants shown in a row, fully revealed.
// Names reuse the GroupChat example cast so icon ids remain consistent with that
// template's own example.
export const InitialsAvatarExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  const CAST = [
    { name: 'Margaret Cole', label: 'index 0' },
    { name: 'Jake Park',     label: 'index 1' },
    { name: 'Kim Lee',       label: 'index 2' },
    { name: 'Chloe Amos',   label: 'index 3' },
    { name: 'Robert Vance', label: 'index 4' },
  ] as const;

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
      {/* Row: all five palette tints at the default 64 px size */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {CAST.map((c, i) => (
          <InitialsAvatar
            key={c.name}
            frame={frame}
            reveal={{ startFrame: i * 4, inFrames: 12 }}
            name={c.name}
            tintIndex={i}
          />
        ))}
      </div>

      {/* Row: large (96 px) size using the first palette colour */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <InitialsAvatar
          frame={frame}
          reveal={r}
          name="Margaret Cole"
          tintIndex={0}
          size={96}
        />
        <InitialsAvatar
          frame={frame}
          reveal={r}
          name="Jake Park"
          tintIndex={1}
          size={96}
        />
        <InitialsAvatar
          frame={frame}
          reveal={r}
          name="Kim Lee"
          tintIndex={2}
          size={96}
        />
      </div>

      {/* Labels */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          opacity: 0.60,
        }}
      >
        {CAST.map((c) => (
          <span
            key={c.name}
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 22,
              color: COLORS.white,
              width: 64,
              textAlign: 'center',
            }}
          >
            {c.label}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
