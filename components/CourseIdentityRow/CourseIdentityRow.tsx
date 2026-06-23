// CourseIdentityRow , top-left course lockup: optional tinted icon + course title text
//
// Extracted from LessonTitle's "logo row" beat. Drops in from above (translateY -14→0)
// and fades in over the entrance duration. Remains constant across all lessons of a
// course: pass the same iconId and courseTitle every time.
//
// BUILD TYPE: code-first. Pure CSS/SVG, fully recolourable via the `tint` prop,
// placement-agnostic (render inside <Place x={77} y={58}> to match LessonTitle).
//
// Source template: LessonTitle (logo row, LOGO_X=77, LOGO_Y=58).
// Icon: 65×65 px, CSS mask technique (backgroundColor = tint, maskImage = icon SVG).
// Gap between icon and text: 14 px.
// Text: Inter SemiBold (weight 600) 28 px white.
// Entrance: translateY -14→0 + opacity over inFrames, easeOutCubic.
// Re-mention pulse: scale bump via pulse(), transformOrigin center center.

import React from 'react';
import { staticFile } from 'remotion';
import {
  appear,
  pulse,
  easeOutCubic,
  FONT_HEAD,
  type Reveal,
} from '../_lib/kit';

// Layout constants lifted from LessonTitle's measured geometry.
const ICON_SIZE   = 65;   // LOGO_ICON_DISPLAY = round(52 * 1.25)
const GAP         = 14;   // LOGO_GAP = round(11 * 1.25)
const TEXT_SIZE   = 28;   // COURSE_TITLE_SIZE = round(22 * 1.25)
const SLIDE_Y     = -14;  // logo drops in from -14 (ENTRY_DISTANCE * 0.5)
const TEXT_COLOUR = '#FFFFFF';
const DEFAULT_TINT = '#0794FD'; // DEFAULT_ACCENT from LessonTitle

export type CourseIdentityRowProps = {
  frame: number;
  reveal: Reveal;
  /** Course title text, e.g. "Connecting AI Agents to Systems". One line only; keep under ~35 chars. */
  courseTitle: string;
  /**
   * Icon id resolved via the icons/ library (e.g. "science-magnifyingglass-dark").
   * The SVG is loaded as a CSS mask and tinted with `tint`. Omit to show text only.
   */
  iconId?: string;
  /** Mask tint colour for the icon. Accepts a COLORS key or any hex. Default: #0794FD (Dodger Blue). */
  tint?: string;
};

export const CourseIdentityRow: React.FC<CourseIdentityRowProps> = ({
  frame,
  reveal,
  courseTitle,
  iconId,
  tint = DEFAULT_TINT,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  const p  = pulse(frame, reveal);
  const ty = SLIDE_Y * (1 - prog);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: GAP,
        opacity: prog,
        transform: `translateY(${ty}px) scale(${p})`,
        transformOrigin: 'center center',
      }}
    >
      {iconId && (
        <div
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            flexShrink: 0,
            backgroundColor: tint,
            WebkitMaskImage: `url(${staticFile(`icons/${iconId}.svg`)})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${staticFile(`icons/${iconId}.svg`)})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      )}
      <span
        style={{
          fontFamily: FONT_HEAD,
          fontWeight: 600,
          fontSize: TEXT_SIZE,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          color: TEXT_COLOUR,
        }}
      >
        {courseTitle}
      </span>
    </div>
  );
};
