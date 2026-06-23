// SectionHeadline , bold section-title heading that slides up and fades in to head a content group
//
// CODE-FIRST: pure CSS, recolourable via a colour prop, placement-agnostic.
// Extracted from LessonSummary's locked "Lesson Summary" title (Arial Black 900,
// 58-62 px, Dodger-Blue default, -0.5 px letterSpacing, 1.1 lineHeight).
// Entrance: opacity easeOutQuad + translateY +28->0 easeOutExpo.
// Re-mention pulse: scale +5% over 0.45s around left-centre origin.
import React from 'react';
import {
  appear,
  pulse,
  easeOutQuad,
  FONT_BODY,
  type Reveal,
  type ColorVariant,
  resolveColor,
} from '../_lib/kit';
import { Easing, interpolate } from 'remotion';

// easeOutExpo for the translateY slide-up, matching the spec.
const easeOutExpo = Easing.out(Easing.exp);

// Geometry lifted from LessonSummary's title block.
const SLIDE_DIST = 28;   // px, starts below, rises to 0

// Size variants, mapped from the source template range (58-62 px).
// 'large' matches the LessonSummary headline (62 px).
// 'medium' is the summary-column-header register (58 px).
export type SectionHeadlineSize = 'large' | 'medium';

export type SectionHeadlineProps = {
  frame: number;
  reveal: Reveal;
  // The heading text to display.
  text: string;
  // Accent colour: any named ColorVariant or hex. Default: 'blue' (#0496FF, Dodger Blue).
  color?: ColorVariant;
  // Size variant controlling font size. Default: 'large' (62 px).
  size?: SectionHeadlineSize;
  // Optional max-width in px. Default: none (shrink-to-fit).
  maxWidth?: number;
  // Optional style overrides for the outer wrapper.
  style?: React.CSSProperties;
};

// Per-size type scale.
const SIZE_MAP: Record<SectionHeadlineSize, number> = {
  large:  62,
  medium: 58,
};

export const SectionHeadline: React.FC<SectionHeadlineProps> = ({
  frame,
  reveal,
  text,
  color = 'blue',
  size = 'large',
  maxWidth,
  style,
}) => {
  // Opacity uses easeOutQuad; translateY uses easeOutExpo (independent curves).
  const opacProg = appear(frame, reveal, easeOutQuad);
  const slideProg = interpolate(
    frame,
    [reveal.startFrame, reveal.startFrame + reveal.inFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easeOutExpo,
    },
  );

  if (opacProg <= 0) return null;

  // Re-mention pulse: brief +5% scale bump around left-centre origin.
  const ps = pulse(frame, reveal);

  const resolvedColor = resolveColor(color);
  const fontSize = SIZE_MAP[size];
  const ty = SLIDE_DIST * (1 - slideProg);

  return (
    <div
      style={{
        maxWidth,
        opacity: opacProg,
        transform: `translateY(${ty}px) scale(${ps})`,
        transformOrigin: 'left center',
        display: 'inline-block',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 900,
          fontSize,
          color: resolvedColor,
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          display: 'inline-block',
        }}
      >
        {text}
      </span>
    </div>
  );
};
