// BulletDotRow , a single bullet list row: small filled square dot + wrapped body text.
// CODE-FIRST: pure CSS, recolourable via dotColor/textColor props, placement-agnostic.
// Lifted from Carousel5Tiles tile body (bullets section). Use inside card bodies and
// content panels wherever a plain-text list row is needed.
import React from 'react';
import {
  appear, pulse, easeOutCubic, resolveColor, FONT_BODY, type Reveal, type ColorVariant,
} from '../_lib/kit';

export type BulletDotRowProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  dotColor?: ColorVariant;   // default '#0794FD' (Carousel5Tiles blue)
  textColor?: string;        // default '#FFFFFF'
  fontSize?: number;         // default 33
  dotSize?: number;          // default 8
  gap?: number;              // gap between dot and text, default 16
};

export const BulletDotRow: React.FC<BulletDotRowProps> = ({
  frame,
  reveal,
  text,
  dotColor = '#0794FD',
  textColor = '#FFFFFF',
  fontSize = 33,
  dotSize = 8,
  gap = 16,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  const p = pulse(frame, reveal);
  const resolvedDot = resolveColor(dotColor);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap,
        opacity: prog,
        transform: `scale(${p})`,
        transformOrigin: 'left center',
      }}
    >
      {/* Filled square dot */}
      <div
        style={{
          width: dotSize,
          height: dotSize,
          background: resolvedDot,
          marginTop: 16,
          flexShrink: 0,
        }}
      />
      {/* Body text */}
      <div
        style={{
          color: textColor,
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize,
          lineHeight: 1.35,
          letterSpacing: '-0.005em',
        }}
      >
        {text}
      </div>
    </div>
  );
};
