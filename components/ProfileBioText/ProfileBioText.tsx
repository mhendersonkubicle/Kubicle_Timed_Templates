// ProfileBioText , muted grey bio block beneath a role title; wraps to two lines in profile card layouts
import React from 'react';
import {
  appear,
  pulse,
  easeOutCubic,
  FONT_BODY,
  type Reveal,
} from '../_lib/kit';

// Text colour lifted directly from CharacterProfileCard's MUTED_TEXT constant.
const DEFAULT_COLOR = '#6B7280';

// Two size variants that mirror CharacterProfileCard's own usage:
//   'single' (default): fontSize 24, max 95 chars, lineHeight 1.35 -- single or team card
//   'duo':              fontSize 20, max 80 chars, lineHeight 1.35 -- two cards side by side
export type ProfileBioTextSize = 'single' | 'duo';

export type ProfileBioTextProps = {
  frame:   number;
  reveal:  Reveal;
  text:    string;
  // Width of the text container in pixels. Matches the card's inner content
  // width (CARD_W - 2 * CARD_PAD = 580 for single; caller may pass narrower
  // for duo). Default 580.
  width?:  number;
  // Override the muted grey text colour (named brand colour or hex). Default #6B7280.
  color?:  string;
  // 'single' (default) or 'duo'. Switches font size and char-limit context.
  size?:   ProfileBioTextSize;
};

const SIZE_MAP: Record<ProfileBioTextSize, { fontSize: number }> = {
  single: { fontSize: 24 },
  duo:    { fontSize: 20 },
};

export const ProfileBioText: React.FC<ProfileBioTextProps> = ({
  frame,
  reveal,
  text,
  width = 580,
  color = DEFAULT_COLOR,
  size = 'single',
}) => {
  // Entrance: slideUp 28 px easeOutCubic + opacity fade-in. Matches exactly
  // the `bio` reveal inside CharacterProfileCard (slideUp travel = 28 px).
  const prog = appear(frame, reveal, easeOutCubic);
  const ty   = 28 * (1 - prog);

  // Re-mention pulse: brief scale bump centred on each pulse frame.
  const ps = pulse(frame, reveal);

  const { fontSize } = SIZE_MAP[size];

  return (
    <div
      style={{
        width,
        color,
        fontFamily:     FONT_BODY,
        fontWeight:     500,
        fontSize,
        lineHeight:     1.35,
        letterSpacing:  '-0.005em',
        overflowWrap:   'break-word',
        transform:      `translateY(${ty}px) scale(${ps})`,
        transformOrigin: '0% 50%',
        opacity:         prog,
      }}
    >
      {text}
    </div>
  );
};
