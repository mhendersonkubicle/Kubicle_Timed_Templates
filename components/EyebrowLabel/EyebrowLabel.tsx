// EyebrowLabel , small all-caps accent-coloured eyebrow text above a headline
//
// Code-first. Pure CSS text, recolourable, resizable, placement-agnostic.
// Two alignment variants:
//   left   (LessonTitle style)    — slides in translateX from -28 px + opacity fade
//   center (CaseStudyIntro style) — fades opacity only
// Both animate easeOutCubic over inFrames. Re-mention pulse via kit pulse().
import React from 'react';
import {
  appear, pulse, easeOutCubic,
  resolveColor, FONT_HEAD,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

export type EyebrowAlign = 'left' | 'center';

export type EyebrowLabelProps = {
  frame: number;
  reveal: Reveal;
  // The text to display. Rendered uppercase by CSS.
  text: string;
  // Accent colour for the text. Accepts a named ColorVariant or any hex.
  // Default: 'blue' (#0496FF, matching LessonTitle and CaseStudyIntro).
  color?: ColorVariant;
  // Alignment variant that also controls the entrance animation.
  // 'left'   — slide in from the left (translateX -28 px) + fade (LessonTitle).
  // 'center' — fade opacity only, text-align center (CaseStudyIntro).
  // Default: 'left'.
  align?: EyebrowAlign;
  // Font size in px. Default: 32 (LessonTitle). CaseStudyIntro uses 34.
  fontSize?: number;
  // Letter-spacing in em units. Default: 0.01 (LessonTitle left).
  // CaseStudyIntro uses 0.18.
  letterSpacing?: string;
  // Font weight: 700 (Bold) or 800 (ExtraBold). Default: 700.
  fontWeight?: 700 | 800;
};

// Slide distance for the left-aligned entrance, matching LessonTitle ENTRY_DISTANCE.
const SLIDE_X = -28;

export const EyebrowLabel: React.FC<EyebrowLabelProps> = ({
  frame,
  reveal,
  text,
  color = 'blue',
  align = 'left',
  fontSize = 32,
  letterSpacing = '0.01em',
  fontWeight = 700,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  const p = pulse(frame, reveal);
  const c = resolveColor(color);

  // Left variant: slide in from the left + fade.
  // Center variant: fade opacity only.
  const translateX = align === 'left' ? SLIDE_X * (1 - prog) : 0;

  return (
    <div
      style={{
        opacity: prog,
        transform: `translateX(${translateX}px) scale(${p})`,
        transformOrigin: align === 'center' ? 'center center' : 'left center',
        textAlign: align,
        // Allow composing templates to control width for centred text;
        // left variant is shrink-to-fit (inline).
        display: align === 'center' ? 'block' : 'inline-block',
      }}
    >
      <span
        style={{
          fontFamily: FONT_HEAD,
          fontWeight,
          fontSize,
          color: c,
          letterSpacing,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    </div>
  );
};
