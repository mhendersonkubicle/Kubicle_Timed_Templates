// DisplayHeadline , large primary display headline that rises or fades in as the main title of a scene
import React from 'react';
import {
  appear, pulse, easeOutCubic, FONT_HEAD, COLORS, type Reveal, type ColorVariant, resolveColor,
} from '../_lib/kit';

// Three variants lifted from LessonTitle geometry:
//   'white'    : Inter ExtraBold 78px, white (#FFFFFF), dark-surface use
//   'blue'     : Inter ExtraBold 116px, dodger-blue (#0496FF), light-surface use
//   'ink'      : Inter ExtraBold 74px, near-black (#0B1B2B), word-definition headings
export type DisplayHeadlineVariant = 'white' | 'blue' | 'ink';

// Entry direction:
//   'slide-x'  : slides in from the left (translateX -36px -> 0), used for lesson titles
//   'slide-y'  : rises up from below (translateY -24px -> 0), used for section/goal headings
export type DisplayHeadlineEntry = 'slide-x' | 'slide-y';

export type DisplayHeadlineProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  // 'white' (default) = white text on dark; 'blue' = dodger-blue on light; 'ink' = near-black on light
  variant?: DisplayHeadlineVariant;
  // Override colour entirely (any hex or COLORS key). Bypasses variant colour only.
  color?: ColorVariant;
  // Entrance direction: 'slide-x' (default, from left) or 'slide-y' (rises up)
  entry?: DisplayHeadlineEntry;
  // Max width in px. Defaults to 1702 (1920 - 58 left - 160 right margin, same as LessonTitle).
  maxWidth?: number;
  // Optional style overrides applied to the outer wrapper (e.g. to adjust position in a flex layout).
  style?: React.CSSProperties;
};

// Per-variant typography, taken directly from LessonTitle measurements.
const VARIANT_STYLES: Record<DisplayHeadlineVariant, { fontSize: number; color: string; letterSpacing: string; lineHeight: number }> = {
  white: { fontSize: 78,  color: COLORS.white,  letterSpacing: '-0.025em', lineHeight: 1.05 },
  blue:  { fontSize: 116, color: COLORS.blue,   letterSpacing: '-0.03em',  lineHeight: 1.05 },
  ink:   { fontSize: 74,  color: COLORS.ink,    letterSpacing: '-0.025em', lineHeight: 1.05 },
};

// Slide distances matching LessonTitle's TITLE_SLIDE_X (36.4px) and a goal-variant rise.
const SLIDE_X_DIST = 36;   // px, from left
const SLIDE_Y_DIST = 24;   // px, rise (negative = starts below, moves up)

export const DisplayHeadline: React.FC<DisplayHeadlineProps> = ({
  frame,
  reveal,
  text,
  variant = 'white',
  color,
  entry = 'slide-x',
  maxWidth = 1702,
  style,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  const ps   = pulse(frame, reveal);

  // Resolve colour: explicit prop overrides variant default.
  const resolvedColor = color ? resolveColor(color) : VARIANT_STYLES[variant].color;
  const vStyle = VARIANT_STYLES[variant];

  // Entry offset: slide-x moves from left, slide-y rises up.
  const tx = entry === 'slide-x' ? (1 - prog) * -SLIDE_X_DIST : 0;
  const ty = entry === 'slide-y' ? (1 - prog) * -SLIDE_Y_DIST : 0;

  return (
    <div
      style={{
        maxWidth,
        opacity: prog,
        transform: `translateX(${tx}px) translateY(${ty}px) scale(${ps})`,
        transformOrigin: 'left center',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: vStyle.fontSize,
          color: resolvedColor,
          letterSpacing: vStyle.letterSpacing,
          lineHeight: vStyle.lineHeight,
          display: 'inline-block',
        }}
      >
        {text}
      </span>
    </div>
  );
};
