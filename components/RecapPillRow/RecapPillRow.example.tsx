import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { RecapPillRow } from './RecapPillRow';

// Catalog example: white (CourseSummary) and dark (LessonSummary) pill
// variants, fully revealed by frame ~45 (reveal { startFrame: 0, inFrames: 12 }).
//
// Both variants are canvas-region (full 1920x1080 layers), so they are shown
// in separate halves using CSS clip. The white band (3 pills) is clipped to the
// top half; the dark band (3 pills) is clipped to the bottom half. Each band
// is rendered inside a half-height stage scaled to 0.5 so the pill artwork fills
// its half of the visible preview without overlap.
export const RecapPillRowExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();

  const whitePills = [
    'Define your target audience',
    'Map the user journey',
    'Measure and iterate',
  ];

  const darkPills = [
    'Set clear objectives',
    'Align your stakeholders',
    'Track key outcomes',
  ];

  // Each half is a 1920x540 viewport that shows one 1920x1080 canvas scaled
  // down by 50 %, so the pills appear correctly proportioned in the preview.
  const halfStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: 1920,
    height: 540,
    overflow: 'hidden',
  };

  // A 1920x1080 inner stage scaled to 50 % and anchored to the top-left of
  // its half; the pills render at their natural canvas coordinates.
  const stageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1920,
    height: 1080,
    transform: 'scale(0.5)',
    transformOrigin: '0 0',
  };

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
    }}>
      {/* Divider */}
      <div style={{
        position: 'absolute',
        top: 540,
        left: 0,
        width: 1920,
        height: 2,
        background: 'rgba(255,255,255,0.12)',
        zIndex: 200,
      }} />

      {/* White variant: upper half */}
      <div style={{ ...halfStyle, top: 0 }}>
        <div style={stageStyle}>
          {whitePills.map((text, i) => (
            <RecapPillRow
              key={`w${i}`}
              frame={frame}
              reveal={{ startFrame: i * 4, inFrames: 12 }}
              text={text}
              rowIndex={i}
              totalRows={whitePills.length}
              variant="white"
              zIndex={whitePills.length - i}
            />
          ))}
        </div>
      </div>

      {/* Dark variant: lower half */}
      <div style={{ ...halfStyle, top: 540 }}>
        <div style={stageStyle}>
          {darkPills.map((text, i) => (
            <RecapPillRow
              key={`d${i}`}
              frame={frame}
              reveal={{ startFrame: i * 4, inFrames: 12 }}
              text={text}
              rowIndex={i}
              totalRows={darkPills.length}
              variant="dark"
              zIndex={darkPills.length - i}
            />
          ))}
        </div>
      </div>

      {/* Variant labels */}
      <div style={{
        position: 'absolute', top: 16, left: 0, width: '100%',
        textAlign: 'center', color: 'rgba(255,255,255,0.40)',
        fontFamily: 'system-ui, sans-serif', fontSize: 20, fontWeight: 600,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        pointerEvents: 'none', zIndex: 200,
      }}>
        white (CourseSummary)
      </div>
      <div style={{
        position: 'absolute', top: 556, left: 0, width: '100%',
        textAlign: 'center', color: 'rgba(255,255,255,0.40)',
        fontFamily: 'system-ui, sans-serif', fontSize: 20, fontWeight: 600,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        pointerEvents: 'none', zIndex: 200,
      }}>
        dark (LessonSummary)
      </div>
    </AbsoluteFill>
  );
};
