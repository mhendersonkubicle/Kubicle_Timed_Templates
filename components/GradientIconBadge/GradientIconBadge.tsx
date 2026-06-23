// GradientIconBadge , dodger-blue gradient rounded-square or circle container with a CSS-masked white icon centred inside
import React from 'react';
import {
  appear, pulse, easeOutBack, easeOutCubic,
  Icon,
  type Reveal,
} from '../_lib/kit';

// The dodger-blue gradient lifted directly from BulletList6Pills' chevron block.
const GRADIENT_BG = 'linear-gradient(180deg, #5DBDFF 0%, #1A9CFE 55%, #0A8FEE 100%)';

// Border-radius constants matching BulletList6Pills source geometry.
// square uses 22 (ChevronAccentBlock), circle uses '50%' (PlayCircle),
// small-square uses 18 (GradientIconSquare).
const RADIUS: Record<Shape, string | number> = {
  square: 22,
  circle: '50%',
  'small-square': 18,
};

export type Shape = 'square' | 'circle' | 'small-square';

export type GradientIconBadgeProps = {
  frame: number;
  reveal: Reveal;
  // icon id resolved via the icons/ library (e.g. 'science-magnifyingglass-dark')
  icon: string;
  // container side length in px; default 120 (matches BulletList6Pills chevron block)
  size?: number;
  // container shape; default 'square'
  shape?: Shape;
  // optional drop shadow; default true
  shadow?: boolean;
};

export const GradientIconBadge: React.FC<GradientIconBadgeProps> = ({
  frame,
  reveal,
  icon,
  size = 120,
  shape = 'square',
  shadow = true,
}) => {
  const sc = appear(frame, reveal, easeOutBack);
  if (sc <= 0) return null;

  const op = appear(frame, reveal, easeOutCubic);
  const p = pulse(frame, reveal);

  const radius = RADIUS[shape];
  // Icon occupies 58-65% of the badge side, matching BulletList6Pills chevron icon
  const iconSize = Math.round(size * 0.61);

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${sc * p})`,
        transformOrigin: 'center center',
        opacity: op,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius,
        background: GRADIENT_BG,
        boxShadow: shadow
          ? '0 6px 18px rgba(4, 150, 255, 0.40), 0 2px 6px rgba(0,0,0,0.20)'
          : undefined,
        flexShrink: 0,
      }}
    >
      <Icon id={icon} size={iconSize} tint="#FFFFFF" />
    </div>
  );
};
