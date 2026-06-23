import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, FONT_BODY, FONT_HEAD } from '../_lib/kit';
import { SlideWipeTransitionPanel } from './SlideWipeTransitionPanel';

// Catalog example: four colour variants and both modes side by side.
// Each panel is revealed by frame ~45 (reveal startFrame: 0, inFrames: 12).
export const SlideWipeTransitionPanelExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        overflow: 'hidden',
      }}
    >
      {/* Label row so the viewer can see what each panel demonstrates */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: FONT_HEAD,
            fontWeight: 800,
            fontSize: 72,
            color: COLORS.white,
            letterSpacing: '-0.02em',
          }}
        >
          SlideWipeTransitionPanel
        </span>

        <div
          style={{
            display: 'flex',
            gap: 60,
            alignItems: 'center',
          }}
        >
          {/* Legend labels */}
          {[
            { label: 'outro / right / platinum', color: COLORS.platinum },
            { label: 'outro / left / blue', color: COLORS.blue },
            { label: 'intro / right / navy', color: COLORS.navy },
            { label: 'intro / down / pink', color: '#FF3D8A' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: color,
                  border: '2px solid rgba(255,255,255,0.25)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontWeight: 700,
                  fontSize: 32,
                  color: 'rgba(255,255,255,0.72)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Variant 1: outro, direction=right, platinum (matches source template outro) */}
      <SlideWipeTransitionPanel
        frame={frame}
        reveal={r}
        mode="outro"
        direction="right"
        color="#E6ECF2"
      />

      {/* Variant 2: outro, direction=left, blue */}
      {/* Staggered so it doesn't fully overlap variant 1 in the catalog still image */}
      <SlideWipeTransitionPanel
        frame={frame}
        reveal={{ startFrame: 0, inFrames: 12 }}
        mode="outro"
        direction="left"
        color={COLORS.blue}
      />

      {/* Variant 3: intro, direction=right, navy (panel slides off right, revealing scene) */}
      <SlideWipeTransitionPanel
        frame={frame}
        reveal={{ startFrame: 0, inFrames: 12 }}
        mode="intro"
        direction="right"
        color={COLORS.navy}
      />

      {/* Variant 4: intro, direction=down, pink */}
      <SlideWipeTransitionPanel
        frame={frame}
        reveal={{ startFrame: 0, inFrames: 12 }}
        mode="intro"
        direction="down"
        color="#FF3D8A"
      />
    </AbsoluteFill>
  );
};
