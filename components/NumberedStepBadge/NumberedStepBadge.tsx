// NumberedStepBadge , dodger-blue gradient circle carrying a zero-padded ordinal integer with easeOutBack entrance and re-mention pulse
import React from 'react';
import {
  appear, pulse, easeOutBack, easeOutQuad,
  FONT_HEAD, FPS,
  type Reveal,
} from '../_lib/kit';

// Exact gradient lifted from Timeline5Tiles CIRCLE_BG constant.
const CIRCLE_BG = 'linear-gradient(180deg, #5ABAFF 0%, #1A9FFF 52%, #0496FF 100%)';

// The entrance occupies the first ~35% of inFrames for the circle pop,
// then the number fades in across the remainder, matching Timeline5Tiles
// internal cascade proportions (CIRCLE_SCALE_FRAC = 0.30, number op starts
// at 36% of circleScaleDur).
const CIRCLE_FRAC  = 0.35;   // circle scale-in uses first 35% of inFrames
const NUMBER_DELAY = 0.36;    // number fade starts at 36% through circle phase

export type NumberedStepBadgeProps = {
  frame: number;
  reveal: Reveal;
  // The ordinal integer to display. Zero-padded to 2 digits when < 10.
  step: number;
  // Outer diameter in px. Default 126 (matches Timeline5Tiles CIRCLE_R * 2).
  diameter?: number;
};

export const NumberedStepBadge: React.FC<NumberedStepBadgeProps> = ({
  frame,
  reveal,
  step,
  diameter = 126,
}) => {
  const { startFrame, inFrames } = reveal;
  const circleDurF = Math.max(1, Math.round(inFrames * CIRCLE_FRAC));

  // Circle scale: 0 to 1 over first circleDurF frames, easeOutBack(1.05).
  const scaleProg = appear(
    frame,
    { startFrame, inFrames: circleDurF },
    easeOutBack,
  );

  if (scaleProg <= 0) return null;

  // Number opacity: fades in starting slightly after the circle begins scaling,
  // completing by the end of the circle phase. Matches Timeline5Tiles numberOp.
  const numberDelayF = Math.round(circleDurF * NUMBER_DELAY);
  const numberOp = appear(
    frame,
    {
      startFrame: startFrame + numberDelayF,
      inFrames: Math.max(1, circleDurF - numberDelayF + Math.round(0.05 * FPS)),
    },
    easeOutQuad,
  );

  // Re-mention pulse: additive scale multiplier (1 at rest, up to ~1.05 at peak).
  const p = pulse(frame, reveal);

  // Zero-pad: "1" becomes "01", "10" stays "10".
  const label = step < 10 ? `0${step}` : String(step);

  // Font size proportional to diameter, matching Timeline5Tiles (60px / 126px = 0.476).
  const fontSize = Math.round(diameter * 0.476);

  return (
    <div
      style={{
        width: diameter,
        height: diameter,
        flexShrink: 0,
        transform: `scale(${scaleProg * p})`,
        transformOrigin: 'center center',
        borderRadius: '50%',
        background: CIRCLE_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize,
          lineHeight: 1,
          color: '#FFFFFF',
          letterSpacing: '-0.04em',
          opacity: numberOp,
          userSelect: 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
};
