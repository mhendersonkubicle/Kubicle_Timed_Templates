import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, FONT_BODY } from '../_lib/kit';
import { HorizontalProgressBar } from './HorizontalProgressBar';

// Catalog example: continuous and segmented variants, fully revealed by frame ~45.
// reveal { startFrame: 0, inFrames: 12 } means each bar animates in over 12 frames.
// Icon ids reused from BigPoints3V1's own example (rocket, auto-update).
export const HorizontalProgressBarExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  // Segmented mode: three bars, one per step, staggered reveals.
  const seg0Reveal = { startFrame: 0,  inFrames: 12 };
  const seg1Reveal = { startFrame: 15, inFrames: 12 };
  const seg2Reveal = { startFrame: 30, inFrames: 12 };

  const BAR_W = 640;

  const labelStyle: React.CSSProperties = {
    fontFamily: COLORS ? FONT_BODY : 'system-ui, sans-serif',
    fontSize: 28,
    fontWeight: 500,
    color: COLORS.platinum,
    marginBottom: 10,
    letterSpacing: '0.01em',
  };

  const groupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 36,
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={groupStyle}>
        {/* Continuous fill at 75% */}
        <div style={rowStyle}>
          <span style={labelStyle}>Continuous fill (75%)</span>
          <HorizontalProgressBar
            frame={frame}
            reveal={r}
            width={BAR_W}
            height={51}
            fill={0.75}
          />
        </div>

        {/* Continuous fill at 40% with smaller height */}
        <div style={rowStyle}>
          <span style={labelStyle}>Continuous fill (40%, h=44)</span>
          <HorizontalProgressBar
            frame={frame}
            reveal={r}
            width={BAR_W}
            height={44}
            fill={0.40}
          />
        </div>

        {/* Segmented: 3 segments, step 0 */}
        <div style={rowStyle}>
          <span style={labelStyle}>Segmented (3 steps, step 1 of 3)</span>
          <HorizontalProgressBar
            frame={frame}
            reveal={seg0Reveal}
            width={BAR_W}
            height={51}
            segmentIndex={0}
            segmentCount={3}
          />
        </div>

        {/* Segmented: 3 segments, step 1 */}
        <div style={rowStyle}>
          <span style={labelStyle}>Segmented (3 steps, step 2 of 3)</span>
          <HorizontalProgressBar
            frame={frame}
            reveal={seg1Reveal}
            width={BAR_W}
            height={51}
            segmentIndex={1}
            segmentCount={3}
          />
        </div>

        {/* Segmented: 3 segments, step 2 */}
        <div style={{ ...rowStyle, marginBottom: 0 }}>
          <span style={labelStyle}>Segmented (3 steps, step 3 of 3)</span>
          <HorizontalProgressBar
            frame={frame}
            reveal={seg2Reveal}
            width={BAR_W}
            height={51}
            segmentIndex={2}
            segmentCount={3}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
