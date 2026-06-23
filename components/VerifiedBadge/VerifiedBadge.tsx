// VerifiedBadge , serrated starburst badge with a white tick indicating verified status
import React from 'react';
import {
  appear, pulse, easeOutCubic,
  resolveColor, COLORS,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

export type VerifiedBadgeProps = {
  frame: number;
  reveal: Reveal;
  // Accent fill for the starburst. Accepts a named ColorVariant or any hex.
  // Default: 'blue' (#0496FF, the CharacterProfileCard default).
  color?: ColorVariant;
  // Rendered size in px (the badge is square). Default 32.
  // Use 32 for a single-card context, 26 for duo/smaller layouts.
  size?: number;
};

// 16-point starburst path at a 32x32 viewBox.
// Derived directly from the CharacterProfileCard inline VerifiedBadge.
const STARBURST_PATH =
  'M16 1 L19.2 3.3 L23.2 2.8 L24.5 6.5 L28 8.3 L26.9 12.2 L28.5 16 ' +
  'L26 19.1 L26.5 23 L22.8 24.4 L20.8 27.8 L17 26.7 L13 27.8 L11 24.4 ' +
  'L7.3 23 L7.8 19.1 L5.3 16 L6.9 12.2 L5.8 8.3 L9.3 6.5 L10.6 2.8 L14.6 3.3 Z';

// White tick path: M11.5 16 L14.7 19 L20.5 13 (source geometry, 32x32 viewBox).
const TICK_PATH = 'M11.5 16 L14.7 19 L20.5 13';

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  frame,
  reveal,
  color = 'blue',
  size = 32,
}) => {
  // Entrance: easeOutBack(2.4) scale pop + opacity easeOutCubic, matching the
  // CharacterProfileCard badge animation exactly.
  const easeBack24 = (t: number) => {
    // Back easing with overshoot factor 2.4 (matches easeOutBackBadge in source).
    const c1 = 2.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const rawProg = appear(frame, reveal, easeOutCubic);
  // Scale driven by a custom back-easing with overshoot 2.4.
  const scaleProg = (() => {
    if (frame < reveal.startFrame) return 0;
    if (frame >= reveal.startFrame + reveal.inFrames) return 1;
    const t = (frame - reveal.startFrame) / reveal.inFrames;
    return Math.max(0, easeBack24(t));
  })();

  if (rawProg <= 0) return null;

  const p = pulse(frame, reveal);
  const fill = resolveColor(color);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scaleProg * p})`,
        transformOrigin: '50% 50%',
        opacity: rawProg,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* 16-point serrated starburst */}
        <path d={STARBURST_PATH} fill={fill} />
        {/* White checkmark tick */}
        <path
          d={TICK_PATH}
          stroke={COLORS.white}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
