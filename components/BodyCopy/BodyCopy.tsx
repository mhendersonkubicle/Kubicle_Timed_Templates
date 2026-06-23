// BodyCopy , large medium-weight body paragraph for goal statements, lesson summaries, and definition bodies
import React from 'react';
import {
  appear, pulse, easeOutCubic, FONT_BODY, COLORS, resolveColor,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

// Two colour variants matching the LessonGoal source:
//   'dark'  : Satoshi Medium 500, 72px, #0B1F33 (near-black), for light surfaces (platinum bg)
//   'light' : Satoshi Medium 500, 55.5px, #4A5864 (muted slate), for light surfaces (YinYang title bars)
//   Any explicit hex is accepted via the color prop.
export type BodyCopyVariant = 'dark' | 'light';

// Typography lifted directly from LessonGoal and YinYangSide source measurements.
const VARIANT_STYLES: Record<BodyCopyVariant, { fontSize: number; color: string }> = {
  dark:  { fontSize: 72,   color: '#0B1F33' },
  light: { fontSize: 55.5, color: '#4A5864' },
};

// Rise distance matches the LessonGoal RISE_FROM_Y constant (24 px).
const RISE_FROM_Y = 24;

export type BodyCopyProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  // 'dark' (default) = near-black #0B1F33 on light/platinum surface; 'light' = muted slate on panels
  variant?: BodyCopyVariant;
  // Override colour entirely (any hex or COLORS key). Bypasses variant colour only.
  color?: ColorVariant;
  // Constrains the paragraph width. Default 1000 px (matches LessonGoal maxWidth).
  maxWidth?: number;
  // Override the top offset used when placed inside a flex or absolute layout.
  // Not applied directly by this component (caller wraps in Place or flex), kept for documentation.
  // Passed through to the outer wrapper style if provided.
  style?: React.CSSProperties;
};

export const BodyCopy: React.FC<BodyCopyProps> = ({
  frame,
  reveal,
  text,
  variant = 'dark',
  color,
  maxWidth = 1000,
  style,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  const ps   = pulse(frame, reveal);

  const vStyle = VARIANT_STYLES[variant];
  const resolvedColor = color ? resolveColor(color) : vStyle.color;

  // Entrance: 24 px rise + opacity fade, same easing as LessonGoal's goal copy.
  const ty = (1 - prog) * RISE_FROM_Y;

  return (
    <div
      style={{
        maxWidth,
        opacity: prog,
        transform: `translateY(${ty}px) scale(${ps})`,
        // Pulse anchored to left-centre so left-aligned layout stays put during scale.
        transformOrigin: 'left center',
        ...style,
      }}
    >
      <p
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: vStyle.fontSize,
          lineHeight: 1.15,
          color: resolvedColor,
          letterSpacing: '-0.015em',
          margin: 0,
          // textWrap: 'pretty' is a CSS4 value; cast via unknown to satisfy TS.
          textWrap: 'pretty' as unknown as React.CSSProperties['textWrap'],
        }}
      >
        {text}
      </p>
    </div>
  );
};
